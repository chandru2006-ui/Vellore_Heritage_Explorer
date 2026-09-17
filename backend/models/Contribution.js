const mongoose = require("mongoose");

const contributionSchema = new mongoose.Schema(
  {
    // ========================================================
    // USER
    // ========================================================

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },


    // ========================================================
    // PLACE
    // ========================================================

    place: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Place",
      required: true
    },


    // ========================================================
    // RATING
    // ========================================================

    rating: {
      type: Number,
      min: 1,
      max: 5,
      default: null
    },


    // ========================================================
    // EXPERIENCE
    // ========================================================

    experience: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: ""
    },


    // ========================================================
    // FEEDBACK
    // ========================================================

    feedback: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: ""
    },


    // ========================================================
    // PHOTOS
    // ========================================================

    photos: {
      type: [String],
      default: []
    },


    // ========================================================
    // VIDEO
    // ========================================================

    video: {
      type: String,
      default: ""
    },


    // ========================================================
    // MODERATION STATUS
    //
    // pending  → Waiting for admin review
    // approved → Visible as approved community content
    // rejected → Rejected by administrator
    // ========================================================

    status: {
      type: String,
      enum: [
        "pending",
        "approved",
        "rejected"
      ],
      default: "pending"
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
  mongoose.model(
    "Contribution",
    contributionSchema
  );