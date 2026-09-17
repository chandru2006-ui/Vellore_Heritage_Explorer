const mongoose = require("mongoose");
const dotenv = require("dotenv");
const XLSX = require("xlsx");

const connectDB = require("./config/db");
const Place = require("./models/Place");

dotenv.config();

const EXCEL_FILE =
  "C:/Users/user/Documents/Multimedia_project/Vellore_Image_URLs_FINAL_COMPLETE.xlsx";

const importImages = async () => {
  try {
    await connectDB();

    console.log("Reading image URL workbook...");

    const workbook = XLSX.readFile(EXCEL_FILE);
    const sheet = workbook.Sheets["Image_URLs"];

    if (!sheet) {
      throw new Error("Image_URLs sheet not found in Excel file.");
    }

    const rows = XLSX.utils.sheet_to_json(sheet);

    console.log(`Image records found in Excel: ${rows.length}`);

    if (rows.length !== 584) {
      throw new Error(
        `Expected 584 image records, but found ${rows.length}.`
      );
    }

    // Group image URLs by Place_ID
    const imagesByPlace = {};

    for (const row of rows) {
      const placeId = String(row.Place_ID || "").trim();
      const imageUrl = String(row.Cloudinary_URL || "").trim();

      if (!placeId || !imageUrl) {
        throw new Error(
          `Invalid row found. Place_ID or Cloudinary_URL is missing.`
        );
      }

      if (!imagesByPlace[placeId]) {
        imagesByPlace[placeId] = [];
      }

      imagesByPlace[placeId].push(imageUrl);
    }

    const placeIds = Object.keys(imagesByPlace);

    console.log(`Unique Place IDs in image workbook: ${placeIds.length}`);

    if (placeIds.length !== 41) {
      throw new Error(
        `Expected images for 41 places, but found ${placeIds.length} Place IDs.`
      );
    }

    // Science Park must not exist
    if (imagesByPlace["VEL026"]) {
      throw new Error(
        "VEL026 (Science Park) was found in the image workbook."
      );
    }

    // Check duplicate URLs within each place
    for (const placeId of placeIds) {
      const urls = imagesByPlace[placeId];
      const uniqueUrls = [...new Set(urls)];

      if (urls.length !== uniqueUrls.length) {
        throw new Error(
          `Duplicate image URL found for Place_ID: ${placeId}`
        );
      }
    }

    // Verify all image Place IDs exist in MongoDB
    const dbPlaces = await Place.find({
      placeId: { $in: placeIds }
    }).select("placeId placeName");

    if (dbPlaces.length !== 41) {
      throw new Error(
        `MongoDB contains ${dbPlaces.length} matching places instead of 41.`
      );
    }

    const dbPlaceIds = new Set(dbPlaces.map((place) => place.placeId));

    for (const placeId of placeIds) {
      if (!dbPlaceIds.has(placeId)) {
        throw new Error(
          `Place_ID ${placeId} exists in Excel but not in MongoDB.`
        );
      }
    }

    console.log("All 41 Place IDs verified in MongoDB.");

    // Update only the images field
    let updatedCount = 0;

    for (const placeId of placeIds) {
      const imageUrls = imagesByPlace[placeId];

      const updatedPlace = await Place.findOneAndUpdate(
        { placeId },
        { $set: { images: imageUrls } },
        { new: true }
      );

      if (!updatedPlace) {
        throw new Error(
          `Failed to update Place_ID: ${placeId}`
        );
      }

      updatedCount++;

      console.log(
        `${placeId} | ${updatedPlace.placeName} | ${imageUrls.length} images`
      );
    }

    console.log("");
    console.log("========================================");
    console.log("IMAGE IMPORT COMPLETED SUCCESSFULLY");
    console.log("========================================");
    console.log(`Excel image records : ${rows.length}`);
    console.log(`Places updated      : ${updatedCount}`);

    // Final MongoDB verification
    const totalPlaces = await Place.countDocuments();

    const placesWithImages = await Place.countDocuments({
      images: { $exists: true, $ne: [] }
    });

    const totalImagesResult = await Place.aggregate([
      {
        $project: {
          imageCount: { $size: { $ifNull: ["$images", []] } }
        }
      },
      {
        $group: {
          _id: null,
          totalImages: { $sum: "$imageCount" }
        }
      }
    ]);

    const totalImages =
      totalImagesResult.length > 0
        ? totalImagesResult[0].totalImages
        : 0;

    console.log("");
    console.log("Final MongoDB verification:");
    console.log(`Total places       : ${totalPlaces}`);
    console.log(`Places with images : ${placesWithImages}`);
    console.log(`Total image URLs   : ${totalImages}`);

    if (
      totalPlaces === 41 &&
      placesWithImages === 41 &&
      totalImages === 584
    ) {
      console.log("");
      console.log("FINAL IMAGE DATABASE VALIDATION: PASS");
    } else {
      console.log("");
      console.log("FINAL IMAGE DATABASE VALIDATION: CHECK");
    }

    await mongoose.connection.close();
    console.log("MongoDB connection closed.");
  } catch (error) {
    console.error("");
    console.error("IMAGE IMPORT FAILED");
    console.error(error.message);

    await mongoose.connection.close();
    process.exit(1);
  }
};

importImages();