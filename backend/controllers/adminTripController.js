const Trip = require("../models/Trip");


// ============================================================
// GET ALL TRIPS
// ADMIN ONLY
// ============================================================

const getAllTrips = async (req, res) => {
    try {

        const {
            q
        } = req.query;


        const filter = {};


        // --------------------------------------------------------
        // Search by trip name
        // --------------------------------------------------------

        if (q && q.trim()) {

            const safeQuery =
                q.trim().replace(
                    /[.*+?^${}()|[\]\\]/g,
                    "\\$&"
                );


            filter.name = {
                $regex: safeQuery,
                $options: "i"
            };

        }


        // --------------------------------------------------------
        // Get trips
        //
        // Populate:
        //   user  → owner information
        //   places.place → place information
        // --------------------------------------------------------

        const trips =
            await Trip.find(filter)
                .populate(
                    "user",
                    "name email role"
                )
                .populate(
                    "places.place",
                    "placeId placeName locality category images"
                )
                .sort({
                    createdAt: -1
                })
                .lean();


        // --------------------------------------------------------
        // Format response
        // --------------------------------------------------------

        const data =
            trips.map(
                trip => ({

                    _id:
                        trip._id,

                    name:
                        trip.name,

                    createdAt:
                        trip.createdAt,

                    updatedAt:
                        trip.updatedAt,

                    user:
                        trip.user
                            ? {
                                _id:
                                    trip.user._id,

                                name:
                                    trip.user.name,

                                email:
                                    trip.user.email,

                                role:
                                    trip.user.role
                            }
                            : null,

                    places:
                        Array.isArray(
                            trip.places
                        )
                            ? trip.places.map(
                                item => ({

                                    order:
                                        item.order,

                                    place:
                                        item.place
                                            ? {
                                                _id:
                                                    item.place._id,

                                                placeId:
                                                    item.place.placeId,

                                                placeName:
                                                    item.place.placeName,

                                                locality:
                                                    item.place.locality,

                                                category:
                                                    item.place.category,

                                                image:
                                                    Array.isArray(
                                                        item.place.images
                                                    ) &&
                                                    item.place.images.length > 0
                                                        ? item.place.images[0]
                                                        : ""
                                            }
                                            : null

                                })
                            )
                            : [],

                    placeCount:
                        Array.isArray(
                            trip.places
                        )
                            ? trip.places.length
                            : 0

                })
            );


        return res.status(200).json({

            success:
                true,

            count:
                data.length,

            data

        });


    } catch (error) {

        console.error(
            "Get admin trips error:",
            error
        );


        return res.status(500).json({

            success:
                false,

            message:
                "Failed to fetch trips"

        });

    }
};


// ============================================================
// DELETE TRIP
// ADMIN ONLY
// ============================================================

const deleteTripAdmin = async (
    req,
    res
) => {

    try {

        const {
            tripId
        } = req.params;


        const trip =
            await Trip.findById(
                tripId
            );


        if (!trip) {

            return res.status(404).json({

                success:
                    false,

                message:
                    "Trip not found"

            });

        }


        await Trip.findByIdAndDelete(
            tripId
        );


        return res.status(200).json({

            success:
                true,

            message:
                "Trip deleted successfully",

            data: {

                tripId:
                    trip._id,

                name:
                    trip.name

            }

        });


    } catch (error) {

        console.error(
            "Admin delete trip error:",
            error
        );


        return res.status(500).json({

            success:
                false,

            message:
                "Failed to delete trip"

        });

    }

};


// ============================================================
// GET TRIP STATISTICS
// ADMIN ONLY
// ============================================================

const getTripStatistics = async (
    req,
    res
) => {

    try {

        const totalTrips =
            await Trip.countDocuments();


        const totalTripPlaces =
            await Trip.aggregate([

                {
                    $project: {
                        placeCount: {
                            $size: {
                                $ifNull: [
                                    "$places",
                                    []
                                ]
                            }
                        }
                    }
                },

                {
                    $group: {
                        _id: null,

                        total:
                            {
                                $sum:
                                    "$placeCount"
                            }
                    }
                }

            ]);


        const averagePlacesPerTrip =
            totalTrips > 0
                ? (
                    (
                        totalTripPlaces.length > 0
                            ? totalTripPlaces[0].total
                            : 0
                    ) /
                    totalTrips
                ).toFixed(1)
                : "0.0";


        return res.status(200).json({

            success:
                true,

            data: {

                totalTrips,

                totalTripPlaces:
                    totalTripPlaces.length > 0
                        ? totalTripPlaces[0].total
                        : 0,

                averagePlacesPerTrip

            }

        });


    } catch (error) {

        console.error(
            "Get trip statistics error:",
            error
        );


        return res.status(500).json({

            success:
                false,

            message:
                "Failed to generate trip statistics"

        });

    }

};


// ============================================================
// EXPORT
// ============================================================

module.exports = {

    getAllTrips,

    deleteTripAdmin,

    getTripStatistics

};