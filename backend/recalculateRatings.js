const dotenv = require("dotenv");

dotenv.config();

const mongoose = require("mongoose");

const connectDB =
    require("./config/db");

const Place =
    require("./models/Place");

const Contribution =
    require("./models/Contribution");


// ============================================================
// RECALCULATE COMMUNITY RATINGS
// ============================================================

const recalculateRatings = async () => {

    try {

        console.log(
            "\nStarting community rating recalculation...\n"
        );


        // ------------------------------------------------------
        // CONNECT TO DATABASE
        // ------------------------------------------------------

        await connectDB();


        // ------------------------------------------------------
        // GET ALL PLACES
        // ------------------------------------------------------

        const places =
            await Place.find({});


        console.log(
            `Found ${places.length} places.`
        );


        // ------------------------------------------------------
        // PROCESS EACH PLACE
        // ------------------------------------------------------

        for (const place of places) {

            const contributions =
                await Contribution.find({
                    place: place._id,
                    status: "approved",
                    rating: {
                        $gte: 1,
                        $lte: 5
                    }
                });


            let totalRating = 0;

            let ratingCount = 0;


            // --------------------------------------------------
            // CALCULATE TOTAL AND COUNT
            // --------------------------------------------------

            for (
                const contribution
                of contributions
            ) {

                if (
                    typeof contribution.rating ===
                    "number"
                ) {

                    totalRating +=
                        contribution.rating;

                    ratingCount++;

                }

            }


            // --------------------------------------------------
            // CALCULATE AVERAGE
            // --------------------------------------------------

            const averageRating =
                ratingCount > 0
                    ? totalRating / ratingCount
                    : 0;


            // --------------------------------------------------
            // UPDATE PLACE
            // --------------------------------------------------

            place.communityRatingTotal =
                totalRating;

            place.communityRatingCount =
                ratingCount;

            place.communityAverageRating =
                Number(
                    averageRating.toFixed(2)
                );


            await place.save();


            console.log(
                `${place.placeId} - ${place.placeName}`
            );

            console.log(
                `   Ratings: ${ratingCount}`
            );

            console.log(
                `   Total: ${totalRating}`
            );

            console.log(
                `   Average: ${averageRating.toFixed(2)}`
            );

        }


        console.log(
            "\n========================================"
        );

        console.log(
            "Rating recalculation completed successfully."
        );

        console.log(
            "========================================\n"
        );


    } catch (error) {

        console.error(
            "\nRating recalculation failed:"
        );

        console.error(
            error
        );

    } finally {

        await mongoose.connection.close();

        console.log(
            "MongoDB connection closed."
        );

    }

};


// ============================================================
// RUN SCRIPT
// ============================================================

recalculateRatings();