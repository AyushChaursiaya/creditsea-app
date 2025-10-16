const multer = require("multer");

// Store files in memory instead of saving to disk
const storage = multer.memoryStorage(); // Files are stored as Buffer in memory

// Check if uploaded file is XML
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ["text/xml", "application/xml"];
  
  // Check if file is XML by type or file extension
  const isXML =
    file.mimetype === "text/xml" ||
    file.mimetype === "application/xml" ||
    file.originalname.toLowerCase().endsWith('.xml');

  if (isXML) {
    // Accept the file
    cb(null, true);
  } else {
    // Reject the file
    cb(new Error("Please upload only XML files"), false);
  }
};

// Configure multer for file uploads
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // file size: 10MB
  },
});

module.exports = upload;