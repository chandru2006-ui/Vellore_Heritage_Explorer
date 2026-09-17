const express = require("express");

const {
    getAllMedia,
    addOfficialImage,
    removeOfficialImage,
    updateOfficialVideo
} = require("../controllers/adminMediaController");

const protect =
    require("../middleware/authMiddleware");

const admin =
    require("../middleware/adminMiddleware");

const router =
    express.Router();


// ============================================================
// ADMIN MEDIA ROUTES
// ============================================================

// GET ALL PLACE MEDIA
router.get(
    "/",
    protect,
    admin,
    getAllMedia
);


// ADD OFFICIAL IMAGE
router.post(
    "/:placeId/images",
    protect,
    admin,
    addOfficialImage
);


// REMOVE OFFICIAL IMAGE
router.delete(
    "/:placeId/images",
    protect,
    admin,
    removeOfficialImage
);


// UPDATE / REMOVE OFFICIAL VIDEO
router.put(
    "/:placeId/video",
    protect,
    admin,
    updateOfficialVideo
);


module.exports =
    router;