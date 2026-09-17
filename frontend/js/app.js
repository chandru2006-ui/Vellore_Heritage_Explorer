// =========================================================
// VELLORE DISCOVER
// Frontend Application
// =========================================================

const API_URL = "http://localhost:5000/api/places";

// Cache all places returned by MongoDB.
// Category/location/sort filters use this cache so they do not
// depend on a separate category API request.
let allPlacesCache = [];
let currentSearchResults = null;


// =========================================================
// CATEGORY MAPPING
// =========================================================

const CATEGORY_MAP = {
    "Forts & Palaces": ["Forts & Palaces"],
    "Temples": ["Temples"],
    "Waterfalls": ["Waterfalls"],
    "Hills": ["Hills"],
    "Dams & Lakes": ["Dams", "Lakes"],
    "Parks & Nature": ["Parks"]
};


// =========================================================
// LOAD PLACES
// =========================================================

async function loadPlaces() {

    const placesGrid =
        document.getElementById("placesGrid");

    try {

        const response =
            await fetch(API_URL);

        if (!response.ok) {
            throw new Error("Failed to fetch places");
        }

        const result =
            await response.json();

        if (!result.success) {
            throw new Error(
                "API returned an unsuccessful response"
            );
        }


        // Store all MongoDB places locally.
        allPlacesCache =
            Array.isArray(result.data)
                ? result.data
                : [];

        currentSearchResults = null;


        // Populate advanced filters.
        populateAdvancedFilters(
            allPlacesCache
        );


        displayPlaces(
            allPlacesCache,
            true
        );


        resetCategoryFilter();


        updateResultsHeading(
            "Featured Places",
            "Explore some of the remarkable places waiting for you in Vellore."
        );

    } catch (error) {

        console.error(
            "Error loading places:",
            error
        );

        if (placesGrid) {

            placesGrid.innerHTML = `
                <div class="loading">
                    Unable to load places.
                    <br>
                    Make sure the backend server is running.
                </div>
            `;
        }
    }
}


// =========================================================
// DISPLAY PLACES
// =========================================================

function displayPlaces(
    places,
    isHomePage = false
) {

    const placesGrid =
        document.getElementById("placesGrid");

    if (!placesGrid) {
        return;
    }

    placesGrid.innerHTML = "";


    if (!places || places.length === 0) {

        placesGrid.innerHTML = `
            <div class="loading">
                No places found.
                <br>
                Try another search or category.
            </div>
        `;

        return;
    }


    const placesToDisplay =
        isHomePage
            ? places.slice(0, 6)
            : places;


    placesToDisplay.forEach((place) => {

        const card =
            document.createElement("article");

        card.className = "place-card";


        const image =
            place.images &&
            place.images.length > 0
                ? place.images[0]
                : "https://via.placeholder.com/800x500?text=Vellore+Discover";


        card.innerHTML = `

            <div class="place-image-wrapper">

                <img
                    src="${escapeHTML(image)}"
                    alt="${escapeHTML(place.placeName)}"
                    class="place-image"
                    loading="lazy"
                >

                <span class="place-category">
                    ${escapeHTML(
                        place.category || "Place"
                    )}
                </span>

            </div>


            <div class="place-card-content">

                <h3>
                    ${escapeHTML(
                        place.placeName
                    )}
                </h3>


                <p class="place-location">

                    📍 ${escapeHTML(
                        place.locality || "Vellore"
                    )}

                </p>


                <p class="place-description">

                    ${escapeHTML(
                        shortenText(
                            place.description || "",
                            120
                        )
                    )}

                </p>


                <!-- COMMUNITY RATING & LIKE SUMMARY -->

                <div class="place-community-summary">

                    <div class="place-rating-summary">

                        <span class="place-rating-stars">

                            ${createRatingStars(
                                place.communityAverageRating
                            )}

                        </span>

                        <span class="place-rating-value">

                            ${formatCommunityRating(
                                place
                            )}

                        </span>

                    </div>


                    <div class="place-like-summary">

                        <span class="place-like-heart">
                            ♡
                        </span>

                        <span class="place-like-count">

                            ${Number(
                                place.likeCount
                            ) || 0}

                        </span>

                    </div>

                </div>


                <button
                    class="view-place-btn"
                    onclick="viewPlace('${escapeHTML(place.placeId)}')"
                >
                    Explore Place →
                </button>

            </div>

        `;


        placesGrid.appendChild(card);

    });
}


// =========================================================
// COMMUNITY RATING / LIKE HELPERS
// =========================================================

function createRatingStars(
    rating
) {

    const numericRating =
        Number(rating) || 0;


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


function formatCommunityRating(
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
// VIEW PLACE
// =========================================================

function viewPlace(
    placeId
) {

    window.location.href =
        `place.html?id=${encodeURIComponent(placeId)}`;

}


// =========================================================
// SEARCH
// =========================================================

async function searchPlaces() {

    const searchInput =
        document.getElementById(
            "searchInput"
        );


    if (!searchInput) {
        return;
    }


    const query =
        searchInput.value.trim();


    if (!query) {

        resetAdvancedFilterControls(
            true
        );

        currentSearchResults =
            null;

        await loadPlaces();


        const exploreSection =
            document.getElementById(
                "explore"
            );

        if (exploreSection) {

            exploreSection.scrollIntoView({
                behavior: "smooth"
            });

        }

        return;
    }


    try {

        const response =
            await fetch(
                `${API_URL}?q=${encodeURIComponent(query)}`
            );


        if (!response.ok) {

            throw new Error(
                "Search request failed"
            );

        }


        const result =
            await response.json();


        if (!result.success) {

            throw new Error(
                "Search failed"
            );

        }


        currentSearchResults =
            Array.isArray(
                result.data
            )
                ? result.data
                : [];


        displayPlaces(
            currentSearchResults,
            false
        );


        populateAdvancedFilters(
            allPlacesCache
        );


        resetCategoryFilter();


        resetAdvancedFilterControls(
            false
        );


        updateResultsHeading(
            "Search Results",
            `Showing places matching "${query}".`
        );


        const exploreSection =
            document.getElementById(
                "explore"
            );


        if (exploreSection) {

            exploreSection.scrollIntoView({
                behavior: "smooth"
            });

        }


    } catch (error) {

        console.error(
            "Search error:",
            error
        );


        const placesGrid =
            document.getElementById(
                "placesGrid"
            );


        if (placesGrid) {

            placesGrid.innerHTML = `
                <div class="loading">
                    Search failed.
                    <br>
                    Please make sure the backend server is running.
                </div>
            `;

        }
    }
}


// =========================================================
// CATEGORY FILTER
// =========================================================

async function filterByCategory(
    category
) {

    if (!category) {
        return;
    }


    const placesGrid =
        document.getElementById(
            "placesGrid"
        );


    if (!placesGrid) {
        return;
    }


    placesGrid.innerHTML = `
        <div class="loading">
            Loading ${escapeHTML(category)}...
        </div>
    `;


    try {

        // =================================================
        // USE THE ALREADY LOADED DATA
        // =================================================

        if (
            !Array.isArray(
                allPlacesCache
            ) ||
            allPlacesCache.length === 0
        ) {

            const response =
                await fetch(API_URL);


            if (!response.ok) {

                throw new Error(
                    "Failed to load places"
                );

            }


            const result =
                await response.json();


            if (!result.success) {

                throw new Error(
                    "API returned an unsuccessful response"
                );

            }


            allPlacesCache =
                Array.isArray(
                    result.data
                )
                    ? result.data
                    : [];


            populateAdvancedFilters(
                allPlacesCache
            );
        }


        const categories =
            CATEGORY_MAP[category] ||
            [category];


        // =================================================
        // FILTER LOCALLY
        // =================================================

        const filteredPlaces =
            allPlacesCache.filter(
                (place) => {

                    const placeCategory =
                        String(
                            place.category || ""
                        )
                        .trim()
                        .toLowerCase();


                    return categories.some(
                        (databaseCategory) => {

                            return (
                                placeCategory ===
                                String(
                                    databaseCategory
                                )
                                .trim()
                                .toLowerCase()
                            );

                        }
                    );

                }
            );


        // =================================================
        // DISPLAY RESULTS
        // =================================================

        displayPlaces(
            filteredPlaces,
            false
        );


        currentSearchResults =
            filteredPlaces;


        // =================================================
        // SYNCHRONIZE CATEGORY DROPDOWN
        // =================================================

        const categorySelect =
            document.getElementById(
                "advancedCategoryFilter"
            );


        if (categorySelect) {

            categorySelect.value =
                category;

        }


        // =================================================
        // UPDATE LOCATION DROPDOWN
        //
        // ONLY LOCATIONS FROM THIS CATEGORY
        // =================================================

        updateLocationFilter(
            allPlacesCache,
            category
        );


        showCategoryFilter(
            category
        );


        updateResultsHeading(
            category,
            filteredPlaces.length > 0
                ? `Explore ${category.toLowerCase()} in Vellore.`
                : `No ${category.toLowerCase()} places found.`
        );


        const exploreSection =
            document.getElementById(
                "explore"
            );


        if (exploreSection) {

            exploreSection.scrollIntoView({
                behavior: "smooth"
            });

        }


    } catch (error) {

        console.error(
            "Category filter error:",
            error
        );


        placesGrid.innerHTML = `
            <div class="loading">
                Unable to load this category.
                <br>
                Please make sure the places data is available.
            </div>
        `;

    }
}


// =========================================================
// ADVANCED FILTERS
// =========================================================

function getFilterBasePlaces() {

    if (
        Array.isArray(
            currentSearchResults
        )
    ) {

        return currentSearchResults;

    }


    return Array.isArray(
        allPlacesCache
    )
        ? allPlacesCache
        : [];
}


// =========================================================
// POPULATE ADVANCED FILTERS
// =========================================================

function populateAdvancedFilters(
    places
) {

    const categorySelect =
        document.getElementById(
            "advancedCategoryFilter"
        );


    const localitySelect =
        document.getElementById(
            "localityFilter"
        );


    if (!Array.isArray(places)) {
        return;
    }


    // =================================================
    // CATEGORY OPTIONS
    // =================================================

    if (categorySelect) {

        const selectedValue =
            categorySelect.value;


        const categories =
            Object.keys(
                CATEGORY_MAP
            );


        categorySelect.innerHTML = `
            <option value="">
                All Categories
            </option>
        `;


        categories.forEach(
            (category) => {

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
                selectedValue
            )
        ) {

            categorySelect.value =
                selectedValue;

        }

    }


    // =================================================
    // LOCATION OPTIONS
    // =================================================
    //
    // IMPORTANT:
    // Location options are based on the currently
    // selected category.
    //

    updateLocationFilter(
        places,
        categorySelect
            ? categorySelect.value
            : ""
    );
}


// =========================================================
// UPDATE LOCATION FILTER
// =========================================================
//
// This is the new dependent/cascading filter.
//
// Example:
//
// Category = Dams & Lakes
//       ↓
// Location dropdown shows only locations that contain
// Dams or Lakes.
//
// Category = Forts & Palaces
//       ↓
// Location dropdown shows only Fort/Palace locations.
//
// Category = All Categories
//       ↓
// Location dropdown shows all available locations.
// =========================================================

function updateLocationFilter(
    places,
    selectedCategory = ""
) {

    const localitySelect =
        document.getElementById(
            "localityFilter"
        );


    if (
        !localitySelect ||
        !Array.isArray(places)
    ) {

        return;

    }


    const previousValue =
        localitySelect.value;


    let locationPlaces =
        places;


    // =================================================
    // FILTER LOCATIONS BY CATEGORY
    // =================================================

    if (selectedCategory) {

        const allowedCategories =
            CATEGORY_MAP[
                selectedCategory
            ] || [
                selectedCategory
            ];


        locationPlaces =
            places.filter(
                (place) => {

                    const placeCategory =
                        String(
                            place.category || ""
                        )
                        .trim()
                        .toLowerCase();


                    return allowedCategories.some(
                        (allowedCategory) => {

                            return (
                                placeCategory ===
                                String(
                                    allowedCategory
                                )
                                .trim()
                                .toLowerCase()
                            );

                        }
                    );

                }
            );

    }


    // =================================================
    // GET UNIQUE LOCATIONS
    // =================================================

    const localities =
        Array.from(
            new Set(
                locationPlaces
                    .map(
                        (place) =>
                            String(
                                place.locality || ""
                            ).trim()
                    )
                    .filter(Boolean)
            )
        )
        .sort(
            (a, b) =>
                a.localeCompare(b)
        );


    // =================================================
    // REBUILD LOCATION DROPDOWN
    // =================================================

    localitySelect.innerHTML = `
        <option value="">
            ${
                selectedCategory
                    ? "All Locations in " +
                      selectedCategory
                    : "All Locations"
            }
        </option>
    `;


    localities.forEach(
        (locality) => {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                locality;


            option.textContent =
                locality;


            localitySelect.appendChild(
                option
            );

        }
    );


    // =================================================
    // KEEP PREVIOUS LOCATION ONLY IF VALID
    // =================================================

    if (
        localities.includes(
            previousValue
        )
    ) {

        localitySelect.value =
            previousValue;

    } else {

        localitySelect.value =
            "";

    }
}


// =========================================================
// APPLY ADVANCED FILTERS
// =========================================================

function applyAdvancedFilters() {

    const categorySelect =
        document.getElementById(
            "advancedCategoryFilter"
        );


    const localitySelect =
        document.getElementById(
            "localityFilter"
        );


    const sortSelect =
        document.getElementById(
            "sortFilter"
        );


    const selectedCategory =
        categorySelect
            ? categorySelect.value.trim()
            : "";


    const selectedLocality =
        localitySelect
            ? localitySelect.value.trim()
            : "";


    const selectedSort =
        sortSelect
            ? sortSelect.value
            : "default";


    let places =
        getFilterBasePlaces().slice();


    // =================================================
    // CATEGORY
    // =================================================

    if (selectedCategory) {

        const allowedCategories =
            CATEGORY_MAP[
                selectedCategory
            ] || [
                selectedCategory
            ];


        places =
            places.filter(
                (place) => {

                    const placeCategory =
                        String(
                            place.category || ""
                        )
                        .trim()
                        .toLowerCase();


                    return allowedCategories.some(
                        (allowedCategory) => {

                            return (
                                placeCategory ===
                                String(
                                    allowedCategory
                                )
                                .trim()
                                .toLowerCase()
                            );

                        }
                    );

                }
            );

    }


    // =================================================
    // LOCATION
    // =================================================

    if (selectedLocality) {

        places =
            places.filter(
                (place) => {

                    return (
                        String(
                            place.locality || ""
                        ).trim() ===
                        selectedLocality
                    );

                }
            );

    }


    // =================================================
    // SORT
    // =================================================

    if (
        selectedSort === "rating"
    ) {

        places.sort(
            (a, b) => {

                return (
                    (
                        Number(
                            b.communityAverageRating
                        ) || 0
                    ) -
                    (
                        Number(
                            a.communityAverageRating
                        ) || 0
                    )
                );

            }
        );


    } else if (
        selectedSort === "likes"
    ) {

        places.sort(
            (a, b) => {

                return (
                    (
                        Number(
                            b.likeCount
                        ) || 0
                    ) -
                    (
                        Number(
                            a.likeCount
                        ) || 0
                    )
                );

            }
        );


    } else if (
        selectedSort === "az"
    ) {

        places.sort(
            (a, b) => {

                return String(
                    a.placeName || ""
                ).localeCompare(
                    String(
                        b.placeName || ""
                    )
                );

            }
        );


    } else if (
        selectedSort === "za"
    ) {

        places.sort(
            (a, b) => {

                return String(
                    b.placeName || ""
                ).localeCompare(
                    String(
                        a.placeName || ""
                    )
                );

            }
        );


    } else if (
        selectedSort === "newest"
    ) {

        places.sort(
            (a, b) => {

                const dateA =
                    new Date(
                        a.createdAt || 0
                    ).getTime();


                const dateB =
                    new Date(
                        b.createdAt || 0
                    ).getTime();


                return (
                    dateB - dateA
                );

            }
        );

    }


    // =================================================
    // DISPLAY
    // =================================================

    displayPlaces(
        places,
        false
    );


    const headingTitle =
        selectedCategory ||
        selectedLocality ||
        "Explore Places";


    const headingDescription =
        places.length > 0
            ? `${places.length} place${places.length === 1 ? "" : "s"} found.`
            : "No places match the selected filters.";


    updateResultsHeading(
        headingTitle,
        headingDescription
    );


    if (
        selectedCategory ||
        selectedLocality
    ) {

        showCategoryFilter(
            selectedCategory ||
            selectedLocality
        );

    } else {

        resetCategoryFilter();

    }


    const exploreSection =
        document.getElementById(
            "explore"
        );


    if (exploreSection) {

        exploreSection.scrollIntoView({
            behavior: "smooth"
        });

    }
}


// =========================================================
// RESET ADVANCED FILTER CONTROLS
// =========================================================

function resetAdvancedFilterControls(
    clearSearch = true
) {

    const categorySelect =
        document.getElementById(
            "advancedCategoryFilter"
        );


    const localitySelect =
        document.getElementById(
            "localityFilter"
        );


    const sortSelect =
        document.getElementById(
            "sortFilter"
        );


    if (categorySelect) {

        categorySelect.value =
            "";

    }


    if (localitySelect) {

        localitySelect.value =
            "";

    }


    if (sortSelect) {

        sortSelect.value =
            "default";

    }


    if (clearSearch) {

        const searchInput =
            document.getElementById(
                "searchInput"
            );


        if (searchInput) {

            searchInput.value =
                "";

        }

    }
}


// =========================================================
// INITIALIZE ADVANCED FILTERS
// =========================================================

function initializeAdvancedFilters() {

    const categorySelect =
        document.getElementById(
            "advancedCategoryFilter"
        );


    const localitySelect =
        document.getElementById(
            "localityFilter"
        );


    const sortSelect =
        document.getElementById(
            "sortFilter"
        );


    const clearButton =
        document.getElementById(
            "clearAdvancedFilters"
        );


    // =================================================
    // CATEGORY DROPDOWN
    // =================================================

    if (categorySelect) {

        categorySelect.addEventListener(
            "change",
            function () {

                // When category changes, rebuild the
                // location dropdown using ONLY places
                // from that category.

                updateLocationFilter(
                    allPlacesCache,
                    this.value
                );


                // Changing category invalidates any
                // previously selected location.

                if (localitySelect) {

                    localitySelect.value =
                        "";

                }


                // Apply the new category.

                applyAdvancedFilters();

            }
        );

    }


    // =================================================
    // LOCATION DROPDOWN
    // =================================================

    if (localitySelect) {

        localitySelect.addEventListener(
            "change",
            function () {

                applyAdvancedFilters();

            }
        );

    }


    // =================================================
    // SORT DROPDOWN
    // =================================================

    if (sortSelect) {

        sortSelect.addEventListener(
            "change",
            function () {

                applyAdvancedFilters();

            }
        );

    }


    // =================================================
    // CLEAR ADVANCED FILTERS
    // =================================================

    if (clearButton) {

        clearButton.addEventListener(
            "click",
            async function () {

                resetAdvancedFilterControls(
                    true
                );


                currentSearchResults =
                    null;


                resetCategoryFilter();


                await loadPlaces();


                const exploreSection =
                    document.getElementById(
                        "explore"
                    );


                if (exploreSection) {

                    exploreSection.scrollIntoView({
                        behavior: "smooth"
                    });

                }

            }
        );

    }
}


// =========================================================
// START ADVANCED FILTER SYSTEM
// =========================================================

initializeAdvancedFilters();


// =========================================================
// CATEGORY CARD CLICK EVENTS
// =========================================================

document
    .querySelectorAll(
        ".category-card"
    )
    .forEach(
        (card) => {

            card.addEventListener(
                "click",
                function () {

                    const category =
                        this.dataset.category;


                    filterByCategory(
                        category
                    );

                }
            );

        }
    );


// =========================================================
// SHOW CATEGORY FILTER
// =========================================================

function showCategoryFilter(
    category
) {

    const filterBar =
        document.getElementById(
            "categoryFilterBar"
        );


    const activeCategory =
        document.getElementById(
            "activeCategory"
        );


    if (
        !filterBar ||
        !activeCategory
    ) {

        return;

    }


    activeCategory.textContent =
        category;


    filterBar.style.display =
        "flex";
}


// =========================================================
// RESET CATEGORY FILTER
// =========================================================

function resetCategoryFilter() {

    const filterBar =
        document.getElementById(
            "categoryFilterBar"
        );


    const activeCategory =
        document.getElementById(
            "activeCategory"
        );


    if (
        !filterBar ||
        !activeCategory
    ) {

        return;

    }


    activeCategory.textContent =
        "";


    filterBar.style.display =
        "none";
}


// =========================================================
// CLEAR CATEGORY BUTTON
// =========================================================

const clearCategoryButton =
    document.getElementById(
        "clearCategoryButton"
    );


if (clearCategoryButton) {

    clearCategoryButton.addEventListener(
        "click",
        async function () {

            resetAdvancedFilterControls(
                true
            );


            currentSearchResults =
                null;


            await loadPlaces();


            const exploreSection =
                document.getElementById(
                    "explore"
                );


            if (exploreSection) {

                exploreSection.scrollIntoView({
                    behavior: "smooth"
                });

            }

        }
    );

}


// =========================================================
// UPDATE RESULTS HEADING
// =========================================================

function updateResultsHeading(
    title,
    description
) {

    const resultsTitle =
        document.getElementById(
            "resultsTitle"
        );


    const resultsDescription =
        document.getElementById(
            "resultsDescription"
        );


    if (resultsTitle) {

        resultsTitle.textContent =
            title;

    }


    if (resultsDescription) {

        resultsDescription.textContent =
            description;

    }

}


// =========================================================
// SEARCH BUTTON
// =========================================================

const searchButton =
    document.getElementById(
        "searchButton"
    );


if (searchButton) {

    searchButton.addEventListener(
        "click",
        searchPlaces
    );

}


// =========================================================
// ENTER KEY SEARCH
// =========================================================

const searchInput =
    document.getElementById(
        "searchInput"
    );


if (searchInput) {

    searchInput.addEventListener(
        "keydown",
        function (event) {

            if (
                event.key === "Enter"
            ) {

                searchPlaces();

            }

        }
    );

}


// =========================================================
// HELPER — SHORTEN TEXT
// =========================================================

function shortenText(
    text,
    maxLength
) {

    text =
        String(
            text || ""
        );


    if (
        text.length <= maxLength
    ) {

        return text;

    }


    return (
        text.substring(
            0,
            maxLength
        ) +
        "..."
    );
}


// =========================================================
// HELPER — HTML ESCAPE
// =========================================================

function escapeHTML(
    value
) {

    return String(
        value
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
// START APPLICATION
// =========================================================

loadPlaces();