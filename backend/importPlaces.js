const XLSX = require("xlsx");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

const Place = require("./models/Place");

dotenv.config();

const excelFile =
  "C:/Users/user/Documents/Multimedia_project/Phase_3_UPDATED_42_PLACES_WITH_VIDEO_LINK(5)_ENRICHED_FINAL.xlsx";

const convertValue = (value) => {
  if (value === undefined || value === null) {
    return "";
  }

  return String(value).trim();
};

const importPlaces = async () => {
  try {
    console.log("Connecting to MongoDB...");

    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB connected successfully.");

    console.log("Reading Excel file...");

    const workbook = XLSX.readFile(excelFile);

    if (!workbook.SheetNames.includes("Place_Text")) {
      throw new Error("Place_Text sheet was not found in the Excel file.");
    }

    const worksheet = workbook.Sheets["Place_Text"];

    const rows = XLSX.utils.sheet_to_json(worksheet, {
      defval: ""
    });

    console.log(`Records found in Excel: ${rows.length}`);

    if (rows.length !== 41) {
      throw new Error(
        `Expected 41 places, but found ${rows.length} records. Import stopped.`
      );
    }

    const places = rows.map((row) => ({
      placeId: convertValue(row.Place_ID),
      placeName: convertValue(row.Place_Name),
      locality: convertValue(row.Locality),
      firka: convertValue(row.Firka),
      taluk: convertValue(row.Taluk),
      category: convertValue(row.Category),
      popularityLevel: convertValue(row.Popularity_Level),

      description: convertValue(row.Description),

      multimediaNotes: convertValue(row.Multimedia_Notes),

      sourceName: convertValue(row.Source_Name),
      sourceUrl: convertValue(row.Source_URL),

      collectionStatus: convertValue(row.Collection_Status),
      verificationStatus: convertValue(row.Verification_Status),

      notes: convertValue(row.Notes),

      whatIsIt: convertValue(row.What_Is_It),

      primaryPurposeOrSignificance: convertValue(
        row.Primary_Purpose_or_Significance
      ),

      historicalBackground: convertValue(row.Historical_Background),

      physicalCharacteristics: convertValue(
        row.Physical_Characteristics
      ),

      dimensionsOrSize: convertValue(row.Dimensions_or_Size),

      locationContext: convertValue(row.Location_Context),

      visitorInformation: convertValue(row.Visitor_Information),

      accessOrTransport: convertValue(row.Access_or_Transport),

      bestTimeOrSeason: convertValue(row.Best_Time_or_Season),

      nearbyOrRelatedFeatures: convertValue(
        row.Nearby_or_Related_Features
      ),

      imageRequirements: convertValue(row.Image_Requirements),

      videoRequirements: convertValue(row.Video_Requirements),

      audioTtsSource: convertValue(row.Audio_TTS_Source),

      verificationNeeded: convertValue(row.Verification_Needed),

      parentOrComplex: convertValue(row.Parent_or_Complex),

      placeSpecificityStatus: convertValue(
        row.Place_Specificity_Status
      ),

      primaryEvidenceSummary: convertValue(
        row.Primary_Evidence_Summary
      ),

      videoLink: convertValue(row["Video Link"])
    }));

    console.log("Checking Place IDs...");

    const placeIds = places.map((place) => place.placeId);
    const uniquePlaceIds = new Set(placeIds);

    if (uniquePlaceIds.size !== 41) {
      throw new Error("Duplicate Place_ID detected. Import stopped.");
    }

    if (placeIds.includes("VEL026")) {
      throw new Error(
        "VEL026 - Science Park is present. Import stopped."
      );
    }

    const emptyIds = places.filter((place) => !place.placeId);

    if (emptyIds.length > 0) {
      throw new Error(
        "One or more records have an empty Place_ID. Import stopped."
      );
    }

    const emptyNames = places.filter((place) => !place.placeName);

    if (emptyNames.length > 0) {
      throw new Error(
        "One or more records have an empty Place_Name. Import stopped."
      );
    }

    const emptyDescriptions = places.filter(
      (place) => !place.description
    );

    if (emptyDescriptions.length > 0) {
      throw new Error(
        "One or more records have an empty Description. Import stopped."
      );
    }

    console.log("Validation passed.");
    console.log("41 unique places ready for import.");

    console.log("Clearing existing Place documents...");

    await Place.deleteMany({});

    console.log("Existing Place collection cleared.");

    console.log("Importing 41 places...");

    const insertedPlaces = await Place.insertMany(places);

    console.log(
      `Successfully imported ${insertedPlaces.length} places.`
    );

    console.log("\nImported Place IDs:");

    insertedPlaces.forEach((place) => {
      console.log(`${place.placeId} - ${place.placeName}`);
    });

    console.log("\nIMPORT COMPLETED SUCCESSFULLY.");

    await mongoose.connection.close();

    console.log("MongoDB connection closed.");
  } catch (error) {
    console.error("\nIMPORT FAILED:");
    console.error(error.message);

    await mongoose.connection.close();

    process.exit(1);
  }
};

importPlaces();