import { Request, Response, NextFunction } from "express";
import { ScreenCaptureParams, ApiResponse } from "../types";
import { getScreenSize, captureScreen } from "../services/robotService";

export const handleGetScreenSize = async (req: Request, res: Response<ApiResponse<{width: number, height: number}>>, next: NextFunction): Promise<void> => {
  try {
    const result = await getScreenSize();
    if (result.success && typeof result.width === "number" && typeof result.height === "number") {
      res.status(200).json({ status: "success", data: { width: result.width, height: result.height }, message: result.message });
    } else {
      res.status(500).json({ status: "error", message: result.message || "Failed to get screen size." });
    }
  } catch (error: any) {
    console.error("Error in screenController handleGetScreenSize:", error);
    res.status(500).json({ status: "error", message: error.message || "Failed to get screen size" });
  }
};

export const handleCaptureScreen = async (req: Request<{}, ApiResponse<{image: string}>, {}, ScreenCaptureParams>, res: Response<ApiResponse<{image: string}>>, next: NextFunction): Promise<void> => {
  try {
    const { x, y, width, height } = req.query;
    
    const xNum = x ? parseInt(x as string, 10) : undefined;
    const yNum = y ? parseInt(y as string, 10) : undefined;
    const widthNum = width ? parseInt(width as string, 10) : undefined;
    const heightNum = height ? parseInt(height as string, 10) : undefined;

    if ((x && isNaN(xNum)) || (y && isNaN(yNum)) || (width && isNaN(widthNum)) || (height && isNaN(heightNum))) {
        res.status(400).json({ status: "error", message: "Invalid query parameters for screen capture. x, y, width, height must be numbers if provided." });
        return;
    }

    const result = await captureScreen(xNum, yNum, widthNum, heightNum);
    if (result.success && result.image) {
      res.status(200).json({ status: "success", data: { image: result.image }, message: result.message });
    } else {
      res.status(500).json({ status: "error", message: result.message || "Failed to capture screen." });
    }
  } catch (error: any) {
    console.error("Error in screenController handleCaptureScreen:", error);
    res.status(500).json({ status: "error", message: error.message || "Failed to capture screen" });
  }
};

