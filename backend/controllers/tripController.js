const Trip = require("../models/Trip");
const Place = require("../models/Place");


// =========================================================
// CREATE TRIP
// =========================================================

const createTrip = async (req, res) => {
    try {

        if (!req.user || !req.user.userId) {
            return res.status(401).json({
                success: false,
                message: "Authentication required"
            });
        }

        const {
            name,
            places
        } = req.body;


        // -------------------------------------------------
        // VALIDATE TRIP NAME
        // -------------------------------------------------

        if (!name || !name.trim()) {
            return res.status(400).json({
                success: false,
                message: "Trip name is required"
            });
        }


        // -------------------------------------------------
        // VALIDATE PLACES
        // -------------------------------------------------

        const placeList =
            Array.isArray(places)
                ? places
                : [];


        const tripPlaces = [];


        for (
            let i = 0;
            i < placeList.length;
            i++
        ) {

            const placeId =
                typeof placeList[i] === "object"
                    ? placeList[i].place
                    : placeList[i];


            const place =
                await Place.findOne({
                    placeId: placeId
                });


            if (!place) {
                return res.status(404).json({
                    success: false,
                    message:
                        `Place not found: ${placeId}`
                });
            }


            tripPlaces.push({
                place: place._id,
                order: i
            });
        }


        // -------------------------------------------------
        // CREATE TRIP
        // -------------------------------------------------

        const trip =
            await Trip.create({

                user:
                    req.user.userId,

                name:
                    name.trim(),

                places:
                    tripPlaces
            });


        // -------------------------------------------------
        // RETURN POPULATED TRIP
        // -------------------------------------------------

        const populatedTrip =
            await Trip.findById(
                trip._id
            ).populate(
                "places.place"
            );


        return res.status(201).json({

            success: true,

            message:
                "Trip created successfully",

            data:
                populatedTrip
        });

    } catch (error) {

        console.error(
            "Create trip error:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Failed to create trip"
        });
    }
};


// =========================================================
// GET MY TRIPS
// =========================================================

const getMyTrips = async (req, res) => {
    try {

        if (!req.user || !req.user.userId) {
            return res.status(401).json({
                success: false,
                message: "Authentication required"
            });
        }


        const trips =
            await Trip.find({
                user:
                    req.user.userId
            })
            .populate(
                "places.place"
            )
            .sort({
                createdAt: -1
            });


        return res.json({

            success: true,

            count:
                trips.length,

            data:
                trips
        });

    } catch (error) {

        console.error(
            "Get my trips error:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Failed to load trips"
        });
    }
};


// =========================================================
// GET SINGLE TRIP
// =========================================================

const getTripById = async (req, res) => {
    try {

        if (!req.user || !req.user.userId) {
            return res.status(401).json({
                success: false,
                message: "Authentication required"
            });
        }


        const trip =
            await Trip.findOne({

                _id:
                    req.params.tripId,

                user:
                    req.user.userId

            }).populate(
                "places.place"
            );


        if (!trip) {
            return res.status(404).json({

                success: false,

                message:
                    "Trip not found"
            });
        }


        return res.json({

            success: true,

            data:
                trip
        });

    } catch (error) {

        console.error(
            "Get trip error:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Failed to load trip"
        });
    }
};


// =========================================================
// UPDATE TRIP
// =========================================================

const updateTrip = async (req, res) => {
    try {

        if (!req.user || !req.user.userId) {
            return res.status(401).json({
                success: false,
                message: "Authentication required"
            });
        }


        const {
            name,
            places
        } = req.body;


        const trip =
            await Trip.findOne({

                _id:
                    req.params.tripId,

                user:
                    req.user.userId

            });


        if (!trip) {
            return res.status(404).json({

                success: false,

                message:
                    "Trip not found"
            });
        }


        // -------------------------------------------------
        // UPDATE NAME
        // -------------------------------------------------

        if (
            typeof name === "string" &&
            name.trim()
        ) {

            trip.name =
                name.trim();
        }


        // -------------------------------------------------
        // UPDATE PLACES
        // -------------------------------------------------

        if (Array.isArray(places)) {

            const tripPlaces = [];


            for (
                let i = 0;
                i < places.length;
                i++
            ) {

                const placeId =
                    typeof places[i] === "object"
                        ? places[i].place
                        : places[i];


                const place =
                    await Place.findOne({
                        placeId:
                            placeId
                    });


                if (!place) {
                    return res.status(404).json({

                        success: false,

                        message:
                            `Place not found: ${placeId}`
                    });
                }


                tripPlaces.push({

                    place:
                        place._id,

                    order:
                        i
                });
            }


            trip.places =
                tripPlaces;
        }


        await trip.save();


        const updatedTrip =
            await Trip.findById(
                trip._id
            ).populate(
                "places.place"
            );


        return res.json({

            success: true,

            message:
                "Trip updated successfully",

            data:
                updatedTrip
        });

    } catch (error) {

        console.error(
            "Update trip error:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Failed to update trip"
        });
    }
};


// =========================================================
// DELETE TRIP
// =========================================================

const deleteTrip = async (req, res) => {
    try {

        if (!req.user || !req.user.userId) {
            return res.status(401).json({
                success: false,
                message: "Authentication required"
            });
        }


        const trip =
            await Trip.findOne({

                _id:
                    req.params.tripId,

                user:
                    req.user.userId

            });


        if (!trip) {
            return res.status(404).json({

                success: false,

                message:
                    "Trip not found"
            });
        }


        await Trip.deleteOne({

            _id:
                trip._id

        });


        return res.json({

            success: true,

            message:
                "Trip deleted successfully"
        });

    } catch (error) {

        console.error(
            "Delete trip error:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Failed to delete trip"
        });
    }
};


// =========================================================
// EXPORT
// =========================================================

module.exports = {

    createTrip,

    getMyTrips,

    getTripById,

    updateTrip,

    deleteTrip

};