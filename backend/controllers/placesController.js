const Place = require("../models/Place");

// ============================================================
// GET ALL PLACES
// ============================================================

const getAllPlaces = async (req, res) => {
  try {
    const {
      q,
      category,
      taluk,
      locality
    } = req.query;

    const filter = {};

    // --------------------------------------------------------
    // Escape special regex characters for safe searching
    // --------------------------------------------------------

    const escapeRegex = (value) => {
      return value.replace(
        /[.*+?^${}()|[\]\\]/g,
        "\\$&"
      );
    };

    // --------------------------------------------------------
    // General search
    // --------------------------------------------------------

    if (q) {
      const safeQuery =
        escapeRegex(q.trim());

      filter.$or = [
        {
          placeName: {
            $regex: safeQuery,
            $options: "i"
          }
        },
        {
          description: {
            $regex: safeQuery,
            $options: "i"
          }
        },
        {
          category: {
            $regex: safeQuery,
            $options: "i"
          }
        },
        {
          locality: {
            $regex: safeQuery,
            $options: "i"
          }
        },
        {
          taluk: {
            $regex: safeQuery,
            $options: "i"
          }
        }
      ];
    }

    // --------------------------------------------------------
    // Category filter
    // --------------------------------------------------------

    if (category) {
      filter.category = {
        $regex:
          `^${escapeRegex(
            category.trim()
          )}$`,
        $options: "i"
      };
    }

    // --------------------------------------------------------
    // Taluk filter
    // --------------------------------------------------------

    if (taluk) {
      filter.taluk = {
        $regex:
          `^${escapeRegex(
            taluk.trim()
          )}$`,
        $options: "i"
      };
    }

    // --------------------------------------------------------
    // Locality filter
    // --------------------------------------------------------

    if (locality) {
      filter.locality = {
        $regex:
          `^${escapeRegex(
            locality.trim()
          )}$`,
        $options: "i"
      };
    }

    const places =
      await Place.find(filter)
        .sort({
          placeId: 1
        });

    res.status(200).json({
      success: true,
      count: places.length,
      data: places
    });

  } catch (error) {
    console.error(
      "Error fetching places:",
      error.message
    );

    res.status(500).json({
      success: false,
      message: "Failed to fetch places",
      error: error.message
    });
  }
};


// ============================================================
// GET ONE PLACE BY PLACE ID
// ============================================================

const getPlaceById = async (req, res) => {
  try {
    const place =
      await Place.findOne({
        placeId: req.params.placeId
      });

    if (!place) {
      return res.status(404).json({
        success: false,
        message: "Place not found"
      });
    }

    res.status(200).json({
      success: true,
      data: place
    });

  } catch (error) {
    console.error(
      "Error fetching place:",
      error.message
    );

    res.status(500).json({
      success: false,
      message: "Failed to fetch place",
      error: error.message
    });
  }
};


// ============================================================
// CREATE NEW PLACE
// ADMIN ONLY
// ============================================================

const createPlace = async (req, res) => {
  try {
    const {
      placeId,
      placeName,
      locality,
      district,
      taluk,
      category,
      description,
      whatIsIt,
      historicalBackground,
      primaryPurposeOrSignificance,
      physicalCharacteristics,
      dimensionsOrSize,
      locationContext,
      visitorInformation,
      accessOrTransport,
      bestTimeOrSeason,
      videoLink,
      latitude,
      longitude,
      images,
      communityImages,
      communityVideos,
      communityRatingTotal,
      communityRatingCount,
      communityAverageRating,
      likeCount
    } = req.body;

    // --------------------------------------------------------
    // Required fields
    // --------------------------------------------------------

    if (!placeId || !placeName) {
      return res.status(400).json({
        success: false,
        message:
          "Place ID and Place Name are required"
      });
    }

    // --------------------------------------------------------
    // Check duplicate Place ID
    // --------------------------------------------------------

    const existingPlace =
      await Place.findOne({
        placeId: placeId.trim()
      });

    if (existingPlace) {
      return res.status(409).json({
        success: false,
        message:
          "A place with this Place ID already exists"
      });
    }

    // --------------------------------------------------------
    // Create place
    // --------------------------------------------------------

    const place =
      new Place({
        placeId:
          placeId.trim(),

        placeName:
          placeName.trim(),

        locality:
          locality || "",

        district:
          district || "",

        taluk:
          taluk || "",

        category:
          category || "",

        description:
          description || "",

        whatIsIt:
          whatIsIt || "",

        historicalBackground:
          historicalBackground || "",

        primaryPurposeOrSignificance:
          primaryPurposeOrSignificance || "",

        physicalCharacteristics:
          physicalCharacteristics || "",

        dimensionsOrSize:
          dimensionsOrSize || "",

        locationContext:
          locationContext || "",

        visitorInformation:
          visitorInformation || "",

        accessOrTransport:
          accessOrTransport || "",

        bestTimeOrSeason:
          bestTimeOrSeason || "",

        videoLink:
          videoLink || "",

        latitude:
          latitude === ""
            || latitude === null
            || latitude === undefined
            ? null
            : Number(latitude),

        longitude:
          longitude === ""
            || longitude === null
            || longitude === undefined
            ? null
            : Number(longitude),

        images:
          Array.isArray(images)
            ? images
            : [],

        communityImages:
          Array.isArray(communityImages)
            ? communityImages
            : [],

        communityVideos:
          Array.isArray(communityVideos)
            ? communityVideos
            : [],

        communityRatingTotal:
          Number(
            communityRatingTotal
          ) || 0,

        communityRatingCount:
          Number(
            communityRatingCount
          ) || 0,

        communityAverageRating:
          Number(
            communityAverageRating
          ) || 0,

        likeCount:
          Number(likeCount) || 0
      });

    await place.save();

    res.status(201).json({
      success: true,
      message:
        "Place created successfully",
      data: place
    });

  } catch (error) {
    console.error(
      "Error creating place:",
      error
    );

    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message:
          "A place with this Place ID already exists"
      });
    }

    // Handle validation error
    if (
      error.name ===
      "ValidationError"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid place data",
        error: error.message
      });
    }

    res.status(500).json({
      success: false,
      message:
        "Failed to create place",
      error: error.message
    });
  }
};


// ============================================================
// UPDATE PLACE
// ADMIN ONLY
// ============================================================

const updatePlace = async (req, res) => {
  try {
    const { placeId } =
      req.params;

    // --------------------------------------------------------
    // Prevent changing the Place ID
    // --------------------------------------------------------

    const updateData = {
      ...req.body
    };

    delete updateData.placeId;
    delete updateData._id;

    // --------------------------------------------------------
    // Prevent modification of automatic fields
    // --------------------------------------------------------

    delete updateData.createdAt;
    delete updateData.updatedAt;

    // --------------------------------------------------------
    // Convert empty coordinates to null
    // --------------------------------------------------------

    if (
      updateData.latitude === ""
      || updateData.latitude === null
      || updateData.latitude === undefined
    ) {
      updateData.latitude = null;
    } else {
      updateData.latitude =
        Number(updateData.latitude);
    }

    if (
      updateData.longitude === ""
      || updateData.longitude === null
      || updateData.longitude === undefined
    ) {
      updateData.longitude = null;
    } else {
      updateData.longitude =
        Number(updateData.longitude);
    }

    // --------------------------------------------------------
    // Find and update
    // --------------------------------------------------------

    const updatedPlace =
      await Place.findOneAndUpdate(
        {
          placeId: placeId
        },
        updateData,
        {
          new: true,
          runValidators: true
        }
      );

    if (!updatedPlace) {
      return res.status(404).json({
        success: false,
        message: "Place not found"
      });
    }

    res.status(200).json({
      success: true,
      message:
        "Place updated successfully",
      data: updatedPlace
    });

  } catch (error) {
    console.error(
      "Error updating place:",
      error
    );

    if (
      error.name ===
      "ValidationError"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid place data",
        error: error.message
      });
    }

    res.status(500).json({
      success: false,
      message:
        "Failed to update place",
      error: error.message
    });
  }
};


// ============================================================
// DELETE PLACE
// ADMIN ONLY
// ============================================================

const deletePlace = async (req, res) => {
  try {
    const { placeId } =
      req.params;

    const deletedPlace =
      await Place.findOneAndDelete({
        placeId: placeId
      });

    if (!deletedPlace) {
      return res.status(404).json({
        success: false,
        message: "Place not found"
      });
    }

    res.status(200).json({
      success: true,
      message:
        "Place deleted successfully",
      data: {
        placeId:
          deletedPlace.placeId,
        placeName:
          deletedPlace.placeName
      }
    });

  } catch (error) {
    console.error(
      "Error deleting place:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to delete place",
      error: error.message
    });
  }
};


// ============================================================
// EXPORT
// ============================================================

module.exports = {
  getAllPlaces,
  getPlaceById,
  createPlace,
  updatePlace,
  deletePlace
};
