const path = require("path");
const fs = require("fs");
const { createGLBFromImage } = require("../utils/createGLB");

const uploadScan = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: "No frames uploaded" });
    }

    const fileId = Date.now().toString();
    const middleIndex = Math.floor(req.files.length / 2);
    const bestFrame = req.files[middleIndex];

    console.log(`Got ${req.files.length} frames`);
    console.log(`Using frame: ${bestFrame.path}`);

    // ✅ Correct output path
    const outputDir = path.join(__dirname, "../../uploads/output");
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const glbPath = path.join(outputDir, `${fileId}.glb`);
    await createGLBFromImage(bestFrame.path, glbPath);

    return res.json({
      success: true,
      glbUrl: `/output/${fileId}.glb`,
      totalFrames: req.files.length,
    });

  } catch (err) {
    console.error("Scan error:", err.message);
    return res.status(500).json({
      error: "Failed to create 3D model",
      detail: err.message,
    });
  }
};

module.exports = uploadScan;