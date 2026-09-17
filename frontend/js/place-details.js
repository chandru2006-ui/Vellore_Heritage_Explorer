// =========================================================
// VELLORE DISCOVER
// PLACE DETAILS JAVASCRIPT
// =========================================================


// =========================================================
// API
// =========================================================

const API_URL =
    "http://localhost:5000/api/places";

const CONTRIBUTION_API =
    "http://localhost:5000/api/contributions";

const LIKE_API =
    "http://localhost:5000/api/likes";


// =========================================================
// URL PARAMETERS
// =========================================================

const urlParams =
    new URLSearchParams(
        window.location.search
    );

const placeId =
    urlParams.get("id");

const editContributionId =
    urlParams.get("edit");


// =========================================================
// GLOBAL GALLERY STATE
// =========================================================

let currentImageIndex = 0;


// =========================================================
// LOAD PLACE DETAILS
// =========================================================

async function loadPlaceDetails() {

    const container =
        document.getElementById(
            "placeDetails"
        );


    if (!placeId) {

        showError(
            "Place not specified",
            "Please select a place from the Explore page."
        );

        return;
    }


    try {

        const response =
            await fetch(
                `${API_URL}/${encodeURIComponent(
                    placeId
                )}`
            );


        if (!response.ok) {

            if (
                response.status === 404
            ) {

                throw new Error(
                    "The requested place could not be found."
                );
            }


            throw new Error(
                "Failed to load place details."
            );
        }


        const result =
            await response.json();


        if (
            !result.success ||
            !result.data
        ) {

            throw new Error(
                "Invalid data received from the server."
            );
        }


        displayPlace(
            result.data
        );


        document.title =
            `${result.data.placeName} | Vellore Discover`;


    } catch (error) {

        console.error(
            "Error loading place:",
            error
        );


        showError(
            "Unable to load place",
            error.message
        );
    }
}


// =========================================================
// DISPLAY PLACE
// =========================================================

function displayPlace(place) {

    const container =
        document.getElementById(
            "placeDetails"
        );


    if (!container) {
        return;
    }


    // =====================================================
    // OFFICIAL IMAGES
    // =====================================================

    const officialImages =
        Array.isArray(place.images)
            ? place.images
            : [];


    // =====================================================
    // APPROVED COMMUNITY IMAGES
    // =====================================================

    const communityImages =
        Array.isArray(
            place.communityImages
        )
            ? place.communityImages
                .map(
                    image =>
                        image?.url
                )
                .filter(Boolean)
            : [];


    // =====================================================
    // COMBINE IMAGES
    // =====================================================

    const images = [
        ...officialImages,
        ...communityImages
    ];


    // =====================================================
    // GALLERY
    // =====================================================

    const galleryHTML =
        createGallery(
            images,
            place.placeName
        );


    // =====================================================
    // VIDEO
    // =====================================================

    const videoHTML =
        createVideoSection(
            place.videoLink,
            place.communityVideos
        );


    // =====================================================
    // MAP
    // =====================================================

    const mapHTML =
        createGoogleMapsSection(
            place
        );


    // =====================================================
    // CREATE PAGE
    // =====================================================

    container.innerHTML = `

        <!-- ================================================= -->
        <!-- PLACE HEADER -->
        <!-- ================================================= -->

        <section class="place-details-header">

            <span class="place-details-category">
                ${escapeHTML(
                    place.category ||
                    "Place"
                )}
            </span>


            <h1 class="place-details-title">
                ${escapeHTML(
                    place.placeName
                )}
            </h1>


            <p class="place-details-location">
                📍 ${escapeHTML(
                    place.locality ||
                    "Vellore"
                )}
            </p>


            <!-- COMMUNITY RATING -->

            ${createCommunityRatingSummary(
                place
            )}


            <!-- LIKE -->

            ${createPlaceLikeSection(
                place
            )}

        </section>


        <!-- ================================================= -->
        <!-- IMAGE GALLERY -->
        <!-- ================================================= -->

        ${galleryHTML}


        <!-- ================================================= -->
        <!-- MAIN CONTENT -->
        <!-- ================================================= -->

        <div class="place-content-layout">


            <!-- INFORMATION -->

            <section class="place-information">

                <div class="info-block">

                    <h2>
                        About the Place
                    </h2>

                    <p>
                        ${escapeHTML(
                            place.description ||
                            ""
                        )}
                    </p>

                </div>


                ${createInfoBlock(
                    "What Is It?",
                    place.whatIsIt
                )}


                ${createInfoBlock(
                    "Historical Background",
                    place.historicalBackground
                )}


                ${createInfoBlock(
                    "Primary Purpose & Significance",
                    place.primaryPurposeOrSignificance
                )}


                ${createInfoBlock(
                    "Physical Characteristics",
                    place.physicalCharacteristics
                )}


                ${createInfoBlock(
                    "Dimensions / Size",
                    place.dimensionsOrSize
                )}


                ${createInfoBlock(
                    "Location Context",
                    place.locationContext
                )}


                ${createInfoBlock(
                    "Visitor Information",
                    place.visitorInformation
                )}


                ${createInfoBlock(
                    "Access / Transport",
                    place.accessOrTransport
                )}


                ${createInfoBlock(
                    "Best Time / Season",
                    place.bestTimeOrSeason
                )}

            </section>


            <!-- SIDEBAR -->

            <aside class="place-sidebar">

                <div class="place-info-card">

                    ${createSidebarRow(
                        "Category",
                        place.category
                    )}


                    ${createSidebarRow(
                        "Locality",
                        place.locality
                    )}


                    ${createSidebarRow(
                        "Firka",
                        place.firka
                    )}


                    ${createSidebarRow(
                        "Taluk",
                        place.taluk
                    )}


                    ${createSidebarRow(
                        "Popularity",
                        place.popularityLevel
                    )}


                    ${createSidebarRow(
                        "Place ID",
                        place.placeId
                    )}

                </div>

            </aside>

        </div>


        <!-- ================================================= -->
        <!-- VIDEO -->
        <!-- ================================================= -->

        ${videoHTML}


        <!-- ================================================= -->
        <!-- GOOGLE MAPS -->
        <!-- ================================================= -->

        ${mapHTML}


        <!-- ================================================= -->
        <!-- NEARBY -->
        <!-- ================================================= -->

        ${createNearbySection(
            place.nearbyOrRelatedFeatures
        )}


        <!-- ================================================= -->
        <!-- COMMUNITY -->
        <!-- ================================================= -->

        ${createContributionSection(
            place
        )}

    `;


    // =====================================================
    // IMPORTANT
    // INITIALIZE DYNAMIC COMMUNITY SECTION HERE
    // =====================================================

    setupContributionSection();

    loadContributions();

    loadSavedPlaceStatus();


    const contributionForm =
        document.getElementById(
            "contributionForm"
        );


    if (contributionForm) {

        contributionForm.addEventListener(
            "submit",
            submitContribution
        );
    }


    // =====================================================
    // LOAD LIKE STATUS AFTER BUTTON EXISTS
    // =====================================================

    loadPlaceLikeStatus(
        place.placeId
    );
}


// =========================================================
// COMMUNITY RATING SUMMARY
// =========================================================

function createCommunityRatingSummary(
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


    if (ratingCount === 0) {

        return `

            <div class="community-rating-summary">

                <div class="community-rating-stars">
                    ☆☆☆☆☆
                </div>

                <div class="community-rating-details">

                    <strong>
                        0.0 / 5
                    </strong>

                    <span>
                        No community ratings yet
                    </span>

                </div>

            </div>

        `;
    }


    const roundedRating =
        Math.max(
            0,
            Math.min(
                5,
                Math.round(
                    averageRating
                )
            )
        );


    const stars =
        "★".repeat(
            roundedRating
        ) +
        "☆".repeat(
            5 - roundedRating
        );


    return `

        <div class="community-rating-summary">

            <div class="community-rating-stars">
                ${stars}
            </div>

            <div class="community-rating-details">

                <strong>
                    ${averageRating.toFixed(1)} / 5
                </strong>

                <span>
                    ${ratingCount}
                    community rating${ratingCount === 1 ? "" : "s"}
                </span>

            </div>

        </div>

    `;
}


// =========================================================
// LIKE + SAVE SECTION
// =========================================================

function createPlaceLikeSection(
    place
) {

    const likeCount =
        Number(
            place.likeCount
        ) || 0;


    return `

        <div class="place-like-section">

            <!-- LIKE BUTTON -->

            <button
                type="button"
                class="place-like-button"
                id="placeLikeButton"
                data-place-id="${escapeHTML(
                    place.placeId || ""
                )}"
                onclick="handlePlaceLike()"
            >

                <span
                    class="place-like-icon"
                    id="placeLikeIcon"
                >
                    ♡
                </span>


                <span
                    class="place-like-text"
                    id="placeLikeText"
                >
                    Like
                </span>


                <span
                    class="place-like-count"
                    id="placeLikeCount"
                >
                    ${likeCount}
                </span>

            </button>


            <!-- SAVE BUTTON -->

            <button
                type="button"
                class="place-save-button"
                id="placeSaveButton"
                data-place-id="${escapeHTML(
                    place.placeId || ""
                )}"
                onclick="handlePlaceSave()"
            >

                <span
                    class="place-save-icon"
                    id="placeSaveIcon"
                >
                    🔖
                </span>


                <span
                    class="place-save-text"
                    id="placeSaveText"
                >
                    Save Place
                </span>

            </button>

        </div>

    `;
}


// =========================================================
// LIKE / UNLIKE
// =========================================================

async function handlePlaceLike() {

    try {

        const token =
            localStorage.getItem(
                "token"
            );


        if (!token) {

            alert(
                "Please login to like this place."
            );


            goToLogin();

            return;
        }


        const button =
            document.getElementById(
                "placeLikeButton"
            );


        if (!button) {
            return;
        }


        const currentPlaceId =
            button.dataset.placeId;


        if (!currentPlaceId) {

            console.error(
                "Place ID not found."
            );

            return;
        }


        button.disabled = true;


        const response =
            await fetch(
                `${LIKE_API}/${encodeURIComponent(
                    currentPlaceId
                )}`,
                {
                    method: "PUT",

                    headers: {

                        "Authorization":
                            `Bearer ${token}`,

                        "Content-Type":
                            "application/json"
                    }
                }
            );


        const data =
            await response.json();


        if (
            response.status === 401
        ) {

            localStorage.removeItem(
                "token"
            );


            alert(
                "Your login session has expired. Please login again."
            );


            window.location.href =
                "login.html";


            return;
        }


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Failed to update like."
            );
        }


        updatePlaceLikeUI(
            data.liked,
            data.likeCount
        );


    } catch (error) {

        console.error(
            "Like error:",
            error
        );


        alert(
            error.message ||
            "Unable to update like. Please try again."
        );


    } finally {

        const button =
            document.getElementById(
                "placeLikeButton"
            );


        if (button) {
            button.disabled = false;
        }
    }
}
// =========================================================
// SAVE / UNSAVE PLACE
// =========================================================

async function handlePlaceSave() {

    const saveButton =
        document.getElementById(
            "placeSaveButton"
        );


    const saveIcon =
        document.getElementById(
            "placeSaveIcon"
        );


    const saveText =
        document.getElementById(
            "placeSaveText"
        );


    if (!saveButton) {
        return;
    }


    const placeId =
        saveButton.dataset.placeId;


    if (!placeId) {

        console.error(
            "Place ID is missing"
        );

        return;
    }


    // =================================================
    // CHECK LOGIN
    // =================================================

    const token =
        localStorage.getItem(
            "token"
        );


    if (!token) {

        alert(
            "Please login to save places."
        );

        window.location.href =
            "login.html";

        return;
    }


    // =================================================
    // PREVENT DOUBLE CLICK
    // =================================================

    saveButton.disabled = true;


    try {

        const response =
            await fetch(
                `http://localhost:5000/api/saved-places/${encodeURIComponent(placeId)}`,
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


        if (!response.ok || !result.success) {

            throw new Error(
                result.message ||
                "Failed to update saved place"
            );

        }


        // =================================================
        // UPDATE BUTTON STATE
        // =================================================

        if (result.saved) {

            saveButton.classList.add(
                "saved"
            );


            if (saveIcon) {

                saveIcon.textContent =
                    "✓";

            }


            if (saveText) {

                saveText.textContent =
                    "Saved";

            }

        } else {

            saveButton.classList.remove(
                "saved"
            );


            if (saveIcon) {

                saveIcon.textContent =
                    "🔖";

            }


            if (saveText) {

                saveText.textContent =
                    "Save Place";

            }

        }


    } catch (error) {

        console.error(
            "Save place error:",
            error
        );


        alert(
            error.message ||
            "Unable to save this place."
        );

    } finally {

        saveButton.disabled = false;

    }
}


// =========================================================
// CHECK WHETHER PLACE IS ALREADY SAVED
// =========================================================

async function loadSavedPlaceStatus() {

    const saveButton =
        document.getElementById(
            "placeSaveButton"
        );


    const saveIcon =
        document.getElementById(
            "placeSaveIcon"
        );


    const saveText =
        document.getElementById(
            "placeSaveText"
        );


    if (!saveButton) {
        return;
    }


    const placeId =
        saveButton.dataset.placeId;


    if (!placeId) {
        return;
    }


    const token =
        localStorage.getItem(
            "token"
        );


    // User is not logged in.
    // Leave the button in normal Save state.

    if (!token) {
        return;
    }


    try {

        const response =
            await fetch(
                `http://localhost:5000/api/saved-places/${encodeURIComponent(placeId)}/status`,
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
            !response.ok ||
            !result.success
        ) {

            return;

        }


        if (result.saved) {

            saveButton.classList.add(
                "saved"
            );


            if (saveIcon) {

                saveIcon.textContent =
                    "✓";

            }


            if (saveText) {

                saveText.textContent =
                    "Saved";

            }

        } else {

            saveButton.classList.remove(
                "saved"
            );


            if (saveIcon) {

                saveIcon.textContent =
                    "🔖";

            }


            if (saveText) {

                saveText.textContent =
                    "Save Place";

            }

        }


    } catch (error) {

        console.error(
            "Load saved place status error:",
            error
        );

    }
}

// =========================================================
// LOAD LIKE STATUS
// =========================================================

async function loadPlaceLikeStatus(
    currentPlaceId
) {

    try {

        const token =
            localStorage.getItem(
                "token"
            );


        if (!token) {
            return;
        }


        if (!currentPlaceId) {
            return;
        }


        const response =
            await fetch(
                `${LIKE_API}/${encodeURIComponent(
                    currentPlaceId
                )}/status`,
                {
                    method: "GET",

                    headers: {
                        "Authorization":
                            `Bearer ${token}`
                    }
                }
            );


        if (
            response.status === 401
        ) {

            return;
        }


        const data =
            await response.json();


        if (!response.ok) {
            return;
        }


        updatePlaceLikeUI(
            data.liked,
            data.likeCount
        );


    } catch (error) {

        console.error(
            "Load like status error:",
            error
        );
    }
}


// =========================================================
// UPDATE LIKE UI
// =========================================================

function updatePlaceLikeUI(
    liked,
    likeCount
) {

    const button =
        document.getElementById(
            "placeLikeButton"
        );


    const icon =
        document.getElementById(
            "placeLikeIcon"
        );


    const text =
        document.getElementById(
            "placeLikeText"
        );


    const count =
        document.getElementById(
            "placeLikeCount"
        );


    if (!button) {
        return;
    }


    if (icon) {

        icon.textContent =
            liked
                ? "♥"
                : "♡";
    }


    if (text) {

        text.textContent =
            liked
                ? "Liked"
                : "Like";
    }


    if (count) {

        count.textContent =
            Number(
                likeCount
            ) || 0;
    }


    button.classList.toggle(
        "liked",
        Boolean(liked)
    );
}


// =========================================================
// GOOGLE MAPS
// =========================================================

function createGoogleMapsSection(
    place
) {

    const placeName =
        place.placeName ||
        "Vellore";


    const locality =
        place.locality ||
        "Vellore";


    let locationQuery =
        `${placeName}, ${locality}, Vellore, Tamil Nadu, India`;


    if (
        place.latitude !== null &&
        place.longitude !== null &&
        place.latitude !== undefined &&
        place.longitude !== undefined
    ) {

        const latitude =
            Number(
                place.latitude
            );


        const longitude =
            Number(
                place.longitude
            );


        if (
            !Number.isNaN(
                latitude
            ) &&
            !Number.isNaN(
                longitude
            )
        ) {

            locationQuery =
                `${latitude},${longitude}`;
        }
    }


    const googleMapsURL =
        `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
            locationQuery
        )}`;


    const directionsURL =
        `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
            locationQuery
        )}`;


    return `

        <section class="place-map-section">

            <div class="section-heading">

                <span class="section-label">
                    Location
                </span>

                <h2>
                    Find This Place
                </h2>

                <p>
                    Find this place and get directions using Google Maps.
                </p>

            </div>


            <div class="google-maps-card">

                <div class="google-maps-location">

                    <div class="google-maps-icon">
                        📍
                    </div>

                    <div class="google-maps-text">

                        <h3>
                            ${escapeHTML(
                                placeName
                            )}
                        </h3>

                        <p>
                            ${escapeHTML(
                                locality
                            )}
                        </p>

                    </div>

                </div>


                <div class="place-location-actions">

                    <a
                        class="map-action-btn"
                        href="${escapeHTML(
                            googleMapsURL
                        )}"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        📍 Open in Google Maps
                    </a>


                    <a
                        class="map-action-btn secondary"
                        href="${escapeHTML(
                            directionsURL
                        )}"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        🚗 Get Directions
                    </a>

                </div>

            </div>

        </section>

    `;
}


// =========================================================
// IMAGE GALLERY
// =========================================================

function createGallery(
    images,
    placeName
) {

    if (
        !Array.isArray(images) ||
        images.length === 0
    ) {

        return `

            <div class="place-gallery-empty">
                No images available for this place.
            </div>

        `;
    }


    const previewImages =
        getPreviewImages(
            images
        );


    let html = `

        <div class="place-gallery">

    `;


    previewImages.forEach(
        (
            image,
            index
        ) => {

            html += `

                <div class="gallery-item">

                    <img
                        src="${escapeHTML(
                            optimizeCloudinaryImage(
                                image
                            )
                        )}"
                        alt="${escapeHTML(
                            placeName
                        )} image ${
                            index + 1
                        }"
                        class="gallery-image ${
                            index === 0
                                ? "gallery-image-main"
                                : ""
                        }"
                        loading="${
                            index === 0
                                ? "eager"
                                : "lazy"
                        }"
                    >

                </div>

            `;
        }
    );


    html += `

        </div>

    `;


    if (
        images.length > 5
    ) {

        html += `

            <div class="gallery-actions">

                <button
                    type="button"
                    class="view-all-images-btn"
                    id="viewAllImagesBtn"
                >
                    🖼️ View All ${images.length} Images
                </button>

            </div>

        `;
    }


    html += `

        <div
            class="gallery-lightbox"
            id="galleryLightbox"
            aria-hidden="true"
        >

            <div class="lightbox-content">

                <button
                    type="button"
                    class="lightbox-close"
                    id="lightboxClose"
                    aria-label="Close gallery"
                >
                    ×
                </button>


                <button
                    type="button"
                    class="lightbox-prev"
                    id="lightboxPrev"
                    aria-label="Previous image"
                >
                    ‹
                </button>


                <img
                    id="lightboxImage"
                    src=""
                    alt=""
                >


                <button
                    type="button"
                    class="lightbox-next"
                    id="lightboxNext"
                    aria-label="Next image"
                >
                    ›
                </button>


                <div
                    class="lightbox-counter"
                    id="lightboxCounter"
                >
                    1 / ${images.length}
                </div>

            </div>

        </div>

    `;


    window.placeGalleryImages =
        images;


    window.placeGalleryName =
        placeName;


    return html;
}


// =========================================================
// PREVIEW IMAGES
// =========================================================

function getPreviewImages(
    images
) {

    if (
        !Array.isArray(images)
    ) {

        return [];
    }


    if (
        window.innerWidth <= 560
    ) {

        return images.slice(
            0,
            2
        );
    }


    if (
        window.innerWidth <= 900
    ) {

        return images.slice(
            0,
            4
        );
    }


    return images.slice(
        0,
        7
    );
}


// =========================================================
// IMAGE OPTIMIZATION
// =========================================================

function optimizeCloudinaryImage(
    url
) {

    if (
        !url ||
        !url.includes(
            "res.cloudinary.com"
        )
    ) {

        return url;
    }


    return url.replace(
        "/image/upload/",
        "/image/upload/f_auto,q_auto,w_2000,c_limit/"
    );
}


// =========================================================
// INFORMATION BLOCK
// =========================================================

function createInfoBlock(
    title,
    value
) {

    if (
        !value ||
        !String(value).trim()
    ) {

        return "";
    }


    return `

        <div class="info-block">

            <h3>
                ${escapeHTML(
                    title
                )}
            </h3>

            <p>
                ${escapeHTML(
                    value
                )}
            </p>

        </div>

    `;
}


// =========================================================
// SIDEBAR ROW
// =========================================================

function createSidebarRow(
    label,
    value
) {

    if (
        !value ||
        !String(value).trim()
    ) {

        return "";
    }


    return `

        <div class="place-info-row">

            <span class="place-info-label">
                ${escapeHTML(
                    label
                )}
            </span>

            <span class="place-info-value">
                ${escapeHTML(
                    value
                )}
            </span>

        </div>

    `;
}


// =========================================================
// VIDEO SECTION
// =========================================================

function createVideoSection(
    videoLink,
    communityVideos = []
) {

    let officialVideoHTML =
        "";


    // =====================================================
    // OFFICIAL VIDEO
    // =====================================================

    if (
        videoLink &&
        String(videoLink).trim()
    ) {

        const embedUrl =
            convertYouTubeToEmbed(
                videoLink
            );


        if (embedUrl) {

            officialVideoHTML = `

                <div class="video-item">

                    <div class="video-item-title">
                        Official Video
                    </div>

                    <div class="video-wrapper">

                        <iframe
                            src="${escapeHTML(
                                embedUrl
                            )}"
                            title="Official video of this place"
                            loading="lazy"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            allowfullscreen>
                        </iframe>

                    </div>

                </div>

            `;
        }
    }


    // =====================================================
    // COMMUNITY VIDEOS
    // =====================================================

    let communityVideoHTML =
        "";


    if (
        Array.isArray(
            communityVideos
        ) &&
        communityVideos.length > 0
    ) {

        communityVideoHTML =
            communityVideos
                .map(
                    (
                        video,
                        index
                    ) => {

                        const videoUrl =
                            typeof video === "string"
                                ? video
                                : video?.url;


                        if (
                            !videoUrl ||
                            !String(
                                videoUrl
                            ).trim()
                        ) {

                            return "";
                        }


                        const embedUrl =
                            convertYouTubeToEmbed(
                                videoUrl
                            );


                        if (embedUrl) {

                            return `

                                <div class="video-item">

                                    <div class="video-item-title">
                                        Community Video ${
                                            index + 1
                                        }
                                    </div>

                                    <div class="video-wrapper">

                                        <iframe
                                            src="${escapeHTML(
                                                embedUrl
                                            )}"
                                            title="Community video ${
                                                index + 1
                                            }"
                                            loading="lazy"
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                            allowfullscreen>
                                        </iframe>

                                    </div>

                                </div>

                            `;
                        }


                        return `

                            <div class="video-item">

                                <div class="video-item-title">
                                    Community Video ${
                                        index + 1
                                    }
                                </div>

                                <video
                                    controls
                                    preload="metadata"
                                    class="community-video-player"
                                >

                                    <source
                                        src="${escapeHTML(
                                            videoUrl
                                        )}"
                                    >

                                    Your browser does not support video playback.

                                </video>

                            </div>

                        `;
                    }
                )
                .join("");
    }


    // =====================================================
    // NO VIDEO
    // =====================================================

    if (
        !officialVideoHTML &&
        !communityVideoHTML
    ) {

        return `

            <section class="place-video-section">

                <h2>
                    Video
                </h2>

                <div class="no-video">
                    No video is currently available for this place.
                </div>

            </section>

        `;
    }


    // =====================================================
    // FINAL VIDEO
    // =====================================================

    return `

        <section class="place-video-section">

            <h2>
                Explore Through Video
            </h2>

            <div class="place-video-list">

                ${officialVideoHTML}

                ${communityVideoHTML}

            </div>

        </section>

    `;
}


// =========================================================
// YOUTUBE CONVERSION
// =========================================================

function convertYouTubeToEmbed(
    url
) {

    try {

        const parsedUrl =
            new URL(
                url
            );


        let videoId =
            "";


        if (
            parsedUrl.hostname.includes(
                "youtube.com"
            )
        ) {

            videoId =
                parsedUrl.searchParams.get(
                    "v"
                );
        }


        if (
            parsedUrl.hostname ===
            "youtu.be"
        ) {

            videoId =
                parsedUrl.pathname.substring(
                    1
                );
        }


        if (!videoId) {

            return null;
        }


        videoId =
            videoId.split(
                "&"
            )[0];


        return (
            `https://www.youtube.com/embed/${videoId}`
        );


    } catch (error) {

        console.error(
            "Invalid YouTube URL:",
            error
        );


        return null;
    }
}


// =========================================================
// NEARBY / RELATED
// =========================================================

function createNearbySection(
    value
) {

    if (
        !value ||
        !String(value).trim()
    ) {

        return "";
    }


    return `

        <section class="nearby-section">

            <h2>
                Nearby & Related Features
            </h2>

            <p>
                ${escapeHTML(
                    value
                )}
            </p>

        </section>

    `;
}


// =========================================================
// COMMUNITY CONTRIBUTION SECTION
// =========================================================

function createContributionSection(
    place
) {

    return `

        <section class="contribution-section">

            <div class="section-heading">

                <span class="section-label">
                    Community
                </span>

                <h2>
                    Share Your Experience
                </h2>

                <p>
                    Help other visitors by sharing your experience,
                    rating, photos, videos and feedback.
                </p>

            </div>


            <div class="contribution-card">


                <!-- ========================================= -->
                <!-- LOGIN MESSAGE -->
                <!-- ========================================= -->

                <div
                    class="contribution-login-message"
                    id="contributionLoginMessage"
                >

                    <p>
                        🔐 Please login to share your experience.
                    </p>

                    <button
                        type="button"
                        class="contribution-login-btn"
                        onclick="goToLogin()"
                    >
                        Login to Contribute
                    </button>

                </div>


                <!-- ========================================= -->
                <!-- CONTRIBUTION FORM -->
                <!-- ========================================= -->

                <form
                    id="contributionForm"
                    class="contribution-form"
                    style="display: none;"
                >


                    <!-- ===================================== -->
                    <!-- RATING -->
                    <!-- ===================================== -->

                    <div class="contribution-field">

                        <label
                            for="contributionRating"
                        >
                            Rating
                        </label>


                        <select
                            id="contributionRating"
                        >

                            <option value="">
                                Select rating
                            </option>


                            <option value="5">
                                ⭐⭐⭐⭐⭐ — Excellent
                            </option>


                            <option value="4">
                                ⭐⭐⭐⭐ — Very Good
                            </option>


                            <option value="3">
                                ⭐⭐⭐ — Good
                            </option>


                            <option value="2">
                                ⭐⭐ — Average
                            </option>


                            <option value="1">
                                ⭐ — Poor
                            </option>

                        </select>

                    </div>


                    <!-- ===================================== -->
                    <!-- EXPERIENCE -->
                    <!-- ===================================== -->

                    <div class="contribution-field">

                        <label
                            for="contributionExperience"
                        >
                            Your Experience
                        </label>


                        <textarea
                            id="contributionExperience"
                            rows="5"
                            maxlength="2000"
                            placeholder="Tell other visitors about your experience..."
                        ></textarea>

                    </div>


                    <!-- ===================================== -->
                    <!-- FEEDBACK -->
                    <!-- ===================================== -->

                    <div class="contribution-field">

                        <label
                            for="contributionFeedback"
                        >
                            Feedback
                        </label>


                        <textarea
                            id="contributionFeedback"
                            rows="4"
                            maxlength="2000"
                            placeholder="Share your suggestions or feedback..."
                        ></textarea>

                    </div>


                    <!-- ===================================== -->
                    <!-- EXISTING MEDIA - EDIT MODE -->
                    <!-- ===================================== -->

                    <div
                        id="existingContributionMedia"
                        class="existing-contribution-media"
                        style="display: none;"
                    >

                        <div class="existing-media-heading">

                            <h3>
                                📂 Existing Media
                            </h3>

                            <p>
                                Select any existing media you want to remove.
                                Your changes will be sent for review again.
                            </p>

                        </div>


                        <!-- EXISTING PHOTOS -->

                        <div
                            id="existingContributionPhotos"
                            class="existing-contribution-photos"
                        ></div>


                        <!-- EXISTING VIDEO -->

                        <div
                            id="existingContributionVideo"
                            class="existing-contribution-video"
                        ></div>

                    </div>


                    <!-- ===================================== -->
                    <!-- PHOTOS -->
                    <!-- ===================================== -->

                    <div class="contribution-field">

                        <label
                            for="contributionPhotos"
                        >
                            Photos
                        </label>


                        <input
                            type="file"
                            id="contributionPhotos"
                            accept="image/jpeg,image/png,image/webp"
                            multiple
                        >


                        <small
                            id="contributionPhotosHelp"
                        >
                            You can select up to 5 photos.
                        </small>

                    </div>


                    <!-- ===================================== -->
                    <!-- VIDEO -->
                    <!-- ===================================== -->

                    <div class="contribution-field">

                        <label
                            for="contributionVideo"
                        >
                            Video
                        </label>


                        <input
                            type="file"
                            id="contributionVideo"
                            accept="video/mp4,video/webm,video/quicktime"
                        >


                        <small
                            id="contributionVideoHelp"
                        >
                            Upload one MP4, WEBM or MOV video.
                        </small>

                    </div>


                    <!-- ===================================== -->
                    <!-- STATUS -->
                    <!-- ===================================== -->

                    <div
                        id="contributionStatus"
                        class="contribution-status"
                    ></div>


                    <!-- ===================================== -->
                    <!-- SUBMIT -->
                    <!-- ===================================== -->

                    <button
                        type="submit"
                        class="contribution-submit-btn"
                    >
                        🚀 Submit Contribution
                    </button>


                </form>

            </div>


            <!-- ========================================= -->
            <!-- EXISTING CONTRIBUTIONS -->
            <!-- ========================================= -->

            <div
                id="contributionsList"
                class="contributions-list"
            >

                <div class="contributions-loading">
                    Loading community contributions...
                </div>

            </div>


        </section>

    `;
}


// =========================================================
// SETUP CONTRIBUTION SECTION
// =========================================================

function setupContributionSection() {

    const token =
        localStorage.getItem(
            "token"
        );


    const loginMessage =
        document.getElementById(
            "contributionLoginMessage"
        );


    const form =
        document.getElementById(
            "contributionForm"
        );


    if (
        !loginMessage ||
        !form
    ) {

        return;
    }


    // =====================================================
    // LOGIN STATE
    // =====================================================

    if (token) {

        loginMessage.style.display =
            "none";


        form.style.display =
            "block";

    } else {

        loginMessage.style.display =
            "block";


        form.style.display =
            "none";


        return;
    }


    // =====================================================
    // NEW CONTRIBUTION
    // =====================================================

    if (
        !editContributionId
    ) {

        return;
    }


    // =====================================================
    // LOAD EDITING CONTRIBUTION
    // =====================================================

    const storedContribution =
        sessionStorage.getItem(
            "editingContribution"
        );


    if (
        !storedContribution
    ) {

        console.error(
            "Editing contribution data not found."
        );


        return;
    }


    try {

        const contribution =
            JSON.parse(
                storedContribution
            );


        // =================================================
        // RATING
        // =================================================

        const ratingElement =
            document.getElementById(
                "contributionRating"
            );


        if (
            ratingElement &&
            contribution.rating !== null &&
            contribution.rating !== undefined
        ) {

            ratingElement.value =
                String(
                    contribution.rating
                );
        }


        // =================================================
        // EXPERIENCE
        // =================================================

        const experienceElement =
            document.getElementById(
                "contributionExperience"
            );


        if (
            experienceElement
        ) {

            experienceElement.value =
                contribution.experience ||
                "";
        }


        // =================================================
        // FEEDBACK
        // =================================================

        const feedbackElement =
            document.getElementById(
                "contributionFeedback"
            );


        if (
            feedbackElement
        ) {

            feedbackElement.value =
                contribution.feedback ||
                "";
        }


        // =================================================
        // EXISTING MEDIA CONTAINER
        // =================================================

        const existingMediaContainer =
            document.getElementById(
                "existingContributionMedia"
            );


        const existingPhotosContainer =
            document.getElementById(
                "existingContributionPhotos"
            );


        const existingVideoContainer =
            document.getElementById(
                "existingContributionVideo"
            );


        // =================================================
        // EXISTING PHOTOS
        // =================================================

        const existingPhotos =
            Array.isArray(
                contribution.photos
            )
                ? contribution.photos.filter(
                    Boolean
                )
                : [];


        if (
            existingPhotosContainer
        ) {

            if (
                existingPhotos.length > 0
            ) {

                existingPhotosContainer.innerHTML = `

                    <div class="existing-media-title">
                        Existing Photos
                    </div>

                    <div class="existing-photo-grid">

                        ${
                            existingPhotos
                                .map(
                                    (
                                        photo,
                                        index
                                    ) => `

                                        <div
                                            class="existing-photo-item"
                                        >

                                            <img
                                                src="${escapeHTML(
                                                    optimizeCloudinaryImage(
                                                        photo
                                                    )
                                                )}"
                                                alt="Existing contribution photo ${
                                                    index + 1
                                                }"
                                                loading="lazy"
                                            >


                                            <label
                                                class="existing-photo-remove"
                                            >

                                                <input
                                                    type="checkbox"
                                                    class="existing-media-remove"
                                                    data-url="${escapeHTML(
                                                        photo
                                                    )}"
                                                >

                                                <span>
                                                    Remove photo
                                                </span>

                                            </label>

                                        </div>

                                    `
                                )
                                .join("")
                        }

                    </div>

                `;

            } else {

                existingPhotosContainer.innerHTML =
                    `
                        <div class="existing-media-empty">
                            No existing photos.
                        </div>
                    `;
            }
        }


        // =================================================
        // EXISTING VIDEO
        // =================================================

        if (
            existingVideoContainer
        ) {

            if (
                contribution.video &&
                String(
                    contribution.video
                ).trim()
            ) {

                existingVideoContainer.innerHTML = `

                    <div class="existing-media-title">
                        Existing Video
                    </div>


                    <div class="existing-video-preview">

                        <video
                            controls
                            preload="metadata"
                            class="existing-contribution-video-player"
                        >

                            <source
                                src="${escapeHTML(
                                    contribution.video
                                )}"
                            >

                            Your browser does not support
                            video playback.

                        </video>


                        <label
                            class="existing-video-remove"
                        >

                            <input
                                type="checkbox"
                                id="existingVideoRemove"
                            >

                            <span>
                                Remove existing video
                            </span>

                        </label>

                    </div>

                `;

            } else {

                existingVideoContainer.innerHTML =
                    `
                        <div class="existing-media-empty">
                            No existing video.
                        </div>
                    `;
            }
        }


        // =================================================
        // SHOW EXISTING MEDIA SECTION
        // =================================================

        if (
            existingMediaContainer &&
            (
                existingPhotos.length > 0 ||
                (
                    contribution.video &&
                    String(
                        contribution.video
                    ).trim()
                )
            )
        ) {

            existingMediaContainer.style.display =
                "block";
        }


        // =================================================
        // PHOTO UPLOAD HELP
        // =================================================

        const photosHelp =
            document.getElementById(
                "contributionPhotosHelp"
            );


        if (
            photosHelp
        ) {

            photosHelp.textContent =
                "Add new photos. Existing photos remain unless you select them for removal.";
        }


        // =================================================
        // VIDEO UPLOAD HELP
        // =================================================

        const videoHelp =
            document.getElementById(
                "contributionVideoHelp"
            );


        if (
            videoHelp
        ) {

            videoHelp.textContent =
                "Select a new video to replace the existing video.";
        }


        // =================================================
        // BUTTON
        // =================================================

        const submitButton =
            form.querySelector(
                ".contribution-submit-btn"
            );


        if (
            submitButton
        ) {

            submitButton.textContent =
                "✏️ Update Contribution";
        }


        // =================================================
        // STATUS
        // =================================================

        const statusElement =
            document.getElementById(
                "contributionStatus"
            );


        if (
            statusElement
        ) {

            statusElement.textContent =
                "✏️ Editing your existing contribution. Update details or media below.";
        }


    } catch (error) {

        console.error(
            "Failed to load contribution for editing:",
            error
        );
    }
}


// =========================================================
// LOGIN
// =========================================================

function goToLogin() {

    const currentPlaceId =
        new URLSearchParams(
            window.location.search
        ).get("id");


    if (
        currentPlaceId
    ) {

        const redirectUrl =
            `place.html?id=${encodeURIComponent(
                currentPlaceId
            )}`;


        window.location.href =
            `login.html?redirect=${encodeURIComponent(
                redirectUrl
            )}`;


        return;
    }


    window.location.href =
        "login.html";
}


// =========================================================
// LOAD COMMUNITY CONTRIBUTIONS
// =========================================================

async function loadContributions() {

    const list =
        document.getElementById(
            "contributionsList"
        );


    if (
        !list ||
        !placeId
    ) {

        return;
    }


    // Show loading state

    list.innerHTML = `

        <div class="contributions-loading">
            Loading community contributions...
        </div>

    `;


    try {

        const response =
            await fetch(
                `${CONTRIBUTION_API}/place/${encodeURIComponent(
                    placeId
                )}`
            );


        const result =
            await response.json();


        if (
            !response.ok ||
            !result.success
        ) {

            throw new Error(
                result.message ||
                "Failed to load contributions."
            );
        }


        displayContributions(
            Array.isArray(
                result.data
            )
                ? result.data
                : []
        );


    } catch (error) {

        console.error(
            "Error loading contributions:",
            error
        );


        list.innerHTML = `

            <div class="contributions-empty">

                <h3>
                    Unable to load community contributions
                </h3>

                <p>
                    Please refresh the page and try again.
                </p>

            </div>

        `;
    }
}


// =========================================================
// DISPLAY CONTRIBUTIONS
// =========================================================

function displayContributions(
    contributions
) {

    const list =
        document.getElementById(
            "contributionsList"
        );


    if (!list) {
        return;
    }


    if (
        !Array.isArray(
            contributions
        ) ||
        contributions.length === 0
    ) {

        list.innerHTML = `

            <div class="contributions-empty">

                <h3>
                    No community contributions yet
                </h3>

                <p>
                    Be the first visitor to share your
                    experience of this place.
                </p>

            </div>

        `;


        return;
    }


    // =====================================================
    // CALCULATE PUBLIC AVERAGE
    // =====================================================

    let totalRating =
        0;


    let ratingCount =
        0;


    contributions.forEach(
        contribution => {

            if (
                contribution.rating !== null &&
                contribution.rating !== undefined
            ) {

                const rating =
                    Number(
                        contribution.rating
                    );


                if (
                    Number.isFinite(
                        rating
                    ) &&
                    rating >= 1 &&
                    rating <= 5
                ) {

                    totalRating +=
                        rating;


                    ratingCount++;
                }
            }
        }
    );


    const averageRating =
        ratingCount > 0
            ? (
                totalRating /
                ratingCount
            ).toFixed(1)
            : null;


    let html = `

        <div class="contributions-summary">

            <h3>
                Community Contributions
            </h3>

            ${
                averageRating
                    ? `

                        <div class="average-rating">

                            ⭐ ${averageRating} / 5

                            <span>
                                (${ratingCount}
                                rating${
                                    ratingCount > 1
                                        ? "s"
                                        : ""
                                })
                            </span>

                        </div>

                    `
                    : ""
            }

        </div>

    `;


    // =====================================================
    // CONTRIBUTION CARDS
    // =====================================================

    contributions.forEach(
        contribution => {

            const userName =
                contribution.user?.name ||
                "Anonymous Visitor";


            const rating =
                contribution.rating;


            const createdDate =
                contribution.createdAt
                    ? new Date(
                        contribution.createdAt
                    ).toLocaleDateString()
                    : "";


            html += `

                <article class="contribution-item">


                    <div class="contribution-item-header">

                        <div>

                            <strong>
                                ${escapeHTML(
                                    userName
                                )}
                            </strong>


                            ${
                                createdDate
                                    ? `

                                        <span>
                                            ${escapeHTML(
                                                createdDate
                                            )}
                                        </span>

                                    `
                                    : ""
                            }

                        </div>


                        ${
                            rating
                                ? `

                                    <div class="contribution-rating">
                                        ${"⭐".repeat(
                                            Number(
                                                rating
                                            )
                                        )}
                                    </div>

                                `
                                : ""
                        }

                    </div>


                    ${
                        contribution.experience
                            ? `

                                <div class="contribution-content">

                                    <h4>
                                        Experience
                                    </h4>

                                    <p>
                                        ${escapeHTML(
                                            contribution.experience
                                        )}
                                    </p>

                                </div>

                            `
                            : ""
                    }


                    ${
                        contribution.feedback
                            ? `

                                <div class="contribution-content">

                                    <h4>
                                        Feedback
                                    </h4>

                                    <p>
                                        ${escapeHTML(
                                            contribution.feedback
                                        )}
                                    </p>

                                </div>

                            `
                            : ""
                    }


                    ${
                        Array.isArray(
                            contribution.photos
                        ) &&
                        contribution.photos.length > 0
                            ? `

                                <div class="contribution-media">

                                    <h4>
                                        Photos
                                    </h4>


                                    <div class="contribution-photo-grid">

                                        ${contribution.photos
                                            .map(
                                                photo => `

                                                    <img
                                                        src="${escapeHTML(
                                                            optimizeCloudinaryImage(
                                                                photo
                                                            )
                                                        )}"
                                                        alt="Community contribution"
                                                        loading="lazy"
                                                    >

                                                `
                                            )
                                            .join("")}

                                    </div>

                                </div>

                            `
                            : ""
                    }


                    ${
                        contribution.video
                            ? `

                                <div class="contribution-media">

                                    <h4>
                                        Video
                                    </h4>


                                    <video
                                        controls
                                        preload="metadata"
                                        class="contribution-video"
                                    >

                                        <source
                                            src="${escapeHTML(
                                                contribution.video
                                            )}"
                                        >

                                        Your browser does not support
                                        video playback.

                                    </video>

                                </div>

                            `
                            : ""
                    }


                </article>

            `;
        }
    );


    list.innerHTML =
        html;
}


// =========================================================
// UPLOAD CONTRIBUTION MEDIA
// =========================================================

async function uploadContributionMedia(
    formData,
    token
) {

    const response =
        await fetch(
            `${CONTRIBUTION_API}/upload-media`,
            {
                method: "POST",

                headers: {
                    Authorization:
                        `Bearer ${token}`
                },

                body:
                    formData
            }
        );


    const result =
        await response.json();


    if (
        !response.ok ||
        !result.success
    ) {

        throw new Error(
            result.message ||
            result.error ||
            "Media upload failed."
        );
    }


    return (
        result.data || {}
    );
}


// =========================================================
// SUBMIT / UPDATE CONTRIBUTION
// =========================================================

async function submitContribution(
    event
) {

    event.preventDefault();


    const token =
        localStorage.getItem(
            "token"
        );


    if (!token) {

        goToLogin();

        return;
    }


    const ratingElement =
        document.getElementById(
            "contributionRating"
        );


    const experienceElement =
        document.getElementById(
            "contributionExperience"
        );


    const feedbackElement =
        document.getElementById(
            "contributionFeedback"
        );


    const photosElement =
        document.getElementById(
            "contributionPhotos"
        );


    const videoElement =
        document.getElementById(
            "contributionVideo"
        );


    const statusElement =
        document.getElementById(
            "contributionStatus"
        );


    const submitButton =
        event.target.querySelector(
            ".contribution-submit-btn"
        );


    if (
        !ratingElement ||
        !experienceElement ||
        !feedbackElement ||
        !photosElement ||
        !videoElement ||
        !statusElement ||
        !submitButton
    ) {

        console.error(
            "Contribution form elements are missing."
        );

        return;
    }


    const rating =
        ratingElement.value;


    const experience =
        experienceElement.value.trim();


    const feedback =
        feedbackElement.value.trim();


    const photoCount =
        photosElement.files
            ? photosElement.files.length
            : 0;


    const videoCount =
        videoElement.files
            ? videoElement.files.length
            : 0;


    const isEditMode =
        Boolean(
            editContributionId
        );


    // =====================================================
    // VALIDATION
    // =====================================================

    if (
        !rating &&
        !experience &&
        !feedback &&
        photoCount === 0 &&
        videoCount === 0 &&
        !isEditMode
    ) {

        statusElement.textContent =
            "Please provide at least one contribution.";

        return;
    }


    try {

        submitButton.disabled =
            true;


        // =================================================
        // EDIT EXISTING CONTRIBUTION
        // =================================================

        if (
            isEditMode
        ) {

            submitButton.textContent =
                "Updating...";


            statusElement.textContent =
                "Updating your contribution...";


            // ---------------------------------------------
            // UPDATE TEXT + RATING
            // ---------------------------------------------

            const contributionData = {

                rating:
                    rating
                        ? Number(
                            rating
                        )
                        : null,

                experience:
                    experience,

                feedback:
                    feedback
            };


            const response =
                await fetch(
                    `${CONTRIBUTION_API}/${encodeURIComponent(
                        editContributionId
                    )}`,
                    {
                        method: "PUT",

                        headers: {

                            "Content-Type":
                                "application/json",

                            Authorization:
                                `Bearer ${token}`
                        },

                        body:
                            JSON.stringify(
                                contributionData
                            )
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


                alert(
                    "Your login session has expired. Please login again."
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
                    "Failed to update contribution."
                );
            }


            // ---------------------------------------------
            // CHECK MEDIA CHANGES
            // ---------------------------------------------

            const removePhotoElements =
                document.querySelectorAll(
                    ".existing-media-remove:checked"
                );


            const removePhotos = [];


            removePhotoElements.forEach(
                (element) => {

                    const photoUrl =
                        element.dataset.url;

                    if (
                        photoUrl
                    ) {

                        removePhotos.push(
                            photoUrl
                        );
                    }
                }
            );


            const removeVideoElement =
                document.querySelector(
                    "#existingVideoRemove"
                );


            const removeVideo =
                Boolean(
                    removeVideoElement &&
                    removeVideoElement.checked
                );


            const hasNewPhotos =
                photoCount > 0;


            const hasNewVideo =
                videoCount > 0;


            const mediaChanged =
                removePhotos.length > 0 ||
                removeVideo ||
                hasNewPhotos ||
                hasNewVideo;


            // ---------------------------------------------
            // UPDATE MEDIA
            // ---------------------------------------------

            if (
                mediaChanged
            ) {

                submitButton.textContent =
                    "Updating media...";


                statusElement.textContent =
                    "Updating your photos and video...";


                const mediaFormData =
                    new FormData();


                // -----------------------------------------
                // NEW PHOTOS
                // -----------------------------------------

                for (
                    let i = 0;
                    i < photoCount &&
                    i < 5;
                    i++
                ) {

                    mediaFormData.append(
                        "photos",
                        photosElement.files[i]
                    );
                }


                // -----------------------------------------
                // NEW VIDEO
                // -----------------------------------------

                if (
                    hasNewVideo
                ) {

                    mediaFormData.append(
                        "video",
                        videoElement.files[0]
                    );
                }


                // -----------------------------------------
                // PHOTOS TO REMOVE
                // -----------------------------------------

                mediaFormData.append(
                    "removePhotos",
                    JSON.stringify(
                        removePhotos
                    )
                );


                // -----------------------------------------
                // VIDEO TO REMOVE
                // -----------------------------------------

                mediaFormData.append(
                    "removeVideo",
                    removeVideo
                        ? "true"
                        : "false"
                );


                const mediaResponse =
                    await fetch(
                        `${CONTRIBUTION_API}/${encodeURIComponent(
                            editContributionId
                        )}/media`,
                        {
                            method: "PUT",

                            headers: {

                                Authorization:
                                    `Bearer ${token}`
                            },

                            body:
                                mediaFormData
                        }
                    );


                const mediaResult =
                    await mediaResponse.json();


                if (
                    mediaResponse.status === 401
                ) {

                    localStorage.removeItem(
                        "token"
                    );


                    alert(
                        "Your login session has expired. Please login again."
                    );


                    window.location.href =
                        "login.html";


                    return;
                }


                if (
                    !mediaResponse.ok ||
                    !mediaResult.success
                ) {

                    throw new Error(
                        mediaResult.message ||
                        "Failed to update contribution media."
                    );
                }
            }


            // ---------------------------------------------
            // SUCCESS
            // ---------------------------------------------

            statusElement.textContent =
                "✅ Contribution updated successfully and sent for review.";


            sessionStorage.removeItem(
                "editingContribution"
            );


            setTimeout(
                () => {

                    window.location.href =
                        "my-contributions.html";

                },
                1000
            );


            return;
        }


        // =================================================
        // NEW CONTRIBUTION
        // =================================================

        submitButton.textContent =
            "Uploading...";


        let uploadedPhotos =
            [];


        let uploadedVideo =
            "";


        // =================================================
        // UPLOAD MEDIA FIRST
        // =================================================

        if (
            photoCount > 0 ||
            videoCount > 0
        ) {

            const mediaFormData =
                new FormData();


            // ---------------------------------------------
            // PHOTOS
            // ---------------------------------------------

            for (
                let i = 0;
                i < photoCount &&
                i < 5;
                i++
            ) {

                mediaFormData.append(
                    "photos",
                    photosElement.files[i]
                );
            }


            // ---------------------------------------------
            // VIDEO
            // ---------------------------------------------

            if (
                videoCount > 0
            ) {

                mediaFormData.append(
                    "video",
                    videoElement.files[0]
                );
            }


            statusElement.textContent =
                "Uploading your media...";


            const mediaResult =
                await uploadContributionMedia(
                    mediaFormData,
                    token
                );


            uploadedPhotos =
                Array.isArray(
                    mediaResult.photos
                )
                    ? mediaResult.photos
                    : [];


            uploadedVideo =
                mediaResult.video ||
                "";
        }


        // =================================================
        // SAVE NEW CONTRIBUTION
        // =================================================

        statusElement.textContent =
            "Saving your contribution...";


        const contributionData = {

            placeId:
                placeId,

            rating:
                rating
                    ? Number(
                        rating
                    )
                    : null,

            experience:
                experience,

            feedback:
                feedback,

            photos:
                uploadedPhotos,

            video:
                uploadedVideo
        };


        const response =
            await fetch(
                CONTRIBUTION_API,
                {
                    method: "POST",

                    headers: {

                        "Content-Type":
                            "application/json",

                        Authorization:
                            `Bearer ${token}`
                    },

                    body:
                        JSON.stringify(
                            contributionData
                        )
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


            alert(
                "Your login session has expired. Please login again."
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
                "Failed to save contribution."
            );
        }


        // =================================================
        // SUCCESS
        // =================================================

        statusElement.textContent =
            "✅ Contribution submitted successfully!";


        event.target.reset();


        await loadContributions();


    } catch (error) {

        console.error(
            "Contribution submission error:",
            error
        );


        statusElement.textContent =
            `❌ ${
                error.message ||
                "Unable to submit contribution."
            }`;


    } finally {

        submitButton.disabled =
            false;


        if (
            isEditMode
        ) {

            submitButton.textContent =
                "✏️ Update Contribution";

        } else {

            submitButton.textContent =
                "🚀 Submit Contribution";
        }
    }
}


// =========================================================
// GALLERY CLICK HANDLING
// =========================================================

document.addEventListener(
    "click",
    function (event) {


        // =================================================
        // OPEN GALLERY
        // =================================================

        if (
            event.target.closest(
                "#viewAllImagesBtn"
            )
        ) {

            openGallery(
                0
            );
        }


        // =================================================
        // CLOSE
        // =================================================

        if (
            event.target.closest(
                "#lightboxClose"
            )
        ) {

            closeGallery();
        }


        // =================================================
        // PREVIOUS
        // =================================================

        if (
            event.target.closest(
                "#lightboxPrev"
            )
        ) {

            changeGalleryImage(
                -1
            );
        }


        // =================================================
        // NEXT
        // =================================================

        if (
            event.target.closest(
                "#lightboxNext"
            )
        ) {

            changeGalleryImage(
                1
            );
        }

    }
);


// =========================================================
// OPEN GALLERY
// =========================================================

function openGallery(
    index
) {

    const lightbox =
        document.getElementById(
            "galleryLightbox"
        );


    if (!lightbox) {
        return;
    }


    currentImageIndex =
        index;


    updateLightbox();


    lightbox.classList.add(
        "active"
    );


    lightbox.setAttribute(
        "aria-hidden",
        "false"
    );


    document.body.style.overflow =
        "hidden";
}


// =========================================================
// CLOSE GALLERY
// =========================================================

function closeGallery() {

    const lightbox =
        document.getElementById(
            "galleryLightbox"
        );


    if (!lightbox) {
        return;
    }


    lightbox.classList.remove(
        "active"
    );


    lightbox.setAttribute(
        "aria-hidden",
        "true"
    );


    document.body.style.overflow =
        "";
}


// =========================================================
// CHANGE GALLERY IMAGE
// =========================================================

function changeGalleryImage(
    direction
) {

    const images =
        window.placeGalleryImages ||
        [];


    if (
        !images.length
    ) {

        return;
    }


    currentImageIndex +=
        direction;


    if (
        currentImageIndex < 0
    ) {

        currentImageIndex =
            images.length - 1;
    }


    if (
        currentImageIndex >=
        images.length
    ) {

        currentImageIndex =
            0;
    }


    updateLightbox();
}


// =========================================================
// UPDATE LIGHTBOX
// =========================================================

function updateLightbox() {

    const images =
        window.placeGalleryImages ||
        [];


    const image =
        document.getElementById(
            "lightboxImage"
        );


    const counter =
        document.getElementById(
            "lightboxCounter"
        );


    if (
        !image ||
        !counter ||
        !images.length
    ) {

        return;
    }


    image.src =
        optimizeCloudinaryImage(
            images[
                currentImageIndex
            ]
        );


    image.alt =
        `${window.placeGalleryName} image ${
            currentImageIndex + 1
        }`;


    counter.textContent =
        `${currentImageIndex + 1} / ${images.length}`;
}


// =========================================================
// KEYBOARD CONTROLS
// =========================================================

document.addEventListener(
    "keydown",
    function (event) {

        const lightbox =
            document.getElementById(
                "galleryLightbox"
            );


        if (
            !lightbox ||
            !lightbox.classList.contains(
                "active"
            )
        ) {

            return;
        }


        if (
            event.key ===
            "Escape"
        ) {

            closeGallery();
        }


        if (
            event.key ===
            "ArrowLeft"
        ) {

            changeGalleryImage(
                -1
            );
        }


        if (
            event.key ===
            "ArrowRight"
        ) {

            changeGalleryImage(
                1
            );
        }

    }
);


// =========================================================
// ERROR
// =========================================================

function showError(
    title,
    message
) {

    const container =
        document.getElementById(
            "placeDetails"
        );


    if (!container) {
        return;
    }


    container.innerHTML = `

        <div class="details-error">

            <h2>
                ${escapeHTML(
                    title
                )}
            </h2>

            <p>
                ${escapeHTML(
                    message
                )}
            </p>

        </div>

    `;
}


// =========================================================
// HTML ESCAPE
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
// START APPLICATION
// =========================================================

loadPlaceDetails();