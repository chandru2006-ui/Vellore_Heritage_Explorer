const SavedPlace = require("../models/SavedPlace");
const Place = require("../models/Place");


// =========================================================
// SAVE / UNSAVE PLACE
// =========================================================

const toggleSavedPlace = async (req, res) => {
    try {

        if (!req.user || !req.user.userId) {
            return res.status(401).json({
                success: false,
                message: "Authentication required"
            });
        }


        const { placeId } = req.params;


        const place =
            await Place.findOne({
                placeId: placeId
            });


        if (!place) {
            return res.status(404).json({
                success: false,
                message: "Place not found"
            });
        }


        const existingSavedPlace =
            await SavedPlace.findOne({
                user: req.user.userId,
                place: place._id
            });


        // =================================================
        // UNSAVE
        // =================================================

        if (existingSavedPlace) {

            await SavedPlace.deleteOne({
                _id: existingSavedPlace._id
            });


            return res.json({
                success: true,
                saved: false,
                message: "Place removed from saved places"
            });
        }


        // =================================================
        // SAVE
        // =================================================

        try {

            await SavedPlace.create({
                user: req.user.userId,
                place: place._id
            });

        } catch (error) {

            if (error.code === 11000) {

                return res.status(409).json({
                    success: false,
                    message: "Place is already saved"
                });

            }

            throw error;
        }


        return res.json({
            success: true,
            saved: true,
            message: "Place saved successfully"
        });


    } catch (error) {

        console.error(
            "Toggle saved place error:",
            error
        );


        return res.status(500).json({
            success: false,
            message: "Failed to update saved place"
        });

    }
};


// =========================================================
// GET SAVE STATUS
// =========================================================

const getSavedPlaceStatus = async (req, res) => {
    try {

        if (!req.user || !req.user.userId) {
            return res.status(401).json({
                success: false,
                message: "Authentication required"
            });
        }


        const { placeId } = req.params;


        const place =
            await Place.findOne({
                placeId: placeId
            });


        if (!place) {
            return res.status(404).json({
                success: false,
                message: "Place not found"
            });
        }


        const savedPlace =
            await SavedPlace.findOne({
                user: req.user.userId,
                place: place._id
            });


        return res.json({
            success: true,
            saved: !!savedPlace
        });


    } catch (error) {

        console.error(
            "Get saved place status error:",
            error
        );


        return res.status(500).json({
            success: false,
            message: "Failed to get saved place status"
        });

    }
};


// =========================================================
// GET MY SAVED PLACES
// =========================================================

const getMySavedPlaces = async (req, res) => {
    try {

        if (!req.user || !req.user.userId) {
            return res.status(401).json({
                success: false,
                message: "Authentication required"
            });
        }


        const savedPlaces =
            await SavedPlace.find({
                user: req.user.userId
            })
            .populate("place")
            .sort({
                createdAt: -1
            });


        const places =
            savedPlaces
                .filter(
                    (item) => item.place
                )
                .map(
                    (item) => item.place
                );


        return res.json({
            success: true,
            count: places.length,
            data: places
        });


    } catch (error) {

        console.error(
            "Get my saved places error:",
            error
        );


        return res.status(500).json({
            success: false,
            message: "Failed to load saved places"
        });

    }
};


module.exports = {
    toggleSavedPlace,
    getSavedPlaceStatus,
    getMySavedPlaces
};