const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// ============================================================
// REGISTER A NEW USER
// ============================================================

const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required"
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters"
      });
    }

    const existingUser = await User.findOne({
      email: email.toLowerCase()
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists with this email"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // IMPORTANT:
    // Do not accept role from the frontend.
    // Every newly registered account is a normal user.
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: "user"
    });

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error(
      "Registration error:",
      error.message
    );

    res.status(500).json({
      success: false,
      message: "Registration failed",
      error: error.message
    });
  }
};


// ============================================================
// LOGIN USER
// ============================================================

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required"
      });
    }

    const user = await User.findOne({
      email: email.toLowerCase()
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    const isPasswordCorrect = await bcrypt.compare(
      password,
      user.password
    );

    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }


    // ========================================================
    // JWT TOKEN
    // ========================================================

    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        role: user.role || "user"
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d"
      }
    );


    // ========================================================
    // LOGIN RESPONSE
    // ========================================================

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role || "user"
      }
    });

  } catch (error) {
    console.error(
      "Login error:",
      error.message
    );

    res.status(500).json({
      success: false,
      message: "Login failed",
      error: error.message
    });
  }
};


// ============================================================
// EXPORT
// ============================================================

module.exports = {
  registerUser,
  loginUser
};