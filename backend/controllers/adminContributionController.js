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
    await Place.findById(placeId);


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
// GET CONTRIBUTIONS FOR ADMIN REVIEW
// ============================================================

const getAllContributions = async (
  req,
  res
) => {

  try {

    const { status } =
      req.query;


    // --------------------------------------------------------
    // Validate status
    // --------------------------------------------------------

    if (
      status &&
      ![
        "pending",
        "approved",
        "rejected"
      ].includes(status)
    ) {

      return res.status(400).json({
        success: false,
        message:
          "Invalid status. Use pending, approved or rejected."
      });

    }


    const query =
      status
        ? { status }
        : {};


    const contributions =
      await Contribution.find(
        query
      )
        .populate(
          "user",
          "name email"
        )
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
      "Get admin contributions error:",
      error.message
    );


    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch contributions"
    });

  }
};


// ============================================================
// APPROVE CONTRIBUTION
// ============================================================

const approveContribution = async (
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
    // Prevent duplicate approval
    // --------------------------------------------------------

    if (
      contribution.status ===
      "approved"
    ) {

      return res.status(400).json({
        success: false,
        message:
          "Contribution is already approved"
      });

    }


    // --------------------------------------------------------
    // Find related place
    // --------------------------------------------------------

    const place =
      await Place.findById(
        contribution.place
      );


    if (!place) {

      return res.status(404).json({
        success: false,
        message:
          "Associated place not found"
      });

    }


    // ========================================================
    // ADD COMMUNITY PHOTOS
    // ========================================================

    if (
      Array.isArray(
        contribution.photos
      ) &&
      contribution.photos.length > 0
    ) {

      if (
        !Array.isArray(
          place.communityImages
        )
      ) {

        place.communityImages = [];

      }


      for (
        const photoUrl
        of contribution.photos
      ) {

        const alreadyExists =
          place.communityImages.some(
            image =>
              image.contributionId &&
              image.contributionId
                .toString() ===
                contribution._id
                  .toString() &&
              image.url === photoUrl
          );


        if (!alreadyExists) {

          place.communityImages.push({
            contributionId:
              contribution._id,

            url:
              photoUrl
          });

        }
      }
    }


    // ========================================================
    // ADD COMMUNITY VIDEO
    // ========================================================

    if (
      contribution.video &&
      typeof contribution.video ===
        "string"
    ) {

      if (
        !Array.isArray(
          place.communityVideos
        )
      ) {

        place.communityVideos = [];

      }


      const alreadyExists =
        place.communityVideos.some(
          video =>
            video.contributionId &&
            video.contributionId
              .toString() ===
              contribution._id
                .toString() &&
            video.url ===
              contribution.video
        );


      if (!alreadyExists) {

        place.communityVideos.push({
          contributionId:
            contribution._id,

          url:
            contribution.video
        });

      }
    }


    // ========================================================
    // MARK CONTRIBUTION APPROVED
    // ========================================================

    contribution.status =
      "approved";


    // --------------------------------------------------------
    // Save contribution first
    // --------------------------------------------------------

    await contribution.save();


    // --------------------------------------------------------
    // Save media changes
    // --------------------------------------------------------

    await place.save();


    // ========================================================
    // RECALCULATE RATING
    // ========================================================

    await recalculatePlaceRating(
      place._id
    );


    // ========================================================
    // GET UPDATED CONTRIBUTION
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
        "Contribution approved successfully. Community media and rating have been updated.",

      data:
        updatedContribution

    });


  } catch (error) {

    console.error(
      "Approve contribution error:",
      error
    );


    return res.status(500).json({
      success: false,
      message:
        "Failed to approve contribution",
      error:
        error.message
    });

  }
};


// ============================================================
// REJECT CONTRIBUTION
// ============================================================

const rejectContribution = async (
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
    // Prevent unnecessary rejection
    // --------------------------------------------------------

    if (
      contribution.status ===
      "rejected"
    ) {

      return res.status(400).json({
        success: false,
        message:
          "Contribution is already rejected"
      });

    }


    // ========================================================
    // IF APPROVED → REMOVE COMMUNITY MEDIA
    // ========================================================

    if (
      contribution.status ===
      "approved"
    ) {

      const place =
        await Place.findById(
          contribution.place
        );


      if (place) {

        // ----------------------------------------------------
        // REMOVE COMMUNITY PHOTOS
        // ----------------------------------------------------

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


        // ----------------------------------------------------
        // REMOVE COMMUNITY VIDEOS
        // ----------------------------------------------------

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


        // ----------------------------------------------------
        // Save media changes
        // ----------------------------------------------------

        await place.save();

      }

    }


    // ========================================================
    // MARK CONTRIBUTION REJECTED
    // ========================================================

    contribution.status =
      "rejected";


    await contribution.save();


    // ========================================================
    // RECALCULATE RATING
    // ========================================================

    await recalculatePlaceRating(
      contribution.place
    );


    // ========================================================
    // GET UPDATED CONTRIBUTION
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
        "Contribution rejected successfully. Community rating has been updated.",

      data:
        updatedContribution

    });


  } catch (error) {

    console.error(
      "Reject contribution error:",
      error
    );


    return res.status(500).json({
      success: false,
      message:
        "Failed to reject contribution",
      error:
        error.message
    });

  }
};


// ============================================================
// EXPORT
// ============================================================

module.exports = {

  getAllContributions,

  approveContribution,

  rejectContribution

};