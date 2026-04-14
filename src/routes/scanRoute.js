import express from "express";
import { upload } from "../middlewares/uploadMiddleware.js";
import { scanController } from "../controllers/scanController.js";

const router = express.Router();

router.post("/scan", upload.array("frames", 30), scanController);

export default router;