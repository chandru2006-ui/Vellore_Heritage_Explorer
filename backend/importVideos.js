const mongoose = require("mongoose");
const dotenv = require("dotenv");
const XLSX = require("xlsx");

const connectDB = require("./config/db");
const Place = require("./models/Place");

dotenv.config();

const EXCEL_FILE =
  "C:/Users/user/Documents/Multimedia_project/Phase_3_UPDATED_42_PLACES_WITH_VIDEO_LINK(5)_ENRICHED_FINAL.xlsx";

const importVideos = async () => {
  try {
    await connectDB();

    console.log("Reading video links from Excel...");

    const workbook = XLSX.readFile(EXCEL_FILE);
    const sheet = workbook.Sheets["Place_Text"];

    if (!sheet) {
      throw new Error("Place_Text sheet not found.");
    }

    const rows = XLSX.utils.sheet_to_json(sheet);

    // Keep only rows containing a Place_ID
    const placeRows = rows.filter(
      (row) => row.Place_ID && String(row.Place_ID).trim() !== ""
    );

    console.log(`Place records found: ${placeRows.length}`);

    if (placeRows.length !== 41) {
      throw new Error(
        `Expected 41 places, but found ${placeRows.length}.`
      );
    }

    const videoData = {};

    for (const row of placeRows) {
      const placeId = String(row.Place_ID).trim();
      const videoLink = String(row["Video Link"] || "").trim();

      if (videoData[placeId]) {
        throw new Error(
          `Duplicate Place_ID found in Excel: ${placeId}`
        );
      }

      videoData[placeId] = videoLink;
    }

    // Science Park must not be present
    if (videoData["VEL026"]) {
      throw new Error(
        "VEL026 (Science Park) must not be present."
      );
    }

    const placeIds = Object.keys(videoData);

    console.log(`Unique Place IDs: ${placeIds.length}`);

    if (placeIds.length !== 41) {
      throw new Error(
        `Expected 41 unique Place IDs, found ${placeIds.length}.`
      );
    }

    // Validate YouTube links
    const youtubeLinks = Object.entries(videoData).filter(
      ([, link]) => link !== ""
    );

    const blankLinks = Object.entries(videoData).filter(
      ([, link]) => link === ""
    );

    console.log(`Video links found: ${youtubeLinks.length}`);
    console.log(`Blank video links: ${blankLinks.length}`);

    if (youtubeLinks.length !== 39) {
      throw new Error(
        `Expected 39 video links, found ${youtubeLinks.length}.`
      );
    }

    if (blankLinks.length !== 2) {
      throw new Error(
        `Expected 2 blank video links, found ${blankLinks.length}.`
      );
    }

    for (const [placeId, link] of youtubeLinks) {
      if (!link.includes("youtube.com") && !link.includes("youtu.be")) {
        throw new Error(
          `Non-YouTube video link found for ${placeId}: ${link}`
        );
      }
    }

    console.log("Video link validation passed.");

    // Verify MongoDB contains all 41 places
    const dbPlaces = await Place.find({
      placeId: { $in: placeIds }
    }).select("placeId placeName");

    if (dbPlaces.length !== 41) {
      throw new Error(
        `MongoDB contains ${dbPlaces.length} matching places instead of 41.`
      );
    }

    const dbPlaceIds = new Set(
      dbPlaces.map((place) => place.placeId)
    );

    for (const placeId of placeIds) {
      if (!dbPlaceIds.has(placeId)) {
        throw new Error(
          `${placeId} exists in Excel but not MongoDB.`
        );
      }
    }

    console.log("All 41 Place IDs verified in MongoDB.");

    // Update ONLY videoLink
    let updatedCount = 0;

    for (const [placeId, videoLink] of Object.entries(videoData)) {
      const updatedPlace = await Place.findOneAndUpdate(
        { placeId },
        { $set: { videoLink } },
        { new: true }
      );

      if (!updatedPlace) {
        throw new Error(
          `Failed to update ${placeId}`
        );
      }

      updatedCount++;

      console.log(
        `${placeId} | ${updatedPlace.placeName} | ${
          videoLink ? "VIDEO" : "NO VIDEO"
        }`
      );
    }

    console.log("");
    console.log("========================================");
    console.log("VIDEO LINK IMPORT COMPLETED SUCCESSFULLY");
    console.log("========================================");

    console.log(`Places updated : ${updatedCount}`);
    console.log(`Video links    : ${youtubeLinks.length}`);
    console.log(`Blank links    : ${blankLinks.length}`);

    // Final MongoDB verification
    const totalPlaces = await Place.countDocuments();

    const placesWithVideos = await Place.countDocuments({
      videoLink: { $exists: true, $ne: "" }
    });

    const placesWithoutVideos = await Place.countDocuments({
      $or: [
        { videoLink: { $exists: false } },
        { videoLink: "" }
      ]
    });

    console.log("");
    console.log("Final MongoDB verification:");
    console.log(`Total places          : ${totalPlaces}`);
    console.log(`Places with videos    : ${placesWithVideos}`);
    console.log(`Places without videos : ${placesWithoutVideos}`);

    if (
      totalPlaces === 41 &&
      placesWithVideos === 39 &&
      placesWithoutVideos === 2
    ) {
      console.log("");
      console.log("FINAL VIDEO DATABASE VALIDATION: PASS");
    } else {
      console.log("");
      console.log("FINAL VIDEO DATABASE VALIDATION: CHECK");
    }

    await mongoose.connection.close();
    console.log("MongoDB connection closed.");

  } catch (error) {
    console.error("");
    console.error("VIDEO IMPORT FAILED");
    console.error(error.message);

    await mongoose.connection.close();
    process.exit(1);
  }
};

importVideos();