import { Router } from "express";
import { handleGetScreenSize, handleCaptureScreen } from "../controllers/screenController";

const router = Router();

router.get("/size", handleGetScreenSize);
router.get("/capture", handleCaptureScreen);

export default router;

