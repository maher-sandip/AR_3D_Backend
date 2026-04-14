import { processFramesToGLB } from "../services/processingService.js";
import {
  uploadGLB,
  createScanRecord,
} from "../services/supabaseService.js";

export const scanController = async (req, res) => {
  try {
    const files = req.files;

    if (!files || files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No frames uploaded",
      });
    }

    // 1️⃣ Create initial DB record
    const scanData = {
      status: "processing",
      frame_count: files.length,
    };

    await createScanRecord(scanData);

    // 2️⃣ Process → GLB
    const glbPath = await processFramesToGLB(files);

    // 3️⃣ Upload to Supabase
    const glbUrl = await uploadGLB(glbPath);

    // 4️⃣ Save final result
    await createScanRecord({
      status: "completed",
      glb_url: glbUrl,
      frame_count: files.length,
    });

    res.json({
      success: true,
      glbUrl,
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Processing failed",
    });
  }
};