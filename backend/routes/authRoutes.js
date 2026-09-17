const express = require("express");

const {
  registerUser,
  loginUser
} = require("../controllers/authController");

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
const protect = require("../middleware/authMiddleware");
router.get("/protected", protect, (req, res) => {
  res.status(200).json({
    success: true,
    message: "You are authenticated",
    user: req.user
  });
});

module.exports = router;