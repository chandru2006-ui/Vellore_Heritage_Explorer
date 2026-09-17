const Contribution = require("../models/Contribution");
const Place = require("../models/Place");


// ============================================================
// HELPER — RECALCULATE COMMUNITY RATING
// ============================================================

const recalculatePlaceRating = async (placeId) => {

  const approvedContributions =
    await Contribution.find({
      place: placeId,
      status: "approved",
      rating: {
        $gte: 1,
        $lte: 5
      }
    });

  let totalRating = 0;
  let ratingCount = 0;


  for (
    const contribution
    of approvedContributions
  ) {

    const rating =
      Number(
        contribution.rating
      );

    if (
      Number.isInteger(rating) &&
      rating >= 1 &&
      rating <= 5
    ) {

      totalRating += rating;
      ratingCount++;

    }
  }


  const averageRating =
    ratingCount > 0
      ? totalRating / ratingCount
      : 0;


  const place =
    await Place.findById(
      placeId
    );


  if (!place) {
    return null;
  }


  place.communityRatingTotal =
    totalRating;

  place.communityRatingCount =
    ratingCount;

  place.communityAverageRating =
    Number(
      averageRating.toFixed(2)
    );


  await place.save();


  return place;
};


// ============================================================
// HELPER — REMOVE APPROVED CONTRIBUTION FROM PLACE
// ============================================================

const removeApprovedContributionFromPlace =
  async (contribution) => {

    if (
      !contribution ||
      contribution.status !== "approved"
    ) {
      return;
    }


    const place =
      await Place.findById(
        contribution.place
      );


    if (!place) {
      return;
    }


    // ========================================================
    // REMOVE COMMUNITY PHOTOS
    // ========================================================

    if (
      Array.isArray(
        place.communityImages
      )
    ) {

      place.communityImages =
        place.communityImages.filter(
          image =>
            !image.contributionId ||
            image.contributionId
              .toString() !==
              contribution._id
                .toString()
        );

    }


    // ========================================================
    // REMOVE COMMUNITY VIDEOS
    // ========================================================

    if (
      Array.isArray(
        place.communityVideos
      )
    ) {

      place.communityVideos =
        place.communityVideos.filter(
          video =>
            !video.contributionId ||
            video.contributionId
              .toString() !==
              contribution._id
                .toString()
        );

    }


    // ========================================================
    // SAVE MEDIA CHANGES
    // ========================================================

    await place.save();


    // ========================================================
    // RECALCULATE RATING
    // ========================================================

    await recalculatePlaceRating(
      place._id
    );

  };


// ============================================================
// CREATE A NEW CONTRIBUTION
// ============================================================

const createContribution = async (
  req,
  res
) => {

  try {

    const {
      placeId,
      rating,
      experience,
      feedback,
      photos,
      video
    } = req.body;


    // --------------------------------------------------------
    // Validate Place ID
    // --------------------------------------------------------

    if (!placeId) {

      return res.status(400).json({
        success: false,
        message:
          "Place ID is required"
      });

    }


    // --------------------------------------------------------
    // Find place
    // --------------------------------------------------------

    const place =
      await Place.findOne({
        placeId: placeId
      });


    if (!place) {

      return res.status(404).json({
        success: false,
        message:
          "Place not found"
      });

    }


    // --------------------------------------------------------
    // Make sure something was submitted
    // --------------------------------------------------------

    if (
      rating === undefined &&
      !experience &&
      !feedback &&
      (!photos ||
        photos.length === 0) &&
      !video
    ) {

      return res.status(400).json({
        success: false,
        message:
          "Please provide a rating, experience, feedback, photo or video"
      });

    }


    // --------------------------------------------------------
    // Validate rating
    // --------------------------------------------------------

    if (
      rating !== undefined &&
      rating !== null &&
      rating !== ""
    ) {

      const numericRating =
        Number(rating);


      if (
        !Number.isInteger(
          numericRating
        ) ||
        numericRating < 1 ||
        numericRating > 5
      ) {

        return res.status(400).json({
          success: false,
          message:
            "Rating must be between 1 and 5"
        });

      }

    }


    // ========================================================
    // CREATE CONTRIBUTION
    // ========================================================

    const contribution =
      await Contribution.create({

        user:
          req.user.userId,

        place:
          place._id,

        rating:
          rating === undefined ||
          rating === null ||
          rating === ""
            ? null
            : Number(rating),

        experience:
          typeof experience ===
          "string"
            ? experience.trim()
            : "",

        feedback:
          typeof feedback ===
          "string"
            ? feedback.trim()
            : "",

        photos:
          Array.isArray(photos)
            ? photos
            : [],

        video:
          typeof video ===
          "string"
            ? video
            : "",

        status:
          "pending"

      });


    // ========================================================
    // POPULATE RESPONSE
    // ========================================================

    const populatedContribution =
      await Contribution.findById(
        contribution._id
      )
        .populate(
          "user",
          "name email"
        )
        .populate(
          "place",
          "placeId placeName"
        );


    // ========================================================
    // RESPONSE
    // ========================================================

    return res.status(201).json({

      success: true,

      message:
        "Contribution submitted successfully and is awaiting review",

      data:
        populatedContribution

    });


  } catch (error) {

    console.error(
      "Create contribution error:",
      error.message
    );


    return res.status(500).json({

      success: false,

      message:
        "Failed to submit contribution",

      error:
        error.message

    });

  }

};


// ============================================================
// GET CONTRIBUTIONS FOR A PLACE
// ============================================================

const getPlaceContributions = async (
  req,
  res
) => {

  try {

    const {
      placeId
    } = req.params;


    // --------------------------------------------------------
    // Find place
    // --------------------------------------------------------

    const place =
      await Place.findOne({
        placeId: placeId
      });


    if (!place) {

      return res.status(404).json({
        success: false,
        message:
          "Place not found"
      });

    }


    // --------------------------------------------------------
    // Get approved contributions
    // --------------------------------------------------------

    const contributions =
      await Contribution.find({

        place:
          place._id,

        $or: [

          {
            status:
              "approved"
          },

          {
            status: {
              $exists: false
            }
          }

        ]

      })
        .populate(
          "user",
          "name"
        )
        .sort({
          createdAt: -1
        });


    // --------------------------------------------------------
    // Response
    // --------------------------------------------------------

    return res.status(200).json({

      success: true,

      count:
        contributions.length,

      data:
        contributions

    });


  } catch (error) {

    console.error(
      "Get contributions error:",
      error.message
    );


    return res.status(500).json({

      success: false,

      message:
        "Failed to fetch contributions",

      error:
        error.message

    });

  }

};


// ============================================================
// GET LOGGED-IN USER'S CONTRIBUTIONS
// ============================================================

const getMyContributions = async (
  req,
  res
) => {

  try {

    const contributions =
      await Contribution.find({

        user:
          req.user.userId

      })
        .populate(
          "place",
          "placeId placeName"
        )
        .sort({
          createdAt: -1
        });


    return res.status(200).json({

      success: true,

      count:
        contributions.length,

      data:
        contributions

    });


  } catch (error) {

    console.error(
      "Get my contributions error:",
      error.message
    );


    return res.status(500).json({

      success: false,

      message:
        "Failed to fetch your contributions",

      error:
        error.message

    });

  }

};


// ============================================================
// UPDATE USER'S OWN CONTRIBUTION
// ============================================================

const updateContribution = async (
  req,
  res
) => {

  try {

    const {
      contributionId
    } = req.params;


    const {
      rating,
      experience,
      feedback
    } = req.body;


    // --------------------------------------------------------
    // Find contribution
    // --------------------------------------------------------

    const contribution =
      await Contribution.findById(
        contributionId
      );


    if (!contribution) {

      return res.status(404).json({

        success: false,

        message:
          "Contribution not found"

      });

    }


    // --------------------------------------------------------
    // Ownership check
    // --------------------------------------------------------

    if (
      contribution.user.toString() !==
      req.user.userId.toString()
    ) {

      return res.status(403).json({

        success: false,

        message:
          "You are not allowed to edit this contribution"

      });

    }


    // ========================================================
    // VALIDATE RATING FIRST
    // ========================================================

    let newRating =
      contribution.rating;


    if (
      rating !== undefined &&
      rating !== null &&
      rating !== ""
    ) {

      const numericRating =
        Number(rating);


      if (
        !Number.isInteger(
          numericRating
        ) ||
        numericRating < 1 ||
        numericRating > 5
      ) {

        return res.status(400).json({

          success: false,

          message:
            "Rating must be between 1 and 5"

        });

      }


      newRating =
        numericRating;

    }
    else if (
      rating === null ||
      rating === ""
    ) {

      newRating =
        null;

    }


    // ========================================================
    // VALIDATE EXPERIENCE
    // ========================================================

    let newExperience =
      contribution.experience;


    if (
      experience !== undefined
    ) {

      if (
        typeof experience !==
        "string"
      ) {

        return res.status(400).json({

          success: false,

          message:
            "Experience must be text"

        });

      }


      if (
        experience.length > 2000
      ) {

        return res.status(400).json({

          success: false,

          message:
            "Experience must not exceed 2000 characters"

        });

      }


      newExperience =
        experience.trim();

    }


    // ========================================================
    // VALIDATE FEEDBACK
    // ========================================================

    let newFeedback =
      contribution.feedback;


    if (
      feedback !== undefined
    ) {

      if (
        typeof feedback !==
        "string"
      ) {

        return res.status(400).json({

          success: false,

          message:
            "Feedback must be text"

        });

      }


      if (
        feedback.length > 2000
      ) {

        return res.status(400).json({

          success: false,

          message:
            "Feedback must not exceed 2000 characters"

        });

      }


      newFeedback =
        feedback.trim();

    }


    // ========================================================
    // NOW REMOVE OLD APPROVED CONTENT
    // ========================================================

    const wasApproved =
      contribution.status ===
      "approved";


    if (wasApproved) {

      await removeApprovedContributionFromPlace(
        contribution
      );

    }


    // ========================================================
    // APPLY UPDATED VALUES
    // ========================================================

    contribution.rating =
      newRating;

    contribution.experience =
      newExperience;

    contribution.feedback =
      newFeedback;


    // ========================================================
    // SEND BACK TO PENDING
    // ========================================================

    contribution.status =
      "pending";


    // ========================================================
    // SAVE
    // ========================================================

    await contribution.save();


    // ========================================================
    // RETURN UPDATED CONTRIBUTION
    // ========================================================

    const updatedContribution =
      await Contribution.findById(
        contribution._id
      )
        .populate(
          "user",
          "name email"
        )
        .populate(
          "place",
          "placeId placeName"
        );


    return res.status(200).json({

      success: true,

      message:
        "Contribution updated successfully and sent for review",

      data:
        updatedContribution

    });


  } catch (error) {

    console.error(
      "Update contribution error:",
      error.message
    );


    return res.status(500).json({

      success: false,

      message:
        "Failed to update contribution",

      error:
        error.message

    });

  }

};


// ============================================================
// DELETE USER'S OWN CONTRIBUTION
// ============================================================

const deleteContribution = async (
  req,
  res
) => {

  try {

    const {
      contributionId
    } = req.params;


    // --------------------------------------------------------
    // Find contribution
    // --------------------------------------------------------

    const contribution =
      await Contribution.findById(
        contributionId
      );


    if (!contribution) {

      return res.status(404).json({

        success: false,

        message:
          "Contribution not found"

      });

    }


    // --------------------------------------------------------
    // Ownership check
    // --------------------------------------------------------

    if (
      contribution.user.toString() !==
      req.user.userId.toString()
    ) {

      return res.status(403).json({

        success: false,

        message:
          "You are not allowed to delete this contribution"

      });

    }


    // ========================================================
    // IF APPROVED
    // REMOVE FROM PLACE FIRST
    // ========================================================

    if (
      contribution.status ===
      "approved"
    ) {

      await removeApprovedContributionFromPlace(
        contribution
      );

    }


    // ========================================================
    // DELETE CONTRIBUTION
    // ========================================================

    await Contribution.findByIdAndDelete(
      contributionId
    );


    // ========================================================
    // RESPONSE
    // ========================================================

    return res.status(200).json({

      success: true,

      message:
        "Contribution deleted successfully"

    });


  } catch (error) {

    console.error(
      "Delete contribution error:",
      error.message
    );


    return res.status(500).json({

      success: false,

      message:
        "Failed to delete contribution",

      error:
        error.message

    });

  }

};


// ============================================================
// EXPORT
// ============================================================

module.exports = {

  createContribution,

  getPlaceContributions,

  getMyContributions,

  updateContribution,

  deleteContribution

};