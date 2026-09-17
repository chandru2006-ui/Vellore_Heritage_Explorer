const mongoose = require("mongoose");

const savedPlaceSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        place: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Place",
            required: true
        }
    },
    {
        timestamps: true
    }
);

savedPlaceSchema.index(
    {
        user: 1,
        place: 1
    },
    {
        unique: true
    }
);

module.exports =
    mongoose.model(
        "SavedPlace",
        savedPlaceSchema
    );