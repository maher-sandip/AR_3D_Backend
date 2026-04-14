const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const uploadScan = require("../controllers/scanController");

const router = express.Router();

// ✅ Make sure frames folder exists
const framesDir = path.join(__dirname, "../../uploads/frames");
if (!fs.existsSync(framesDir)) {
  fs.mkdirSync(framesDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, framesDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

// ✅ Accept any image file type
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype.startsWith("image/") ||
      file.mimetype === "application/octet-stream"
    ) {
      cb(null, true);
    } else {
      cb(new Error("Only image files allowed"), false);
    }
  },
});

router.post("/scan", upload.array("frames", 30), uploadScan);

module.exports = router;