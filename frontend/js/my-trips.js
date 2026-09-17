// ============================================================
// VELLORE DISCOVER
// MY TRIPS
// View and manage user's saved trip plans
// ============================================================

const MY_TRIPS_API =
    "http://localhost:5000/api/trips";


// ============================================================
// PAGE LOAD
// ============================================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        initializeMyTrips();

    }
);


// ============================================================
// INITIALIZE
// ============================================================

function initializeMyTrips() {

    const token =
        localStorage.getItem("token");


    if (!token) {

        window.location.href =
            "login.html";

        return;
    }


    const retryButton =
        document.getElementById(
            "retryMyTrips"
        );


    if (retryButton) {

        retryButton.addEventListener(
            "click",
            loadMyTrips
        );
    }


    loadMyTrips();
}


// ============================================================
// LOAD MY TRIPS
// ============================================================

async function loadMyTrips() {

    showMyTripsLoading();

    hideMyTripsError();

    hideMyTripsEmpty();


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
                `${MY_TRIPS_API}/my`,
                {
                    method: "GET",

                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );


        if (response.status === 401) {

            handleAuthenticationFailure();

            return;
        }


        const result =
            await response.json();


        if (!response.ok) {

            throw new Error(
                result.message ||
                "Failed to load trips"
            );
        }


        const trips =
            Array.isArray(result.data)
                ? result.data
                : [];


        hideMyTripsLoading();


        if (!trips.length) {

            showMyTripsEmpty();

            return;
        }


        renderTrips(
            trips
        );


    } catch (error) {

        console.error(
            "Load my trips error:",
            error
        );


        hideMyTripsLoading();


        showMyTripsError(
            error.message ||
            "Unable to load your trips."
        );
    }
}


// ============================================================
// RENDER TRIPS
// ============================================================

function renderTrips(
    trips
) {

    const grid =
        document.getElementById(
            "myTripsGrid"
        );


    if (!grid) {
        return;
    }


    grid.innerHTML = "";


    trips.forEach(
        function (trip) {

            const card =
                createTripCard(
                    trip
                );


            grid.appendChild(
                card
            );

        }
    );
}


// ============================================================
// CREATE TRIP CARD
// ============================================================

function createTripCard(
    trip
) {

    const card =
        document.createElement(
            "article"
        );


    card.className =
        "my-trip-card";


    const places =
        Array.isArray(
            trip.places
        )
            ? [...trip.places]
            : [];


    places.sort(
        function (a, b) {

            return (
                Number(a.order || 0) -
                Number(b.order || 0)
            );

        }
    );


    const tripName =
        trip.name ||
        "Untitled Trip";


    const placeCount =
        places.length;


    const createdDate =
        formatTripDate(
            trip.createdAt
        );


    const previewPlaces =
        places.slice(
            0,
            4
        );


    card.innerHTML = `

        <div class="my-trip-card-header">

            <div class="my-trip-icon">
                🗺️
            </div>

            <div class="my-trip-date">
                ${escapeHTML(createdDate)}
            </div>

        </div>


        <div class="my-trip-card-body">

            <h3>
                ${escapeHTML(tripName)}
            </h3>


            <div class="my-trip-place-count">
                📍 ${placeCount}
                ${
                    placeCount === 1
                        ? "place"
                        : "places"
                }
            </div>


            ${
                previewPlaces.length
                    ? `
                        <div class="my-trip-preview">

                            ${previewPlaces
                                .map(
                                    function (tripPlace) {

                                        const place =
                                            tripPlace.place;

                                        const placeName =
                                            place &&
                                            place.placeName
                                                ? place.placeName
                                                : "Unknown Place";

                                        return `
                                            <div class="my-trip-preview-item">

                                                <span class="my-trip-preview-number">
                                                    ${
                                                        Number(
                                                            tripPlace.order || 0
                                                        ) + 1
                                                    }
                                                </span>

                                                <span class="my-trip-preview-name">
                                                    ${escapeHTML(
                                                        placeName
                                                    )}
                                                </span>

                                            </div>
                                        `;

                                    }
                                )
                                .join("")}

                            ${
                                placeCount > 4
                                    ? `
                                        <div class="my-trip-more">
                                            + ${
                                                placeCount - 4
                                            } more
                                        </div>
                                    `
                                    : ""
                            }

                        </div>
                    `
                    : `
                        <div class="my-trip-no-places">
                            No places added to this trip.
                        </div>
                    `
            }

        </div>


        <div class="my-trip-card-actions">

            <button
                type="button"
                class="my-trip-view-button"
                data-trip-id="${escapeHTML(
                    trip._id || ""
                )}"
            >
                👁 View Trip
            </button>


            <button
                type="button"
                class="my-trip-delete-button"
                data-trip-id="${escapeHTML(
                    trip._id || ""
                )}"
            >
                🗑 Delete
            </button>

        </div>

    `;


    const viewButton =
        card.querySelector(
            ".my-trip-view-button"
        );


    const deleteButton =
        card.querySelector(
            ".my-trip-delete-button"
        );


    if (viewButton) {

        viewButton.addEventListener(
            "click",
            function () {

                viewTrip(
                    trip
                );

            }
        );
    }


    if (deleteButton) {

        deleteButton.addEventListener(
            "click",
            function () {

                deleteTrip(
                    trip
                );

            }
        );
    }


    return card;
}


// ============================================================
// VIEW TRIP
// ============================================================

function viewTrip(
    trip
) {

    const places =
        Array.isArray(
            trip.places
        )
            ? [...trip.places]
            : [];


    places.sort(
        function (a, b) {

            return (
                Number(a.order || 0) -
                Number(b.order || 0)
            );

        }
    );


    if (!places.length) {

        showMyTripsNotification(
            "This trip does not contain any places.",
            "error"
        );

        return;
    }


    const placeNames =
        places
            .map(
                function (item) {

                    return (
                        item.place &&
                        item.place.placeName
                    )
                        ? item.place.placeName
                        : "Unknown Place";

                }
            );


    showTripDetailsModal(
        trip,
        placeNames
    );
}


// ============================================================
// TRIP DETAILS MODAL
// ============================================================

function showTripDetailsModal(
    trip,
    placeNames
) {

    let modal =
        document.getElementById(
            "tripDetailsModal"
        );


    if (modal) {

        modal.remove();
    }


    modal =
        document.createElement(
            "div"
        );


    modal.id =
        "tripDetailsModal";

    modal.className =
        "trip-details-modal";


    modal.innerHTML = `

        <div class="trip-modal-overlay">

            <div
                class="trip-modal"
                role="dialog"
                aria-modal="true"
            >

                <button
                    type="button"
                    class="trip-modal-close"
                    aria-label="Close"
                >
                    ×
                </button>


                <div class="trip-modal-icon">
                    🗺️
                </div>


                <span class="section-label">
                    YOUR ITINERARY
                </span>


                <h2>
                    ${escapeHTML(
                        trip.name ||
                        "My Trip"
                    )}
                </h2>


                <p class="trip-modal-subtitle">
                    ${placeNames.length}
                    ${
                        placeNames.length === 1
                            ? "place"
                            : "places"
                    }
                    in your planned journey.
                </p>


                <div class="trip-modal-list">

                    ${placeNames
                        .map(
                            function (
                                name,
                                index
                            ) {

                                return `
                                    <div class="trip-modal-place">

                                        <span class="trip-modal-number">
                                            ${
                                                index + 1
                                            }
                                        </span>

                                        <span>
                                            ${escapeHTML(
                                                name
                                            )}
                                        </span>

                                    </div>
                                `;

                            }
                        )
                        .join("")}

                </div>


                <div class="trip-modal-actions">

                    <button
                        type="button"
                        class="trip-modal-close-button"
                    >
                        Close
                    </button>

                </div>

            </div>

        </div>

    `;


    document.body.appendChild(
        modal
    );


    const closeButtons =
        modal.querySelectorAll(
            ".trip-modal-close, .trip-modal-close-button"
        );


    closeButtons.forEach(
        function (button) {

            button.addEventListener(
                "click",
                function () {

                    modal.remove();

                }
            );

        }
    );


    const overlay =
        modal.querySelector(
            ".trip-modal-overlay"
        );


    if (overlay) {

        overlay.addEventListener(
            "click",
            function (event) {

                if (
                    event.target ===
                    overlay
                ) {

                    modal.remove();
                }

            }
        );
    }
}


// ============================================================
// DELETE TRIP
// ============================================================

async function deleteTrip(
    trip
) {

    const tripName =
        trip.name ||
        "this trip";


    const confirmed =
        window.confirm(
            `Are you sure you want to delete "${tripName}"?`
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
                `${MY_TRIPS_API}/${trip._id}`,
                {
                    method: "DELETE",

                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );


        if (response.status === 401) {

            handleAuthenticationFailure();

            return;
        }


        const result =
            await response.json();


        if (!response.ok) {

            throw new Error(
                result.message ||
                "Failed to delete trip"
            );
        }


        showMyTripsNotification(
            "Trip deleted successfully.",
            "success"
        );


        loadMyTrips();


    } catch (error) {

        console.error(
            "Delete trip error:",
            error
        );


        showMyTripsNotification(
            error.message ||
            "Failed to delete trip.",
            "error"
        );
    }
}


// ============================================================
// FORMAT DATE
// ============================================================

function formatTripDate(
    dateValue
) {

    if (!dateValue) {

        return "Recently created";
    }


    const date =
        new Date(
            dateValue
        );


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return "Recently created";
    }


    return (
        "Created " +
        date.toLocaleDateString(
            "en-IN",
            {
                day: "numeric",
                month: "short",
                year: "numeric"
            }
        )
    );
}


// ============================================================
// LOADING
// ============================================================

function showMyTripsLoading() {

    const loading =
        document.getElementById(
            "myTripsLoading"
        );


    const grid =
        document.getElementById(
            "myTripsGrid"
        );


    if (loading) {

        loading.style.display =
            "flex";
    }


    if (grid) {

        grid.innerHTML = "";
    }
}


function hideMyTripsLoading() {

    const loading =
        document.getElementById(
            "myTripsLoading"
        );


    if (loading) {

        loading.style.display =
            "none";
    }
}


// ============================================================
// EMPTY
// ============================================================

function showMyTripsEmpty() {

    const empty =
        document.getElementById(
            "myTripsEmpty"
        );


    if (empty) {

        empty.style.display =
            "flex";
    }
}


function hideMyTripsEmpty() {

    const empty =
        document.getElementById(
            "myTripsEmpty"
        );


    if (empty) {

        empty.style.display =
            "none";
    }
}


// ============================================================
// ERROR
// ============================================================

function showMyTripsError(
    message
) {

    const error =
        document.getElementById(
            "myTripsError"
        );


    const errorText =
        document.getElementById(
            "myTripsErrorText"
        );


    if (errorText) {

        errorText.textContent =
            message;
    }


    if (error) {

        error.style.display =
            "flex";
    }
}


function hideMyTripsError() {

    const error =
        document.getElementById(
            "myTripsError"
        );


    if (error) {

        error.style.display =
            "none";
    }
}


// ============================================================
// NOTIFICATION
// ============================================================

function showMyTripsNotification(
    message,
    type
) {

    let notification =
        document.getElementById(
            "myTripsNotification"
        );


    if (!notification) {

        notification =
            document.createElement(
                "div"
            );

        notification.id =
            "myTripsNotification";

        notification.className =
            "my-trips-notification";

        document.body.appendChild(
            notification
        );
    }


    notification.className =
        `my-trips-notification ${
            type || ""
        }`;


    notification.textContent =
        message;


    notification.classList.add(
        "show"
    );


    setTimeout(
        function () {

            notification.classList.remove(
                "show"
            );

        },
        3500
    );
}


// ============================================================
// AUTH FAILURE
// ============================================================

function handleAuthenticationFailure() {

    localStorage.removeItem(
        "token"
    );

    localStorage.removeItem(
        "user"
    );


    window.location.href =
        "login.html";
}


// ============================================================
// ESCAPE HTML
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