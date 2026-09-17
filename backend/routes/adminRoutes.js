const express = require("express");


// ============================================================
// CONTRIBUTION CONTROLLER
// ============================================================

const {
    getAllContributions,
    approveContribution,
    rejectContribution
} = require("../controllers/adminContributionController");


// ============================================================
// USER CONTROLLER
// ============================================================

const {
    getAllUsers,
    searchUsers,
    updateUserRole
} = require("../controllers/adminUserController");


// ============================================================
// REPORTS CONTROLLER
// ============================================================

const {
    getReportsOverview
} = require("../controllers/adminReportController");


// ============================================================
// MIDDLEWARE
// ============================================================

const protect =
    require("../middleware/authMiddleware");

const adminOnly =
    require("../middleware/adminMiddleware");


// ============================================================
// ROUTER
// ============================================================

const router =
    express.Router();


// ============================================================
// CONTRIBUTION MANAGEMENT
// ============================================================

// GET ALL CONTRIBUTIONS

router.get(
    "/contributions",
    protect,
    adminOnly,
    getAllContributions
);


// APPROVE CONTRIBUTION

router.put(
    "/contributions/:contributionId/approve",
    protect,
    adminOnly,
    approveContribution
);


// REJECT CONTRIBUTION

router.put(
    "/contributions/:contributionId/reject",
    protect,
    adminOnly,
    rejectContribution
);


// ============================================================
// USER MANAGEMENT
// ============================================================

// GET ALL USERS

router.get(
    "/users",
    protect,
    adminOnly,
    getAllUsers
);


// SEARCH USERS

router.get(
    "/users/search",
    protect,
    adminOnly,
    searchUsers
);


// UPDATE USER ROLE

router.put(
    "/users/:userId/role",
    protect,
    adminOnly,
    updateUserRole
);


// ============================================================
// REPORTS & ANALYTICS
// ============================================================

// GET REPORTS OVERVIEW

router.get(
    "/reports/overview",
    protect,
    adminOnly,
    getReportsOverview
);


// ============================================================
// EXPORT
// ============================================================

module.exports =
    router;