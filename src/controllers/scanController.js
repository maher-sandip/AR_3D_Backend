import { processFramesToGLB } from "../services/processingService.js";
import {
  uploadGLB,
  createScanRecord,
  updateScanRecord,
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

    // ✅ 1. Create ONE record
    const scan = await createScanRecord({
      status: "processing",
      frame_count: files.length,
    });

    // ✅ 2. Process
    const glbPath = await processFramesToGLB(files);

    // ✅ 3. Upload
    const glbUrl = await uploadGLB(glbPath);

    // ✅ 4. Update SAME record
    await updateScanRecord(scan.id, {
      status: "completed",
      glb_url: glbUrl,
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