const express = require("express");

const {
    createContribution,
    getPlaceContributions,
    getMyContributions,
    updateContribution,
    deleteContribution
} = require("../controllers/contributionController");

const protect =
    require("../middleware/authMiddleware");

const upload =
    require("../uploads/uploadMiddleware");

const {
    uploadContributionMedia,
    updateContributionMedia
} = require("../controllers/mediaController");

const router = express.Router();


// =====================================================
// UPLOAD PHOTOS AND VIDEOS
// Login required
// =====================================================

router.post(
    "/upload-media",
    protect,
    upload.fields([
        {
            name: "photos",
            maxCount: 5
        },
        {
            name: "video",
            maxCount: 1
        }
    ]),
    uploadContributionMedia
);


// =====================================================
// CREATE A CONTRIBUTION
// Login required
// =====================================================

router.post(
    "/",
    protect,
    createContribution
);


// =====================================================
// UPDATE CONTRIBUTION MEDIA
// Login required
// =====================================================

router.put(
    "/:contributionId/media",
    protect,
    upload.fields([
        {
            name: "photos",
            maxCount: 5
        },
        {
            name: "video",
            maxCount: 1
        }
    ]),
    updateContributionMedia
);


// =====================================================
// UPDATE USER'S OWN CONTRIBUTION
// Login required
// =====================================================

router.put(
    "/:contributionId",
    protect,
    updateContribution
);


// =====================================================
// DELETE USER'S OWN CONTRIBUTION
// Login required
// =====================================================

router.delete(
    "/:contributionId",
    protect,
    deleteContribution
);


// =====================================================
// GET CONTRIBUTIONS FOR A PARTICULAR PLACE
// Public
// =====================================================

router.get(
    "/place/:placeId",
    getPlaceContributions
);


// =====================================================
// GET LOGGED-IN USER'S CONTRIBUTIONS
// Login required
// =====================================================

router.get(
    "/my",
    protect,
    getMyContributions
);


// =====================================================
// TEMPORARY ROUTE-CHECKING LOGS
// =====================================================

console.log("Contribution routes loaded:");

console.log(
    router.stack
        .filter((layer) => layer.route)
        .map((layer) => ({
            path: layer.route.path,
            methods:
                Object.keys(
                    layer.route.methods
                )
        }))
);


module.exports = router;