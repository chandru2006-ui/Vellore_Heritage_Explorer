const express = require("express");

const {
    getAllTrips,
    deleteTripAdmin,
    getTripStatistics
} = require("../controllers/adminTripController");

const protect =
    require("../middleware/authMiddleware");

const admin =
    require("../middleware/adminMiddleware");

const router =
    express.Router();


// ============================================================
// ADMIN TRIP MANAGEMENT
// ============================================================


// GET ALL TRIPS
router.get(
    "/",
    protect,
    admin,
    getAllTrips
);


// GET TRIP STATISTICS
router.get(
    "/statistics",
    protect,
    admin,
    getTripStatistics
);


// DELETE TRIP
router.delete(
    "/:tripId",
    protect,
    admin,
    deleteTripAdmin
);


module.exports =
    router;