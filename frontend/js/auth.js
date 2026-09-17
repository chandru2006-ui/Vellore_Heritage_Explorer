// ============================================================
// VELLORE MULTIMEDIA-BASED LOCAL DISCOVERY SYSTEM
// Authentication JavaScript
// Handles Login + Register
// ============================================================

const AUTH_API_URL = "http://localhost:5000/api/auth";


// ============================================================
// COMMON HELPERS
// ============================================================

function getElement(id) {
    return document.getElementById(id);
}


// Show field error
function showFieldError(inputId, errorId, message) {
    const input = getElement(inputId);
    const error = getElement(errorId);

    if (input) {
        input.classList.add("input-error");
        input.setAttribute("aria-invalid", "true");
    }

    if (error) {
        error.textContent = message;
        error.classList.add("show");
    }
}


// Clear field error
function clearFieldError(inputId, errorId) {
    const input = getElement(inputId);
    const error = getElement(errorId);

    if (input) {
        input.classList.remove("input-error");
        input.removeAttribute("aria-invalid");
    }

    if (error) {
        error.textContent = "";
        error.classList.remove("show");
    }
}


// Clear all errors
function clearAllErrors() {
    const errors = document.querySelectorAll(".field-error");

    errors.forEach((error) => {
        error.textContent = "";
        error.classList.remove("show");
    });

    const inputs = document.querySelectorAll(
        ".auth-form input, .auth-form select, .auth-form textarea"
    );

    inputs.forEach((input) => {
        input.classList.remove("input-error");
        input.removeAttribute("aria-invalid");
    });
}


// Show general authentication message
function showAuthMessage(message, type = "error") {
    const messageBox = getElement("authMessage");

    if (!messageBox) {
        return;
    }

    messageBox.textContent = message;
    messageBox.className = `auth-message ${type}`;
    messageBox.classList.add("show");
}


// Hide general authentication message
function hideAuthMessage() {
    const messageBox = getElement("authMessage");

    if (!messageBox) {
        return;
    }

    messageBox.textContent = "";
    messageBox.className = "auth-message";
}


// ============================================================
// EMAIL VALIDATION
// ============================================================

function isValidEmail(email) {
    const emailPattern =
        /^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?)+$/;

    return emailPattern.test(email);
}


// ============================================================
// LOGIN VALIDATION
// ============================================================

function validateLoginForm() {
    let isValid = true;

    clearAllErrors();
    hideAuthMessage();

    const emailInput = getElement("email");
    const passwordInput = getElement("password");

    if (!emailInput || !passwordInput) {
        return false;
    }

    const email = emailInput.value.trim();
    const password = passwordInput.value;

    // --------------------------------------------------------
    // Email validation
    // --------------------------------------------------------

    if (!email) {
        showFieldError(
            "email",
            "emailError",
            "Email address is required."
        );

        isValid = false;
    } else if (email.length > 100) {
        showFieldError(
            "email",
            "emailError",
            "Email address must not exceed 100 characters."
        );

        isValid = false;
    } else if (!isValidEmail(email)) {
        showFieldError(
            "email",
            "emailError",
            "Please enter a valid email address."
        );

        isValid = false;
    }

    // --------------------------------------------------------
    // Password validation
    // --------------------------------------------------------

    if (!password) {
        showFieldError(
            "password",
            "passwordError",
            "Password is required."
        );

        isValid = false;
    } else if (password.length < 6) {
        showFieldError(
            "password",
            "passwordError",
            "Password must be at least 6 characters."
        );

        isValid = false;
    } else if (password.length > 100) {
        showFieldError(
            "password",
            "passwordError",
            "Password must not exceed 100 characters."
        );

        isValid = false;
    }

    return isValid;
}


// ============================================================
// LOGIN
// ============================================================

async function handleLogin(event) {
    event.preventDefault();

    const loginButton = getElement("loginSubmitButton");
    const buttonText = getElement("loginButtonText");

    const isValid = validateLoginForm();

    if (!isValid) {
        return;
    }

    const emailInput = getElement("email");
    const passwordInput = getElement("password");

    const email = emailInput.value.trim().toLowerCase();
    const password = passwordInput.value;

    // --------------------------------------------------------
    // Loading state
    // --------------------------------------------------------

    if (loginButton) {
        loginButton.disabled = true;
        loginButton.classList.add("loading");
    }

    if (buttonText) {
        buttonText.textContent = "Signing in...";
    }

    hideAuthMessage();

    try {
        const response = await fetch(`${AUTH_API_URL}/login`, {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                email: email,
                password: password
            })
        });

        let result;

        try {
            result = await response.json();
        } catch (jsonError) {
            result = {
                success: false,
                message: "The server returned an invalid response."
            };
        }

        // ----------------------------------------------------
        // Login failed
        // ----------------------------------------------------

        if (!response.ok || !result.success) {
            showAuthMessage(
                result.message || "Invalid email or password.",
                "error"
            );

            if (response.status === 401) {
                showFieldError(
                    "password",
                    "passwordError",
                    "Invalid email or password."
                );
            }

            return;
        }

        // ----------------------------------------------------
        // Login successful
        // ----------------------------------------------------

        if (!result.token) {
            showAuthMessage(
                "Login succeeded, but no authentication token was received.",
                "error"
            );

            return;
        }

        // Store JWT
        localStorage.setItem("token", result.token);

        // Store user information
        if (result.data) {
            localStorage.setItem(
                "user",
                JSON.stringify(result.data)
            );
        }

        showAuthMessage(
            "Login successful. Redirecting...",
            "success"
        );

        // ----------------------------------------------------
        // Redirect
        // ----------------------------------------------------

        setTimeout(() => {
            redirectAfterLogin();
        }, 700);

    } catch (error) {

        console.error("Login error:", error);

        showAuthMessage(
            "Unable to connect to the server. Please make sure the backend is running.",
            "error"
        );

    } finally {

        if (loginButton) {
            loginButton.disabled = false;
            loginButton.classList.remove("loading");
        }

        if (buttonText) {
            buttonText.textContent = "Login";
        }
    }
}


// ============================================================
// REDIRECT AFTER LOGIN
// ============================================================

function redirectAfterLogin() {
    const params = new URLSearchParams(window.location.search);

    const redirect = params.get("redirect");

    // Only allow internal frontend pages.
    if (
        redirect &&
        !redirect.includes("://") &&
        !redirect.startsWith("//") &&
        !redirect.startsWith("javascript:")
    ) {
        window.location.href = redirect;
        return;
    }

    // Default destination
    window.location.href = "index.html";
}


// ============================================================
// PASSWORD SHOW / HIDE
// ============================================================

function setupPasswordToggle() {
    const passwordInput = getElement("password");
    const togglePassword = getElement("togglePassword");

    if (!passwordInput || !togglePassword) {
        return;
    }

    togglePassword.addEventListener("click", () => {

        const isPassword =
            passwordInput.type === "password";

        passwordInput.type =
            isPassword ? "text" : "password";

        togglePassword.setAttribute(
            "aria-label",
            isPassword
                ? "Hide password"
                : "Show password"
        );

        togglePassword.setAttribute(
            "title",
            isPassword
                ? "Hide password"
                : "Show password"
        );

        // Support text/icon inside the button
        const icon = togglePassword.querySelector(
            ".password-toggle-icon"
        );

        if (icon) {
            icon.textContent =
                isPassword ? "Hide" : "Show";
        }
    });
}


// ============================================================
// LIVE LOGIN VALIDATION
// ============================================================

function setupLoginLiveValidation() {

    const emailInput = getElement("email");
    const passwordInput = getElement("password");

    if (emailInput) {
        emailInput.addEventListener("input", () => {
            clearFieldError(
                "email",
                "emailError"
            );
        });
    }

    if (passwordInput) {
        passwordInput.addEventListener("input", () => {
            clearFieldError(
                "password",
                "passwordError"
            );
        });
    }
}


// ============================================================
// REGISTER VALIDATION
// These functions allow the same auth.js file to be used
// by register.html.
// ============================================================

function validateName(name) {

    const trimmedName = name.trim();

    if (!trimmedName) {
        return "Full name is required.";
    }

    if (trimmedName.length < 2) {
        return "Name must contain at least 2 characters.";
    }

    if (trimmedName.length > 60) {
        return "Name must not exceed 60 characters.";
    }

    // Letters, spaces, apostrophes and hyphens
    const namePattern =
        /^[A-Za-zÀ-ÖØ-öø-ÿ][A-Za-zÀ-ÖØ-öø-ÿ' -]*$/;

    if (!namePattern.test(trimmedName)) {
        return "Name can contain only letters, spaces, apostrophes and hyphens.";
    }

    if (/\s{2,}/.test(trimmedName)) {
        return "Please avoid consecutive spaces in your name.";
    }

    return "";
}


function validateRegisterForm() {

    let isValid = true;

    clearAllErrors();
    hideAuthMessage();

    const nameInput = getElement("name");
    const emailInput = getElement("email");
    const passwordInput = getElement("password");
    const confirmPasswordInput =
        getElement("confirmPassword");

    // --------------------------------------------------------
    // Name
    // --------------------------------------------------------

    if (nameInput) {

        const nameError =
            validateName(nameInput.value);

        if (nameError) {

            showFieldError(
                "name",
                "nameError",
                nameError
            );

            isValid = false;
        }
    }

    // --------------------------------------------------------
    // Email
    // --------------------------------------------------------

    if (emailInput) {

        const email =
            emailInput.value.trim();

        if (!email) {

            showFieldError(
                "email",
                "emailError",
                "Email address is required."
            );

            isValid = false;

        } else if (email.length > 100) {

            showFieldError(
                "email",
                "emailError",
                "Email address must not exceed 100 characters."
            );

            isValid = false;

        } else if (!isValidEmail(email)) {

            showFieldError(
                "email",
                "emailError",
                "Please enter a valid email address."
            );

            isValid = false;
        }
    }

    // --------------------------------------------------------
    // Password
    // --------------------------------------------------------

    if (passwordInput) {

        const password =
            passwordInput.value;

        if (!password) {

            showFieldError(
                "password",
                "passwordError",
                "Password is required."
            );

            isValid = false;

        } else if (password.length < 6) {

            showFieldError(
                "password",
                "passwordError",
                "Password must be at least 6 characters."
            );

            isValid = false;

        } else if (password.length > 100) {

            showFieldError(
                "password",
                "passwordError",
                "Password must not exceed 100 characters."
            );

            isValid = false;
        }
    }

    // --------------------------------------------------------
    // Confirm password
    // --------------------------------------------------------

    if (confirmPasswordInput && passwordInput) {

        const password =
            passwordInput.value;

        const confirmPassword =
            confirmPasswordInput.value;

        if (!confirmPassword) {

            showFieldError(
                "confirmPassword",
                "confirmPasswordError",
                "Please confirm your password."
            );

            isValid = false;

        } else if (password !== confirmPassword) {

            showFieldError(
                "confirmPassword",
                "confirmPasswordError",
                "Passwords do not match."
            );

            isValid = false;
        }
    }

    return isValid;
}


// ============================================================
// REGISTER
// ============================================================

async function handleRegister(event) {

    event.preventDefault();

    const registerButton =
        getElement("registerSubmitButton");

    const buttonText =
        getElement("registerButtonText");

    if (!validateRegisterForm()) {
        return;
    }

    const nameInput =
        getElement("name");

    const emailInput =
        getElement("email");

    const passwordInput =
        getElement("password");

    const name =
        nameInput.value.trim();

    const email =
        emailInput.value.trim().toLowerCase();

    const password =
        passwordInput.value;

    // --------------------------------------------------------
    // Loading
    // --------------------------------------------------------

    if (registerButton) {
        registerButton.disabled = true;
        registerButton.classList.add("loading");
    }

    if (buttonText) {
        buttonText.textContent = "Creating account...";
    }

    hideAuthMessage();

    try {

        const response = await fetch(
            `${AUTH_API_URL}/register`,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    name: name,
                    email: email,
                    password: password
                })
            }
        );

        let result;

        try {
            result = await response.json();
        } catch (jsonError) {
            result = {
                success: false,
                message: "The server returned an invalid response."
            };
        }

        // ----------------------------------------------------
        // Registration failed
        // ----------------------------------------------------

        if (!response.ok || !result.success) {

            showAuthMessage(
                result.message ||
                "Registration failed. Please try again.",
                "error"
            );

            return;
        }

        // ----------------------------------------------------
        // Registration successful
        // ----------------------------------------------------

        showAuthMessage(
            "Account created successfully. Redirecting to login...",
            "success"
        );

        setTimeout(() => {

            window.location.href =
                "login.html";

        }, 1000);

    } catch (error) {

        console.error(
            "Registration error:",
            error
        );

        showAuthMessage(
            "Unable to connect to the server. Please make sure the backend is running.",
            "error"
        );

    } finally {

        if (registerButton) {
            registerButton.disabled = false;
            registerButton.classList.remove("loading");
        }

        if (buttonText) {
            buttonText.textContent = "Create Account";
        }
    }
}


// ============================================================
// LIVE REGISTER VALIDATION
// ============================================================

function setupRegisterLiveValidation() {

    const fields = [
        ["name", "nameError"],
        ["email", "emailError"],
        ["password", "passwordError"],
        ["confirmPassword", "confirmPasswordError"]
    ];

    fields.forEach(([inputId, errorId]) => {

        const input =
            getElement(inputId);

        if (!input) {
            return;
        }

        input.addEventListener(
            "input",
            () => {
                clearFieldError(
                    inputId,
                    errorId
                );
            }
        );
    });
}


// ============================================================
// CHECK WHICH AUTH PAGE IS OPEN
// ============================================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        // ----------------------------------------------------
        // LOGIN PAGE
        // ----------------------------------------------------

        const loginForm =
            getElement("loginForm");

        if (loginForm) {

            loginForm.addEventListener(
                "submit",
                handleLogin
            );

            setupPasswordToggle();
            setupLoginLiveValidation();
        }


        // ----------------------------------------------------
        // REGISTER PAGE
        // ----------------------------------------------------

        const registerForm =
            getElement("registerForm");

        if (registerForm) {

            registerForm.addEventListener(
                "submit",
                handleRegister
            );

            setupRegisterLiveValidation();
        }
    }
);