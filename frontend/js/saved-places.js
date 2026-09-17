// =========================================================
// VELLORE DISCOVER
// MY SAVED PLACES
// =========================================================

const SAVED_PLACES_API =
    "http://localhost:5000/api/saved-places";


// =========================================================
// PAGE ELEMENTS
// =========================================================

const savedPlacesGrid =
    document.getElementById(
        "savedPlacesGrid"
    );

const savedPlacesLoading =
    document.getElementById(
        "savedPlacesLoading"
    );

const savedPlacesEmpty =
    document.getElementById(
        "savedPlacesEmpty"
    );

const savedPlacesError =
    document.getElementById(
        "savedPlacesError"
    );

const savedPlacesErrorText =
    document.getElementById(
        "savedPlacesErrorText"
    );

const savedPlacesCount =
    document.getElementById(
        "savedPlacesCount"
    );

const savedPlacesDescription =
    document.getElementById(
        "savedPlacesDescription"
    );

const retrySavedPlaces =
    document.getElementById(
        "retrySavedPlaces"
    );


// =========================================================
// GET TOKEN
// =========================================================

function getAuthToken() {

    return localStorage.getItem(
        "token"
    );

}


// =========================================================
// ESCAPE HTML
// =========================================================

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


// =========================================================
// SHORTEN TEXT
// =========================================================

function shortenText(
    text,
    maxLength = 120
) {

    const value =
        String(
            text || ""
        );


    if (
        value.length <= maxLength
    ) {

        return value;

    }


    return (
        value.substring(
            0,
            maxLength
        ) +
        "..."
    );

}


// =========================================================
// RATING STARS
// =========================================================

function createRatingStars(
    rating
) {

    const numericRating =
        Number(
            rating
        ) || 0;


    const roundedRating =
        Math.round(
            numericRating
        );


    const filledStars =
        Math.max(
            0,
            Math.min(
                5,
                roundedRating
            )
        );


    return (
        "★".repeat(
            filledStars
        ) +
        "☆".repeat(
            5 - filledStars
        )
    );

}


// =========================================================
// FORMAT RATING
// =========================================================

function formatRating(
    place
) {

    const ratingCount =
        Number(
            place.communityRatingCount
        ) || 0;


    const averageRating =
        Number(
            place.communityAverageRating
        ) || 0;


    if (
        ratingCount === 0
    ) {

        return "0.0 / 5";

    }


    return (
        `${averageRating.toFixed(1)} / 5`
    );

}


// =========================================================
// SHOW / HIDE UI
// =========================================================

function showLoading() {

    if (savedPlacesLoading) {

        savedPlacesLoading.style.display =
            "flex";

    }


    if (savedPlacesEmpty) {

        savedPlacesEmpty.style.display =
            "none";

    }


    if (savedPlacesError) {

        savedPlacesError.style.display =
            "none";

    }


    if (savedPlacesGrid) {

        savedPlacesGrid.innerHTML =
            "";

    }

}


function hideLoading() {

    if (savedPlacesLoading) {

        savedPlacesLoading.style.display =
            "none";

    }

}


// =========================================================
// SHOW ERROR
// =========================================================

function showError(
    message
) {

    hideLoading();


    if (savedPlacesGrid) {

        savedPlacesGrid.innerHTML =
            "";

    }


    if (savedPlacesEmpty) {

        savedPlacesEmpty.style.display =
            "none";

    }


    if (savedPlacesError) {

        savedPlacesError.style.display =
            "flex";

    }


    if (savedPlacesErrorText) {

        savedPlacesErrorText.textContent =
            message;

    }

}


// =========================================================
// SHOW EMPTY STATE
// =========================================================

function showEmptyState() {

    hideLoading();


    if (savedPlacesError) {

        savedPlacesError.style.display =
            "none";

    }


    if (savedPlacesEmpty) {

        savedPlacesEmpty.style.display =
            "flex";

    }


    if (savedPlacesGrid) {

        savedPlacesGrid.innerHTML =
            "";

    }


    if (savedPlacesCount) {

        savedPlacesCount.textContent =
            "0 places";

    }


    if (savedPlacesDescription) {

        savedPlacesDescription.textContent =
            "You haven't saved any places yet.";

    }

}


// =========================================================
// UPDATE COUNT
// =========================================================

function updateSavedPlacesCount(
    count
) {

    if (savedPlacesCount) {

        savedPlacesCount.textContent =
            `${count} place${count === 1 ? "" : "s"}`;

    }


    if (savedPlacesDescription) {

        if (count === 0) {

            savedPlacesDescription.textContent =
                "You haven't saved any places yet.";

        } else {

            savedPlacesDescription.textContent =
                `You have ${count} saved place${count === 1 ? "" : "s"} to explore.`;

        }

    }

}


// =========================================================
// CREATE SAVED PLACE CARD
// =========================================================

function createSavedPlaceCard(
    place
) {

    const image =
        place.images &&
        place.images.length > 0
            ? place.images[0]
            : "https://via.placeholder.com/800x500?text=Vellore+Discover";


    const placeId =
        place.placeId || "";


    const placeName =
        place.placeName ||
        "Unnamed Place";


    const category =
        place.category ||
        "Place";


    const locality =
        place.locality ||
        "Vellore";


    const description =
        shortenText(
            place.description || "",
            120
        );


    const rating =
        Number(
            place.communityAverageRating
        ) || 0;


    const likeCount =
        Number(
            place.likeCount
        ) || 0;


    const card =
        document.createElement(
            "article"
        );


    card.className =
        "saved-place-card";


    card.dataset.placeId =
        placeId;


    card.innerHTML = `

        <!-- IMAGE -->

        <div
            class="saved-place-image-wrapper"
        >

            <img
                src="${escapeHTML(image)}"
                alt="${escapeHTML(placeName)}"
                class="saved-place-image"
                loading="lazy"
            >


            <span
                class="saved-place-category"
            >
                ${escapeHTML(category)}
            </span>


            <button
                type="button"
                class="saved-place-remove-top"
                title="Remove from saved places"
                aria-label="Remove ${escapeHTML(placeName)} from saved places"
                onclick="removeSavedPlace('${escapeHTML(placeId)}', this)"
            >
                ✕
            </button>

        </div>


        <!-- CONTENT -->

        <div
            class="saved-place-card-content"
        >

            <h3>
                ${escapeHTML(placeName)}
            </h3>


            <p
                class="saved-place-location"
            >
                📍 ${escapeHTML(locality)}
            </p>


            <p
                class="saved-place-description"
            >
                ${escapeHTML(description)}
            </p>


            <!-- RATING / LIKES -->

            <div
                class="saved-place-summary"
            >

                <div
                    class="saved-place-rating"
                >

                    <span
                        class="saved-place-rating-stars"
                    >
                        ${createRatingStars(rating)}
                    </span>


                    <span
                        class="saved-place-rating-value"
                    >
                        ${formatRating(place)}
                    </span>

                </div>


                <div
                    class="saved-place-likes"
                >

                    <span
                        class="saved-place-heart"
                    >
                        ♡
                    </span>

                    <span>
                        ${likeCount}
                    </span>

                </div>

            </div>


            <!-- ACTIONS -->

            <div
                class="saved-place-actions"
            >

                <a
                    href="place.html?id=${encodeURIComponent(placeId)}"
                    class="saved-place-explore"
                >
                    Explore Place →
                </a>


                <button
                    type="button"
                    class="saved-place-remove"
                    onclick="removeSavedPlace('${escapeHTML(placeId)}', this)"
                >
                    Remove
                </button>

            </div>

        </div>

    `;


    return card;

}


// =========================================================
// LOAD SAVED PLACES
// =========================================================

async function loadSavedPlaces() {

    const token =
        getAuthToken();


    // =================================================
    // LOGIN CHECK
    // =================================================

    if (!token) {

        hideLoading();


        if (savedPlacesGrid) {

            savedPlacesGrid.innerHTML =
                "";

        }


        if (savedPlacesEmpty) {

            savedPlacesEmpty.style.display =
                "flex";

        }


        if (savedPlacesCount) {

            savedPlacesCount.textContent =
                "Login required";

        }


        if (savedPlacesDescription) {

            savedPlacesDescription.textContent =
                "Please login to view your saved places.";

        }


        const exploreButton =
            savedPlacesEmpty
                ? savedPlacesEmpty.querySelector(
                    ".saved-explore-button"
                )
                : null;


        if (exploreButton) {

            exploreButton.textContent =
                "Login to Continue";

            exploreButton.href =
                "login.html";

        }


        return;

    }


    showLoading();


    try {

        const response =
            await fetch(
                `${SAVED_PLACES_API}/my`,
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

            localStorage.removeItem(
                "token"
            );


            window.location.href =
                "login.html";

            return;

        }


        if (
            !response.ok ||
            !result.success
        ) {

            throw new Error(
                result.message ||
                "Failed to load saved places"
            );

        }


        const places =
            Array.isArray(
                result.data
            )
                ? result.data
                : [];


        updateSavedPlacesCount(
            places.length
        );


        if (
            places.length === 0
        ) {

            showEmptyState();

            return;

        }


        hideLoading();


        if (savedPlacesEmpty) {

            savedPlacesEmpty.style.display =
                "none";

        }


        if (savedPlacesError) {

            savedPlacesError.style.display =
                "none";

        }


        if (savedPlacesGrid) {

            savedPlacesGrid.innerHTML =
                "";

        }


        places.forEach(
            (place) => {

                const card =
                    createSavedPlaceCard(
                        place
                    );


                if (savedPlacesGrid) {

                    savedPlacesGrid.appendChild(
                        card
                    );

                }

            }
        );


    } catch (error) {

        console.error(
            "Load saved places error:",
            error
        );


        showError(
            error.message ||
            "Unable to load your saved places."
        );

    }

}


// =========================================================
// REMOVE SAVED PLACE
// =========================================================

async function removeSavedPlace(
    placeId,
    button
) {

    const token =
        getAuthToken();


    if (!token) {

        window.location.href =
            "login.html";

        return;

    }


    if (!placeId) {

        return;

    }


    // Prevent double click.

    if (button) {

        button.disabled =
            true;

    }


    try {

        const response =
            await fetch(
                `${SAVED_PLACES_API}/${encodeURIComponent(placeId)}`,
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

            localStorage.removeItem(
                "token"
            );


            window.location.href =
                "login.html";

            return;

        }


        if (
            !response.ok ||
            !result.success
        ) {

            throw new Error(
                result.message ||
                "Failed to remove saved place"
            );

        }


        // =================================================
        // REMOVE CARD IMMEDIATELY
        // =================================================

        const card =
            document.querySelector(
                `.saved-place-card[data-place-id="${CSS.escape(placeId)}"]`
            );


        if (card) {

            card.style.opacity =
                "0";

            card.style.transform =
                "scale(0.97)";


            setTimeout(
                () => {

                    card.remove();


                    const remainingCards =
                        document.querySelectorAll(
                            ".saved-place-card"
                        );


                    updateSavedPlacesCount(
                        remainingCards.length
                    );


                    if (
                        remainingCards.length === 0
                    ) {

                        showEmptyState();

                    }

                },
                200
            );

        } else {

            await loadSavedPlaces();

        }


    } catch (error) {

        console.error(
            "Remove saved place error:",
            error
        );


        alert(
            error.message ||
            "Unable to remove saved place."
        );


        if (button) {

            button.disabled =
                false;

        }

    }

}


// =========================================================
// RETRY BUTTON
// =========================================================

if (retrySavedPlaces) {

    retrySavedPlaces.addEventListener(
        "click",
        function () {

            loadSavedPlaces();

        }
    );

}


// =========================================================
// START
// =========================================================

loadSavedPlaces();