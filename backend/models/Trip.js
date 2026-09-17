const mongoose = require("mongoose");


// =========================================================
// TRIP PLACE SCHEMA
// =========================================================

const tripPlaceSchema = new mongoose.Schema(
    {
        place: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Place",
            required: true
        },

        order: {
            type: Number,
            required: true,
            min: 0
        }
    },
    {
        _id: false
    }
);


// =========================================================
// TRIP SCHEMA
// =========================================================

const tripSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        name: {
            type: String,
            required: true,
            trim: true,
            maxlength: 100
        },

        places: {
            type: [tripPlaceSchema],
            default: []
        }
    },
    {
        timestamps: true
    }
);


// =========================================================
// INDEX
// =========================================================

tripSchema.index({
    user: 1,
    createdAt: -1
});


module.exports =
    mongoose.model(
        "Trip",
        tripSchema
    );