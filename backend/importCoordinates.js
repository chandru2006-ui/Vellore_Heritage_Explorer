const mongoose = require("mongoose");
const dotenv = require("dotenv");

const Place = require("./models/Place");

dotenv.config();

/*
  Coordinate import for the 41 active Vellore places.

  IMPORTANT:
  - Do NOT change placeId values.
  - null means the coordinate still needs verification.
  - Existing images and videoLink values are NOT modified.
*/

const coordinates = [
  {
    placeId: "ANA009",
    latitude: null,
    longitude: null
  },
  {
    placeId: "ANA003",
    latitude: null,
    longitude: null
  },
  {
    placeId: "ANA005",
    latitude: null,
    longitude: null
  },
  {
    placeId: "ANA001",
    latitude: 12.732363,
    longitude: 79.056673
  },
  {
    placeId: "ANA010",
    latitude: 12.922110,
    longitude: 79.022680
  },
  {
    placeId: "ANA002",
    latitude: null,
    longitude: null
  },
  {
    placeId: "ANA006",
    latitude: null,
    longitude: null
  },
  {
    placeId: "GUD001",
    latitude: 13.046100,
    longitude: 78.783600
  },
  {
    placeId: "GUD006",
    latitude: 12.885000,
    longitude: 79.161000
  },
  {
    placeId: "GUD005",
    latitude: null,
    longitude: null
  },
  {
    placeId: "GUD004",
    latitude: null,
    longitude: null
  },
  {
    placeId: "GUD003",
    latitude: null,
    longitude: null
  },
  {
    placeId: "GUD002",
    latitude: 12.995880,
    longitude: 78.965310
  },
  {
    placeId: "KVK001",
    latitude: null,
    longitude: null
  },
  {
    placeId: "VEL025",
    latitude: null,
    longitude: null
  },
  {
    placeId: "KAT002",
    latitude: 13.075010,
    longitude: 79.262551
  },
  {
    placeId: "KAT015",
    latitude: null,
    longitude: null
  },
  {
    placeId: "KAT009",
    latitude: 12.962429,
    longitude: 79.127706
  },
  {
    placeId: "KAT005",
    latitude: 13.063956,
    longitude: 79.284489
  },
  {
    placeId: "KAT007",
    latitude: 13.090000,
    longitude: 79.262500
  },
  {
    placeId: "KAT004",
    latitude: 13.064911,
    longitude: 79.284163
  },
  {
    placeId: "KAT014",
    latitude: null,
    longitude: null
  },
  {
    placeId: "KAT001",
    latitude: 13.073860,
    longitude: 79.259773
  },
  {
    placeId: "KAT006",
    latitude: 12.985000,
    longitude: 79.266389
  },
  {
    placeId: "PER003",
    latitude: null,
    longitude: null
  },
  {
    placeId: "PER001",
    latitude: null,
    longitude: null
  },
  {
    placeId: "VEL008",
    latitude: null,
    longitude: null
  },
  {
    placeId: "VEL028",
    latitude: 12.914430,
    longitude: 79.081990
  },
  {
    placeId: "VEL016",
    latitude: 12.917516,
    longitude: 79.136078
  },
  {
    placeId: "VEL001",
    latitude: 12.920833,
    longitude: 79.128333
  },
  {
    placeId: "VEL015",
    latitude: 12.917516,
    longitude: 79.136078
  },
  {
    placeId: "VEL004",
    latitude: 12.919390,
    longitude: 79.130110
  },
  {
    placeId: "VEL009",
    latitude: 12.937337,
    longitude: 79.163301
  },
  {
    placeId: "VEL010",
    latitude: 12.917650,
    longitude: 79.128860
  },
  {
    placeId: "VEL002",
    latitude: 12.920833,
    longitude: 79.128333
  },
  {
    placeId: "VEL022",
    latitude: 12.873267,
    longitude: 79.088419
  },
  {
    placeId: "VEL023",
    latitude: null,
    longitude: null
  },
  {
    placeId: "VEL018",
    latitude: null,
    longitude: null
  },
  {
    placeId: "VEL024",
    latitude: null,
    longitude: null
  },
  {
    placeId: "VEL031",
    latitude: null,
    longitude: null
  },
  {
    placeId: "VEL032",
    latitude: 12.937430,
    longitude: 79.196420
  }
];

async function importCoordinates() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB connected");

    let updated = 0;
    let missing = 0;

    for (const item of coordinates) {
      const result = await Place.updateOne(
        { placeId: item.placeId },
        {
          $set: {
            latitude: item.latitude,
            longitude: item.longitude
          }
        }
      );

      if (result.matchedCount === 0) {
        console.log(`Place not found: ${item.placeId}`);
        missing++;
      } else {
        updated++;
      }
    }

    const total = await Place.countDocuments();

    const withCoordinates = await Place.countDocuments({
      latitude: { $ne: null },
      longitude: { $ne: null }
    });

    console.log("");
    console.log("======================================");
    console.log("COORDINATE IMPORT COMPLETED");
    console.log("======================================");
    console.log(`Records processed : ${coordinates.length}`);
    console.log(`Places updated    : ${updated}`);
    console.log(`Places not found  : ${missing}`);
    console.log(`Total places      : ${total}`);
    console.log(`With coordinates  : ${withCoordinates}`);
    console.log("======================================");

  } catch (error) {
    console.error("Coordinate import failed:", error.message);
  } finally {
    await mongoose.disconnect();
    console.log("MongoDB disconnected");
  }
}

importCoordinates();