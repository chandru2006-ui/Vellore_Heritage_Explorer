// ============================================================
// VELLORE DISCOVER
// MY CONTRIBUTIONS
// ============================================================

const CONTRIBUTIONS_API =
    "http://localhost:5000/api/contributions";


// ============================================================
// PAGE INITIALIZATION
// ============================================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        initializeMyContributions();

    }
);


// ============================================================
// INITIALIZE
// ============================================================

function initializeMyContributions() {

    const token =
        localStorage.getItem("token");

    const storedUser =
        localStorage.getItem("user");


    if (!token || !storedUser) {

        redirectToLogin();

        return;
    }


    let user;

    try {

        user =
            JSON.parse(storedUser);

    } catch (error) {

        console.error(
            "Invalid stored user:",
            error
        );

        localStorage.removeItem("token");
        localStorage.removeItem("user");

        redirectToLogin();

        return;
    }


    displayUserInfo(user);

    setupLogout();

    loadMyContributions();
}


// ============================================================
// DISPLAY USER INFORMATION
// ============================================================

function displayUserInfo(user) {

    const name =
        user.name || "User";

    const email =
        user.email || "";


    const nameElement =
        document.getElementById(
            "userName"
        );

    const emailElement =
        document.getElementById(
            "userEmail"
        );

    const avatarElement =
        document.getElementById(
            "userAvatar"
        );


    if (nameElement) {
        nameElement.textContent =
            name;
    }

    if (emailElement) {
        emailElement.textContent =
            email;
    }

    if (avatarElement) {
        avatarElement.textContent =
            getInitials(name);
    }
}


// ============================================================
// LOGOUT
// ============================================================

function setupLogout() {

    const logoutButton =
        document.getElementById(
            "logoutButton"
        );


    if (!logoutButton) {
        return;
    }


    logoutButton.addEventListener(
        "click",
        () => {

            localStorage.removeItem(
                "token"
            );

            localStorage.removeItem(
                "user"
            );

            window.location.href =
                "index.html";
        }
    );
}


// ============================================================
// LOAD MY CONTRIBUTIONS
// ============================================================

async function loadMyContributions() {

    const token =
        localStorage.getItem("token");


    if (!token) {

        redirectToLogin();

        return;
    }


    showLoading(true);

    hideMessage();

    hideEmpty();


    try {

        const response =
            await fetch(
                `${CONTRIBUTIONS_API}/my`,
                {
                    method: "GET",

                    headers: {
                        "Authorization":
                            `Bearer ${token}`
                    }
                }
            );


        const result =
            await response.json();


        if (
            response.status === 401
        ) {

            handleAuthenticationFailure();

            return;
        }


        if (!response.ok) {

            throw new Error(
                result.message ||
                "Failed to load your contributions"
            );
        }


        const contributions =
            Array.isArray(result.data)
                ? result.data
                : [];


        updateStatistics(
            contributions
        );


        renderContributions(
            contributions
        );


    } catch (error) {

        console.error(
            "My contributions loading error:",
            error
        );

        showMessage(
            error.message ||
            "Failed to load your contributions.",
            "error"
        );

    } finally {

        showLoading(false);
    }
}


// ============================================================
// UPDATE STATISTICS
// ============================================================

function updateStatistics(
    contributions
) {

    const total =
        contributions.length;


    const totalRatings =
        contributions.filter(
            contribution =>
                contribution.rating !== null &&
                contribution.rating !== undefined
        ).length;


    const totalPhotos =
        contributions.reduce(
            (total, contribution) => {

                return total +
                    (
                        Array.isArray(
                            contribution.photos
                        )
                            ? contribution.photos.length
                            : 0
                    );

            },
            0
        );


    const totalVideos =
        contributions.filter(
            contribution =>
                contribution.video
        ).length;


    setText(
        "totalContributions",
        total
    );

    setText(
        "totalRatings",
        totalRatings
    );

    setText(
        "totalPhotos",
        totalPhotos
    );

    setText(
        "totalVideos",
        totalVideos
    );
}


// ============================================================
// RENDER CONTRIBUTIONS
// ============================================================

function renderContributions(
    contributions
) {

    const grid =
        document.getElementById(
            "contributionsGrid"
        );


    if (!grid) {
        return;
    }


    grid.innerHTML = "";


    if (
        contributions.length === 0
    ) {

        showEmpty(true);

        return;
    }


    contributions.forEach(
        contribution => {

            const card =
                createContributionCard(
                    contribution
                );

            grid.appendChild(card);
        }
    );
}


// ============================================================
// CREATE CONTRIBUTION CARD
// ============================================================

function createContributionCard(
    contribution
) {

    const card =
        document.createElement(
            "article"
        );


    card.className =
        "my-contribution-card";


    const place =
        contribution.place || {};


    const placeName =
        place.placeName ||
        "Unknown Place";


    const placeId =
        place.placeId ||
        "";


    const status =
        contribution.status ||
        "pending";


    const statusInfo =
        getStatusInfo(status);


    const rating =
        contribution.rating;


    const experience =
        contribution.experience ||
        "";


    const feedback =
        contribution.feedback ||
        "";


    const photos =
        Array.isArray(
            contribution.photos
        )
            ? contribution.photos
            : [];


    const video =
        contribution.video ||
        "";


    const createdAt =
        contribution.createdAt
            ? formatDate(
                contribution.createdAt
            )
            : "";


    card.innerHTML = `

        <!-- ================================================
             CARD HEADER
        ================================================= -->

        <div class="contribution-card-header">

            <div>

                <h3 class="contribution-place-name">
                    ${escapeHTML(placeName)}
                </h3>

                <span class="contribution-place-id">
                    ${escapeHTML(placeId)}
                </span>

            </div>


            <span
                class="contribution-status ${statusInfo.className}"
            >
                ${statusInfo.icon}
                ${statusInfo.label}
            </span>

        </div>


        <!-- ================================================
             STATUS INFORMATION
        ================================================= -->

        <div class="contribution-status-info ${statusInfo.className}">

            <strong>
                ${statusInfo.label}
            </strong>

            <span>
                ${statusInfo.description}
            </span>

        </div>


        <!-- ================================================
             RATING
        ================================================= -->

        ${
            rating !== null &&
            rating !== undefined
                ? `

                    <div class="my-contribution-rating">

                        <span class="rating-stars">
                            ${createStars(rating)}
                        </span>

                        <span class="rating-value">
                            ${rating}/5
                        </span>

                    </div>

                `
                : ""
        }


        <!-- ================================================
             EXPERIENCE
        ================================================= -->

        ${
            experience
                ? `

                    <div class="my-contribution-content">

                        <div class="content-label">
                            My Experience
                        </div>

                        <p>
                            ${escapeHTML(
                                experience
                            )}
                        </p>

                    </div>

                `
                : ""
        }


        <!-- ================================================
             FEEDBACK
        ================================================= -->

        ${
            feedback
                ? `

                    <div class="my-contribution-content">

                        <div class="content-label">
                            My Feedback
                        </div>

                        <p>
                            ${escapeHTML(
                                feedback
                            )}
                        </p>

                    </div>

                `
                : ""
        }


        <!-- ================================================
             PHOTOS
        ================================================= -->

        ${
            photos.length > 0
                ? `

                    <div class="my-contribution-content">

                        <div class="content-label">
                            Photos
                        </div>

                        <div class="my-contribution-photos">

                            ${photos
                                .map(
                                    photo => `
                                        <a
                                            href="${escapeAttribute(
                                                photo
                                            )}"
                                            target="_blank"
                                            rel="noopener"
                                        >
                                            <img
                                                src="${escapeAttribute(
                                                    photo
                                                )}"
                                                alt="My contribution photo"
                                                loading="lazy"
                                            >
                                        </a>
                                    `
                                )
                                .join("")}

                        </div>

                    </div>

                `
                : ""
        }


        <!-- ================================================
             VIDEO
        ================================================= -->

        ${
            video
                ? `

                    <div class="my-contribution-content">

                        <div class="content-label">
                            Video
                        </div>

                        <video
                            class="my-contribution-video"
                            controls
                            preload="metadata"
                        >

                            <source
                                src="${escapeAttribute(
                                    video
                                )}"
                            >

                            Your browser does not support
                            video playback.

                        </video>

                    </div>

                `
                : ""
        }


        <!-- ================================================
             DATE
        ================================================= -->

        ${
            createdAt
                ? `

                    <div class="contribution-date">
                        Submitted ${escapeHTML(createdAt)}
                    </div>

                `
                : ""
        }


        <!-- ================================================
             ACTIONS
        ================================================= -->

        <div class="my-contribution-actions">

            <a
                href="place.html?id=${encodeURIComponent(
                    placeId
                )}"
                class="my-contribution-view-btn"
            >
                View Place
            </a>


            <button
                type="button"
                class="my-contribution-edit-btn"
                data-id="${escapeAttribute(
                    contribution._id
                )}"
            >
                ✏️ Edit
            </button>


            <button
                type="button"
                class="my-contribution-delete-btn"
                data-id="${escapeAttribute(
                    contribution._id
                )}"
            >
                🗑️ Delete
            </button>

        </div>

    `;


    // ========================================================
    // EDIT BUTTON
    // ========================================================

    const editButton =
        card.querySelector(
            ".my-contribution-edit-btn"
        );


    if (editButton) {

        editButton.addEventListener(
            "click",
            () => {

                editContribution(
                    contribution
                );
            }
        );
    }


    // ========================================================
    // DELETE BUTTON
    // ========================================================

    const deleteButton =
        card.querySelector(
            ".my-contribution-delete-btn"
        );


    if (deleteButton) {

        deleteButton.addEventListener(
            "click",
            () => {

                deleteContribution(
                    contribution._id,
                    card
                );
            }
        );
    }


    return card;
}


// ============================================================
// STATUS INFORMATION
// ============================================================

function getStatusInfo(
    status
) {

    switch (status) {

        case "approved":

            return {
                className: "approved",
                icon: "✓",
                label: "Approved",
                description:
                    "Your contribution has been approved and is visible to the community."
            };


        case "rejected":

            return {
                className: "rejected",
                icon: "✕",
                label: "Rejected",
                description:
                    "Your contribution was not approved by the administrator."
            };


        case "pending":

        default:

            return {
                className: "pending",
                icon: "⏳",
                label: "Pending",
                description:
                    "Your contribution is waiting for administrator review."
            };
    }
}


// ============================================================
// EDIT CONTRIBUTION
// ============================================================

function editContribution(
    contribution
) {

    const contributionId =
        contribution._id;


    if (!contributionId) {

        showMessage(
            "Invalid contribution.",
            "error"
        );

        return;
    }


    // Store the contribution temporarily
    // so the edit page can use it.
    sessionStorage.setItem(
        "editingContribution",
        JSON.stringify(
            contribution
        )
    );


    // Open the place page.
    // The contribution form there will later
    // be enhanced to support editing.
    const place =
        contribution.place || {};


    const placeId =
        place.placeId;


    if (placeId) {

        window.location.href =
            `place.html?id=${encodeURIComponent(
                placeId
            )}&edit=${encodeURIComponent(
                contributionId
            )}`;

        return;
    }


    showMessage(
        "Unable to find the contribution's place.",
        "error"
    );
}


// ============================================================
// DELETE CONTRIBUTION
// ============================================================

async function deleteContribution(
    contributionId,
    card
) {

    if (!contributionId) {
        return;
    }


    const confirmed =
        window.confirm(
            "Are you sure you want to delete this contribution? This action cannot be undone."
        );


    if (!confirmed) {
        return;
    }


    const token =
        localStorage.getItem("token");


    if (!token) {

        redirectToLogin();

        return;
    }


    const deleteButton =
        card.querySelector(
            ".my-contribution-delete-btn"
        );


    const editButton =
        card.querySelector(
            ".my-contribution-edit-btn"
        );


    if (deleteButton) {
        deleteButton.disabled = true;
        deleteButton.textContent =
            "Deleting...";
    }

    if (editButton) {
        editButton.disabled = true;
    }


    try {

        const response =
            await fetch(
                `${CONTRIBUTIONS_API}/${encodeURIComponent(
                    contributionId
                )}`,
                {
                    method: "DELETE",

                    headers: {
                        "Authorization":
                            `Bearer ${token}`
                    }
                }
            );


        const result =
            await response.json();


        if (
            response.status === 401
        ) {

            handleAuthenticationFailure();

            return;
        }


        if (
            response.status === 403
        ) {

            throw new Error(
                "You are not allowed to delete this contribution."
            );
        }


        if (!response.ok) {

            throw new Error(
                result.message ||
                "Failed to delete contribution."
            );
        }


        showMessage(
            result.message ||
            "Contribution deleted successfully.",
            "success"
        );


        // Reload the list and statistics.
        await loadMyContributions();


    } catch (error) {

        console.error(
            "Delete contribution error:",
            error
        );


        showMessage(
            error.message ||
            "Failed to delete contribution.",
            "error"
        );


        if (deleteButton) {

            deleteButton.disabled =
                false;

            deleteButton.textContent =
                "🗑️ Delete";
        }


        if (editButton) {
            editButton.disabled =
                false;
        }
    }
}


// ============================================================
// CREATE STARS
// ============================================================

function createStars(
    rating
) {

    const numericRating =
        Number(rating) || 0;


    let stars = "";


    for (
        let i = 1;
        i <= 5;
        i++
    ) {

        stars +=
            i <= numericRating
                ? "★"
                : "☆";
    }


    return stars;
}


// ============================================================
// LOADING
// ============================================================

function showLoading(
    show
) {

    const loading =
        document.getElementById(
            "contributionsLoading"
        );

    if (loading) {
        loading.hidden = !show;
        loading.style.display =
            show ? "flex" : "none";
    }
}


// ============================================================
// EMPTY
// ============================================================

function showEmpty(
    show
) {

    const empty =
        document.getElementById(
            "emptyContributions"
        );


    if (empty) {
        empty.hidden = !show;
    }
}


function hideEmpty() {
    showEmpty(false);
}


// ============================================================
// MESSAGE
// ============================================================

function showMessage(
    message,
    type
) {

    const element =
        document.getElementById(
            "contributionsMessage"
        );


    if (!element) {
        return;
    }


    element.textContent =
        message;


    element.className =
        `contributions-message ${type}`;


    element.hidden = false;
}


function hideMessage() {

    const element =
        document.getElementById(
            "contributionsMessage"
        );


    if (!element) {
        return;
    }


    element.textContent = "";

    element.hidden = true;

    element.className =
        "contributions-message";
}


// ============================================================
// AUTHENTICATION FAILURE
// ============================================================

function handleAuthenticationFailure() {

    localStorage.removeItem(
        "token"
    );

    localStorage.removeItem(
        "user"
    );

    redirectToLogin();
}


// ============================================================
// LOGIN REDIRECT
// ============================================================

function redirectToLogin() {

    window.location.href =
        "login.html?redirect=my-contributions.html";
}


// ============================================================
// SET TEXT
// ============================================================

function setText(
    id,
    value
) {

    const element =
        document.getElementById(id);


    if (element) {
        element.textContent =
            value;
    }
}


// ============================================================
// DATE
// ============================================================

function formatDate(
    dateString
) {

    const date =
        new Date(dateString);


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {
        return "";
    }


    return date.toLocaleString(
        undefined,
        {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit"
        }
    );
}


// ============================================================
// INITIALS
// ============================================================

function getInitials(
    name
) {

    const words =
        String(name)
            .trim()
            .split(/\s+/)
            .filter(Boolean);


    if (words.length === 0) {
        return "U";
    }


    if (words.length === 1) {

        return words[0]
            .charAt(0)
            .toUpperCase();
    }


    return (
        words[0].charAt(0) +
        words[
            words.length - 1
        ].charAt(0)
    ).toUpperCase();
}


// ============================================================
// HTML ESCAPE
// ============================================================

function escapeHTML(
    value
) {

    return String(value ?? "")
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );
}


// ============================================================
// ATTRIBUTE ESCAPE
// ============================================================

function escapeAttribute(
    value
) {

    return escapeHTML(value);
}