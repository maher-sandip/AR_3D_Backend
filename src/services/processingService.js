import fs from "fs";
import { createGLBFromImage } from "../utils/createGLB.js";

export const processFramesToGLB = async (files) => {
  if (!fs.existsSync("models")) {
    fs.mkdirSync("models", { recursive: true });
  }

  const imagePath = files[0].path;
  console.log("📸 Using image:", imagePath);

  const outputPath = `models/model_${Date.now()}.glb`;

  // ✅ REAL GLB generation
  await createGLBFromImage(imagePath, outputPath);

  return outputPath;
};