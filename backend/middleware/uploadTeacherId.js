const multer = require("multer");
const path = require("path");

// Storage location for teacher IDs
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/teacherIds"); // Create folder teacherIds
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

// Accept ONLY PDF
const fileFilter = (req, file, cb) => {
  if (file.mimetype === "application/pdf") {
    cb(null, true);
  } else {
    cb(new Error("Only PDF files are allowed"));
  }
};

const uploadTeacherId = multer({
  storage,
  fileFilter,
});

module.exports = uploadTeacherId;
