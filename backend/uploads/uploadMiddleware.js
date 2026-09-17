const multer = require("multer");

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedImageTypes = [
    "image/jpeg",
    "image/png",
    "image/webp"
  ];

  const allowedVideoTypes = [
    "video/mp4",
    "video/webm",
    "video/quicktime"
  ];

  const allowedTypes = [
    ...allowedImageTypes,
    ...allowedVideoTypes
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Invalid file type. Only JPG, PNG, WEBP images and MP4, WEBM, MOV videos are allowed."
      ),
      false
    );
  }
};

const upload = multer({
  storage: storage,

  limits: {
    fileSize: 50 * 1024 * 1024,
    files: 6
  },

  fileFilter: fileFilter
});

module.exports = upload;