const User = require("../models/User");

// ============================================================
// ADMIN ONLY MIDDLEWARE
// ============================================================
// This middleware must be used AFTER authMiddleware.
//
// Flow:
// User Request
//      ↓
// protect middleware
//      ↓
// Verify JWT
//      ↓
// adminOnly middleware
//      ↓
// Check user's role in MongoDB
//      ↓
// Allow only "admin"
// ============================================================

const adminOnly = async (req, res, next) => {
  try {
    // Make sure authentication middleware has already
    // identified the logged-in user.
    if (!req.user || !req.user.userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required"
      });
    }

    // Fetch the actual user from MongoDB.
    // We check the database instead of trusting the role
    // sent by the frontend.
    const user = await User.findById(
      req.user.userId
    );

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User account not found"
      });
    }

    // Only administrators are allowed.
    if (user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Admin access required"
      });
    }

    // Store the verified admin user in the request.
    req.adminUser = user;

    next();

  } catch (error) {
    console.error(
      "Admin authentication error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message: "Failed to verify admin access"
    });
  }
};


// ============================================================
// EXPORT
// ============================================================

module.exports = adminOnly;