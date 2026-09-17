// ============================================================
// VELLORE DISCOVER
// AUTHENTICATION UI
// Handles logged-in user display, admin dashboard and logout
// ============================================================

document.addEventListener("DOMContentLoaded", () => {

    updateAuthenticationUI();

});


// ============================================================
// UPDATE AUTHENTICATION UI
// ============================================================

function updateAuthenticationUI() {

    const navActions =
        document.querySelector(".nav-actions");

    if (!navActions) {
        return;
    }

    const token =
        localStorage.getItem("token");

    const storedUser =
        localStorage.getItem("user");


    // ========================================================
    // NOT LOGGED IN
    // ========================================================

    if (!token || !storedUser) {

        navActions.innerHTML = `
            <a
                href="login.html"
                class="login-btn"
            >
                Login
            </a>

            <button
                class="menu-btn"
                aria-label="Open menu"
            >
                ☰
            </button>
        `;

        return;
    }


    // ========================================================
    // READ USER INFORMATION
    // ========================================================

    let user;

    try {

        user =
            JSON.parse(storedUser);

    } catch (error) {

        console.error(
            "Invalid stored user information:",
            error
        );

        localStorage.removeItem("token");
        localStorage.removeItem("user");

        updateAuthenticationUI();

        return;
    }


    const userName =
        user.name || "User";

    const userRole =
        user.role || "user";


    // ========================================================
    // ADMIN BUTTON
    // ========================================================

    let adminDashboardButton = "";

    if (userRole === "admin") {

        adminDashboardButton = `
            <a
                href="admin.html"
                class="admin-dashboard-link"
            >
                ⚙ Admin Dashboard
            </a>
        `;
    }


    // ========================================================
    // MY CONTRIBUTIONS BUTTON
    // ========================================================

    const myContributionsButton = `
        <a
            href="my-contributions.html"
            class="my-contributions-link"
        >
            My Contributions
        </a>
    `;


    // ========================================================
    // LOGGED-IN NAVIGATION
    // ========================================================

    navActions.innerHTML = `

        <div class="user-menu">

            <span class="welcome-user">
                Welcome, ${escapeAuthHTML(userName)}
            </span>

            ${myContributionsButton}

            ${adminDashboardButton}

            <button
                type="button"
                class="logout-btn"
                id="logoutButton"
            >
                Logout
            </button>

        </div>

        <button
            class="menu-btn"
            aria-label="Open menu"
        >
            ☰
        </button>

    `;


    // ========================================================
    // LOGOUT
    // ========================================================

    const logoutButton =
        document.getElementById(
            "logoutButton"
        );

    if (logoutButton) {

        logoutButton.addEventListener(
            "click",
            handleLogout
        );
    }
}


// ============================================================
// LOGOUT
// ============================================================

function handleLogout() {

    localStorage.removeItem("token");

    localStorage.removeItem("user");

    window.location.href =
        "index.html";
}


// ============================================================
// ESCAPE HTML
// ============================================================

function escapeAuthHTML(value) {

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}