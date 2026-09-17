const express = require("express");

const {
    toggleLike,
    getLikeStatus
} = require("../controllers/likeController");

const protect =
    require("../middleware/authMiddleware");

const router = express.Router();


// =========================================================
// LIKE / UNLIKE PLACE
// =========================================================

router.put(
    "/:placeId",
    protect,
    toggleLike
);


// =========================================================
// GET CURRENT USER LIKE STATUS
// =========================================================

router.get(
    "/:placeId/status",
    protect,
    getLikeStatus
);


module.exports = router;