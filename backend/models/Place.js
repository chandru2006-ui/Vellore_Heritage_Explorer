const mongoose = require("mongoose");

const placeSchema = new mongoose.Schema(
  {
    // ========================================================
    // BASIC PLACE INFORMATION
    // ========================================================

    placeId: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },

    placeName: {
      type: String,
      required: true,
      trim: true
    },

    locality: {
      type: String,
      trim: true
    },

    firka: {
      type: String,
      trim: true
    },

    taluk: {
      type: String,
      trim: true
    },

    category: {
      type: String,
      trim: true
    },

    popularityLevel: {
      type: String,
      trim: true
    },

    description: {
      type: String,
      required: true
    },

    multimediaNotes: {
      type: String
    },

    sourceName: {
      type: String
    },

    sourceUrl: {
      type: String
    },

    collectionStatus: {
      type: String
    },

    verificationStatus: {
      type: String
    },

    notes: {
      type: String
    },


    // ========================================================
    // ENRICHED PLACE INFORMATION
    // ========================================================

    whatIsIt: {
      type: String
    },

    primaryPurposeOrSignificance: {
      type: String
    },

    historicalBackground: {
      type: String
    },

    physicalCharacteristics: {
      type: String
    },

    dimensionsOrSize: {
      type: String
    },

    locationContext: {
      type: String
    },

    visitorInformation: {
      type: String
    },

    accessOrTransport: {
      type: String
    },

    bestTimeOrSeason: {
      type: String
    },

    nearbyOrRelatedFeatures: {
      type: String
    },

    imageRequirements: {
      type: String
    },

    videoRequirements: {
      type: String
    },

    audioTtsSource: {
      type: String
    },

    verificationNeeded: {
      type: String
    },

    parentOrComplex: {
      type: String
    },

    placeSpecificityStatus: {
      type: String
    },

    primaryEvidenceSummary: {
      type: String
    },


    // ========================================================
    // OFFICIAL VIDEO
    // ========================================================
    // This is the existing verified YouTube video link.
    // Do NOT mix community-uploaded videos into this field.

    videoLink: {
      type: String,
      default: ""
    },


    // ========================================================
    // LOCATION COORDINATES
    // ========================================================

    latitude: {
      type: Number,
      default: null
    },

    longitude: {
      type: Number,
      default: null
    },


    // ========================================================
    // OFFICIAL / VERIFIED GALLERY
    // ========================================================
    // These are the existing image URLs imported for the
    // original place dataset.

    images: {
      type: [String],
      default: []
    },


    // ========================================================
    // APPROVED COMMUNITY PHOTOS
    // ========================================================
    // A photo is added here ONLY after an administrator
    // approves the corresponding contribution.
    //
    // contributionId lets us know which contribution
    // supplied the image.

    communityImages: {
      type: [
        {
          contributionId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Contribution",
            required: true
          },

          url: {
            type: String,
            required: true
          }
        }
      ],
      default: []
    },


    // ========================================================
    // APPROVED COMMUNITY VIDEOS
    // ========================================================
    // Community videos are kept separate from the official
    // YouTube videoLink.

    communityVideos: {
      type: [
        {
          contributionId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Contribution",
            required: true
          },

          url: {
            type: String,
            required: true
          }
        }
      ],
      default: []
    },


    // ========================================================
    // COMMUNITY RATINGS
    // ========================================================
    //
    // Initially:
    //
    // ratingTotal = 0
    // ratingCount = 0
    // average = 0
    //
    // Only APPROVED contribution ratings will update these.

    communityRatingTotal: {
      type: Number,
      default: 0,
      min: 0
    },

    communityRatingCount: {
      type: Number,
      default: 0,
      min: 0
    },

    communityAverageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },


    // ========================================================
    // COMMUNITY LIKES
    // ========================================================
    //
    // Initially every place has zero likes.
    //
    // The actual users who liked a place will be stored in
    // a separate Like collection later.

    likeCount: {
      type: Number,
      default: 0,
      min: 0
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
  mongoose.model("Place", placeSchema);