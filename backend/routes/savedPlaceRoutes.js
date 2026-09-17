const express = require("express");

const {
    toggleSavedPlace,
    getSavedPlaceStatus,
    getMySavedPlaces
} = require("../controllers/savedPlaceController");

const protect =
    require("../middleware/authMiddleware");

const router = express.Router();


// =========================================================
// SAVE / UNSAVE PLACE
// =========================================================

router.put(
    "/:placeId",
    protect,
    toggleSavedPlace
);


// =========================================================
// GET SAVE STATUS
// =========================================================

router.get(
    "/:placeId/status",
    protect,
    getSavedPlaceStatus
);


// =========================================================
// GET CURRENT USER'S SAVED PLACES
// =========================================================

router.get(
    "/my",
    protect,
    getMySavedPlaces
);


module.exports = router;