// ============================================================
// VELLORE DISCOVER
// ADMIN DASHBOARD JAVASCRIPT
// ============================================================

const ADMIN_API =
    "http://localhost:5000/api/admin";

const PLACES_API =
    "http://localhost:5000/api/places";


// ============================================================
// PAGE INITIALIZATION
// ============================================================

// ============================================================
// PAGE INITIALIZATION
// ============================================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        checkAdminAccess();

        setupContributionControls();

        setupPlacesManagement();

        createPlaceModal();

        setupUserManagement();

        setupReportsAnalytics();
        setupMediaManagement();
        setupTripManagement();

    }
);
// ============================================================
// ADMIN ACCESS
// ============================================================

function checkAdminAccess() {

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

        localStorage.removeItem("token");
        localStorage.removeItem("user");

        redirectToLogin();

        return;
    }


    if (user.role !== "admin") {

        showMessage(
            "You do not have permission to access the admin dashboard.",
            "error"
        );

        setTimeout(() => {

            window.location.href =
                "index.html";

        }, 1800);

        return;
    }


    displayAdminInfo(user);

    loadContributions();

    loadAdminPlaces();

}


// ============================================================
// ADMIN INFORMATION
// ============================================================

function displayAdminInfo(user) {

    const adminName =
        document.getElementById(
            "adminName"
        );

    const adminEmail =
        document.getElementById(
            "adminEmail"
        );


    if (adminName) {

        adminName.textContent =
            user.name ||
            "Administrator";

    }


    if (adminEmail) {

        adminEmail.textContent =
            user.email ||
            "";

    }

}


// ============================================================
// CONTRIBUTION CONTROLS
// ============================================================

function setupContributionControls() {

    const statusFilter =
        document.getElementById(
            "statusFilter"
        );

    if (statusFilter) {

        statusFilter.addEventListener(
            "change",
            loadContributions
        );

    }


    const logoutButton =
        document.getElementById(
            "adminLogoutButton"
        );

    if (logoutButton) {

        logoutButton.addEventListener(
            "click",
            logoutAdmin
        );

    }

}


// ============================================================
// LOAD CONTRIBUTIONS
// ============================================================

async function loadContributions() {

    const token =
        localStorage.getItem("token");

    if (!token) {

        redirectToLogin();

        return;
    }


    const filter =
        document.getElementById(
            "statusFilter"
        );

    const selectedStatus =
        filter
            ? filter.value
            : "pending";


    showLoading(true);

    hideEmpty();

    clearMessage();


    try {

        let url =
            `${ADMIN_API}/contributions`;


        if (
            selectedStatus !== "all"
        ) {

            url +=
                `?status=${encodeURIComponent(
                    selectedStatus
                )}`;

        }


        const response =
            await fetch(
                url,
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


        if (
            response.status === 403
        ) {

            showMessage(
                "Admin access required.",
                "error"
            );

            setTimeout(() => {

                window.location.href =
                    "index.html";

            }, 1800);

            return;
        }


        if (!response.ok) {

            throw new Error(
                result.message ||
                "Failed to load contributions"
            );

        }


        const contributions =
            Array.isArray(result.data)
                ? result.data
                : [];


        updateStatistics(
            contributions,
            selectedStatus
        );


        renderContributions(
            contributions
        );


    } catch (error) {

        console.error(
            "Admin contribution loading error:",
            error
        );


        showMessage(
            error.message ||
            "Failed to load contributions.",
            "error"
        );


    } finally {

        showLoading(false);

    }

}


// ============================================================
// UPDATE CONTRIBUTION STATISTICS
// ============================================================

async function updateStatistics(
    currentContributions,
    selectedStatus
) {

    const token =
        localStorage.getItem("token");

    if (!token) {
        return;
    }


    try {

        const response =
            await fetch(
                `${ADMIN_API}/contributions`,
                {
                    method: "GET",

                    headers: {
                        "Authorization":
                            `Bearer ${token}`
                    }
                }
            );


        if (!response.ok) {
            return;
        }


        const result =
            await response.json();


        const allContributions =
            Array.isArray(result.data)
                ? result.data
                : [];


        const pending =
            allContributions.filter(
                contribution =>
                    contribution.status ===
                    "pending"
            ).length;


        const approved =
            allContributions.filter(
                contribution =>
                    contribution.status ===
                    "approved"
            ).length;


        const rejected =
            allContributions.filter(
                contribution =>
                    contribution.status ===
                    "rejected"
            ).length;


        const total =
            allContributions.length;


        setText(
            "pendingCount",
            pending
        );


        setText(
            "approvedCount",
            approved
        );


        setText(
            "rejectedCount",
            rejected
        );


        setText(
            "totalCount",
            total
        );


    } catch (error) {

        console.error(
            "Statistics loading error:",
            error
        );

    }

}


// ============================================================
// RENDER CONTRIBUTIONS
// ============================================================

function renderContributions(
    contributions
) {

    const grid =
        document.getElementById(
            "adminContributionsGrid"
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


    showEmpty(false);


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
        "admin-contribution-card";


    const user =
        contribution.user || {};


    const place =
        contribution.place || {};


    const userName =
        user.name ||
        "Unknown User";


    const userEmail =
        user.email ||
        "";


    const placeName =
        place.placeName ||
        "Unknown Place";


    const placeId =
        place.placeId ||
        "";


    const status =
        contribution.status ||
        "pending";


    const rating =
        contribution.rating;


    const experience =
        contribution.experience ||
        "";


    const feedback =
        contribution.feedback ||
        "";


    const createdAt =
        contribution.createdAt
            ? formatDate(
                contribution.createdAt
            )
            : "";


    card.innerHTML = `

        <div class="admin-card-header">

            <div>

                <h3 class="admin-place-name">
                    ${escapeHTML(placeName)}
                </h3>

                <span class="admin-place-id">
                    ${escapeHTML(placeId)}
                </span>

            </div>


            <span
                class="admin-status ${escapeHTML(status)}"
            >
                ${escapeHTML(
                    capitalize(status)
                )}
            </span>

        </div>


        <div class="admin-contributor">

            <div class="admin-avatar">
                ${getInitials(userName)}
            </div>

            <div>

                <strong>
                    ${escapeHTML(userName)}
                </strong>

                <span>
                    ${escapeHTML(userEmail)}
                </span>

            </div>

        </div>


        <div class="admin-card-body">

            ${
                rating !== null &&
                rating !== undefined
                    ? `

                        <div class="admin-rating">

                            ${createStars(rating)}

                            <span class="admin-rating-number">
                                ${rating}/5
                            </span>

                        </div>

                    `
                    : ""
            }


            ${
                experience
                    ? `

                        <div class="admin-content-block">

                            <div class="admin-content-title">
                                Experience
                            </div>

                            <p class="admin-content-text">
                                ${escapeHTML(
                                    experience
                                )}
                            </p>

                        </div>

                    `
                    : ""
            }


            ${
                feedback
                    ? `

                        <div class="admin-content-block">

                            <div class="admin-content-title">
                                Feedback
                            </div>

                            <p class="admin-content-text">
                                ${escapeHTML(
                                    feedback
                                )}
                            </p>

                        </div>

                    `
                    : ""
            }


            ${
                contribution.photos &&
                contribution.photos.length > 0
                    ? createPhotoGallery(
                        contribution.photos
                    )
                    : ""
            }


            ${
                contribution.video
                    ? `

                        <video
                            class="admin-video"
                            controls
                            preload="metadata"
                        >

                            <source
                                src="${escapeAttribute(
                                    contribution.video
                                )}"
                            >

                            Your browser does not support
                            video playback.

                        </video>

                    `
                    : ""
            }

        </div>


        <div class="admin-card-footer">

            <a
                href="place.html?id=${encodeURIComponent(
                    placeId
                )}"
                class="view-place-btn"
                target="_blank"
                rel="noopener"
            >
                View Place
            </a>


            ${
                status === "pending"
                    ? `

                        <button
                            type="button"
                            class="admin-action-btn approve-btn"
                            data-action="approve"
                            data-id="${escapeAttribute(
                                contribution._id
                            )}"
                        >
                            ✓ Approve
                        </button>


                        <button
                            type="button"
                            class="admin-action-btn reject-btn"
                            data-action="reject"
                            data-id="${escapeAttribute(
                                contribution._id
                            )}"
                        >
                            ✕ Reject
                        </button>

                    `
                    : ""
            }

        </div>


        ${
            createdAt
                ? `

                    <div
                        style="
                            padding: 0 24px 20px;
                            color: #94a3b8;
                            font-size: 12px;
                        "
                    >
                        Submitted
                        ${escapeHTML(createdAt)}
                    </div>

                `
                : ""
        }

    `;


    const actionButtons =
        card.querySelectorAll(
            "[data-action]"
        );


    actionButtons.forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    const action =
                        button.dataset.action;


                    const id =
                        button.dataset.id;


                    handleModeration(
                        id,
                        action,
                        card
                    );

                }
            );

        }
    );


    return card;

}


// ============================================================
// APPROVE / REJECT CONTRIBUTION
// ============================================================

async function handleModeration(
    contributionId,
    action,
    card
) {

    if (
        !contributionId ||
        !["approve", "reject"].includes(
            action
        )
    ) {

        return;
    }


    const token =
        localStorage.getItem("token");


    if (!token) {

        redirectToLogin();

        return;
    }


    const actionName =
        action === "approve"
            ? "approve"
            : "reject";


    const confirmed =
        window.confirm(
            `Are you sure you want to ${actionName} this contribution?`
        );


    if (!confirmed) {
        return;
    }


    const buttons =
        card.querySelectorAll(
            ".admin-action-btn"
        );


    buttons.forEach(
        button => {
            button.disabled = true;
        }
    );


    try {

        const response =
            await fetch(
                `${ADMIN_API}/contributions/${encodeURIComponent(
                    contributionId
                )}/${action}`,
                {
                    method: "PUT",

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

            showMessage(
                "Admin access required.",
                "error"
            );

            return;
        }


        if (!response.ok) {

            throw new Error(
                result.message ||
                `Failed to ${actionName} contribution`
            );

        }


        showMessage(
            result.message ||
            `Contribution ${actionName}d successfully.`,
            "success"
        );


        await loadContributions();


    } catch (error) {

        console.error(
            "Moderation error:",
            error
        );


        showMessage(
            error.message ||
            `Failed to ${actionName} contribution.`,
            "error"
        );


        buttons.forEach(
            button => {
                button.disabled = false;
            }
        );

    }

}


// ============================================================
// PHOTO GALLERY
// ============================================================

function createPhotoGallery(
    photos
) {

    return `

        <div class="admin-content-block">

            <div class="admin-content-title">
                Photos
            </div>

            <div class="admin-media">

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
                                    alt="Community contribution photo"
                                    loading="lazy"
                                >

                            </a>

                        `
                    )
                    .join("")}

            </div>

        </div>

    `;

}


// ============================================================
// STAR DISPLAY
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
// ============================================================
// PLACES MANAGEMENT
// ============================================================
// ============================================================

let adminPlaces = [];

let filteredAdminPlaces = [];

let adminTripStatistics = null;

let adminPlaceSearchText = "";

let adminPlaceCategory = "";

let adminPlaceLocality = "";

let adminPlaceSort = "default";


// ============================================================
// SETUP PLACES MANAGEMENT
// ============================================================

function setupPlacesManagement() {

    const manageButton =
        document.getElementById(
            "managePlacesButton"
        );


    if (manageButton) {

        manageButton.addEventListener(
            "click",
            () => {

                const section =
                    document.getElementById(
                        "placesManagementPanel"
                    );


                if (section) {

                    section.scrollIntoView({
                        behavior: "smooth",
                        block: "start"
                    });

                }

            }
        );

    }


    const searchInput =
        document.getElementById(
            "adminPlaceSearch"
        );


    if (searchInput) {

        searchInput.addEventListener(
            "input",
            () => {

                adminPlaceSearchText =
                    searchInput.value
                        .trim()
                        .toLowerCase();


                renderAdminPlaces();

            }
        );

    }


    const clearSearch =
        document.getElementById(
            "clearAdminPlaceSearch"
        );


    if (clearSearch) {

        clearSearch.addEventListener(
            "click",
            () => {

                if (searchInput) {

                    searchInput.value = "";

                }


                adminPlaceSearchText = "";

                renderAdminPlaces();

            }
        );

    }


    const categoryFilter =
        document.getElementById(
            "adminPlaceCategoryFilter"
        );


    if (categoryFilter) {

        categoryFilter.addEventListener(
            "change",
            () => {

                adminPlaceCategory =
                    categoryFilter.value;


                updateAdminLocalityFilter();

                adminPlaceLocality = "";


                const localityFilter =
                    document.getElementById(
                        "adminPlaceLocalityFilter"
                    );


                if (localityFilter) {

                    localityFilter.value = "";

                }


                renderAdminPlaces();

            }
        );

    }


    const localityFilter =
        document.getElementById(
            "adminPlaceLocalityFilter"
        );


    if (localityFilter) {

        localityFilter.addEventListener(
            "change",
            () => {

                adminPlaceLocality =
                    localityFilter.value;

                renderAdminPlaces();

            }
        );

    }


    const sortFilter =
        document.getElementById(
            "adminPlaceSort"
        );


    if (sortFilter) {

        sortFilter.addEventListener(
            "change",
            () => {

                adminPlaceSort =
                    sortFilter.value;

                renderAdminPlaces();

            }
        );

    }


    const clearFilters =
        document.getElementById(
            "clearAdminPlaceFilters"
        );


    if (clearFilters) {

        clearFilters.addEventListener(
            "click",
            clearAdminPlaceFilters
        );

    }


    const addButton =
        document.getElementById(
            "addNewPlaceButton"
        );


    if (addButton) {

        addButton.addEventListener(
            "click",
            () => {

                openPlaceModal();

            }
        );

    }

}


// ============================================================
// LOAD PLACES
// ============================================================

async function loadAdminPlaces() {

    const token =
        localStorage.getItem("token");


    if (!token) {

        redirectToLogin();

        return;
    }


    showPlacesLoading(true);

    hidePlacesEmpty();

    clearPlacesMessage();


    try {

        const response =
            await fetch(
                PLACES_API,
                {
                    method: "GET"
                }
            );


        const result =
            await response.json();


        if (!response.ok) {

            throw new Error(
                result.message ||
                "Failed to load places"
            );

        }


        adminPlaces =
            Array.isArray(result.data)
                ? result.data
                : [];


        filteredAdminPlaces =
            [...adminPlaces];


        populateAdminCategoryFilter();

        updateAdminLocalityFilter();

        renderAdminPlaces();


    } catch (error) {

        console.error(
            "Admin places loading error:",
            error
        );


        showPlacesMessage(
            error.message ||
            "Failed to load places.",
            "error"
        );

    } finally {

        showPlacesLoading(false);

    }

}


// ============================================================
// POPULATE CATEGORY FILTER
// ============================================================

function populateAdminCategoryFilter() {

    const select =
        document.getElementById(
            "adminPlaceCategoryFilter"
        );


    if (!select) {
        return;
    }


    const categories =
        [
            ...new Set(
                adminPlaces
                    .map(
                        place =>
                            place.category
                    )
                    .filter(Boolean)
            )
        ]
        .sort(
            (a, b) =>
                String(a).localeCompare(
                    String(b)
                )
        );


    select.innerHTML = `

        <option value="">
            All Categories
        </option>

    `;


    categories.forEach(
        category => {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                category;


            option.textContent =
                category;


            select.appendChild(
                option
            );

        }
    );


    select.value =
        adminPlaceCategory;

}


// ============================================================
// UPDATE LOCALITY FILTER
// ============================================================

function updateAdminLocalityFilter() {

    const select =
        document.getElementById(
            "adminPlaceLocalityFilter"
        );


    if (!select) {
        return;
    }


    let source =
        [...adminPlaces];


    if (adminPlaceCategory) {

        source =
            source.filter(
                place =>
                    String(
                        place.category || ""
                    ).toLowerCase() ===
                    adminPlaceCategory
                        .toLowerCase()
            );

    }


    const localities =
        [
            ...new Set(
                source
                    .map(
                        place =>
                            place.locality
                    )
                    .filter(Boolean)
            )
        ]
        .sort(
            (a, b) =>
                String(a).localeCompare(
                    String(b)
                )
        );


    select.innerHTML = `

        <option value="">
            ${
                adminPlaceCategory
                    ? `All Locations in ${escapeHTML(
                        adminPlaceCategory
                    )}`
                    : "All Locations"
            }
        </option>

    `;


    localities.forEach(
        locality => {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                locality;


            option.textContent =
                locality;


            select.appendChild(
                option
            );

        }
    );


    select.value =
        adminPlaceLocality;

}


// ============================================================
// FILTER + SORT PLACES
// ============================================================

function getFilteredAdminPlaces() {

    let places =
        [...adminPlaces];


    // --------------------------------------------------------
    // Search
    // --------------------------------------------------------

    if (adminPlaceSearchText) {

        places =
            places.filter(
                place => {

                    const searchable =
                        [
                            place.placeId,
                            place.placeName,
                            place.category,
                            place.locality,
                            place.taluk,
                            place.district,
                            place.description
                        ]
                        .join(" ")
                        .toLowerCase();


                    return searchable.includes(
                        adminPlaceSearchText
                    );

                }
            );

    }


    // --------------------------------------------------------
    // Category
    // --------------------------------------------------------

    if (adminPlaceCategory) {

        places =
            places.filter(
                place =>
                    String(
                        place.category || ""
                    ).toLowerCase() ===
                    adminPlaceCategory
                        .toLowerCase()
            );

    }


    // --------------------------------------------------------
    // Locality
    // --------------------------------------------------------

    if (adminPlaceLocality) {

        places =
            places.filter(
                place =>
                    String(
                        place.locality || ""
                    ).toLowerCase() ===
                    adminPlaceLocality
                        .toLowerCase()
            );

    }


    // --------------------------------------------------------
    // Sort
    // --------------------------------------------------------

    switch (
        adminPlaceSort
    ) {

        case "az":

            places.sort(
                (a, b) =>
                    String(
                        a.placeName || ""
                    ).localeCompare(
                        String(
                            b.placeName || ""
                        )
                    )
            );

            break;


        case "za":

            places.sort(
                (a, b) =>
                    String(
                        b.placeName || ""
                    ).localeCompare(
                        String(
                            a.placeName || ""
                        )
                    )
            );

            break;


        case "rating":

            places.sort(
                (a, b) =>
                    Number(
                        b.communityAverageRating
                    ) -
                    Number(
                        a.communityAverageRating
                    )
            );

            break;


        case "likes":

            places.sort(
                (a, b) =>
                    Number(
                        b.likeCount || 0
                    ) -
                    Number(
                        a.likeCount || 0
                    )
            );

            break;


        default:

            places.sort(
                (a, b) =>
                    String(
                        a.placeId || ""
                    ).localeCompare(
                        String(
                            b.placeId || ""
                        )
                    )
            );

            break;

    }


    return places;

}


// ============================================================
// RENDER ADMIN PLACES
// ============================================================

function renderAdminPlaces() {

    const grid =
        document.getElementById(
            "adminPlacesGrid"
        );


    if (!grid) {
        return;
    }


    const places =
        getFilteredAdminPlaces();


    filteredAdminPlaces =
        places;


    grid.innerHTML = "";


    setText(
        "adminPlacesCount",
        `${places.length} ${
            places.length === 1
                ? "Place"
                : "Places"
        }`
    );


    if (
        places.length === 0
    ) {

        showPlacesEmpty(true);

        return;
    }


    showPlacesEmpty(false);


    places.forEach(
        place => {

            grid.appendChild(
                createAdminPlaceCard(
                    place
                )
            );

        }
    );

}


// ============================================================
// CREATE PLACE CARD
// ============================================================

function createAdminPlaceCard(
    place
) {

    const card =
        document.createElement(
            "article"
        );


    card.className =
        "admin-place-card";


    const image =
        getPlaceImage(
            place
        );


    const rating =
        Number(
            place.communityAverageRating
        ) || 0;


    const ratingCount =
        Number(
            place.communityRatingCount
        ) || 0;


    const likes =
        Number(
            place.likeCount
        ) || 0;


    const imageHTML =
        image
            ? `

                <img
                    src="${escapeAttribute(image)}"
                    alt="${escapeAttribute(
                        place.placeName ||
                        "Place"
                    )}"
                    class="admin-place-card-image"
                    loading="lazy"
                    onerror="this.style.display='none';"
                >

            `
            : `

                <div class="admin-place-card-image admin-place-no-image">
                    📍
                </div>

            `;


    card.innerHTML = `

        <div class="admin-place-card-media">

            ${imageHTML}


            <span class="admin-place-category">

                ${escapeHTML(
                    place.category ||
                    "Uncategorized"
                )}

            </span>

        </div>


        <div class="admin-place-card-body">

            <div class="admin-place-card-heading">

                <div>

                    <span class="admin-place-card-id">
                        ${escapeHTML(
                            place.placeId ||
                            ""
                        )}
                    </span>

                    <h3>
                        ${escapeHTML(
                            place.placeName ||
                            "Unnamed Place"
                        )}
                    </h3>

                </div>

            </div>


            <div class="admin-place-card-location">

                📍

                ${escapeHTML(
                    place.locality ||
                    place.taluk ||
                    place.district ||
                    "Vellore"
                )}

            </div>


            <p class="admin-place-card-description">

                ${escapeHTML(
                    truncateText(
                        place.description ||
                        place.whatIsIt ||
                        "No description available.",
                        150
                    )
                )}

            </p>


            <div class="admin-place-card-stats">

                <span>

                    <strong>
                        ${createStars(
                            Math.round(rating)
                        )}
                    </strong>

                    ${rating > 0
                        ? `${rating.toFixed(1)}`
                        : "No rating"}

                    ${
                        ratingCount > 0
                            ? `(${ratingCount})`
                            : ""
                    }

                </span>


                <span>
                    ❤️ ${likes}
                </span>


                <span>
                    ${
                        place.videoLink
                            ? "🎥 Video"
                            : "—"
                    }
                </span>

            </div>


            <div class="admin-place-card-actions">

                <button
                    type="button"
                    class="admin-place-view-button"
                    data-place-action="view"
                    data-place-id="${escapeAttribute(
                        place.placeId
                    )}"
                >
                    👁 View
                </button>


                <button
                    type="button"
                    class="admin-place-edit-button"
                    data-place-action="edit"
                    data-place-id="${escapeAttribute(
                        place.placeId
                    )}"
                >
                    ✏️ Edit
                </button>


                <button
                    type="button"
                    class="admin-place-delete-button"
                    data-place-action="delete"
                    data-place-id="${escapeAttribute(
                        place.placeId
                    )}"
                >
                    🗑 Delete
                </button>

            </div>

        </div>

    `;


    const actionButtons =
        card.querySelectorAll(
            "[data-place-action]"
        );


    actionButtons.forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    const action =
                        button.dataset.placeAction;


                    const placeId =
                        button.dataset.placeId;


                    handlePlaceAction(
                        action,
                        placeId
                    );

                }
            );

        }
    );


    return card;

}


// ============================================================
// PLACE IMAGE
// ============================================================

function getPlaceImage(
    place
) {

    if (
        Array.isArray(place.images) &&
        place.images.length > 0
    ) {

        return place.images[0];

    }


    if (
        Array.isArray(place.communityImages) &&
        place.communityImages.length > 0
    ) {

        const first =
            place.communityImages[0];


        if (
            first &&
            typeof first === "object"
        ) {

            return first.url || "";

        }


        return first || "";

    }


    return "";

}


// ============================================================
// PLACE ACTION
// ============================================================

function handlePlaceAction(
    action,
    placeId
) {

    if (!placeId) {
        return;
    }


    const place =
        adminPlaces.find(
            item =>
                String(
                    item.placeId
                ) ===
                String(placeId)
        );


    if (!place) {

        showPlacesMessage(
            "Place could not be found.",
            "error"
        );

        return;
    }


    if (action === "view") {

        openPlaceViewModal(
            place
        );

        return;
    }


    if (action === "edit") {

        openPlaceModal(
            place
        );

        return;
    }


    if (action === "delete") {

        deleteAdminPlace(
            place
        );

    }

}


// ============================================================
// DELETE PLACE
// ============================================================

async function deleteAdminPlace(
    place
) {

    const confirmed =
        window.confirm(
            `Are you sure you want to permanently delete "${place.placeName}" (${place.placeId})?\n\nThis action cannot be undone.`
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


    try {

        const response =
            await fetch(
                `${PLACES_API}/${encodeURIComponent(
                    place.placeId
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

            showPlacesMessage(
                "Admin access required.",
                "error"
            );

            return;
        }


        if (!response.ok) {

            throw new Error(
                result.message ||
                "Failed to delete place"
            );

        }


        showPlacesMessage(
            result.message ||
            "Place deleted successfully.",
            "success"
        );


        await loadAdminPlaces();


    } catch (error) {

        console.error(
            "Delete place error:",
            error
        );


        showPlacesMessage(
            error.message ||
            "Failed to delete place.",
            "error"
        );

    }

}


// ============================================================
// PLACE MODAL
// ============================================================

function createPlaceModal() {

    if (
        document.getElementById(
            "adminPlaceModal"
        )
    ) {

        return;
    }


    const modal =
        document.createElement(
            "div"
        );


    modal.id =
        "adminPlaceModal";


    modal.className =
        "admin-place-modal";


    modal.hidden = true;


    modal.innerHTML = `

        <div
            class="admin-place-modal-overlay"
            data-close-place-modal="true"
        ></div>


        <div
            class="admin-place-modal-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="adminPlaceModalTitle"
        >

            <div class="admin-place-modal-header">

                <div>

                    <span class="admin-label">
                        PLACE DATABASE
                    </span>

                    <h2 id="adminPlaceModalTitle">
                        Add New Place
                    </h2>

                    <p id="adminPlaceModalSubtitle">
                        Create a new place in Vellore Discover.
                    </p>

                </div>


                <button
                    type="button"
                    class="admin-place-modal-close"
                    id="closePlaceModal"
                    aria-label="Close"
                >
                    ×
                </button>

            </div>


            <form
                id="adminPlaceForm"
                class="admin-place-form"
            >

                <div
                    id="adminPlaceFormMessage"
                    class="admin-place-form-message"
                    hidden
                ></div>


                <!-- BASIC INFORMATION -->

                <div class="admin-form-section">

                    <div class="admin-form-section-title">
                        Basic Information
                    </div>


                    <div class="admin-form-grid">

                        <div class="admin-form-field">

                            <label for="placeFormId">
                                Place ID *
                            </label>

                            <input
                                type="text"
                                id="placeFormId"
                                name="placeId"
                                placeholder="Example: VEL042"
                                required
                            >

                        </div>


                        <div class="admin-form-field">

                            <label for="placeFormName">
                                Place Name *
                            </label>

                            <input
                                type="text"
                                id="placeFormName"
                                name="placeName"
                                placeholder="Place name"
                                required
                            >

                        </div>


                        <div class="admin-form-field">

                            <label for="placeFormCategory">
                                Category
                            </label>

                            <input
                                type="text"
                                id="placeFormCategory"
                                name="category"
                                placeholder="Historical, Nature, Religious..."
                            >

                        </div>


                        <div class="admin-form-field">

                            <label for="placeFormLocality">
                                Locality
                            </label>

                            <input
                                type="text"
                                id="placeFormLocality"
                                name="locality"
                                placeholder="Locality"
                            >

                        </div>


                        <div class="admin-form-field">

                            <label for="placeFormTaluk">
                                Taluk
                            </label>

                            <input
                                type="text"
                                id="placeFormTaluk"
                                name="taluk"
                                placeholder="Taluk"
                            >

                        </div>


                        <div class="admin-form-field">

                            <label for="placeFormDistrict">
                                District
                            </label>

                            <input
                                type="text"
                                id="placeFormDistrict"
                                name="district"
                                placeholder="District"
                                value="Vellore"
                            >

                        </div>

                    </div>

                </div>


                <!-- DESCRIPTION -->

                <div class="admin-form-section">

                    <div class="admin-form-section-title">
                        Place Information
                    </div>


                    <div class="admin-form-field">

                        <label for="placeFormDescription">
                            Description
                        </label>

                        <textarea
                            id="placeFormDescription"
                            name="description"
                            rows="4"
                            placeholder="General description of the place..."
                        ></textarea>

                    </div>


                    <div class="admin-form-grid">

                        <div class="admin-form-field">

                            <label for="placeFormWhatIsIt">
                                What Is It?
                            </label>

                            <textarea
                                id="placeFormWhatIsIt"
                                name="whatIsIt"
                                rows="4"
                                placeholder="Explain what this place is..."
                            ></textarea>

                        </div>


                        <div class="admin-form-field">

                            <label for="placeFormHistory">
                                Historical Background
                            </label>

                            <textarea
                                id="placeFormHistory"
                                name="historicalBackground"
                                rows="4"
                                placeholder="Historical information..."
                            ></textarea>

                        </div>


                        <div class="admin-form-field">

                            <label for="placeFormSignificance">
                                Primary Purpose / Significance
                            </label>

                            <textarea
                                id="placeFormSignificance"
                                name="primaryPurposeOrSignificance"
                                rows="4"
                                placeholder="Importance or significance..."
                            ></textarea>

                        </div>


                        <div class="admin-form-field">

                            <label for="placeFormPhysical">
                                Physical Characteristics
                            </label>

                            <textarea
                                id="placeFormPhysical"
                                name="physicalCharacteristics"
                                rows="4"
                                placeholder="Physical characteristics..."
                            ></textarea>

                        </div>


                        <div class="admin-form-field">

                            <label for="placeFormDimensions">
                                Dimensions / Size
                            </label>

                            <textarea
                                id="placeFormDimensions"
                                name="dimensionsOrSize"
                                rows="4"
                                placeholder="Dimensions or size..."
                            ></textarea>

                        </div>


                        <div class="admin-form-field">

                            <label for="placeFormContext">
                                Location Context
                            </label>

                            <textarea
                                id="placeFormContext"
                                name="locationContext"
                                rows="4"
                                placeholder="Location context..."
                            ></textarea>

                        </div>

                    </div>

                </div>


                <!-- VISITOR INFORMATION -->

                <div class="admin-form-section">

                    <div class="admin-form-section-title">
                        Visitor Information
                    </div>


                    <div class="admin-form-grid">

                        <div class="admin-form-field">

                            <label for="placeFormVisitor">
                                Visitor Information
                            </label>

                            <textarea
                                id="placeFormVisitor"
                                name="visitorInformation"
                                rows="4"
                                placeholder="Visitor information..."
                            ></textarea>

                        </div>


                        <div class="admin-form-field">

                            <label for="placeFormAccess">
                                Access / Transport
                            </label>

                            <textarea
                                id="placeFormAccess"
                                name="accessOrTransport"
                                rows="4"
                                placeholder="How visitors can reach the place..."
                            ></textarea>

                        </div>


                        <div class="admin-form-field">

                            <label for="placeFormBestTime">
                                Best Time / Season
                            </label>

                            <textarea
                                id="placeFormBestTime"
                                name="bestTimeOrSeason"
                                rows="4"
                                placeholder="Best time to visit..."
                            ></textarea>

                        </div>

                    </div>

                </div>


                <!-- MEDIA -->

                <div class="admin-form-section">

                    <div class="admin-form-section-title">
                        Multimedia
                    </div>


                    <div class="admin-form-field">

                        <label for="placeFormImages">
                            Image URLs
                        </label>

                        <textarea
                            id="placeFormImages"
                            name="images"
                            rows="4"
                            placeholder="Paste one image URL per line..."
                        ></textarea>

                        <small>
                            Enter one image URL on each line.
                        </small>

                    </div>


                    <div class="admin-form-field">

                        <label for="placeFormVideo">
                            Video Link
                        </label>

                        <input
                            type="url"
                            id="placeFormVideo"
                            name="videoLink"
                            placeholder="YouTube or video URL"
                        >

                    </div>

                </div>


                <!-- LOCATION -->

                <div class="admin-form-section">

                    <div class="admin-form-section-title">
                        Map Location
                    </div>


                    <div class="admin-form-grid">

                        <div class="admin-form-field">

                            <label for="placeFormLatitude">
                                Latitude
                            </label>

                            <input
                                type="number"
                                step="any"
                                id="placeFormLatitude"
                                name="latitude"
                                placeholder="Example: 12.9165"
                            >

                        </div>


                        <div class="admin-form-field">

                            <label for="placeFormLongitude">
                                Longitude
                            </label>

                            <input
                                type="number"
                                step="any"
                                id="placeFormLongitude"
                                name="longitude"
                                placeholder="Example: 79.1325"
                            >

                        </div>

                    </div>

                    <small>
                        Leave blank when verified coordinates
                        are not available.
                    </small>

                </div>


                <!-- ACTIONS -->

                <div class="admin-place-form-actions">

                    <button
                        type="button"
                        class="admin-place-cancel-button"
                        id="cancelPlaceForm"
                    >
                        Cancel
                    </button>


                    <button
                        type="submit"
                        class="admin-place-submit-button"
                        id="savePlaceFormButton"
                    >
                        Save Place
                    </button>

                </div>

            </form>

        </div>

    `;


    document.body.appendChild(
        modal
    );


    const closeButton =
        document.getElementById(
            "closePlaceModal"
        );


    const cancelButton =
        document.getElementById(
            "cancelPlaceForm"
        );


    const form =
        document.getElementById(
            "adminPlaceForm"
        );


    if (closeButton) {

        closeButton.addEventListener(
            "click",
            closePlaceModal
        );

    }


    if (cancelButton) {

        cancelButton.addEventListener(
            "click",
            closePlaceModal
        );

    }


    modal.addEventListener(
        "click",
        event => {

            if (
                event.target.dataset
                    .closePlaceModal ===
                "true"
            ) {

                closePlaceModal();

            }

        }
    );


    if (form) {

        form.addEventListener(
            "submit",
            handlePlaceFormSubmit
        );

    }


    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Escape" &&
                !modal.hidden
            ) {

                closePlaceModal();

            }

        }
    );

}


// ============================================================
// CURRENT EDITING PLACE
// ============================================================

let editingPlaceId = null;


// ============================================================
// OPEN ADD / EDIT MODAL
// ============================================================

function openPlaceModal(
    place = null
) {

    const modal =
        document.getElementById(
            "adminPlaceModal"
        );


    if (!modal) {
        return;
    }


    const form =
        document.getElementById(
            "adminPlaceForm"
        );


    const title =
        document.getElementById(
            "adminPlaceModalTitle"
        );


    const subtitle =
        document.getElementById(
            "adminPlaceModalSubtitle"
        );


    const submitButton =
        document.getElementById(
            "savePlaceFormButton"
        );


    clearPlaceFormMessage();


    if (form) {

        form.reset();

    }


    if (place) {

        editingPlaceId =
            place.placeId;


        if (title) {

            title.textContent =
                "Edit Place";

        }


        if (subtitle) {

            subtitle.textContent =
                `Update ${place.placeName || place.placeId}.`;

        }


        if (submitButton) {

            submitButton.textContent =
                "Update Place";

        }


        fillPlaceForm(
            place
        );

    } else {

        editingPlaceId =
            null;


        if (title) {

            title.textContent =
                "Add New Place";

        }


        if (subtitle) {

            subtitle.textContent =
                "Create a new place in Vellore Discover.";

        }


        if (submitButton) {

            submitButton.textContent =
                "Save Place";

        }

    }


    modal.hidden = false;

    document.body.classList.add(
        "admin-modal-open"
    );


    setTimeout(
        () => {

            const firstInput =
                document.getElementById(
                    "placeFormId"
                );


            if (firstInput) {

                firstInput.focus();

            }

        },
        50
    );

}


// ============================================================
// FILL PLACE FORM
// ============================================================

function fillPlaceForm(
    place
) {

    setFormValue(
        "placeFormId",
        place.placeId
    );


    setFormValue(
        "placeFormName",
        place.placeName
    );


    setFormValue(
        "placeFormCategory",
        place.category
    );


    setFormValue(
        "placeFormLocality",
        place.locality
    );


    setFormValue(
        "placeFormTaluk",
        place.taluk
    );


    setFormValue(
        "placeFormDistrict",
        place.district
    );


    setFormValue(
        "placeFormDescription",
        place.description
    );


    setFormValue(
        "placeFormWhatIsIt",
        place.whatIsIt
    );


    setFormValue(
        "placeFormHistory",
        place.historicalBackground
    );


    setFormValue(
        "placeFormSignificance",
        place.primaryPurposeOrSignificance
    );


    setFormValue(
        "placeFormPhysical",
        place.physicalCharacteristics
    );


    setFormValue(
        "placeFormDimensions",
        place.dimensionsOrSize
    );


    setFormValue(
        "placeFormContext",
        place.locationContext
    );


    setFormValue(
        "placeFormVisitor",
        place.visitorInformation
    );


    setFormValue(
        "placeFormAccess",
        place.accessOrTransport
    );


    setFormValue(
        "placeFormBestTime",
        place.bestTimeOrSeason
    );


    const images =
        Array.isArray(place.images)
            ? place.images
            : [];


    setFormValue(
        "placeFormImages",
        images.join("\n")
    );


    setFormValue(
        "placeFormVideo",
        place.videoLink
    );


    setFormValue(
        "placeFormLatitude",
        place.latitude
    );


    setFormValue(
        "placeFormLongitude",
        place.longitude
    );

}


// ============================================================
// PLACE FORM SUBMIT
// ============================================================

async function handlePlaceFormSubmit(
    event
) {

    event.preventDefault();


    const token =
        localStorage.getItem("token");


    if (!token) {

        redirectToLogin();

        return;
    }


    const placeId =
        getFormValue(
            "placeFormId"
        ).trim();


    const placeName =
        getFormValue(
            "placeFormName"
        ).trim();


    if (!placeId) {

        showPlaceFormMessage(
            "Place ID is required.",
            "error"
        );

        return;
    }


    if (!placeName) {

        showPlaceFormMessage(
            "Place Name is required.",
            "error"
        );

        return;
    }


    const imageText =
        getFormValue(
            "placeFormImages"
        );


    const images =
        imageText
            .split(/\r?\n/)
            .map(
                url =>
                    url.trim()
            )
            .filter(Boolean);


    const latitudeValue =
        getFormValue(
            "placeFormLatitude"
        ).trim();


    const longitudeValue =
        getFormValue(
            "placeFormLongitude"
        ).trim();


    const data = {

        placeId,

        placeName,

        category:
            getFormValue(
                "placeFormCategory"
            ).trim(),

        locality:
            getFormValue(
                "placeFormLocality"
            ).trim(),

        taluk:
            getFormValue(
                "placeFormTaluk"
            ).trim(),

        district:
            getFormValue(
                "placeFormDistrict"
            ).trim(),

        description:
            getFormValue(
                "placeFormDescription"
            ).trim(),

        whatIsIt:
            getFormValue(
                "placeFormWhatIsIt"
            ).trim(),

        historicalBackground:
            getFormValue(
                "placeFormHistory"
            ).trim(),

        primaryPurposeOrSignificance:
            getFormValue(
                "placeFormSignificance"
            ).trim(),

        physicalCharacteristics:
            getFormValue(
                "placeFormPhysical"
            ).trim(),

        dimensionsOrSize:
            getFormValue(
                "placeFormDimensions"
            ).trim(),

        locationContext:
            getFormValue(
                "placeFormContext"
            ).trim(),

        visitorInformation:
            getFormValue(
                "placeFormVisitor"
            ).trim(),

        accessOrTransport:
            getFormValue(
                "placeFormAccess"
            ).trim(),

        bestTimeOrSeason:
            getFormValue(
                "placeFormBestTime"
            ).trim(),

        videoLink:
            getFormValue(
                "placeFormVideo"
            ).trim(),

        latitude:
            latitudeValue === ""
                ? null
                : Number(
                    latitudeValue
                ),

        longitude:
            longitudeValue === ""
                ? null
                : Number(
                    longitudeValue
                ),

        images

    };


    const isEditing =
        Boolean(
            editingPlaceId
        );


    if (
        !isEditing
    ) {

        data.communityImages = [];

        data.communityVideos = [];

        data.communityRatingTotal = 0;

        data.communityRatingCount = 0;

        data.communityAverageRating = 0;

        data.likeCount = 0;

    }


    const submitButton =
        document.getElementById(
            "savePlaceFormButton"
        );


    if (submitButton) {

        submitButton.disabled = true;

        submitButton.textContent =
            isEditing
                ? "Updating..."
                : "Saving...";

    }


    try {

        const url =
            isEditing
                ? `${PLACES_API}/${encodeURIComponent(
                    editingPlaceId
                )}`
                : PLACES_API;


        const response =
            await fetch(
                url,
                {
                    method:
                        isEditing
                            ? "PUT"
                            : "POST",

                    headers: {

                        "Content-Type":
                            "application/json",

                        "Authorization":
                            `Bearer ${token}`

                    },

                    body:
                        JSON.stringify(
                            data
                        )

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

            showPlaceFormMessage(
                "Admin access required.",
                "error"
            );

            return;
        }


        if (!response.ok) {

            throw new Error(
                result.message ||
                "Failed to save place"
            );

        }


        closePlaceModal();


        showPlacesMessage(
            result.message ||
            (
                isEditing
                    ? "Place updated successfully."
                    : "Place created successfully."
            ),
            "success"
        );


        await loadAdminPlaces();


    } catch (error) {

        console.error(
            "Place form error:",
            error
        );


        showPlaceFormMessage(
            error.message ||
            "Failed to save place.",
            "error"
        );


    } finally {

        if (submitButton) {

            submitButton.disabled =
                false;

            submitButton.textContent =
                isEditing
                    ? "Update Place"
                    : "Save Place";

        }

    }

}


// ============================================================
// VIEW PLACE MODAL
// ============================================================

function openPlaceViewModal(
    place
) {

    const existing =
        document.getElementById(
            "adminPlaceViewModal"
        );


    if (existing) {

        existing.remove();

    }


    const image =
        getPlaceImage(
            place
        );


    const rating =
        Number(
            place.communityAverageRating
        ) || 0;


    const likes =
        Number(
            place.likeCount
        ) || 0;


    const imageHTML =
        image
            ? `

                <img
                    src="${escapeAttribute(image)}"
                    alt="${escapeAttribute(
                        place.placeName ||
                        "Place"
                    )}"
                    class="admin-place-view-image"
                >

            `
            : `

                <div class="admin-place-view-no-image">
                    📍
                </div>

            `;


    const modal =
        document.createElement(
            "div"
        );


    modal.id =
        "adminPlaceViewModal";


    modal.className =
        "admin-place-modal";


    modal.innerHTML = `

        <div
            class="admin-place-modal-overlay"
            data-close-view-modal="true"
        ></div>


        <div
            class="admin-place-view-dialog"
            role="dialog"
            aria-modal="true"
        >

            <div class="admin-place-view-header">

                <div>

                    <span class="admin-label">
                        PLACE DETAILS
                    </span>

                    <h2>
                        ${escapeHTML(
                            place.placeName ||
                            "Unnamed Place"
                        )}
                    </h2>

                    <span class="admin-place-card-id">
                        ${escapeHTML(
                            place.placeId ||
                            ""
                        )}
                    </span>

                </div>


                <button
                    type="button"
                    class="admin-place-modal-close"
                    id="closePlaceViewModal"
                >
                    ×
                </button>

            </div>


            <div class="admin-place-view-content">

                ${imageHTML}


                <div class="admin-place-view-stats">

                    <span>
                        📍
                        ${escapeHTML(
                            place.locality ||
                            place.taluk ||
                            place.district ||
                            "Vellore"
                        )}
                    </span>

                    <span>
                        ⭐
                        ${
                            rating > 0
                                ? rating.toFixed(1)
                                : "No rating"
                        }
                    </span>

                    <span>
                        ❤️ ${likes}
                    </span>

                    <span>
                        ${escapeHTML(
                            place.category ||
                            "Uncategorized"
                        )}
                    </span>

                </div>


                ${createViewField(
                    "Description",
                    place.description
                )}


                ${createViewField(
                    "What Is It?",
                    place.whatIsIt
                )}


                ${createViewField(
                    "Historical Background",
                    place.historicalBackground
                )}


                ${createViewField(
                    "Primary Purpose / Significance",
                    place.primaryPurposeOrSignificance
                )}


                ${createViewField(
                    "Physical Characteristics",
                    place.physicalCharacteristics
                )}


                ${createViewField(
                    "Dimensions / Size",
                    place.dimensionsOrSize
                )}


                ${createViewField(
                    "Location Context",
                    place.locationContext
                )}


                ${createViewField(
                    "Visitor Information",
                    place.visitorInformation
                )}


                ${createViewField(
                    "Access / Transport",
                    place.accessOrTransport
                )}


                ${createViewField(
                    "Best Time / Season",
                    place.bestTimeOrSeason
                )}


                ${
                    place.videoLink
                        ? `

                            <div class="admin-place-view-field">

                                <strong>
                                    Video
                                </strong>

                                <a
                                    href="${escapeAttribute(
                                        place.videoLink
                                    )}"
                                    target="_blank"
                                    rel="noopener"
                                >
                                    🎥 Open Video
                                </a>

                            </div>

                        `
                        : ""
                }


                ${
                    place.latitude !== null &&
                    place.latitude !== undefined &&
                    place.longitude !== null &&
                    place.longitude !== undefined
                        ? `

                            <div class="admin-place-view-field">

                                <strong>
                                    Coordinates
                                </strong>

                                <span>
                                    ${escapeHTML(
                                        String(
                                            place.latitude
                                        )
                                    )},
                                    ${escapeHTML(
                                        String(
                                            place.longitude
                                        )
                                    )}
                                </span>

                            </div>

                        `
                        : ""
                }


                ${
                    Array.isArray(
                        place.images
                    ) &&
                    place.images.length > 0
                        ? `

                            <div class="admin-place-view-field">

                                <strong>
                                    Images
                                </strong>

                                <span>
                                    ${place.images.length}
                                    image${
                                        place.images.length === 1
                                            ? ""
                                            : "s"
                                    }
                                </span>

                            </div>

                        `
                        : ""
                }

            </div>


            <div class="admin-place-view-actions">

                <button
                    type="button"
                    class="admin-place-cancel-button"
                    id="closePlaceViewButton"
                >
                    Close
                </button>


                <button
                    type="button"
                    class="admin-place-submit-button"
                    id="editPlaceFromView"
                >
                    ✏️ Edit Place
                </button>

            </div>

        </div>

    `;


    document.body.appendChild(
        modal
    );


    document.body.classList.add(
        "admin-modal-open"
    );


    const closeButton =
        document.getElementById(
            "closePlaceViewModal"
        );


    const closeBottomButton =
        document.getElementById(
            "closePlaceViewButton"
        );


    const editButton =
        document.getElementById(
            "editPlaceFromView"
        );


    if (closeButton) {

        closeButton.addEventListener(
            "click",
            closePlaceViewModal
        );

    }


    if (closeBottomButton) {

        closeBottomButton.addEventListener(
            "click",
            closePlaceViewModal
        );

    }


    if (editButton) {

        editButton.addEventListener(
            "click",
            () => {

                closePlaceViewModal();

                openPlaceModal(
                    place
                );

            }
        );

    }


    modal.addEventListener(
        "click",
        event => {

            if (
                event.target.dataset
                    .closeViewModal ===
                "true"
            ) {

                closePlaceViewModal();

            }

        }
    );

}


// ============================================================
// VIEW FIELD
// ============================================================

function createViewField(
    label,
    value
) {

    if (
        value === null ||
        value === undefined ||
        String(value).trim() === ""
    ) {

        return "";

    }


    return `

        <div class="admin-place-view-field">

            <strong>
                ${escapeHTML(label)}
            </strong>

            <p>
                ${escapeHTML(value)}
            </p>

        </div>

    `;

}


// ============================================================
// CLOSE VIEW MODAL
// ============================================================

function closePlaceViewModal() {

    const modal =
        document.getElementById(
            "adminPlaceViewModal"
        );


    if (modal) {

        modal.remove();

    }


    if (
        !document.getElementById(
            "adminPlaceModal"
        ) ||
        document.getElementById(
            "adminPlaceModal"
        ).hidden
    ) {

        document.body.classList.remove(
            "admin-modal-open"
        );

    }

}


// ============================================================
// CLOSE ADD / EDIT MODAL
// ============================================================

function closePlaceModal() {

    const modal =
        document.getElementById(
            "adminPlaceModal"
        );


    if (modal) {

        modal.hidden = true;

    }


    editingPlaceId =
        null;


    document.body.classList.remove(
        "admin-modal-open"
    );


    clearPlaceFormMessage();

}


// ============================================================
// FORM HELPERS
// ============================================================

function setFormValue(
    id,
    value
) {

    const element =
        document.getElementById(id);


    if (element) {

        element.value =
            value === null ||
            value === undefined
                ? ""
                : value;

    }

}


function getFormValue(
    id
) {

    const element =
        document.getElementById(id);


    return element
        ? element.value
        : "";

}


// ============================================================
// PLACE FORM MESSAGE
// ============================================================

function showPlaceFormMessage(
    message,
    type
) {

    const element =
        document.getElementById(
            "adminPlaceFormMessage"
        );


    if (!element) {
        return;
    }


    element.textContent =
        message;


    element.className =
        `admin-place-form-message ${type}`;


    element.hidden =
        false;

}


function clearPlaceFormMessage() {

    const element =
        document.getElementById(
            "adminPlaceFormMessage"
        );


    if (!element) {
        return;
    }


    element.textContent = "";

    element.hidden = true;

    element.className =
        "admin-place-form-message";

}


// ============================================================
// PLACES LOADING
// ============================================================

function showPlacesLoading(
    show
) {

    const loading =
        document.getElementById(
            "adminPlacesLoading"
        );


    const grid =
        document.getElementById(
            "adminPlacesGrid"
        );


    if (loading) {

        loading.hidden =
            !show;


        loading.style.display =
            show
                ? "flex"
                : "none";

    }


    if (
        show &&
        grid
    ) {

        grid.innerHTML = "";

    }

}


// ============================================================
// PLACES EMPTY
// ============================================================

function showPlacesEmpty(
    show
) {

    const empty =
        document.getElementById(
            "adminPlacesEmpty"
        );


    if (empty) {

        empty.hidden =
            !show;

    }

}


function hidePlacesEmpty() {

    showPlacesEmpty(false);

}


// ============================================================
// PLACES MESSAGE
// ============================================================

function showPlacesMessage(
    message,
    type
) {

    const element =
        document.getElementById(
            "adminPlacesMessage"
        );


    if (!element) {
        return;
    }


    element.textContent =
        message;


    element.className =
        `admin-message ${type}`;


    element.hidden =
        false;


    if (type === "success") {

        setTimeout(
            () => {

                clearPlacesMessage();

            },
            3500
        );

    }

}


function clearPlacesMessage() {

    const element =
        document.getElementById(
            "adminPlacesMessage"
        );


    if (!element) {
        return;
    }


    element.textContent = "";

    element.hidden = true;

    element.className =
        "admin-message";

}


// ============================================================
// CLEAR PLACE FILTERS
// ============================================================

function clearAdminPlaceFilters() {

    adminPlaceSearchText = "";

    adminPlaceCategory = "";

    adminPlaceLocality = "";

    adminPlaceSort = "default";


    const search =
        document.getElementById(
            "adminPlaceSearch"
        );


    if (search) {

        search.value = "";

    }


    const category =
        document.getElementById(
            "adminPlaceCategoryFilter"
        );


    if (category) {

        category.value = "";

    }


    const sort =
        document.getElementById(
            "adminPlaceSort"
        );


    if (sort) {

        sort.value = "default";

    }


    updateAdminLocalityFilter();


    const locality =
        document.getElementById(
            "adminPlaceLocalityFilter"
        );


    if (locality) {

        locality.value = "";

    }


    renderAdminPlaces();

}


// ============================================================
// TRUNCATE TEXT
// ============================================================

function truncateText(
    value,
    length
) {

    const text =
        String(
            value || ""
        ).trim();


    if (
        text.length <= length
    ) {

        return text;

    }


    return (
        text.slice(
            0,
            length
        ).trim() +
        "..."
    );

}


// ============================================================
// EXISTING LOADING STATE
// ============================================================

function showLoading(
    show
) {

    const loading =
        document.getElementById(
            "adminLoading"
        );


    const grid =
        document.getElementById(
            "adminContributionsGrid"
        );


    if (loading) {

        loading.hidden =
            !show;


        loading.style.display =
            show
                ? "flex"
                : "none";

    }


    if (
        show &&
        grid
    ) {

        grid.innerHTML = "";

    }

}


// ============================================================
// EXISTING EMPTY STATE
// ============================================================

function showEmpty(
    show
) {

    const empty =
        document.getElementById(
            "adminEmpty"
        );


    if (empty) {

        empty.hidden =
            !show;

    }

}


function hideEmpty() {

    showEmpty(false);

}


// ============================================================
// EXISTING MESSAGE
// ============================================================

function showMessage(
    message,
    type
) {

    const element =
        document.getElementById(
            "adminMessage"
        );


    if (!element) {
        return;
    }


    element.textContent =
        message;


    element.className =
        `admin-message ${type}`;


    element.hidden =
        false;

}


function clearMessage() {

    const element =
        document.getElementById(
            "adminMessage"
        );


    if (!element) {
        return;
    }


    element.textContent = "";

    element.hidden = true;

    element.className =
        "admin-message";

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
// USER MANAGEMENT
// ============================================================

const USERS_API =
    `${ADMIN_API}/users`;

let adminUsers = [];


/// ============================================================
// SETUP USER MANAGEMENT
// ============================================================

function setupUserManagement() {

    // --------------------------------------------------------
    // MANAGE USERS BUTTON
    // --------------------------------------------------------

    const manageUsersButton =
        document.getElementById(
            "manageUsersButton"
        );


    if (manageUsersButton) {

        manageUsersButton.addEventListener(
            "click",
            () => {

                const section =
                    document.getElementById(
                        "usersManagementPanel"
                    );


                if (section) {

                    section.scrollIntoView({
                        behavior: "smooth",
                        block: "start"
                    });

                }


                loadAdminUsers();

            }
        );

    }


    // --------------------------------------------------------
    // SEARCH
    // --------------------------------------------------------

    const searchInput =
        document.getElementById(
            "adminUserSearch"
        );


    if (searchInput) {

        searchInput.addEventListener(
            "input",
            () => {

                const searchText =
                    searchInput.value
                        .trim()
                        .toLowerCase();


                if (!searchText) {

                    renderAdminUsers(
                        adminUsers
                    );

                    updateAdminUserCount(
                        adminUsers.length
                    );

                    return;
                }


                const filteredUsers =
                    adminUsers.filter(
                        user => {

                            const searchable =
                                [
                                    user.name,
                                    user.email,
                                    user.role
                                ]
                                    .join(" ")
                                    .toLowerCase();


                            return searchable.includes(
                                searchText
                            );

                        }
                    );


                renderAdminUsers(
                    filteredUsers
                );


                updateAdminUserCount(
                    filteredUsers.length
                );

            }
        );

    }


    // --------------------------------------------------------
    // CLEAR SEARCH
    // --------------------------------------------------------

    const clearSearch =
        document.getElementById(
            "clearAdminUserSearch"
        );


    if (clearSearch) {

        clearSearch.addEventListener(
            "click",
            () => {

                if (searchInput) {

                    searchInput.value = "";

                }


                renderAdminUsers(
                    adminUsers
                );


                updateAdminUserCount(
                    adminUsers.length
                );

            }
        );

    }


    // --------------------------------------------------------
    // REFRESH USERS
    // --------------------------------------------------------

    const refreshButton =
        document.getElementById(
            "refreshAdminUsers"
        );


    if (refreshButton) {

        refreshButton.addEventListener(
            "click",
            loadAdminUsers
        );

    }


    // --------------------------------------------------------
    // RETRY
    // --------------------------------------------------------

    const retryButton =
        document.getElementById(
            "retryAdminUsers"
        );


    if (retryButton) {

        retryButton.addEventListener(
            "click",
            loadAdminUsers
        );

    }

}
// ============================================================
// REPORTS & ANALYTICS
// ============================================================

function setupReportsAnalytics() {

    const reportsButton =
        document.getElementById(
            "viewReportsButton"
        );

    if (reportsButton) {

        reportsButton.addEventListener(
            "click",
            () => {

                const section =
                    document.getElementById(
                        "reportsManagementPanel"
                    );

                if (section) {

                    section.scrollIntoView({
                        behavior: "smooth",
                        block: "start"
                    });

                }

                loadReportsAnalytics();

            }
        );

    }


    const refreshButton =
        document.getElementById(
            "refreshAdminReports"
        );

    if (refreshButton) {

        refreshButton.addEventListener(
            "click",
            loadReportsAnalytics
        );

    }


    const retryButton =
        document.getElementById(
            "retryAdminReports"
        );

    if (retryButton) {

        retryButton.addEventListener(
            "click",
            loadReportsAnalytics
        );

    }

}

// ============================================================
// MEDIA MANAGEMENT SETUP
// ============================================================

function setupMediaManagement() {

    const manageMediaButton =
        document.getElementById(
            "manageMediaButton"
        );

    if (manageMediaButton) {

        manageMediaButton.addEventListener(
            "click",
            () => {

                const section =
                    document.getElementById(
                        "mediaManagementPanel"
                    );

                if (section) {

                    section.scrollIntoView({
                        behavior: "smooth",
                        block: "start"
                    });

                }

                loadAdminMedia();

            }
        );

    }


    const refreshButton =
        document.getElementById(
            "refreshAdminMedia"
        );

    if (refreshButton) {

        refreshButton.addEventListener(
            "click",
            loadAdminMedia
        );

    }


    const retryButton =
        document.getElementById(
            "retryAdminMedia"
        );

    if (retryButton) {

        retryButton.addEventListener(
            "click",
            loadAdminMedia
        );

    }


    const searchInput =
        document.getElementById(
            "adminMediaSearch"
        );

    if (searchInput) {

        searchInput.addEventListener(
            "input",
            applyAdminMediaFilters
        );

    }


    const categoryFilter =
        document.getElementById(
            "adminMediaCategory"
        );

    if (categoryFilter) {

        categoryFilter.addEventListener(
            "change",
            applyAdminMediaFilters
        );

    }


    const clearSearch =
        document.getElementById(
            "clearAdminMediaSearch"
        );

    if (clearSearch) {

        clearSearch.addEventListener(
            "click",
            () => {

                if (searchInput) {
                    searchInput.value = "";
                }

                applyAdminMediaFilters();

            }
        );

    }


    const clearFilters =
        document.getElementById(
            "clearAdminMediaFilters"
        );

    if (clearFilters) {

        clearFilters.addEventListener(
            "click",
            clearAdminMediaFilters
        );

    }


    const emptyClearFilters =
        document.getElementById(
            "clearAdminMediaEmptyFilters"
        );

    if (emptyClearFilters) {

        emptyClearFilters.addEventListener(
            "click",
            clearAdminMediaFilters
        );

    }

}

// ============================================================
// LOAD ADMIN USERS
// ============================================================

async function loadAdminUsers() {

    const token =
        localStorage.getItem("token")
        ;

    if (!token) {
        redirectToLogin();
        return;
    }

    const grid =
        document.getElementById(
            "adminUsersGrid"
        );

    const loading =
        document.getElementById(
            "adminUsersLoading"
        );

    const errorBox =
        document.getElementById(
            "adminUsersError"
        );

    const emptyBox =
        document.getElementById(
            "adminUsersEmpty"
        );

    if (!grid) {
        console.error(
            "adminUsersGrid not found."
        );
        return;
    }

    // --------------------------------------------------------
    // RESET UI
    // --------------------------------------------------------

    if (loading) {
        loading.hidden = false;
    }

    if (errorBox) {
        errorBox.hidden = true;
    }

    if (emptyBox) {
        emptyBox.hidden = true;
    }

    grid.innerHTML = "";

    try {

        const response =
            await fetch(
                USERS_API,
                {
                    method: "GET",

                    headers: {
                        "Authorization":
                            `Bearer ${token}`,

                        "Accept":
                            "application/json"
                    }
                }
            );

        const result =
            await response.json();

        console.log(
            "ADMIN USERS API:",
            result
        );

        // ----------------------------------------------------
        // AUTHENTICATION FAILURE
        // ----------------------------------------------------

        if (response.status === 401) {

            if (loading) {
                loading.hidden = true;
            }

            handleAuthenticationFailure();
            return;
        }

        // ----------------------------------------------------
        // ADMIN ACCESS FAILURE
        // ----------------------------------------------------

        if (response.status === 403) {

            if (loading) {
                loading.hidden = true;
            }

            grid.innerHTML = `
                <div class="admin-users-error">

                    <div class="admin-users-error-icon">
                        🔒
                    </div>

                    <h3>
                        Admin Access Required
                    </h3>

                    <p>
                        You do not have permission
                        to view registered users.
                    </p>

                </div>
            `;

            return;
        }

        // ----------------------------------------------------
        // OTHER API ERRORS
        // ----------------------------------------------------

        if (!response.ok) {

            throw new Error(
                result.message ||
                "Failed to load users"
            );
        }

        // ----------------------------------------------------
        // GET USERS
        // ----------------------------------------------------

        const users =
            Array.isArray(result.data)
                ? result.data
                : [];

        console.log(
            "ADMIN USERS COUNT:",
            users.length
        );

        /*
         * Keep the fetched array as the
         * source of truth.
         */
        adminUsers = users;

        // ----------------------------------------------------
        // UPDATE USER COUNT
        // ----------------------------------------------------

        updateAdminUserCount(
            users.length
        );

        // ----------------------------------------------------
        // HIDE LOADING
        // ----------------------------------------------------

        if (loading) {
            loading.hidden = true;
        }

        // ----------------------------------------------------
        // HANDLE EMPTY RESULT
        // ----------------------------------------------------

        if (users.length === 0) {

            if (emptyBox) {
                emptyBox.hidden = false;
            }

            grid.innerHTML = "";

            return;
        }

        // ----------------------------------------------------
        // RENDER USERS
        // ----------------------------------------------------

        renderAdminUsers(
            users
        );

    } catch (error) {

        console.error(
            "Admin users error:",
            error
        );

        // Hide loading
        if (loading) {
            loading.hidden = true;
        }

        // Show error message
        if (errorBox) {

            const errorText =
                document.getElementById(
                    "adminUsersErrorText"
                );

            if (errorText) {

                errorText.textContent =
                    error.message ||
                    "Something went wrong while loading users.";
            }

            errorBox.hidden = false;
        }

        // Fallback error inside grid
        if (!errorBox) {

            grid.innerHTML = `
                <div class="admin-users-error">

                    <div class="admin-users-error-icon">
                        ⚠️
                    </div>

                    <h3>
                        Unable to load users
                    </h3>

                    <p>
                        ${escapeHTML(
                            error.message ||
                            "Something went wrong."
                        )}
                    </p>

                    <button
                        type="button"
                        class="admin-user-retry-button"
                        onclick="loadAdminUsers()"
                    >
                        Try Again
                    </button>

                </div>
            `;
        }
    }
}

// ============================================================
// LOAD ADMIN MEDIA
// ============================================================

async function loadAdminMedia() {

    const token =
        localStorage.getItem("token");

    if (!token) {

        window.location.href =
            "login.html";

        return;

    }


    const loading =
        document.getElementById(
            "adminMediaLoading"
        );

    const errorPanel =
        document.getElementById(
            "adminMediaError"
        );

    const content =
        document.getElementById(
            "adminMediaContent"
        );

    const errorText =
        document.getElementById(
            "adminMediaErrorText"
        );


    if (loading) {
        loading.hidden = false;
    }

    if (errorPanel) {
        errorPanel.hidden = true;
    }

    if (content) {
        content.hidden = true;
    }


    try {

        const response =
            await fetch(
                `${ADMIN_API}/media`,
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            if (
                response.status === 401 ||
                response.status === 403
            ) {

                localStorage.removeItem(
                    "token"
                );

                localStorage.removeItem(
                    "user"
                );

                window.location.href =
                    "login.html";

                return;

            }

            throw new Error(
                data.message ||
                "Failed to load media"
            );

        }


        if (!data.success) {

            throw new Error(
                data.message ||
                "Failed to load media"
            );

        }


        adminMedia =
            Array.isArray(data.data)
                ? data.data
                : [];


        filteredAdminMedia =
            [...adminMedia];


        populateAdminMediaCategories();

        updateAdminMediaSummary();

        renderAdminMedia();


        if (content) {
            content.hidden = false;
        }


    } catch (error) {

        console.error(
            "Admin media loading error:",
            error
        );


        if (errorText) {

            errorText.textContent =
                error.message ||
                "Failed to load media.";

        }


        if (errorPanel) {
            errorPanel.hidden = false;
        }


    } finally {

        if (loading) {
            loading.hidden = true;
        }

    }

}

// ============================================================
// POPULATE MEDIA CATEGORY FILTER
// ============================================================

function populateAdminMediaCategories() {

    const categorySelect =
        document.getElementById(
            "adminMediaCategory"
        );

    if (!categorySelect) {
        return;
    }


    const currentValue =
        categorySelect.value;


    const categories =
        [
            ...new Set(
                adminMedia
                    .map(
                        place =>
                            place.category
                    )
                    .filter(
                        category =>
                            category &&
                            category.trim()
                    )
            )
        ]
        .sort(
            (a, b) =>
                a.localeCompare(b)
        );


    categorySelect.innerHTML = `
        <option value="">
            All Categories
        </option>
    `;


    categories.forEach(
        category => {

            const option =
                document.createElement(
                    "option"
                );

            option.value =
                category;

            option.textContent =
                category;

            categorySelect.appendChild(
                option
            );

        }
    );


    if (
        categories.includes(
            currentValue
        )
    ) {

        categorySelect.value =
            currentValue;

    }

}


// ============================================================
// APPLY MEDIA SEARCH / FILTERS
// ============================================================

function applyAdminMediaFilters() {

    const searchInput =
        document.getElementById(
            "adminMediaSearch"
        );

    const categorySelect =
        document.getElementById(
            "adminMediaCategory"
        );


    const searchText =
        searchInput
            ? searchInput.value
                .trim()
                .toLowerCase()
            : "";


    const selectedCategory =
        categorySelect
            ? categorySelect.value
            : "";


    filteredAdminMedia =
        adminMedia.filter(
            place => {

                const searchableText =
                    [
                        place.placeId,
                        place.placeName,
                        place.locality,
                        place.category
                    ]
                        .filter(Boolean)
                        .join(" ")
                        .toLowerCase();


                const matchesSearch =
                    !searchText ||
                    searchableText.includes(
                        searchText
                    );


                const matchesCategory =
                    !selectedCategory ||
                    place.category ===
                        selectedCategory;


                return (
                    matchesSearch &&
                    matchesCategory
                );

            }
        );


    renderAdminMedia();

}


// ============================================================
// CLEAR MEDIA FILTERS
// ============================================================

function clearAdminMediaFilters() {

    const searchInput =
        document.getElementById(
            "adminMediaSearch"
        );

    const categorySelect =
        document.getElementById(
            "adminMediaCategory"
        );


    if (searchInput) {
        searchInput.value = "";
    }


    if (categorySelect) {
        categorySelect.value = "";
    }


    filteredAdminMedia =
        [...adminMedia];


    renderAdminMedia();

}


// ============================================================
// UPDATE MEDIA SUMMARY
// ============================================================

function updateAdminMediaSummary() {

    const totalPlaces =
        adminMedia.length;


    const totalImages =
        adminMedia.reduce(
            (total, place) =>
                total +
                (
                    Array.isArray(
                        place.images
                    )
                        ? place.images.length
                        : 0
                ),
            0
        );


    const placesWithVideo =
        adminMedia.filter(
            place =>
                place.hasVideo
        ).length;


    const communityMedia =
        adminMedia.reduce(
            (total, place) =>
                total +
                (
                    Number(
                        place.communityImageCount
                    ) || 0
                ) +
                (
                    Number(
                        place.communityVideoCount
                    ) || 0
                ),
            0
        );


    setMediaValue(
        "mediaTotalPlaces",
        totalPlaces
    );

    setMediaValue(
        "mediaTotalImages",
        totalImages
    );

    setMediaValue(
        "mediaPlacesWithVideo",
        placesWithVideo
    );

    setMediaValue(
        "mediaCommunityItems",
        communityMedia
    );

}


// ============================================================
// SET MEDIA STATISTIC VALUE
// ============================================================

function setMediaValue(
    elementId,
    value
) {

    const element =
        document.getElementById(
            elementId
        );


    if (element) {
        element.textContent =
            value;
    }

}


// ============================================================
// RENDER MEDIA PLACES
// ============================================================

function renderAdminMedia() {

    const grid =
        document.getElementById(
            "adminMediaGrid"
        );

    const empty =
        document.getElementById(
            "adminMediaEmpty"
        );


    if (!grid) {
        return;
    }


    grid.innerHTML = "";


    if (
        !filteredAdminMedia ||
        filteredAdminMedia.length === 0
    ) {

        if (empty) {
            empty.hidden = false;
        }

        return;

    }


    if (empty) {
        empty.hidden = true;
    }


    filteredAdminMedia.forEach(
        place => {

            grid.appendChild(
                createAdminMediaCard(
                    place
                )
            );

        }
    );

}


// ============================================================
// CREATE MEDIA CARD
// ============================================================

function createAdminMediaCard(
    place
) {

    const card =
        document.createElement(
            "article"
        );


    card.className =
        "admin-media-card";


    const images =
        Array.isArray(
            place.images
        )
            ? place.images
            : [];


    const firstImage =
        images.length > 0
            ? images[0]
            : "";


    const imageCount =
        images.length;


    const videoLink =
        place.videoLink || "";


    const communityImages =
        Number(
            place.communityImageCount
        ) || 0;


    const communityVideos =
        Number(
            place.communityVideoCount
        ) || 0;


    card.innerHTML = `

        <div class="admin-media-card-image">

            ${
                firstImage
                    ? `
                        <img
                            src="${escapeMediaHTML(
                                firstImage
                            )}"
                            alt="${escapeMediaHTML(
                                place.placeName
                            )}"
                            loading="lazy"
                            onerror="this.style.display='none'; this.parentElement.classList.add('media-image-error');"
                        >
                    `
                    : `
                        <div class="admin-media-no-image">
                            🖼️
                            <span>
                                No official image
                            </span>
                        </div>
                    `
            }

            <div class="admin-media-image-count">
                🖼️ ${imageCount}
            </div>

        </div>


        <div class="admin-media-card-body">

            <div class="admin-media-card-meta">

                <span class="admin-media-place-id">
                    ${escapeMediaHTML(
                        place.placeId
                    )}
                </span>

                ${
                    place.category
                        ? `
                            <span class="admin-media-category">
                                ${escapeMediaHTML(
                                    place.category
                                )}
                            </span>
                        `
                        : ""
                }

            </div>


            <h3>
                ${escapeMediaHTML(
                    place.placeName
                )}
            </h3>


            <p class="admin-media-locality">
                📍
                ${escapeMediaHTML(
                    place.locality ||
                    "Location not specified"
                )}
            </p>


            <div class="admin-media-status-row">

                <span
                    class="${
                        imageCount > 0
                            ? "has-media"
                            : "no-media"
                    }"
                >
                    ${
                        imageCount > 0
                            ? "✓ Images"
                            : "○ No Images"
                    }
                </span>


                <span
                    class="${
                        videoLink
                            ? "has-media"
                            : "no-media"
                    }"
                >
                    ${
                        videoLink
                            ? "✓ Video"
                            : "○ No Video"
                    }
                </span>

            </div>


            <div class="admin-media-community-info">

                <span>
                    👥
                    ${communityImages}
                    community images
                </span>

                <span>
                    🎥
                    ${communityVideos}
                    community videos
                </span>

            </div>


            <div class="admin-media-card-actions">

                ${
                    imageCount > 0
                        ? `
                            <button
                                type="button"
                                class="admin-media-action-button"
                                data-media-action="view-images"
                                data-place-id="${escapeMediaHTML(
                                    place.placeId
                                )}"
                            >
                                🖼️ View Images
                            </button>
                        `
                        : ""
                }


                <button
                    type="button"
                    class="admin-media-action-button"
                    data-media-action="add-image"
                    data-place-id="${escapeMediaHTML(
                        place.placeId
                    )}"
                >
                    + Add Image
                </button>


                ${
                    videoLink
                        ? `
                            <button
                                type="button"
                                class="admin-media-action-button"
                                data-media-action="edit-video"
                                data-place-id="${escapeMediaHTML(
                                    place.placeId
                                )}"
                            >
                                🎥 Manage Video
                            </button>
                        `
                        : `
                            <button
                                type="button"
                                class="admin-media-action-button"
                                data-media-action="edit-video"
                                data-place-id="${escapeMediaHTML(
                                    place.placeId
                                )}"
                            >
                                + Add Video
                            </button>
                        `
                }

            </div>

        </div>

    `;


    return card;

}


// ============================================================
// SAFE HTML ESCAPE FOR MEDIA UI
// ============================================================

function escapeMediaHTML(
    value
) {

    return String(
        value ?? ""
    )
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
// MEDIA CARD ACTION HANDLER
// ============================================================

document.addEventListener(
    "click",
    event => {

        const button =
            event.target.closest(
                "[data-media-action]"
            );


        if (!button) {
            return;
        }


        const action =
            button.dataset.mediaAction;


        const placeId =
            button.dataset.placeId;


        if (!placeId) {
            return;
        }


        if (
            action ===
            "view-images"
        ) {

            openMediaImagesViewer(
                placeId
            );

        }


        if (
            action ===
            "add-image"
        ) {

            openAddMediaImagePrompt(
                placeId
            );

        }


        if (
            action ===
            "edit-video"
        ) {

            openEditMediaVideoPrompt(
                placeId
            );

        }

    }
);


// ============================================================
// FIND MEDIA PLACE
// ============================================================

function findAdminMediaPlace(
    placeId
) {

    return adminMedia.find(
        place =>
            place.placeId ===
            placeId
    );

}


// ============================================================
// VIEW IMAGES
// ============================================================

function openMediaImagesViewer(
    placeId
) {

    const place =
        findAdminMediaPlace(
            placeId
        );


    if (!place) {
        return;
    }


    const images =
        Array.isArray(
            place.images
        )
            ? place.images
            : [];


    if (images.length === 0) {

        alert(
            "This place has no official images."
        );

        return;

    }


    const imageList =
        images
            .map(
                (url, index) => `
                    <div
                        style="
                            margin-bottom:16px;
                            padding-bottom:16px;
                            border-bottom:1px solid #e5e7eb;
                        "
                    >

                        <img
                            src="${escapeMediaHTML(
                                url
                            )}"
                            alt="Image ${index + 1}"
                            style="
                                width:100%;
                                max-height:260px;
                                object-fit:cover;
                                border-radius:12px;
                                display:block;
                                margin-bottom:10px;
                            "
                            onerror="this.style.opacity='0.4';"
                        >

                        <div
                            style="
                                display:flex;
                                gap:10px;
                                align-items:center;
                                justify-content:space-between;
                            "
                        >

                            <small
                                style="
                                    word-break:break-all;
                                    color:#64748b;
                                "
                            >
                                Image ${index + 1}
                            </small>

                            <button
                                type="button"
                                class="admin-media-delete-image"
                                data-delete-image-place="${escapeMediaHTML(
                                    place.placeId
                                )}"
                                data-delete-image-url="${escapeMediaHTML(
                                    url
                                )}"
                                style="
                                    border:0;
                                    border-radius:8px;
                                    padding:7px 11px;
                                    cursor:pointer;
                                "
                            >
                                Remove
                            </button>

                        </div>

                    </div>
                `
            )
            .join("");


    showMediaModal(
        `Official Images — ${place.placeName}`,
        `
            <div>
                ${imageList}
            </div>
        `
    );

}


// ============================================================
// ADD IMAGE
// ============================================================

function openAddMediaImagePrompt(
    placeId
) {

    const place =
        findAdminMediaPlace(
            placeId
        );


    if (!place) {
        return;
    }


    const url =
        prompt(
            `Enter the official image URL for "${place.placeName}":`
        );


    if (
        url === null
    ) {
        return;
    }


    const cleanUrl =
        url.trim();


    if (!cleanUrl) {

        alert(
            "Image URL cannot be empty."
        );

        return;

    }


    addOfficialMediaImage(
        placeId,
        cleanUrl
    );

}


// ============================================================
// ADD OFFICIAL IMAGE API
// ============================================================

async function addOfficialMediaImage(
    placeId,
    imageUrl
) {

    const token =
        localStorage.getItem(
            "token"
        );


    try {

        const response =
            await fetch(
                `${ADMIN_API}/media/${encodeURIComponent(
                    placeId
                )}/images`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json",

                        Authorization:
                            `Bearer ${token}`
                    },

                    body:
                        JSON.stringify({
                            imageUrl
                        })
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Failed to add image"
            );

        }


        alert(
            "Official image added successfully."
        );


        await loadAdminMedia();


    } catch (error) {

        console.error(
            "Add official image error:",
            error
        );


        alert(
            error.message ||
            "Failed to add image."
        );

    }

}


// ============================================================
// EDIT OFFICIAL VIDEO
// ============================================================

function openEditMediaVideoPrompt(
    placeId
) {

    const place =
        findAdminMediaPlace(
            placeId
        );


    if (!place) {
        return;
    }


    const currentUrl =
        place.videoLink || "";


    const message =
        currentUrl
            ? `Current video:\n${currentUrl}\n\nEnter the new official video URL.\nLeave blank to remove the video.`
            : `Enter the official video URL for "${place.placeName}".`;


    const url =
        prompt(
            message,
            currentUrl
        );


    if (
        url === null
    ) {
        return;
    }


    updateOfficialMediaVideo(
        placeId,
        url.trim()
    );

}


// ============================================================
// UPDATE OFFICIAL VIDEO API
// ============================================================

async function updateOfficialMediaVideo(
    placeId,
    videoUrl
) {

    const token =
        localStorage.getItem(
            "token"
        );


    try {

        const response =
            await fetch(
                `${ADMIN_API}/media/${encodeURIComponent(
                    placeId
                )}/video`,
                {
                    method: "PUT",

                    headers: {
                        "Content-Type":
                            "application/json",

                        Authorization:
                            `Bearer ${token}`
                    },

                    body:
                        JSON.stringify({
                            videoUrl
                        })
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Failed to update video"
            );

        }


        alert(
            videoUrl
                ? "Official video updated successfully."
                : "Official video removed successfully."
        );


        await loadAdminMedia();


    } catch (error) {

        console.error(
            "Update official video error:",
            error
        );


        alert(
            error.message ||
            "Failed to update video."
        );

    }

}


// ============================================================
// DELETE OFFICIAL IMAGE
// ============================================================

document.addEventListener(
    "click",
    event => {

        const button =
            event.target.closest(
                ".admin-media-delete-image"
            );


        if (!button) {
            return;
        }


        const placeId =
            button.dataset.deleteImagePlace;


        const imageUrl =
            button.dataset.deleteImageUrl;


        if (
            !placeId ||
            !imageUrl
        ) {
            return;
        }


        const confirmed =
            confirm(
                "Are you sure you want to remove this official image?"
            );


        if (!confirmed) {
            return;
        }


        removeOfficialMediaImage(
            placeId,
            imageUrl
        );

    }
);


// ============================================================
// REMOVE OFFICIAL IMAGE API
// ============================================================

async function removeOfficialMediaImage(
    placeId,
    imageUrl
) {

    const token =
        localStorage.getItem(
            "token"
        );


    try {

        const response =
            await fetch(
                `${ADMIN_API}/media/${encodeURIComponent(
                    placeId
                )}/images`,
                {
                    method: "DELETE",

                    headers: {
                        "Content-Type":
                            "application/json",

                        Authorization:
                            `Bearer ${token}`
                    },

                    body:
                        JSON.stringify({
                            imageUrl
                        })
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Failed to remove image"
            );

        }


        alert(
            "Official image removed successfully."
        );


        await loadAdminMedia();


    } catch (error) {

        console.error(
            "Remove official image error:",
            error
        );


        alert(
            error.message ||
            "Failed to remove image."
        );

    }

}


// ============================================================
// SIMPLE MEDIA MODAL
// ============================================================

function showMediaModal(
    title,
    content
) {

    const existingModal =
        document.getElementById(
            "adminMediaModal"
        );


    if (existingModal) {
        existingModal.remove();
    }


    const modal =
        document.createElement(
            "div"
        );


    modal.id =
        "adminMediaModal";


    modal.innerHTML = `

        <div
            style="
                position:fixed;
                inset:0;
                background:rgba(15,23,42,0.65);
                z-index:9999;
                display:flex;
                align-items:center;
                justify-content:center;
                padding:20px;
            "
            data-media-modal-close
        >

            <div
                style="
                    width:min(720px,100%);
                    max-height:90vh;
                    overflow:auto;
                    background:#ffffff;
                    border-radius:20px;
                    box-shadow:0 25px 70px rgba(0,0,0,0.25);
                    padding:24px;
                "
                onclick="event.stopPropagation()"
            >

                <div
                    style="
                        display:flex;
                        align-items:center;
                        justify-content:space-between;
                        gap:16px;
                        margin-bottom:20px;
                    "
                >

                    <h3
                        style="
                            margin:0;
                            font-size:22px;
                        "
                    >
                        ${escapeMediaHTML(
                            title
                        )}
                    </h3>


                    <button
                        type="button"
                        data-media-modal-close
                        style="
                            border:0;
                            background:#f1f5f9;
                            width:36px;
                            height:36px;
                            border-radius:50%;
                            cursor:pointer;
                            font-size:20px;
                        "
                    >
                        ×
                    </button>

                </div>


                ${content}

            </div>

        </div>

    `;


    document.body.appendChild(
        modal
    );


    modal.addEventListener(
        "click",
        event => {

            if (
                event.target.closest(
                    "[data-media-modal-close]"
                )
            ) {

                modal.remove();

            }

        }
    );

}

// ============================================================
// LOAD REPORTS & ANALYTICS
// ============================================================

async function loadReportsAnalytics() {

    const token =
        localStorage.getItem("token");

    if (!token) {
        redirectToLogin();
        return;
    }

    const loading =
        document.getElementById(
            "adminReportsLoading"
        );

    const errorBox =
        document.getElementById(
            "adminReportsError"
        );

    const content =
        document.getElementById(
            "adminReportsContent"
        );


    // --------------------------------------------------------
    // RESET UI
    // --------------------------------------------------------

    if (loading) {
        loading.hidden = false;
    }

    if (errorBox) {
        errorBox.hidden = true;
    }

    if (content) {
        content.hidden = true;
    }


    try {

        // ----------------------------------------------------
        // REQUEST REPORTS
        // ----------------------------------------------------

        const response =
            await fetch(
                `${ADMIN_API}/reports/overview`,
                {
                    method: "GET",

                    headers: {
                        "Authorization":
                            `Bearer ${token}`,

                        "Accept":
                            "application/json"
                    }
                }
            );


        const result =
            await response.json();


        console.log(
            "ADMIN REPORTS API:",
            result
        );


        // ----------------------------------------------------
        // AUTHENTICATION FAILURE
        // ----------------------------------------------------

        if (response.status === 401) {

            if (loading) {
                loading.hidden = true;
            }

            handleAuthenticationFailure();

            return;
        }


        // ----------------------------------------------------
        // ADMIN ACCESS FAILURE
        // ----------------------------------------------------

        if (response.status === 403) {

            if (loading) {
                loading.hidden = true;
            }

            if (errorBox) {

                const errorText =
                    document.getElementById(
                        "adminReportsErrorText"
                    );

                if (errorText) {

                    errorText.textContent =
                        "You do not have permission to view reports.";
                }

                errorBox.hidden = false;

            }

            return;
        }


        // ----------------------------------------------------
        // OTHER API ERRORS
        // ----------------------------------------------------

        if (!response.ok) {

            throw new Error(
                result.message ||
                "Failed to load reports"
            );

        }


        // ----------------------------------------------------
        // VALIDATE RESPONSE
        // ----------------------------------------------------

        if (
            !result ||
            !result.success ||
            !result.data
        ) {

            throw new Error(
                "Invalid reports response received from server."
            );

        }


        const data =
            result.data;


        console.log(
            "REPORT DATA:",
            data
        );


        // ----------------------------------------------------
        // OVERVIEW
        // ----------------------------------------------------

        const overview =
            data.overview || {};


        setReportValue(
            "reportTotalPlaces",
            overview.totalPlaces
        );

        setReportValue(
            "reportTotalUsers",
            overview.totalUsers
        );

        setReportValue(
            "reportTotalContributions",
            overview.totalContributions
        );

        setReportValue(
            "reportTotalLikes",
            overview.totalLikes
        );

        setReportValue(
            "reportTotalSavedPlaces",
            overview.totalSavedPlaces
        );

        setReportValue(
            "reportTotalTrips",
            overview.totalTrips
        );


        // ----------------------------------------------------
        // USER STATISTICS
        // ----------------------------------------------------

        const users =
            data.users || {};


        setReportValue(
            "reportUsersTotal",
            users.total
        );

        setReportValue(
            "reportAdmins",
            users.admins
        );

        setReportValue(
            "reportRegularUsers",
            users.regularUsers
        );


        // ----------------------------------------------------
        // CONTRIBUTION STATISTICS
        // ----------------------------------------------------

        const contributions =
            data.contributions || {};


        setReportValue(
            "reportContributionsTotal",
            contributions.total
        );

        setReportValue(
            "reportApprovedContributions",
            contributions.approved
        );

        setReportValue(
            "reportPendingContributions",
            contributions.pending
        );

        setReportValue(
            "reportRejectedContributions",
            contributions.rejected
        );


        // ----------------------------------------------------
        // ENGAGEMENT
        // ----------------------------------------------------

        const engagement =
            data.engagement || {};


        setReportValue(
            "reportEngagementLikes",
            engagement.placeLikes
        );

        setReportValue(
            "reportEngagementSaves",
            engagement.savedPlaces
        );

        setReportValue(
            "reportEngagementTrips",
            engagement.trips
        );


        // ----------------------------------------------------
        // TOP LIKED PLACES
        // ----------------------------------------------------

        renderTopLikedPlaces(
            Array.isArray(
                data.topLikedPlaces
            )
                ? data.topLikedPlaces
                : []
        );


        // ----------------------------------------------------
        // TOP RATED PLACES
        // ----------------------------------------------------

        renderTopRatedPlaces(
            Array.isArray(
                data.topRatedPlaces
            )
                ? data.topRatedPlaces
                : []
        );


        // ----------------------------------------------------
        // CATEGORY DISTRIBUTION
        // ----------------------------------------------------

        renderCategoryDistribution(
            Array.isArray(
                data.categoryDistribution
            )
                ? data.categoryDistribution
                : []
        );


        // ----------------------------------------------------
        // LOCALITY DISTRIBUTION
        // ----------------------------------------------------

        renderLocalityDistribution(
            Array.isArray(
                data.localityDistribution
            )
                ? data.localityDistribution
                : []
        );


        // ----------------------------------------------------
        // SHOW CONTENT
        // ----------------------------------------------------

        if (loading) {
            loading.hidden = true;
        }

        if (content) {
            content.hidden = false;
        }


    } catch (error) {

        console.error(
            "Admin reports error:",
            error
        );


        if (loading) {
            loading.hidden = true;
        }


        if (errorBox) {

            const errorText =
                document.getElementById(
                    "adminReportsErrorText"
                );

            if (errorText) {

                errorText.textContent =
                    error.message ||
                    "Something went wrong while loading reports.";

            }

            errorBox.hidden = false;

        }

    }

}


// ============================================================
// SET REPORT VALUE
// ============================================================

function setReportValue(
    elementId,
    value
) {

    const element =
        document.getElementById(
            elementId
        );


    if (!element) {
        return;
    }


    element.textContent =
        Number.isFinite(
            Number(value)
        )
            ? Number(value).toLocaleString()
            : "0";

}


// ============================================================
// RENDER TOP LIKED PLACES
// ============================================================

function renderTopLikedPlaces(
    places
) {

    const container =
        document.getElementById(
            "topLikedPlacesReport"
        );


    if (!container) {
        return;
    }


    container.innerHTML = "";


    if (!places.length) {

        container.innerHTML = `
            <div class="admin-report-empty">
                <span>♥</span>
                <p>No liked places yet.</p>
            </div>
        `;

        return;
    }


    places.forEach(
        (place, index) => {

            const item =
                document.createElement(
                    "div"
                );


            item.className =
                "admin-report-ranking-item";


            const placeName =
                escapeHTML(
                    place.placeName ||
                    "Unknown Place"
                );


            const category =
                escapeHTML(
                    place.category ||
                    "Uncategorized"
                );


            const locality =
                escapeHTML(
                    place.locality ||
                    "Unknown location"
                );


            const likes =
                Number(
                    place.likeCount || 0
                );


            item.innerHTML = `

                <div class="admin-report-rank-number">
                    ${index + 1}
                </div>

                <div class="admin-report-ranking-info">

                    <strong>
                        ${placeName}
                    </strong>

                    <span>
                        ${category}
                        •
                        ${locality}
                    </span>

                </div>

                <div class="admin-report-ranking-value">

                    <strong>
                        ${likes}
                    </strong>

                    <span>
                        ${likes === 1 ? "Like" : "Likes"}
                    </span>

                </div>

            `;


            container.appendChild(
                item
            );

        }
    );

}


// ============================================================
// RENDER TOP RATED PLACES
// ============================================================

function renderTopRatedPlaces(
    places
) {

    const container =
        document.getElementById(
            "topRatedPlacesReport"
        );


    if (!container) {
        return;
    }


    container.innerHTML = "";


    if (!places.length) {

        container.innerHTML = `
            <div class="admin-report-empty">
                <span>★</span>
                <p>No rated places yet.</p>
            </div>
        `;

        return;
    }


    places.forEach(
        (place, index) => {

            const item =
                document.createElement(
                    "div"
                );


            item.className =
                "admin-report-ranking-item";


            const placeName =
                escapeHTML(
                    place.placeName ||
                    "Unknown Place"
                );


            const category =
                escapeHTML(
                    place.category ||
                    "Uncategorized"
                );


            const locality =
                escapeHTML(
                    place.locality ||
                    "Unknown location"
                );


            const rating =
                Number(
                    place.communityAverageRating || 0
                );


            const ratingCount =
                Number(
                    place.communityRatingCount || 0
                );


            item.innerHTML = `

                <div class="admin-report-rank-number">
                    ${index + 1}
                </div>

                <div class="admin-report-ranking-info">

                    <strong>
                        ${placeName}
                    </strong>

                    <span>
                        ${category}
                        •
                        ${locality}
                    </span>

                </div>

                <div class="admin-report-ranking-value">

                    <strong>
                        ★ ${rating.toFixed(1)}
                    </strong>

                    <span>
                        ${ratingCount}
                        ${ratingCount === 1 ? "rating" : "ratings"}
                    </span>

                </div>

            `;


            container.appendChild(
                item
            );

        }
    );

}


// ============================================================
// RENDER CATEGORY DISTRIBUTION
// ============================================================

function renderCategoryDistribution(
    categories
) {

    const container =
        document.getElementById(
            "categoryDistributionReport"
        );


    if (!container) {
        return;
    }


    container.innerHTML = "";


    if (!categories.length) {

        container.innerHTML = `
            <div class="admin-report-empty">
                <span>🏷️</span>
                <p>No category data available.</p>
            </div>
        `;

        return;
    }


    const total =
        categories.reduce(
            (
                sum,
                item
            ) => {

                return (
                    sum +
                    Number(
                        item.count || 0
                    )
                );

            },
            0
        );


    categories.forEach(
        item => {

            const name =
                item._id ||
                "Uncategorized";


            const count =
                Number(
                    item.count || 0
                );


            const percentage =
                total > 0
                    ? Math.round(
                        (
                            count /
                            total
                        ) * 100
                    )
                    : 0;


            const row =
                document.createElement(
                    "div"
                );


            row.className =
                "admin-report-distribution-item";


            row.innerHTML = `

                <div class="admin-report-distribution-header">

                    <span>
                        ${escapeHTML(name)}
                    </span>

                    <strong>
                        ${count}
                    </strong>

                </div>

                <div class="admin-report-progress">

                    <span
                        style="width: ${percentage}%"
                    ></span>

                </div>

                <small>
                    ${percentage}% of places
                </small>

            `;


            container.appendChild(
                row
            );

        }
    );

}


// ============================================================
// RENDER LOCALITY DISTRIBUTION
// ============================================================

function renderLocalityDistribution(
    localities
) {

    const container =
        document.getElementById(
            "localityDistributionReport"
        );


    if (!container) {
        return;
    }


    container.innerHTML = "";


    if (!localities.length) {

        container.innerHTML = `
            <div class="admin-report-empty">
                <span>📍</span>
                <p>No locality data available.</p>
            </div>
        `;

        return;
    }


    const total =
        localities.reduce(
            (
                sum,
                item
            ) => {

                return (
                    sum +
                    Number(
                        item.count || 0
                    )
                );

            },
            0
        );


    localities.forEach(
        item => {

            const name =
                item._id ||
                "Unknown location";


            const count =
                Number(
                    item.count || 0
                );


            const percentage =
                total > 0
                    ? Math.round(
                        (
                            count /
                            total
                        ) * 100
                    )
                    : 0;


            const row =
                document.createElement(
                    "div"
                );


            row.className =
                "admin-report-distribution-item";


            row.innerHTML = `

                <div class="admin-report-distribution-header">

                    <span>
                        ${escapeHTML(name)}
                    </span>

                    <strong>
                        ${count}
                    </strong>

                </div>

                <div class="admin-report-progress">

                    <span
                        style="width: ${percentage}%"
                    ></span>

                </div>

                <small>
                    ${percentage}% of top localities
                </small>

            `;


            container.appendChild(
                row
            );

        }
    );

}
// ============================================================
// RENDER USERS
// ============================================================

function renderAdminUsers(
    users
) {
        console.log(
        "RENDER ADMIN USERS CALLED:",
        users
    );
    const grid =
        document.getElementById(
            "adminUsersGrid"
        );


    if (!grid) {
        return;
    }


    grid.innerHTML = "";


    if (
        !users ||
        users.length === 0
    ) {

        grid.innerHTML = `
            <div class="admin-users-empty">
                <div class="admin-users-empty-icon">
                    👥
                </div>

                <h3>
                    No users found
                </h3>

                <p>
                    There are no registered users to display.
                </p>
            </div>
        `;

        return;
    }


    users.forEach(
        user => {

            grid.appendChild(
                createAdminUserCard(
                    user
                )
            );

        }
    );

}


// ============================================================
// CREATE USER CARD
// ============================================================

function createAdminUserCard(
    user
) {

    const card =
        document.createElement(
            "article"
        );


    card.className =
        "admin-user-card";


    const userName =
        user.name ||
        "Unknown User";


    const userEmail =
        user.email ||
        "No email";


    const userRole =
        user.role ||
        "user";


    const currentUser =
        getCurrentAdminUser();


    const isCurrentUser =
        currentUser &&
        currentUser._id &&
        user._id &&
        String(
            currentUser._id
        ) ===
        String(
            user._id
        );


    const initials =
        getInitials(
            userName
        );


    const createdAt =
        user.createdAt
            ? formatDate(
                user.createdAt
            )
            : "";


    const roleLabel =
        userRole === "admin"
            ? "ADMIN"
            : "USER";


    const roleClass =
        userRole === "admin"
            ? "admin"
            : "user";


    card.innerHTML = `

        <div class="admin-user-card-header">

            <div class="admin-user-avatar">
                ${escapeHTML(
                    initials
                )}
            </div>

            <div class="admin-user-main">

                <h3>
                    ${escapeHTML(
                        userName
                    )}
                </h3>

                <p>
                    ${escapeHTML(
                        userEmail
                    )}
                </p>

            </div>

            <span
                class="admin-user-role ${roleClass}"
            >
                ${roleLabel}
            </span>

        </div>


        <div class="admin-user-card-body">

            <div class="admin-user-detail">

                <span>
                    ACCOUNT
                </span>

                <strong>
                    ${
                        isCurrentUser
                            ? "Current Admin"
                            : "Registered User"
                    }
                </strong>

            </div>


            <div class="admin-user-detail">

                <span>
                    JOINED
                </span>

                <strong>
                    ${escapeHTML(
                        createdAt ||
                        "—"
                    )}
                </strong>

            </div>

        </div>


        <div class="admin-user-card-actions">

            ${
                isCurrentUser
                    ? `
                        <button
                            type="button"
                            class="admin-user-role-button current-user"
                            disabled
                        >
                            🔐 Your Account
                        </button>
                    `
                    : `
                        <button
                            type="button"
                            class="admin-user-role-button"
                            data-user-role="${escapeAttribute(
                                userRole
                            )}"
                            data-user-id="${escapeAttribute(
                                user._id
                            )}"
                        >
                            ${
                                userRole === "admin"
                                    ? "↓ Make User"
                                    : "↑ Make Admin"
                            }
                        </button>
                    `
            }

        </div>

    `;


    const roleButton =
        card.querySelector(
            "[data-user-role]"
        );


    if (roleButton) {

        roleButton.addEventListener(
            "click",
            () => {

                const userId =
                    roleButton.dataset.userId;

                const currentRole =
                    roleButton.dataset.userRole;

                const newRole =
                    currentRole === "admin"
                        ? "user"
                        : "admin";


                updateAdminUserRole(
                    userId,
                    newRole,
                    roleButton
                );

            }
        );

    }


    return card;

}


// ============================================================
// UPDATE USER ROLE
// ============================================================

async function updateAdminUserRole(
    userId,
    newRole,
    button
) {

    if (
        !userId ||
        !["user", "admin"].includes(
            newRole
        )
    ) {

        return;
    }


    const user =
        adminUsers.find(
            item =>
                String(
                    item._id
                ) ===
                String(
                    userId
                )
        );


    if (!user) {

        showMessage(
            "User could not be found.",
            "error"
        );

        return;
    }


    const roleText =
        newRole === "admin"
            ? "Administrator"
            : "regular user";


    const confirmed =
        window.confirm(
            `Are you sure you want to make "${user.name || user.email}" a ${roleText}?`
        );


    if (!confirmed) {
        return;
    }


    const token =
        localStorage.getItem(
            "token"
        );


    if (!token) {

        redirectToLogin();

        return;
    }


    if (button) {

        button.disabled = true;

        button.textContent =
            "Updating...";
    }


    try {

        const response =
            await fetch(
                `${USERS_API}/${encodeURIComponent(
                    userId
                )}/role`,
                {
                    method: "PUT",

                    headers: {
                        "Content-Type":
                            "application/json",

                        "Authorization":
                            `Bearer ${token}`
                    },

                    body:
                        JSON.stringify({
                            role: newRole
                        })
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

            showMessage(
                "Admin access required.",
                "error"
            );

            return;
        }


        if (!response.ok) {

            throw new Error(
                result.message ||
                "Failed to update user role."
            );
        }


        showMessage(
            result.message ||
            "User role updated successfully.",
            "success"
        );


        await loadAdminUsers();


    } catch (error) {

        console.error(
            "Admin user role update error:",
            error
        );


        showMessage(
            error.message ||
            "Failed to update user role.",
            "error"
        );


        if (button) {

            button.disabled = false;

            button.textContent =
                newRole === "admin"
                    ? "↑ Make Admin"
                    : "↓ Make User";
        }

    }

}


// ============================================================
// GET CURRENT ADMIN USER
// ============================================================

function getCurrentAdminUser() {

    const storedUser =
        localStorage.getItem(
            "user"
        );


    if (!storedUser) {
        return null;
    }


    try {

        return JSON.parse(
            storedUser
        );

    } catch (error) {

        return null;

    }

}


// ============================================================
// UPDATE USER COUNT
// ============================================================

function updateAdminUserCount(
    count
) {

    const elements =
        document.querySelectorAll(
            "#adminUsersCount"
        );


    elements.forEach(
        element => {

            element.textContent =
                `${count} ${
                    count === 1
                        ? "User"
                        : "Users"
                }`;

        }
    );

}

// ============================================================
// LOGOUT
// ============================================================

function logoutAdmin() {

    localStorage.removeItem(
        "token"
    );


    localStorage.removeItem(
        "user"
    );


    window.location.href =
        "index.html";

}


// ============================================================
// LOGIN REDIRECT
// ============================================================

function redirectToLogin() {

    const redirectUrl =
        "admin.html";


    window.location.href =
        `login.html?redirect=${encodeURIComponent(
            redirectUrl
        )}`;

}


// ============================================================
// SET TEXT
// ============================================================

function setText(
    id,
    value
) {

    const element =
        document.getElementById(
            id
        );


    if (element) {

        element.textContent =
            value;

    }

}


// ============================================================
// DATE FORMAT
// ============================================================

function formatDate(
    dateString
) {

    const date =
        new Date(
            dateString
        );


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
// CAPITALIZE
// ============================================================

function capitalize(
    value
) {

    if (!value) {
        return "";
    }


    return (
        value.charAt(0).toUpperCase() +
        value.slice(1)
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


    if (
        words.length === 0
    ) {

        return "U";

    }


    if (
        words.length === 1
    ) {

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

    return String(
        value ?? ""
    )
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

    return escapeHTML(
        value
    );

}
// ============================================================
// TRIP MANAGEMENT
// ============================================================

function setupTripManagement() {
    const manageTripsButton =
        document.getElementById(
            "manageTripsButton"
        );

    const tripPanel =
        document.getElementById(
            "tripManagementPanel"
        );

    const refreshButton =
        document.getElementById(
            "refreshAdminTrips"
        );

    const retryButton =
        document.getElementById(
            "retryAdminTrips"
        );

    const searchInput =
        document.getElementById(
            "adminTripSearch"
        );

    const clearSearchButton =
        document.getElementById(
            "clearAdminTripSearch"
        );

    const clearFiltersButton =
        document.getElementById(
            "clearAdminTripFilters"
        );

    const clearEmptyButton =
        document.getElementById(
            "clearAdminTripsEmptyFilters"
        );


    if (manageTripsButton) {
        manageTripsButton.addEventListener(
            "click",
            () => {

                if (tripPanel) {
                    tripPanel.scrollIntoView({
                        behavior: "smooth",
                        block: "start"
                    });
                }

                loadAdminTrips();
            }
        );
    }


    if (refreshButton) {
        refreshButton.addEventListener(
            "click",
            loadAdminTrips
        );
    }


    if (retryButton) {
        retryButton.addEventListener(
            "click",
            loadAdminTrips
        );
    }


    if (searchInput) {
        searchInput.addEventListener(
            "input",
            applyAdminTripFilters
        );
    }


    if (clearSearchButton) {
        clearSearchButton.addEventListener(
            "click",
            () => {

                if (searchInput) {
                    searchInput.value = "";
                }

                applyAdminTripFilters();
            }
        );
    }


    if (clearFiltersButton) {
        clearFiltersButton.addEventListener(
            "click",
            clearAdminTripFilters
        );
    }


    if (clearEmptyButton) {
        clearEmptyButton.addEventListener(
            "click",
            clearAdminTripFilters
        );
    }
}


// ============================================================
// LOAD TRIPS
// ============================================================

async function loadAdminTrips() {

    const loading =
        document.getElementById(
            "adminTripsLoading"
        );

    const error =
        document.getElementById(
            "adminTripsError"
        );

    const errorText =
        document.getElementById(
            "adminTripsErrorText"
        );

    const content =
        document.getElementById(
            "adminTripsContent"
        );

    if (loading) {
        loading.hidden = false;
    }

    if (error) {
        error.hidden = true;
    }

    if (content) {
        content.hidden = true;
    }


    const token =
        localStorage.getItem("token");


    if (!token) {

        window.location.href =
            "login.html";

        return;
    }


    try {

        const [
            tripsResponse,
            statisticsResponse
        ] = await Promise.all([

            fetch(
                `${ADMIN_API}/trips`,
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            ),

            fetch(
                `${ADMIN_API}/trips/statistics`,
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            )

        ]);


        if (
            tripsResponse.status === 401 ||
            tripsResponse.status === 403 ||
            statisticsResponse.status === 401 ||
            statisticsResponse.status === 403
        ) {

            localStorage.removeItem(
                "token"
            );

            localStorage.removeItem(
                "user"
            );

            window.location.href =
                "login.html";

            return;
        }


        const tripsData =
            await tripsResponse.json();

        const statisticsData =
            await statisticsResponse.json();


        if (!tripsResponse.ok) {

            throw new Error(
                tripsData.message ||
                "Failed to fetch trips"
            );
        }


        if (!statisticsResponse.ok) {

            throw new Error(
                statisticsData.message ||
                "Failed to fetch trip statistics"
            );
        }


        adminTrips =
            Array.isArray(
                tripsData.data
            )
                ? tripsData.data
                : [];


        adminTripStatistics =
            statisticsData.data ||
            null;


        filteredAdminTrips =
            [...adminTrips];


        updateAdminTripSummary();

        applyAdminTripFilters();


        if (loading) {
            loading.hidden = true;
        }

        if (content) {
            content.hidden = false;
        }

    } catch (errorValue) {

        console.error(
            "Admin trips loading error:",
            errorValue
        );


        if (loading) {
            loading.hidden = true;
        }

        if (content) {
            content.hidden = true;
        }

        if (error) {
            error.hidden = false;
        }

        if (errorText) {

            errorText.textContent =
                errorValue.message ||
                "Something went wrong while loading trips.";
        }
    }
}


// ============================================================
// UPDATE TRIP SUMMARY
// ============================================================

function updateAdminTripSummary() {

    const statistics =
        adminTripStatistics || {};


    setTripValue(
        "tripTotalTrips",
        statistics.totalTrips ??
            adminTrips.length
    );


    setTripValue(
        "tripTotalPlaces",
        statistics.totalTripPlaces ??
            0
    );


    setTripValue(
        "tripAveragePlaces",
        statistics.averagePlacesPerTrip ??
            "0.0"
    );
}


// ============================================================
// APPLY TRIP FILTERS
// ============================================================

function applyAdminTripFilters() {

    const searchInput =
        document.getElementById(
            "adminTripSearch"
        );


    const search =
        searchInput &&
        typeof searchInput.value === "string"
            ? searchInput.value
                .trim()
                .toLowerCase()
            : "";


    filteredAdminTrips =
        adminTrips.filter(
            trip => {

                if (!search) {
                    return true;
                }


                const tripName =
                    trip.name || "";


                const ownerName =
                    trip.user &&
                    trip.user.name
                        ? trip.user.name
                        : "";


                const ownerEmail =
                    trip.user &&
                    trip.user.email
                        ? trip.user.email
                        : "";


                return (
                    tripName
                        .toLowerCase()
                        .includes(search) ||

                    ownerName
                        .toLowerCase()
                        .includes(search) ||

                    ownerEmail
                        .toLowerCase()
                        .includes(search)
                );
            }
        );


    renderAdminTrips();
}


// ============================================================
// CLEAR TRIP FILTERS
// ============================================================

function clearAdminTripFilters() {

    const searchInput =
        document.getElementById(
            "adminTripSearch"
        );


    if (searchInput) {
        searchInput.value = "";
    }


    filteredAdminTrips =
        [...adminTrips];


    renderAdminTrips();
}


// ============================================================
// TRIP VALUE HELPER
// ============================================================

function setTripValue(
    elementId,
    value
) {

    const element =
        document.getElementById(
            elementId
        );


    if (element) {
        element.textContent =
            value;
    }
}


// ============================================================
// RENDER TRIPS
// ============================================================

function renderAdminTrips() {

    const grid =
        document.getElementById(
            "adminTripsGrid"
        );

    const empty =
        document.getElementById(
            "adminTripsEmpty"
        );


    if (!grid) {
        return;
    }


    grid.innerHTML = "";


    if (
        !filteredAdminTrips.length
    ) {

        if (empty) {
            empty.hidden = false;
        }

        return;
    }


    if (empty) {
        empty.hidden = true;
    }


    filteredAdminTrips.forEach(
        trip => {

            grid.appendChild(
                createAdminTripCard(
                    trip
                )
            );
        }
    );
}


// ============================================================
// CREATE TRIP CARD
// ============================================================

function createAdminTripCard(
    trip
) {

    const card =
        document.createElement(
            "article"
        );


    card.className =
        "admin-trip-card";


    const owner =
        trip.user || {};


    const ownerName =
        owner.name ||
        "Unknown user";


    const ownerEmail =
        owner.email ||
        "No email available";


    const places =
        Array.isArray(
            trip.places
        )
            ? trip.places
            : [];


    const createdDate =
        trip.createdAt
            ? new Date(
                trip.createdAt
            ).toLocaleString(
                "en-IN",
                {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit"
                }
            )
            : "Unknown date";


    const placesHTML =
        places.length
            ? places
                .sort(
                    (a, b) =>
                        (a.order ?? 0) -
                        (b.order ?? 0)
                )
                .map(
                    (item, index) => {

                        const place =
                            item.place ||
                            {};


                        const image =
                            place.image ||
                            "";


                        const placeName =
                            place.placeName ||
                            "Unknown place";


                        const locality =
                            place.locality ||
                            "";


                        return `
                            <div
                                class="admin-trip-place"
                            >

                                <div
                                    class="admin-trip-place-number"
                                >
                                    ${index + 1}
                                </div>

                                ${
                                    image
                                        ? `
                                            <img
                                                src="${escapeTripHTML(image)}"
                                                alt="${escapeTripHTML(placeName)}"
                                                class="admin-trip-place-image"
                                                loading="lazy"
                                            >
                                        `
                                        : `
                                            <div
                                                class="admin-trip-place-image admin-trip-place-placeholder"
                                            >
                                                📍
                                            </div>
                                        `
                                }

                                <div
                                    class="admin-trip-place-info"
                                >

                                    <strong>
                                        ${escapeTripHTML(placeName)}
                                    </strong>

                                    ${
                                        locality
                                            ? `
                                                <span>
                                                    ${escapeTripHTML(locality)}
                                                </span>
                                            `
                                            : ""
                                    }

                                </div>

                            </div>
                        `;
                    }
                )
                .join("")
            : `
                <div
                    class="admin-trip-no-places"
                >
                    No places in this trip.
                </div>
            `;


    card.innerHTML = `

        <div
            class="admin-trip-card-header"
        >

            <div
                class="admin-trip-title-area"
            >

                <div
                    class="admin-trip-icon"
                >
                    🗺️
                </div>

                <div>

                    <span
                        class="admin-trip-label"
                    >
                        SAVED TRIP
                    </span>

                    <h3>
                        ${escapeTripHTML(
                            trip.name ||
                            "Unnamed Trip"
                        )}
                    </h3>

                </div>

            </div>


            <button
                type="button"
                class="admin-trip-delete"
                data-admin-trip-delete="${escapeTripHTML(
                    trip._id
                )}"
                title="Delete trip"
            >
                🗑️
            </button>

        </div>


        <div
            class="admin-trip-owner"
        >

            <div
                class="admin-trip-owner-avatar"
            >
                👤
            </div>

            <div>

                <strong>
                    ${escapeTripHTML(
                        ownerName
                    )}
                </strong>

                <span>
                    ${escapeTripHTML(
                        ownerEmail
                    )}
                </span>

            </div>

        </div>


        <div
            class="admin-trip-meta"
        >

            <span>
                📍 ${places.length} place${
                    places.length === 1
                        ? ""
                        : "s"
                }
            </span>

            <span>
                🕒 ${escapeTripHTML(
                    createdDate
                )}
            </span>

        </div>


        <div
            class="admin-trip-places"
        >

            <div
                class="admin-trip-places-heading"
            >
                <span>
                    ITINERARY
                </span>

                <strong>
                    ${places.length}
                </strong>
            </div>

            ${placesHTML}

        </div>

    `;


    return card;
}


// ============================================================
// DELETE TRIP
// ============================================================

async function deleteAdminTrip(
    tripId
) {

    const trip =
        findAdminTrip(
            tripId
        );


    if (!trip) {
        return;
    }


    const confirmed =
        window.confirm(
            `Delete the trip "${trip.name}"?\n\nThis action cannot be undone.`
        );


    if (!confirmed) {
        return;
    }


    const token =
        localStorage.getItem("token");


    if (!token) {

        window.location.href =
            "login.html";

        return;
    }


    try {

        const response =
            await fetch(
                `${ADMIN_API}/trips/${encodeURIComponent(
                    tripId
                )}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );


        if (
            response.status === 401 ||
            response.status === 403
        ) {

            localStorage.removeItem(
                "token"
            );

            localStorage.removeItem(
                "user"
            );

            window.location.href =
                "login.html";

            return;
        }


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Failed to delete trip"
            );
        }


        adminTrips =
            adminTrips.filter(
                item =>
                    item._id !==
                    tripId
            );


        filteredAdminTrips =
            filteredAdminTrips.filter(
                item =>
                    item._id !==
                    tripId
            );


        if (
            adminTripStatistics
        ) {

            adminTripStatistics.totalTrips =
                Math.max(
                    0,
                    Number(
                        adminTripStatistics.totalTrips ||
                        0
                    ) - 1
                );
        }


        updateAdminTripSummary();

        renderAdminTrips();


        alert(
            data.message ||
            "Trip deleted successfully."
        );

    } catch (errorValue) {

        console.error(
            "Admin trip deletion error:",
            errorValue
        );


        alert(
            errorValue.message ||
            "Failed to delete trip."
        );
    }
}


// ============================================================
// FIND TRIP
// ============================================================

function findAdminTrip(
    tripId
) {

    return adminTrips.find(
        trip =>
            trip._id ===
            tripId
    );
}


// ============================================================
// ESCAPE HTML
// ============================================================

function escapeTripHTML(
    value
) {

    return String(
        value ?? ""
    )
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
// TRIP DELETE CLICK HANDLER
// ============================================================

document.addEventListener(
    "click",
    event => {

        const button =
            event.target.closest(
                "[data-admin-trip-delete]"
            );


        if (!button) {
            return;
        }


        const tripId =
            button.getAttribute(
                "data-admin-trip-delete"
            );


        if (!tripId) {
            return;
        }


        deleteAdminTrip(
            tripId
        );
    }
);