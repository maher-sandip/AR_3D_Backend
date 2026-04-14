const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

const scanRoute = require("./routes/scanRoute");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Ensure output folder exists
const outputPath = path.join(__dirname, "uploads/output");
if (!fs.existsSync(outputPath)) {
  fs.mkdirSync(outputPath, { recursive: true });
}

// Serve GLB files statically
app.use("/output", express.static("src/uploads/output"));

// Routes
app.use("/api/video", scanRoute);

// Health check
app.get("/", (req, res) => {
  res.json({ status: "ScanBackend running ✅" });
});

const PORT = 5000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ ScanBackend running on http://0.0.0.0:${PORT}`);
  console.log(`📱 Phone should connect to http://192.168.0.110:${PORT}`);
});