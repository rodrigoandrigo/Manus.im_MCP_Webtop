import { Router } from "express";
import { handleTypeText, handlePressKey } from "../controllers/keyboardController";

const router = Router();

router.post("/type", handleTypeText);
router.post("/press", handlePressKey);

export default router;

