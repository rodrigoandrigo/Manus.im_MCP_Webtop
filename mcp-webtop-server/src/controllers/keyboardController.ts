import { Request, Response, NextFunction } from "express";
import { KeyboardTypePayload, KeyboardPressPayload, ApiResponse } from "../types";
import { typeText, pressKey } from "../services/robotService";

export const handleTypeText = async (req: Request<{}, ApiResponse, KeyboardTypePayload>, res: Response<ApiResponse>, next: NextFunction): Promise<void> => {
  try {
    const { text } = req.body;
    if (typeof text !== "string") {
      res.status(400).json({ status: "error", message: "Invalid payload. Text must be a string." });
      return;
    }
    const result = await typeText(text);
    if (result.success) {
      res.status(200).json({ status: "success", message: result.message });
    } else {
      res.status(500).json({ status: "error", message: result.message });
    }
  } catch (error: any) {
    console.error("Error in keyboardController handleTypeText:", error);
    res.status(500).json({ status: "error", message: error.message || "Failed to type text" });
  }
};

export const handlePressKey = async (req: Request<{}, ApiResponse, KeyboardPressPayload>, res: Response<ApiResponse>, next: NextFunction): Promise<void> => {
  try {
    const { key, modifiers } = req.body;
    if (typeof key !== "string") {
      res.status(400).json({ status: "error", message: "Invalid payload. Key must be a string." });
      return;
    }
    if (modifiers && !Array.isArray(modifiers)) {
        res.status(400).json({ status: "error", message: "Invalid payload. Modifiers must be an array of strings." });
        return;
    }
    const result = await pressKey(key, modifiers);
    if (result.success) {
      res.status(200).json({ status: "success", message: result.message });
    } else {
      res.status(500).json({ status: "error", message: result.message });
    }
  } catch (error: any) {
    console.error("Error in keyboardController handlePressKey:", error);
    res.status(500).json({ status: "error", message: error.message || "Failed to press key" });
  }
};

