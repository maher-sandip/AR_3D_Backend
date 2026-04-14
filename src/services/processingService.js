import fs from "fs";

export const processFramesToGLB = async (files) => {
  const outputPath = `models/model_${Date.now()}.glb`;

  // Mock processing
  fs.writeFileSync(outputPath, "dummy glb content");

  return outputPath;
};