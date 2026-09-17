const dotenv = require("dotenv");
const mongoose = require("mongoose");
const User = require("./models/User");

// Load environment variables
dotenv.config();


// ============================================================
// MAKE AN EXISTING USER AN ADMIN
// ============================================================

const makeAdmin = async () => {
  try {
    // --------------------------------------------------------
    // Check ADMIN_EMAIL
    // --------------------------------------------------------

    if (!process.env.ADMIN_EMAIL) {
      console.error(
        "ERROR: ADMIN_EMAIL is not defined in .env"
      );

      process.exit(1);
    }


    // --------------------------------------------------------
    // Connect to MongoDB
    // --------------------------------------------------------

    await mongoose.connect(
      process.env.MONGO_URI
    );

    console.log(
      "MongoDB connected successfully"
    );


    // --------------------------------------------------------
    // Find the user
    // --------------------------------------------------------

    const email =
      process.env.ADMIN_EMAIL
        .toLowerCase()
        .trim();

    const user =
      await User.findOne({ email });


    if (!user) {
      console.error(
        `No user found with email: ${email}`
      );

      await mongoose.connection.close();
      process.exit(1);
    }


    // --------------------------------------------------------
    // Check current role
    // --------------------------------------------------------

    if (user.role === "admin") {
      console.log(
        "This user is already an admin."
      );

      await mongoose.connection.close();
      process.exit(0);
    }


    // --------------------------------------------------------
    // Promote user to admin
    // --------------------------------------------------------

    user.role = "admin";

    await user.save();


    console.log(
      "=========================================="
    );

    console.log(
      "ADMIN ACCOUNT CREATED SUCCESSFULLY"
    );

    console.log(
      "=========================================="
    );

    console.log(
      `Name  : ${user.name}`
    );

    console.log(
      `Email : ${user.email}`
    );

    console.log(
      `Role  : ${user.role}`
    );

    console.log(
      "=========================================="
    );


    // --------------------------------------------------------
    // Close MongoDB connection
    // --------------------------------------------------------

    await mongoose.connection.close();

    process.exit(0);

  } catch (error) {

    console.error(
      "Failed to create admin:",
      error.message
    );

    try {
      await mongoose.connection.close();
    } catch (closeError) {
      // Ignore connection-close errors
    }

    process.exit(1);
  }
};


// ============================================================
// RUN
// ============================================================

makeAdmin();