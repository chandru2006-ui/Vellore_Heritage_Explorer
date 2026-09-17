// ============================================================
// ADMIN REPORTS & ANALYTICS CONTROLLER
// ============================================================

const User =
    require("../models/User");

const Place =
    require("../models/Place");

const Contribution =
    require("../models/Contribution");

const Like =
    require("../models/Like");

const SavedPlace =
    require("../models/SavedPlace");

const Trip =
    require("../models/Trip");


// ============================================================
// GET REPORTS OVERVIEW
// ============================================================

const getReportsOverview =
    async (req, res) => {

        try {

            // ----------------------------------------------------
            // BASIC COUNTS
            // ----------------------------------------------------

            const totalPlaces =
                await Place.countDocuments();

            const totalUsers =
                await User.countDocuments();

            const totalContributions =
                await Contribution.countDocuments();

            const totalLikes =
                await Like.countDocuments();

            const totalSavedPlaces =
                await SavedPlace.countDocuments();

            const totalTrips =
                await Trip.countDocuments();


            // ----------------------------------------------------
            // USER STATISTICS
            // ----------------------------------------------------

            const userStatistics =
                await User.aggregate([
                    {
                        $group: {
                            _id: "$role",
                            count: {
                                $sum: 1
                            }
                        }
                    }
                ]);


            let adminUsers = 0;
            let regularUsers = 0;

            userStatistics.forEach(
                item => {

                    if (
                        item._id ===
                        "admin"
                    ) {
                        adminUsers =
                            item.count;
                    }

                    if (
                        item._id ===
                        "user"
                    ) {
                        regularUsers =
                            item.count;
                    }

                }
            );


            // ----------------------------------------------------
            // CONTRIBUTION STATISTICS
            // ----------------------------------------------------

            const contributionStatistics =
                await Contribution.aggregate([
                    {
                        $group: {
                            _id: "$status",
                            count: {
                                $sum: 1
                            }
                        }
                    }
                ]);


            let pendingContributions = 0;
            let approvedContributions = 0;
            let rejectedContributions = 0;

            contributionStatistics.forEach(
                item => {

                    if (
                        item._id ===
                        "pending"
                    ) {
                        pendingContributions =
                            item.count;
                    }

                    if (
                        item._id ===
                        "approved"
                    ) {
                        approvedContributions =
                            item.count;
                    }

                    if (
                        item._id ===
                        "rejected"
                    ) {
                        rejectedContributions =
                            item.count;
                    }

                }
            );


            // ----------------------------------------------------
            // PLACE ENGAGEMENT
            // ----------------------------------------------------

            const totalPlaceLikes =
                await Place.aggregate([
                    {
                        $group: {
                            _id: null,
                            total: {
                                $sum: {
                                    $ifNull: [
                                        "$likeCount",
                                        0
                                    ]
                                }
                            }
                        }
                    }
                ]);


            const placeLikeTotal =
                totalPlaceLikes.length > 0
                    ? totalPlaceLikes[0].total
                    : 0;


            // ----------------------------------------------------
            // TOP LIKED PLACES
            // ----------------------------------------------------

            const topLikedPlaces =
                await Place.find({})
                    .select(
                        "placeId placeName locality category likeCount"
                    )
                    .sort({
                        likeCount: -1
                    })
                    .limit(5)
                    .lean();


            // ----------------------------------------------------
            // TOP RATED PLACES
            // ----------------------------------------------------

            const topRatedPlaces =
                await Place.find({
                    communityRatingCount: {
                        $gt: 0
                    }
                })
                    .select(
                        "placeId placeName locality category communityAverageRating communityRatingCount"
                    )
                    .sort({
                        communityAverageRating: -1,
                        communityRatingCount: -1
                    })
                    .limit(5)
                    .lean();


            // ----------------------------------------------------
            // CATEGORY DISTRIBUTION
            // ----------------------------------------------------

            const categoryDistribution =
                await Place.aggregate([
                    {
                        $group: {
                            _id: "$category",
                            count: {
                                $sum: 1
                            }
                        }
                    },
                    {
                        $sort: {
                            count: -1
                        }
                    }
                ]);


            // ----------------------------------------------------
            // LOCALITY DISTRIBUTION
            // ----------------------------------------------------

            const localityDistribution =
                await Place.aggregate([
                    {
                        $group: {
                            _id: "$locality",
                            count: {
                                $sum: 1
                            }
                        }
                    },
                    {
                        $sort: {
                            count: -1
                        }
                    },
                    {
                        $limit: 10
                    }
                ]);


            // ----------------------------------------------------
            // FINAL RESPONSE
            // ----------------------------------------------------

            return res.status(200).json({

                success: true,

                data: {

                    overview: {

                        totalPlaces,

                        totalUsers,

                        totalContributions,

                        totalLikes:
                            placeLikeTotal,

                        totalLikeRecords:
                            totalLikes,

                        totalSavedPlaces,

                        totalTrips

                    },


                    users: {

                        total:
                            totalUsers,

                        admins:
                            adminUsers,

                        regularUsers:
                            regularUsers

                    },


                    contributions: {

                        total:
                            totalContributions,

                        pending:
                            pendingContributions,

                        approved:
                            approvedContributions,

                        rejected:
                            rejectedContributions

                    },


                    engagement: {

                        placeLikes:
                            placeLikeTotal,

                        likeRecords:
                            totalLikes,

                        savedPlaces:
                            totalSavedPlaces,

                        trips:
                            totalTrips

                    },


                    topLikedPlaces,

                    topRatedPlaces,

                    categoryDistribution,

                    localityDistribution

                }

            });

        } catch (error) {

            console.error(
                "Admin reports error:",
                error
            );

            return res.status(500).json({

                success: false,

                message:
                    "Failed to generate reports"

            });

        }

    };


module.exports = {

    getReportsOverview

};