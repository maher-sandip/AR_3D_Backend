import express from "express";
import multer from "multer";

// import { upload } from "../middlewares/uploadMiddleware.js";
// import { scanController } from "../controllers/scanController.js";
import { processImages } from "../controllers/scanController.js";


const router = express.Router();

const upload = multer({ dest: "uploads/" });

router.post("/scan", upload.array("images", 30), processImages);

export default router;