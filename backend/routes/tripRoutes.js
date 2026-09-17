const express = require("express");

const {
    createTrip,
    getMyTrips,
    getTripById,
    updateTrip,
    deleteTrip
} = require("../controllers/tripController");

const protect =
    require("../middleware/authMiddleware");

const router = express.Router();


// =========================================================
// CREATE TRIP
// =========================================================

router.post(
    "/",
    protect,
    createTrip
);


// =========================================================
// GET MY TRIPS
// =========================================================

router.get(
    "/my",
    protect,
    getMyTrips
);


// =========================================================
// GET SINGLE TRIP
// =========================================================

router.get(
    "/:tripId",
    protect,
    getTripById
);


// =========================================================
// UPDATE TRIP
// =========================================================

router.put(
    "/:tripId",
    protect,
    updateTrip
);


// =========================================================
// DELETE TRIP
// =========================================================

router.delete(
    "/:tripId",
    protect,
    deleteTrip
);


module.exports = router;