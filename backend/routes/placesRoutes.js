const express = require("express");

const {
    getAllPlaces,
    getPlaceById,
    createPlace,
    updatePlace,
    deletePlace
} = require("../controllers/placesController");

const protect =
    require("../middleware/authMiddleware");

const admin =
    require("../middleware/adminMiddleware");

const router =
    express.Router();


// ============================================================
// PUBLIC ROUTES
// ============================================================

// GET ALL PLACES
router.get(
    "/",
    getAllPlaces
);


// GET ONE PLACE
router.get(
    "/:placeId",
    getPlaceById
);


// ============================================================
// ADMIN-ONLY ROUTES
// ============================================================

// CREATE NEW PLACE
router.post(
    "/",
    protect,
    admin,
    createPlace
);


// UPDATE EXISTING PLACE
router.put(
    "/:placeId",
    protect,
    admin,
    updatePlace
);


// DELETE PLACE
router.delete(
    "/:placeId",
    protect,
    admin,
    deletePlace
);


module.exports =
    router;