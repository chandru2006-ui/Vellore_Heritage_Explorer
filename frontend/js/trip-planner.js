// ============================================================
// VELLORE DISCOVER
// TRIP PLANNER
// Choose any Vellore place, search, filter, reorder and save
// ============================================================

const PLACES_API =
    "http://localhost:5000/api/places";

const SAVED_PLACES_API =
    "http://localhost:5000/api/saved-places";

const TRIPS_API =
    "http://localhost:5000/api/trips";


// ============================================================
// STATE
// ============================================================

let allPlaces = [];

let savedPlaces = [];

let selectedPlaces = [];

let currentTripFilter = "all";

let currentSearchText = "";


// ============================================================
// PAGE LOAD
// ============================================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        initializeTripPlanner();

    }
);


// ============================================================
// INITIALIZE
// ============================================================

function initializeTripPlanner() {

    const token =
        localStorage.getItem("token");


    if (!token) {

        window.location.href =
            "login.html";

        return;
    }


    // Search
    const searchInput =
        document.getElementById(
            "tripPlaceSearch"
        );


    if (searchInput) {

        searchInput.addEventListener(
            "input",
            function () {

                currentSearchText =
                    this.value.trim()
                        .toLowerCase();

                updateClearSearchButton();

                renderAvailablePlaces();

            }
        );
    }


    // Clear search
    const clearSearchButton =
        document.getElementById(
            "clearTripSearch"
        );


    if (clearSearchButton) {

        clearSearchButton.addEventListener(
            "click",
            clearTripSearch
        );
    }


    // Filter buttons
    const filterButtons =
        document.querySelectorAll(
            ".trip-filter-button"
        );


    filterButtons.forEach(
        function (button) {

            button.addEventListener(
                "click",
                function () {

                    const filter =
                        this.dataset.tripFilter ||
                        "all";


                    currentTripFilter =
                        filter;


                    filterButtons.forEach(
                        function (item) {

                            item.classList.remove(
                                "active"
                            );

                        }
                    );


                    this.classList.add(
                        "active"
                    );


                    renderAvailablePlaces();

                }
            );

        }
    );


    // Retry
    const retryButton =
        document.getElementById(
            "retrySavedPlaces"
        );


    if (retryButton) {

        retryButton.addEventListener(
            "click",
            loadPlaces
        );
    }


    // Save trip
    const saveTripButton =
        document.getElementById(
            "saveTripButton"
        );


    if (saveTripButton) {

        saveTripButton.addEventListener(
            "click",
            saveTrip
        );
    }


    // Load everything
    loadPlaces();
}


// ============================================================
// LOAD ALL PLACES + SAVED PLACES
// ============================================================

async function loadPlaces() {

    showTripLoading();

    hideTripError();

    hideNoResults();


    const token =
        localStorage.getItem("token");


    if (!token) {

        window.location.href =
            "login.html";

        return;
    }


    try {

        // -----------------------------------------------------
        // LOAD ALL 41 PLACES
        // -----------------------------------------------------

        const placesResponse =
            await fetch(
                PLACES_API
            );


        const placesResult =
            await placesResponse.json();


        if (!placesResponse.ok) {

            throw new Error(
                placesResult.message ||
                "Failed to load places"
            );
        }


        allPlaces =
            Array.isArray(
                placesResult.data
            )
                ? placesResult.data
                : [];


        // -----------------------------------------------------
        // LOAD USER'S SAVED PLACES
        // -----------------------------------------------------

        const savedResponse =
            await fetch(
                `${SAVED_PLACES_API}/my`,
                {
                    method: "GET",

                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );


        if (
            savedResponse.status === 401
        ) {

            handleAuthenticationFailure();

            return;
        }


        const savedResult =
            await savedResponse.json();


        if (!savedResponse.ok) {

            throw new Error(
                savedResult.message ||
                "Failed to load saved places"
            );
        }


        savedPlaces =
            Array.isArray(
                savedResult.data
            )
                ? savedResult.data
                : [];


        hideTripLoading();


        renderAvailablePlaces();

        updateSelectedCount();

        renderItinerary();


    } catch (error) {

        console.error(
            "Load Trip Planner places error:",
            error
        );


        hideTripLoading();


        showTripError(
            error.message ||
            "Unable to load places."
        );
    }
}


// ============================================================
// RENDER AVAILABLE PLACES
// ============================================================

function renderAvailablePlaces() {

    const grid =
        document.getElementById(
            "savedPlacesSelectionGrid"
        );


    if (!grid) {
        return;
    }


    grid.innerHTML = "";


    let filteredPlaces =
        [...allPlaces];


    // ---------------------------------------------------------
    // SAVED FILTER
    // ---------------------------------------------------------

    if (
        currentTripFilter ===
        "saved"
    ) {

        filteredPlaces =
            filteredPlaces.filter(
                function (place) {

                    return isPlaceSaved(
                        place
                    );

                }
            );
    }


    // ---------------------------------------------------------
    // SEARCH FILTER
    // ---------------------------------------------------------

    if (currentSearchText) {

        filteredPlaces =
            filteredPlaces.filter(
                function (place) {

                    const searchableText =
                        [
                            place.placeName,
                            place.placeId,
                            place.category,
                            place.locality,
                            place.location,
                            place.shortDescription,
                            place.description
                        ]
                            .filter(Boolean)
                            .join(" ")
                            .toLowerCase();


                    return searchableText.includes(
                        currentSearchText
                    );

                }
            );
    }


    // ---------------------------------------------------------
    // NO RESULTS
    // ---------------------------------------------------------

    if (!filteredPlaces.length) {

        showNoResults();

        return;
    }


    hideNoResults();


    filteredPlaces.forEach(
        function (place) {

            const card =
                createPlaceCard(
                    place
                );


            grid.appendChild(
                card
            );

        }
    );
}


// ============================================================
// CREATE PLACE CARD
// ============================================================

function createPlaceCard(
    place
) {

    const card =
        document.createElement(
            "article"
        );


    card.className =
        "trip-selection-card";


    const placeId =
        getPlaceId(
            place
        );


    const selected =
        isPlaceSelected(
            place
        );


    if (selected) {

        card.classList.add(
            "selected"
        );
    }


    const saved =
        isPlaceSaved(
            place
        );


    const image =
        getPlaceImage(
            place
        );


    const category =
        place.category ||
        "Vellore";


    const locality =
        place.locality ||
        place.location ||
        "Vellore";


    const description =
        place.shortDescription ||
        place.description ||
        "Discover this wonderful place in Vellore.";


    card.innerHTML = `

        <div class="trip-selection-image-wrapper">

            <img
                src="${escapeHTML(image)}"
                alt="${escapeHTML(
                    place.placeName ||
                    "Vellore place"
                )}"
                class="trip-selection-image"
                loading="lazy"
                onerror="this.src='https://via.placeholder.com/600x400?text=Vellore+Discover'"
            >


            <span class="trip-selection-category">
                ${escapeHTML(category)}
            </span>


            ${
                saved
                    ? `
                        <span class="trip-saved-badge">
                            🔖 Saved
                        </span>
                    `
                    : ""
            }


            <span class="trip-selection-check">
                ${
                    selected
                        ? "✓"
                        : ""
                }
            </span>

        </div>


        <div class="trip-selection-content">

            <h3>
                ${escapeHTML(
                    place.placeName ||
                    "Unnamed Place"
                )}
            </h3>


            <div class="trip-selection-location">
                📍 ${escapeHTML(locality)}
            </div>


            <p>
                ${escapeHTML(
                    truncateText(
                        description,
                        110
                    )
                )}
            </p>


            <button
                type="button"
                class="trip-select-button ${
                    selected
                        ? "selected"
                        : ""
                }"
            >

                ${
                    selected
                        ? "✓ Selected"
                        : "＋ Add to Trip"
                }

            </button>

        </div>

    `;


    const selectButton =
        card.querySelector(
            ".trip-select-button"
        );


    if (selectButton) {

        selectButton.addEventListener(
            "click",
            function (event) {

                event.preventDefault();

                event.stopPropagation();


                togglePlaceSelection(
                    place
                );

            }
        );
    }


    return card;
}


// ============================================================
// TOGGLE PLACE SELECTION
// ============================================================

function togglePlaceSelection(
    place
) {

    const placeId =
        getPlaceId(
            place
        );


    if (!placeId) {

        showTripNotification(
            "Unable to select this place.",
            "error"
        );

        return;
    }


    const existingIndex =
        selectedPlaces.findIndex(
            function (selectedPlace) {

                return (
                    getPlaceId(
                        selectedPlace
                    ) === placeId
                );

            }
        );


    if (existingIndex !== -1) {

        // Remove
        selectedPlaces.splice(
            existingIndex,
            1
        );

    } else {

        // Add
        selectedPlaces.push(
            place
        );
    }


    updateSelectedCount();

    renderAvailablePlaces();

    renderItinerary();
}


// ============================================================
// CHECK SELECTED
// ============================================================

function isPlaceSelected(
    place
) {

    const placeId =
        getPlaceId(
            place
        );


    return selectedPlaces.some(
        function (selectedPlace) {

            return (
                getPlaceId(
                    selectedPlace
                ) === placeId
            );

        }
    );
}


// ============================================================
// CHECK SAVED
// ============================================================

function isPlaceSaved(
    place
) {

    const placeId =
        getPlaceId(
            place
        );


    return savedPlaces.some(
        function (savedPlace) {

            return (
                getPlaceId(
                    savedPlace
                ) === placeId
            );

        }
    );
}


// ============================================================
// GET PLACE ID
// ============================================================

function getPlaceId(
    place
) {

    if (!place) {
        return "";
    }


    if (place.placeId) {

        return String(
            place.placeId
        );
    }


    if (place._id) {

        return String(
            place._id
        );
    }


    return "";
}


// ============================================================
// UPDATE SELECTED COUNT
// ============================================================

function updateSelectedCount() {

    const countElement =
        document.getElementById(
            "selectedPlacesCount"
        );


    if (!countElement) {
        return;
    }


    const count =
        selectedPlaces.length;


    countElement.textContent =
        `${count} ${
            count === 1
                ? "place"
                : "places"
        } selected`;
}


// ============================================================
// RENDER ITINERARY
// ============================================================

function renderItinerary() {

    const list =
        document.getElementById(
            "itineraryList"
        );


    const emptyState =
        document.getElementById(
            "itineraryEmpty"
        );


    if (!list) {
        return;
    }


    list.innerHTML = "";


    if (!selectedPlaces.length) {

        if (emptyState) {

            emptyState.style.display =
                "flex";
        }

        return;
    }


    if (emptyState) {

        emptyState.style.display =
            "none";
    }


    selectedPlaces.forEach(
        function (place, index) {

            list.appendChild(
                createItineraryItem(
                    place,
                    index
                )
            );

        }
    );
}


// ============================================================
// CREATE ITINERARY ITEM
// ============================================================

function createItineraryItem(
    place,
    index
) {

    const item =
        document.createElement(
            "div"
        );


    item.className =
        "itinerary-item";


    const image =
        getPlaceImage(
            place
        );


    const locality =
        place.locality ||
        place.location ||
        "Vellore";


    item.innerHTML = `

        <div class="itinerary-number">
            ${index + 1}
        </div>


        <div class="itinerary-image-wrapper">

            <img
                src="${escapeHTML(image)}"
                alt="${escapeHTML(
                    place.placeName ||
                    "Vellore place"
                )}"
                class="itinerary-image"
                loading="lazy"
                onerror="this.src='https://via.placeholder.com/200x140?text=Vellore'"
            >

        </div>


        <div class="itinerary-info">

            <h3>
                ${escapeHTML(
                    place.placeName ||
                    "Unnamed Place"
                )}
            </h3>


            <span>
                📍 ${escapeHTML(locality)}
            </span>

        </div>


        <div class="itinerary-actions">

            <button
                type="button"
                class="itinerary-move-button"
                data-action="up"
                title="Move up"
                ${
                    index === 0
                        ? "disabled"
                        : ""
                }
            >
                ↑
            </button>


            <button
                type="button"
                class="itinerary-move-button"
                data-action="down"
                title="Move down"
                ${
                    index ===
                    selectedPlaces.length - 1
                        ? "disabled"
                        : ""
                }
            >
                ↓
            </button>


            <button
                type="button"
                class="itinerary-remove-button"
                title="Remove from trip"
            >
                ×
            </button>

        </div>

    `;


    const upButton =
        item.querySelector(
            '[data-action="up"]'
        );


    const downButton =
        item.querySelector(
            '[data-action="down"]'
        );


    const removeButton =
        item.querySelector(
            ".itinerary-remove-button"
        );


    if (upButton) {

        upButton.addEventListener(
            "click",
            function () {

                movePlace(
                    index,
                    -1
                );

            }
        );
    }


    if (downButton) {

        downButton.addEventListener(
            "click",
            function () {

                movePlace(
                    index,
                    1
                );

            }
        );
    }


    if (removeButton) {

        removeButton.addEventListener(
            "click",
            function () {

                removePlaceFromTrip(
                    index
                );

            }
        );
    }


    return item;
}


// ============================================================
// MOVE PLACE
// ============================================================

function movePlace(
    index,
    direction
) {

    const newIndex =
        index + direction;


    if (
        newIndex < 0 ||
        newIndex >=
            selectedPlaces.length
    ) {
        return;
    }


    const temporary =
        selectedPlaces[index];


    selectedPlaces[index] =
        selectedPlaces[newIndex];


    selectedPlaces[newIndex] =
        temporary;


    updateSelectedCount();

    renderAvailablePlaces();

    renderItinerary();
}


// ============================================================
// REMOVE PLACE
// ============================================================

function removePlaceFromTrip(
    index
) {

    if (
        index < 0 ||
        index >=
            selectedPlaces.length
    ) {
        return;
    }


    selectedPlaces.splice(
        index,
        1
    );


    updateSelectedCount();

    renderAvailablePlaces();

    renderItinerary();
}


// ============================================================
// SAVE TRIP
// ============================================================

async function saveTrip() {

    const nameInput =
        document.getElementById(
            "tripName"
        );


    const saveButton =
        document.getElementById(
            "saveTripButton"
        );


    const tripName =
        nameInput
            ? nameInput.value.trim()
            : "";


    // ---------------------------------------------------------
    // VALIDATE NAME
    // ---------------------------------------------------------

    if (!tripName) {

        showTripNotification(
            "Please enter a name for your trip.",
            "error"
        );


        if (nameInput) {

            nameInput.focus();
        }


        return;
    }


    // ---------------------------------------------------------
    // VALIDATE PLACES
    // ---------------------------------------------------------

    if (!selectedPlaces.length) {

        showTripNotification(
            "Please select at least one place.",
            "error"
        );

        return;
    }


    const token =
        localStorage.getItem("token");


    if (!token) {

        window.location.href =
            "login.html";

        return;
    }


    if (saveButton) {

        saveButton.disabled =
            true;

        saveButton.innerHTML =
            "⏳ Saving Trip...";
    }


    try {

        const response =
            await fetch(
                TRIPS_API,
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

                            name:
                                tripName,

                            places:
                                selectedPlaces.map(
                                    function (place) {

                                        return getPlaceId(
                                            place
                                        );

                                    }
                                )

                        })
                }
            );


        if (
            response.status === 401
        ) {

            handleAuthenticationFailure();

            return;
        }


        const result =
            await response.json();


        if (!response.ok) {

            throw new Error(
                result.message ||
                "Failed to save trip"
            );
        }


        showTripNotification(
            "🎉 Your trip was saved successfully!",
            "success"
        );


        if (nameInput) {

            nameInput.value = "";
        }


        selectedPlaces = [];


        updateSelectedCount();

        renderAvailablePlaces();

        renderItinerary();


    } catch (error) {

        console.error(
            "Save trip error:",
            error
        );


        showTripNotification(
            error.message ||
            "Failed to save trip.",
            "error"
        );


    } finally {

        if (saveButton) {

            saveButton.disabled =
                false;

            saveButton.innerHTML =
                "💾 Save Trip";
        }
    }
}


// ============================================================
// SEARCH CLEAR
// ============================================================

function clearTripSearch() {

    const searchInput =
        document.getElementById(
            "tripPlaceSearch"
        );


    if (searchInput) {

        searchInput.value = "";

        currentSearchText = "";

        updateClearSearchButton();

        renderAvailablePlaces();

        searchInput.focus();
    }
}


function updateClearSearchButton() {

    const button =
        document.getElementById(
            "clearTripSearch"
        );


    if (!button) {
        return;
    }


    button.style.display =
        currentSearchText
            ? "flex"
            : "none";
}


// ============================================================
// NO RESULTS
// ============================================================

function showNoResults() {

    const noResults =
        document.getElementById(
            "tripNoResults"
        );


    if (noResults) {

        noResults.style.display =
            "flex";
    }
}


function hideNoResults() {

    const noResults =
        document.getElementById(
            "tripNoResults"
        );


    if (noResults) {

        noResults.style.display =
            "none";
    }
}


// ============================================================
// LOADING
// ============================================================

function showTripLoading() {

    const loading =
        document.getElementById(
            "savedPlacesLoading"
        );


    const grid =
        document.getElementById(
            "savedPlacesSelectionGrid"
        );


    if (loading) {

        loading.style.display =
            "flex";
    }


    if (grid) {

        grid.innerHTML = "";
    }
}


function hideTripLoading() {

    const loading =
        document.getElementById(
            "savedPlacesLoading"
        );


    if (loading) {

        loading.style.display =
            "none";
    }
}


// ============================================================
// ERROR
// ============================================================

function showTripError(
    message
) {

    const error =
        document.getElementById(
            "savedPlacesError"
        );


    const errorText =
        document.getElementById(
            "savedPlacesErrorText"
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


function hideTripError() {

    const error =
        document.getElementById(
            "savedPlacesError"
        );


    if (error) {

        error.style.display =
            "none";
    }
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
// PLACE IMAGE
// ============================================================

function getPlaceImage(
    place
) {

    if (
        Array.isArray(
            place.images
        ) &&
        place.images.length > 0
    ) {

        return place.images[0];
    }


    if (
        Array.isArray(
            place.communityImages
        ) &&
        place.communityImages.length > 0
    ) {

        return (
            place.communityImages[0].url ||
            ""
        );
    }


    return "https://via.placeholder.com/600x400?text=Vellore+Discover";
}


// ============================================================
// TRUNCATE
// ============================================================

function truncateText(
    text,
    maxLength
) {

    const value =
        String(
            text || ""
        );


    if (
        value.length <=
        maxLength
    ) {

        return value;
    }


    return (
        value
            .substring(
                0,
                maxLength
            )
            .trim() +
        "..."
    );
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


// ============================================================
// NOTIFICATION
// ============================================================

function showTripNotification(
    message,
    type
) {

    let notification =
        document.getElementById(
            "tripNotification"
        );


    if (!notification) {

        notification =
            document.createElement(
                "div"
            );

        notification.id =
            "tripNotification";

        notification.className =
            "trip-notification";

        document.body.appendChild(
            notification
        );
    }


    notification.className =
        `trip-notification ${
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