const Like = require("../models/Like");
const Place = require("../models/Place");


// ============================================================
// LIKE / UNLIKE PLACE
// ============================================================

const toggleLike = async (req, res) => {
    try {

        // ------------------------------------------------------
        // CHECK AUTHENTICATION
        // ------------------------------------------------------

        if (!req.user || !req.user.userId) {

            return res.status(401).json({
                success: false,
                message:
                    "Authentication required"
            });

        }


        // ------------------------------------------------------
        // GET PLACE ID
        // ------------------------------------------------------

        const { placeId } =
            req.params;


        // ------------------------------------------------------
        // FIND PLACE
        // ------------------------------------------------------

        const place =
            await Place.findOne({
                placeId: placeId
            });


        if (!place) {

            return res.status(404).json({
                success: false,
                message:
                    "Place not found"
            });

        }


        // ------------------------------------------------------
        // CHECK WHETHER USER ALREADY LIKED
        // ------------------------------------------------------

        const existingLike =
            await Like.findOne({
                user: req.user.userId,
                place: place._id
            });


        // ======================================================
        // UNLIKE
        // ======================================================

        if (existingLike) {

            await Like.deleteOne({
                _id: existingLike._id
            });


            place.likeCount =
                Math.max(
                    0,
                    (place.likeCount || 0) - 1
                );


            await place.save();


            return res.json({
                success: true,
                liked: false,
                likeCount:
                    place.likeCount,
                message:
                    "Place unliked successfully"
            });

        }


        // ======================================================
        // LIKE
        // ======================================================

        try {

            await Like.create({
                user: req.user.userId,
                place: place._id
            });

        } catch (error) {

            // --------------------------------------------------
            // DUPLICATE LIKE
            // --------------------------------------------------

            if (error.code === 11000) {

                return res.status(409).json({
                    success: false,
                    message:
                        "You have already liked this place."
                });

            }

            throw error;
        }


        // ------------------------------------------------------
        // INCREASE LIKE COUNT
        // ------------------------------------------------------

        place.likeCount =
            (place.likeCount || 0) + 1;


        await place.save();


        // ------------------------------------------------------
        // SUCCESS RESPONSE
        // ------------------------------------------------------

        return res.json({
            success: true,
            liked: true,
            likeCount:
                place.likeCount,
            message:
                "Place liked successfully"
        });

    } catch (error) {

        console.error(
            "Toggle like error:",
            error
        );


        return res.status(500).json({
            success: false,
            message:
                "Failed to update like"
        });

    }
};


// ============================================================
// GET CURRENT LIKE STATUS
// ============================================================

const getLikeStatus = async (req, res) => {

    try {

        // ------------------------------------------------------
        // CHECK AUTHENTICATION
        // ------------------------------------------------------

        if (!req.user || !req.user.userId) {

            return res.status(401).json({
                success: false,
                message:
                    "Authentication required"
            });

        }


        // ------------------------------------------------------
        // GET PLACE ID
        // ------------------------------------------------------

        const { placeId } =
            req.params;


        // ------------------------------------------------------
        // FIND PLACE
        // ------------------------------------------------------

        const place =
            await Place.findOne({
                placeId: placeId
            });


        if (!place) {

            return res.status(404).json({
                success: false,
                message:
                    "Place not found"
            });

        }


        // ------------------------------------------------------
        // CHECK LIKE
        // ------------------------------------------------------

        const existingLike =
            await Like.findOne({
                user: req.user.userId,
                place: place._id
            });


        // ------------------------------------------------------
        // RETURN STATUS
        // ------------------------------------------------------

        return res.json({
            success: true,
            liked:
                !!existingLike,
            likeCount:
                place.likeCount || 0
        });

    } catch (error) {

        console.error(
            "Get like status error:",
            error
        );


        return res.status(500).json({
            success: false,
            message:
                "Failed to get like status"
        });

    }
};


// ============================================================
// EXPORT CONTROLLERS
// ============================================================

module.exports = {
    toggleLike,
    getLikeStatus
};