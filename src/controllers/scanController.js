import { processFramesToGLB } from "../services/processingService.js";
import {
  uploadGLB,
  createScanRecord,
  updateScanRecord,
} from "../services/supabaseService.js";

import { run3DPipeline } from "../services/reconstructionService.js";
import path from "path";
import fs from "fs";

// export const scanController = async (req, res) => {
//   try {
//     const files = req.files;

//     if (!files || files.length === 0) {
//       return res.status(400).json({
//         success: false,
//         message: "No frames uploaded",
//       });
//     }

//     // ✅ 1. Create ONE record
//     const scan = await createScanRecord({
//       status: "processing",
//       frame_count: files.length,
//     });

//     console.log("🆔 Scan created:", scan.id);

//     // ✅ 2. Process
//     const glbPath = await processFramesToGLB(files);
//     console.log("📦 GLB Path:", glbPath);

//     // ✅ 3. Upload
//     const glbUrl = await uploadGLB(glbPath);
//     console.log("🌐 GLB URL:", glbUrl);

//     // ❗ SAFETY CHECK
//     if (!glbUrl) {
//       throw new Error("GLB URL not generated");
//     }

//     // ✅ 4. Update SAME record
//     await updateScanRecord(scan.id, {
//       status: "completed",
//       glb_url: glbUrl,
//     });

//     console.log("✅ Scan updated successfully");

//     res.json({
//       success: true,
//       glbUrl,
//     });

//   } catch (error) {
//     console.error("❌ Controller Error:", error);

//     res.status(500).json({
//       success: false,
//       message: error.message || "Processing failed",
//     });
//   }
// };

export const processImages = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        error: "No images uploaded",
      });
    }

    console.log("📸 Images received");

    // 1️⃣ Run pipeline
    await run3DPipeline();

    // 2️⃣ Convert OBJ → GLB
    const plyPath = "output/mesh.ply";
    const glbPath = "output/model.glb";

    const { execSync } = await import("child_process");

    // execSync(`gltf-transform obj2gltf ${objPath} ${glbPath}`);
    execSync(`gltf-transform copy output/mesh.ply output/model.glb`);
    execSync(`gltf-transform optimize ${glbPath} ${glbPath}`);

    // 3️⃣ Upload
    const fileUrl = await uploadGLB(glbPath);

    // 4️⃣ Cleanup uploads

    fs.rmSync("uploads", { recursive: true, force: true });
    fs.mkdirSync("uploads");

    res.json({
      success: true,
      modelUrl: fileUrl,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Processing failed" });
  }
};
