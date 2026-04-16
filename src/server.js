import express from "express";
import cors from "cors";
import path from "path";
import fs from "fs";
import "dotenv/config";

import scanRoute from "./routes/scanRoute.js";

import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

// ✅ Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Ensure folders exist
const uploadsDir = path.join(__dirname, "uploads");
const outputDir = path.join(uploadsDir, "output");

[uploadsDir, outputDir].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// ✅ Static file serving (GLB local fallback)
app.use("/output", express.static(outputDir));

// ✅ Routes
app.use("/api/video", scanRoute);

// ✅ Health check
app.get("/", (req, res) => {
  res.json({
    status: "ScanBackend running ✅",
    env: process.env.NODE_ENV || "development",
  });
});

// ✅ 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// ✅ Global error handler
app.use((err, req, res, next) => {
  console.error("❌ Error:", err);

  res.status(500).json({
    success: false,
    message: "Internal Server Error",
  });
});

// ✅ Server start
const PORT = process.env.PORT || 5001;

app.listen(PORT, "0.0.0.0", () => {
  console.log("🚀 Server started successfully");
  console.log(`🌐 Local: http://localhost:${PORT}`);
  console.log(`📱 Mobile: http://192.168.0.106:${PORT}`);
});