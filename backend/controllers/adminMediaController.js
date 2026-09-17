const Place = require("../models/Place");

// ============================================================
// GET MEDIA FOR ALL PLACES
// ============================================================

const getAllMedia = async (req, res) => {
    try {
        const {
            q,
            category
        } = req.query;

        const filter = {};

        // --------------------------------------------------------
        // Search by Place ID / Place Name / Locality
        // --------------------------------------------------------

        if (q && q.trim()) {
            const safeQuery =
                q.trim().replace(
                    /[.*+?^${}()|[\]\\]/g,
                    "\\$&"
                );

            filter.$or = [
                {
                    placeId: {
                        $regex: safeQuery,
                        $options: "i"
                    }
                },
                {
                    placeName: {
                        $regex: safeQuery,
                        $options: "i"
                    }
                },
                {
                    locality: {
                        $regex: safeQuery,
                        $options: "i"
                    }
                }
            ];
        }

        // --------------------------------------------------------
        // Category filter
        // --------------------------------------------------------

        if (category && category.trim()) {
            filter.category = {
                $regex:
                    `^${category.trim().replace(
                        /[.*+?^${}()|[\]\\]/g,
                        "\\$&"
                    )}$`,
                $options: "i"
            };
        }

        const places =
            await Place.find(filter)
                .select(
                    "placeId placeName locality category images videoLink communityImages communityVideos"
                )
                .sort({
                    placeId: 1
                })
                .lean();

        const data = places.map(place => ({
            _id: place._id,
            placeId: place.placeId,
            placeName: place.placeName,
            locality: place.locality || "",
            category: place.category || "",

            images:
                Array.isArray(place.images)
                    ? place.images
                    : [],

            videoLink:
                place.videoLink || "",

            communityImageCount:
                Array.isArray(place.communityImages)
                    ? place.communityImages.length
                    : 0,

            communityVideoCount:
                Array.isArray(place.communityVideos)
                    ? place.communityVideos.length
                    : 0,

            imageCount:
                Array.isArray(place.images)
                    ? place.images.length
                    : 0,

            hasVideo:
                Boolean(
                    place.videoLink &&
                    place.videoLink.trim()
                )
        }));

        return res.status(200).json({
            success: true,
            count: data.length,
            data
        });

    } catch (error) {
        console.error(
            "Get admin media error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to fetch media"
        });
    }
};


// ============================================================
// ADD OFFICIAL IMAGE
// ============================================================

const addOfficialImage = async (req, res) => {
    try {
        const {
            placeId
        } = req.params;

        const {
            imageUrl
        } = req.body;

        // --------------------------------------------------------
        // Validate image URL
        // --------------------------------------------------------

        if (
            !imageUrl ||
            typeof imageUrl !== "string" ||
            !imageUrl.trim()
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Image URL is required"
            });
        }

        const cleanUrl =
            imageUrl.trim();

        // --------------------------------------------------------
        // Find place
        // --------------------------------------------------------

        const place =
            await Place.findOne({
                placeId
            });

        if (!place) {
            return res.status(404).json({
                success: false,
                message:
                    "Place not found"
            });
        }

        // --------------------------------------------------------
        // Prevent duplicate image URL
        // --------------------------------------------------------

        if (
            Array.isArray(place.images) &&
            place.images.includes(cleanUrl)
        ) {
            return res.status(409).json({
                success: false,
                message:
                    "This image already exists for this place"
            });
        }

        // --------------------------------------------------------
        // Add image
        // --------------------------------------------------------

        if (!Array.isArray(place.images)) {
            place.images = [];
        }

        place.images.push(cleanUrl);

        await place.save();

        return res.status(200).json({
            success: true,
            message:
                "Official image added successfully",
            data: {
                placeId: place.placeId,
                imageUrl: cleanUrl,
                imageCount:
                    place.images.length
            }
        });

    } catch (error) {
        console.error(
            "Add official image error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to add official image"
        });
    }
};


// ============================================================
// REMOVE OFFICIAL IMAGE
// ============================================================

const removeOfficialImage = async (req, res) => {
    try {
        const {
            placeId
        } = req.params;

        const {
            imageUrl
        } = req.body;

        if (
            !imageUrl ||
            typeof imageUrl !== "string" ||
            !imageUrl.trim()
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Image URL is required"
            });
        }

        const cleanUrl =
            imageUrl.trim();

        const place =
            await Place.findOne({
                placeId
            });

        if (!place) {
            return res.status(404).json({
                success: false,
                message:
                    "Place not found"
            });
        }

        if (
            !Array.isArray(place.images) ||
            !place.images.includes(cleanUrl)
        ) {
            return res.status(404).json({
                success: false,
                message:
                    "Image not found for this place"
            });
        }

        place.images =
            place.images.filter(
                url => url !== cleanUrl
            );

        await place.save();

        return res.status(200).json({
            success: true,
            message:
                "Official image removed successfully",
            data: {
                placeId: place.placeId,
                imageCount:
                    place.images.length
            }
        });

    } catch (error) {
        console.error(
            "Remove official image error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to remove official image"
        });
    }
};


// ============================================================
// UPDATE OFFICIAL VIDEO
// ============================================================

const updateOfficialVideo = async (req, res) => {
    try {
        const {
            placeId
        } = req.params;

        const {
            videoUrl
        } = req.body;

        if (
            videoUrl === undefined ||
            videoUrl === null
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Video URL is required"
            });
        }

        if (
            typeof videoUrl !== "string"
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Video URL must be a string"
            });
        }

        const cleanUrl =
            videoUrl.trim();

        const place =
            await Place.findOne({
                placeId
            });

        if (!place) {
            return res.status(404).json({
                success: false,
                message:
                    "Place not found"
            });
        }

        // --------------------------------------------------------
        // Empty URL removes the video
        // --------------------------------------------------------

        place.videoLink =
            cleanUrl;

        await place.save();

        return res.status(200).json({
            success: true,
            message:
                cleanUrl
                    ? "Official video updated successfully"
                    : "Official video removed successfully",
            data: {
                placeId:
                    place.placeId,
                videoLink:
                    place.videoLink,
                hasVideo:
                    Boolean(
                        place.videoLink
                    )
            }
        });

    } catch (error) {
        console.error(
            "Update official video error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to update official video"
        });
    }
};


// ============================================================
// EXPORT
// ============================================================

module.exports = {
    getAllMedia,
    addOfficialImage,
    removeOfficialImage,
    updateOfficialVideo
};