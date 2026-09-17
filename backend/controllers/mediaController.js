const cloudinary =
    require("../config/cloudinary");

const Contribution =
    require("../models/Contribution");

const Place =
    require("../models/Place");


// ============================================================
// UPLOAD FILE TO CLOUDINARY
// ============================================================

const uploadToCloudinary = (
    file,
    resourceType
) => {

    return new Promise(
        (resolve, reject) => {

            const uploadStream =
                cloudinary.uploader.upload_stream(
                    {
                        folder:
                            "vellore_user_contributions",

                        resource_type:
                            resourceType
                    },

                    (
                        error,
                        result
                    ) => {

                        if (error) {

                            reject(
                                error
                            );

                        } else {

                            resolve(
                                result
                            );

                        }

                    }
                );

            uploadStream.end(
                file.buffer
            );

        }
    );

};


// ============================================================
// RECALCULATE PLACE RATING
// ============================================================

const recalculatePlaceRating =
    async (placeId) => {

        const approvedContributions =
            await Contribution.find({

                place:
                    placeId,

                status:
                    "approved",

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
                Number.isInteger(
                    rating
                ) &&
                rating >= 1 &&
                rating <= 5
            ) {

                totalRating +=
                    rating;

                ratingCount++;

            }

        }


        const averageRating =
            ratingCount > 0
                ? totalRating /
                  ratingCount
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
                averageRating.toFixed(
                    2
                )
            );


        await place.save();


        return place;

    };


// ============================================================
// REMOVE APPROVED CONTRIBUTION FROM PLACE
// ============================================================

const removeApprovedContributionFromPlace =
    async (contribution) => {

        if (
            !contribution ||
            contribution.status !==
                "approved"
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


        // ----------------------------------------------------
        // Remove community photos
        // ----------------------------------------------------

        if (
            Array.isArray(
                place.communityImages
            )
        ) {

            place.communityImages =
                place.communityImages.filter(
                    image => {

                        if (
                            !image.contributionId
                        ) {

                            return true;

                        }


                        return (
                            image
                                .contributionId
                                .toString() !==
                            contribution._id
                                .toString()
                        );

                    }
                );

        }


        // ----------------------------------------------------
        // Remove community videos
        // ----------------------------------------------------

        if (
            Array.isArray(
                place.communityVideos
            )
        ) {

            place.communityVideos =
                place.communityVideos.filter(
                    video => {

                        if (
                            !video.contributionId
                        ) {

                            return true;

                        }


                        return (
                            video
                                .contributionId
                                .toString() !==
                            contribution._id
                                .toString()
                        );

                    }
                );

        }


        await place.save();


        // ----------------------------------------------------
        // Recalculate rating
        // ----------------------------------------------------

        await recalculatePlaceRating(
            place._id
        );

    };


// ============================================================
// UPLOAD USER PHOTOS AND VIDEOS
// ============================================================

const uploadContributionMedia =
    async (req, res) => {

        try {

            const photos =
                req.files?.photos ||
                [];

            const videos =
                req.files?.video ||
                [];


            if (
                photos.length === 0 &&
                videos.length === 0
            ) {

                return res.status(
                    400
                ).json({

                    success: false,

                    message:
                        "Please select at least one photo or video"

                });

            }


            // ------------------------------------------------
            // Upload photos
            // ------------------------------------------------

            const photoUrls = [];


            for (
                const photo
                of photos
            ) {

                const result =
                    await uploadToCloudinary(
                        photo,
                        "image"
                    );


                photoUrls.push(
                    result.secure_url
                );

            }


            // ------------------------------------------------
            // Upload video
            // ------------------------------------------------

            let videoUrl = "";


            if (
                videos.length > 0
            ) {

                const result =
                    await uploadToCloudinary(
                        videos[0],
                        "video"
                    );


                videoUrl =
                    result.secure_url;

            }


            return res.status(
                200
            ).json({

                success: true,

                message:
                    "Media uploaded successfully",

                data: {

                    photos:
                        photoUrls,

                    video:
                        videoUrl

                }

            });

        } catch (error) {

            console.error(
                "Media upload error:",
                error.message
            );


            return res.status(
                500
            ).json({

                success: false,

                message:
                    "Failed to upload media",

                error:
                    error.message

            });

        }

    };


// ============================================================
// UPDATE CONTRIBUTION MEDIA
// ============================================================

const updateContributionMedia =
    async (req, res) => {

        try {

            const {
                contributionId
            } = req.params;


            // ------------------------------------------------
            // Find contribution
            // ------------------------------------------------

            const contribution =
                await Contribution.findById(
                    contributionId
                );


            if (!contribution) {

                return res.status(
                    404
                ).json({

                    success: false,

                    message:
                        "Contribution not found"

                });

            }


            // ------------------------------------------------
            // Ownership check
            // ------------------------------------------------

            if (
                contribution.user.toString() !==
                req.user.userId.toString()
            ) {

                return res.status(
                    403
                ).json({

                    success: false,

                    message:
                        "You are not allowed to edit this contribution"

                });

            }


            // =================================================
            // READ EDIT OPTIONS
            // =================================================

            let removePhotos = [];


            if (
                req.body.removePhotos
            ) {

                try {

                    removePhotos =
                        JSON.parse(
                            req.body.removePhotos
                        );

                } catch {

                    removePhotos = [];

                }

            }


            if (
                !Array.isArray(
                    removePhotos
                )
            ) {

                removePhotos = [];

            }


            const removeVideo =
                req.body.removeVideo ===
                "true";


            // =================================================
            // VALIDATE PHOTO COUNT
            // =================================================

            const existingPhotos =
                Array.isArray(
                    contribution.photos
                )
                    ? contribution.photos
                    : [];


            const photosAfterRemoval =
                existingPhotos.filter(
                    photo =>
                        !removePhotos.includes(
                            photo
                        )
                );


            const newPhotos =
                req.files?.photos ||
                [];


            if (
                photosAfterRemoval.length +
                newPhotos.length >
                5
            ) {

                return res.status(
                    400
                ).json({

                    success: false,

                    message:
                        "A contribution can contain a maximum of 5 photos"

                });

            }


            // =================================================
            // IF APPROVED, REMOVE OLD PLACE CONTENT FIRST
            // =================================================

            const wasApproved =
                contribution.status ===
                "approved";


            if (wasApproved) {

                await removeApprovedContributionFromPlace(
                    contribution
                );

            }


            // =================================================
            // UPLOAD NEW PHOTOS
            // =================================================

            const uploadedPhotoUrls =
                [];


            for (
                const photo
                of newPhotos
            ) {

                const result =
                    await uploadToCloudinary(
                        photo,
                        "image"
                    );


                uploadedPhotoUrls.push(
                    result.secure_url
                );

            }


            // =================================================
            // FINAL PHOTO LIST
            // =================================================

            contribution.photos =
                [
                    ...photosAfterRemoval,
                    ...uploadedPhotoUrls
                ];


            // =================================================
            // VIDEO HANDLING
            // =================================================

            const newVideos =
                req.files?.video ||
                [];


            if (
                newVideos.length > 0
            ) {

                const result =
                    await uploadToCloudinary(
                        newVideos[0],
                        "video"
                    );


                contribution.video =
                    result.secure_url;

            }
            else if (
                removeVideo
            ) {

                contribution.video =
                    "";

            }


            // =================================================
            // SEND BACK TO PENDING
            // =================================================

            contribution.status =
                "pending";


            // =================================================
            // SAVE
            // =================================================

            await contribution.save();


            // =================================================
            // RETURN UPDATED CONTRIBUTION
            // =================================================

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


            return res.status(
                200
            ).json({

                success: true,

                message:
                    "Contribution media updated successfully and sent for review",

                data:
                    updatedContribution

            });

        } catch (error) {

            console.error(
                "Update contribution media error:",
                error.message
            );


            return res.status(
                500
            ).json({

                success: false,

                message:
                    "Failed to update contribution media",

                error:
                    error.message

            });

        }

    };


// ============================================================
// EXPORTS
// ============================================================

module.exports = {

    uploadContributionMedia,

    updateContributionMedia

};