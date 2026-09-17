const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");

// ============================================================
// LOAD ENVIRONMENT VARIABLES
// ============================================================
// This must happen BEFORE importing files that use .env values.

dotenv.config();


// ============================================================
// IMPORT CONFIGURATION
// ============================================================

const connectDB =
  require("./config/db");


// ============================================================
// IMPORT ROUTES
// ============================================================

// Places
const placesRoutes =
  require("./routes/placesRoutes");

// Authentication
const authRoutes =
  require("./routes/authRoutes");

  const adminMediaRoutes =
  require("./routes/adminMediaRoutes");

  const adminTripRoutes =
    require("./routes/adminTripRoutes");

// Community contributions
const contributionRoutes =
  require("./routes/contributionRoutes");

// Admin moderation
const adminRoutes =
  require("./routes/adminRoutes");

// Likes
const likeRoutes =
  require("./routes/likeRoutes");

const savedPlaceRoutes =
  require("./routes/savedPlaceRoutes");

const tripRoutes =
    require("./routes/tripRoutes");


// ============================================================
// CREATE EXPRESS APP
// ============================================================

const app = express();


// ============================================================
// MIDDLEWARE
// ============================================================

app.use(cors());

app.use(express.json());


// ============================================================
// API ROUTES
// ============================================================

// ------------------------------------------------------------
// PLACES
// ------------------------------------------------------------

app.use(
  "/api/places",
  placesRoutes
);


// ------------------------------------------------------------
// AUTHENTICATION
// ------------------------------------------------------------

app.use(
  "/api/auth",
  authRoutes
);


// ------------------------------------------------------------
// COMMUNITY CONTRIBUTIONS
// ------------------------------------------------------------

app.use(
  "/api/contributions",
  contributionRoutes
);


// ------------------------------------------------------------
// ADMIN MODERATION
// ------------------------------------------------------------

app.use(
  "/api/admin",
  adminRoutes
);

app.use(
  "/api/admin/media",
  adminMediaRoutes
);

app.use(
    "/api/admin/trips",
    adminTripRoutes
);
// ------------------------------------------------------------
// LIKES
// ------------------------------------------------------------

app.use(
  "/api/likes",
  likeRoutes
);

app.use(
  "/api/saved-places",
  savedPlaceRoutes
);

app.use(
    "/api/trips",
    tripRoutes
);

// ============================================================
// CONNECT TO MONGODB
// ============================================================

connectDB();


// ============================================================
// ROOT API
// ============================================================

app.get("/", (req, res) => {
  res.json({
    message:
      "Vellore Multimedia-Based Local Discovery System API is running"
  });
});


// ============================================================
// SERVER
// ============================================================

const PORT =
  process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(
    `Server running on port ${PORT}`
  );
});