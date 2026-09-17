const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    // ========================================================
    // USER NAME
    // ========================================================

    name: {
      type: String,
      required: true,
      trim: true
    },


    // ========================================================
    // EMAIL
    // ========================================================

    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true
    },


    // ========================================================
    // PASSWORD
    // ========================================================

    password: {
      type: String,
      required: true,
      minlength: 6
    },


    // ========================================================
    // USER ROLE
    //
    // user  → Normal community member
    // admin → Administrator
    // ========================================================

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user"
    }
  },
  {
    timestamps: true
  }
);


// ============================================================
// EXPORT MODEL
// ============================================================

module.exports =
  mongoose.model("User", userSchema);