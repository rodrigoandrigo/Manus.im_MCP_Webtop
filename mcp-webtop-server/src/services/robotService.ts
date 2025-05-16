import robot from "robotjs";
import { getPage } from "./puppeteerService"; // To get webtop viewport info

// --- Helper to get Webtop Viewport --- 

async function getWebtopViewport(): Promise<{ x: number; y: number; width: number; height: number; error?: string }> {
  const page = getPage();
  if (!page) {
    return { x: 0, y: 0, width: 0, height: 0, error: "Puppeteer page not initialized." };
  }
  try {
    const viewport = await page.evaluate(() => {
      const body = document.body;
      const rect = body.getBoundingClientRect();
      // Adjust for browser window chrome (title bar, toolbars, etc.)
      // These are estimates and might need calibration depending on the browser and OS.
      const chromeOffsetX = window.outerWidth - window.innerWidth;
      const chromeOffsetY = window.outerHeight - window.innerHeight;
      return {
        x: window.screenX + rect.left,
        y: window.screenY + rect.top,
        width: rect.width,
        height: rect.height,
      };
    });

    if (!viewport || typeof viewport.x === "undefined" || typeof viewport.y === "undefined") {
        console.warn("Failed to get precise viewport via page.evaluate. Using rough estimate based on page viewport.");
        const pageSize = page.viewport() || { width: 1280, height: 720 }; // Default if viewport not set
        // This is a very rough estimate assuming browser is at (0,0) of screen and has a 75px header.
        // This part is highly unreliable and should ideally be improved or calibrated.
        return { 
            x: 0, // Assuming browser window is at screen origin X
            y: 75, // Rough estimate for browser header height
            width: pageSize.width, 
            height: pageSize.height 
        };
    }
    // Further refinement: if puppeteer is not headless, window.screenX/Y are for the browser window.
    // We need to ensure the page (webtop) is focused for robotjs to work correctly.
    await page.bringToFront();
    return viewport;

  } catch (e: any) {
    console.error("Error getting webtop viewport:", e);
    return { x: 0, y: 0, width: 0, height: 0, error: `Failed to get viewport: ${e.message}` };
  }
}

// --- Mouse Control --- 

export const moveMouse = async (x: number, y: number): Promise<{success: boolean, message: string}> => {
  try {
    const viewport = await getWebtopViewport();
    if (viewport.error) return { success: false, message: viewport.error };

    const absoluteX = viewport.x + x;
    const absoluteY = viewport.y + y;

    if (x < 0 || x > viewport.width || y < 0 || y > viewport.height) {
        return { success: false, message: `Coordinates (${x},${y}) are outside the webtop viewport (${viewport.width}x${viewport.height}).` };
    }

    robot.moveMouse(absoluteX, absoluteY);
    console.log(`Mouse moved to webtop coordinates (${x}, ${y}), absolute (${absoluteX}, ${absoluteY})`);
    return { success: true, message: `Mouse moved to (${x}, ${y})` };
  } catch (error: any) {
    console.error("Error moving mouse:", error);
    return { success: false, message: `Error moving mouse: ${error.message}` };
  }
};

export const clickMouse = async (button: "left" | "right" | "middle" = "left", double: boolean = false, x?: number, y?: number): Promise<{success: boolean, message: string}> => {
  try {
    if (typeof x === "number" && typeof y === "number") {
      const moveResult = await moveMouse(x, y);
      if (!moveResult.success) {
        return moveResult;
      }
    }
    robot.mouseClick(button, double);
    console.log(`Mouse clicked: ${button}, double: ${double}`);
    return { success: true, message: `Mouse ${button} ${double ? "double " : ""}clicked` };
  } catch (error: any) {
    console.error("Error clicking mouse:", error);
    return { success: false, message: `Error clicking mouse: ${error.message}` };
  }
};

export const scrollMouse = (direction: "up" | "down", amount: number): Promise<{success: boolean, message: string}> => {
  return new Promise((resolve) => {
    try {
      const yDirection = direction === "up" ? -amount : amount;
      robot.scrollMouse(0, yDirection);
      console.log(`Mouse scrolled ${direction} by ${amount}`);
      resolve({ success: true, message: `Mouse scrolled ${direction} by ${amount}` });
    } catch (error: any) {
      console.error("Error scrolling mouse:", error);
      resolve({ success: false, message: `Error scrolling mouse: ${error.message}` });
    }
  });
};

// --- Keyboard Control --- 
export const typeText = async (text: string): Promise<{success: boolean, message: string}> => {
  try {
    const page = getPage();
    if (!page) return { success: false, message: "Puppeteer page not initialized." };
    await page.bringToFront(); // Ensure the webtop window is focused
    robot.typeString(text);
    console.log(`Text typed: ${text}`);
    return { success: true, message: `Text typed: ${text}` };
  } catch (error: any) {
    console.error("Error typing text:", error);
    return { success: false, message: `Error typing text: ${error.message}` };
  }
};

export const pressKey = async (key: string, modifiers?: string[]): Promise<{success: boolean, message: string}> => {
  try {
    const page = getPage();
    if (!page) return { success: false, message: "Puppeteer page not initialized." };
    await page.bringToFront(); // Ensure the webtop window is focused

    const validModifiers = ["alt", "control", "shift", "command"];
    const activeModifiers = modifiers?.filter(mod => validModifiers.includes(mod.toLowerCase())) || [];

    if (activeModifiers.length > 0) {
      robot.keyTap(key, activeModifiers);
      console.log(`Key pressed: ${key} with modifiers: ${activeModifiers.join("+")}`);
      return { success: true, message: `Key pressed: ${key} with modifiers: ${activeModifiers.join("+")}` };
    } else {
      robot.keyTap(key);
      console.log(`Key pressed: ${key}`);
      return { success: true, message: `Key pressed: ${key}` };
    }
  } catch (error: any) {
    console.error(`Error pressing key ${key}:`, error);
    return { success: false, message: `Error pressing key ${key}: ${error.message}` };
  }
};

// --- Screen Operations --- 
export const getScreenSize = async (): Promise<{success: boolean, message?: string, width?: number, height?: number}> => {
  try {
    const viewport = await getWebtopViewport();
    if (viewport.error) return { success: false, message: viewport.error };
    return { success: true, width: viewport.width, height: viewport.height };
  } catch (error: any) {
    console.error("Error getting screen size:", error);
    return { success: false, message: `Error getting screen size: ${error.message}` };
  }
};

export const captureScreen = async (x?: number, y?: number, width?: number, height?: number): Promise<{success: boolean, message?: string, image?: string}> => {
  try {
    const page = getPage();
    if (!page) return { success: false, message: "Puppeteer page not initialized." };
    await page.bringToFront(); // Ensure the webtop window is focused

    const viewport = await getWebtopViewport();
    if (viewport.error) return { success: false, message: viewport.error };

    let captureX = viewport.x;
    let captureY = viewport.y;
    let captureWidth = viewport.width;
    let captureHeight = viewport.height;

    if (typeof x === "number" && typeof y === "number" && typeof width === "number" && typeof height === "number") {
      // Capture a specific region within the webtop viewport
      captureX = viewport.x + x;
      captureY = viewport.y + y;
      captureWidth = width;
      captureHeight = height;
      // Basic boundary check for the sub-region
      if (x < 0 || y < 0 || x + width > viewport.width || y + height > viewport.height) {
        return { success: false, message: "Specified capture region is outside the webtop viewport." };
      }
    }

    const img = robot.screen.capture(captureX, captureY, captureWidth, captureHeight);
    // RobotJS returns a bitmap object. We need to convert it to a base64 string.
    // The bitmap object has width, height, byteWidth, bytesPerPixel, image (Buffer)
    // For simplicity, we'll assume it's RGBA (4 bytes per pixel) if not specified, though it's often BGRA.
    // RobotJS image buffer is BGRA. PNG is typically RGBA.
    // To create a valid PNG, we might need to swap B and R channels or use a library.
    // For now, let's try to provide the raw buffer as base64, but this might not be directly viewable as PNG.
    // A more robust solution would use a library like 'jimp' or 'sharp' to process the buffer into a PNG.
    
    // Correcting BGRA to RGBA for PNG encoding (simple manual swap)
    const correctedImageBuffer = Buffer.alloc(img.image.length);
    for (let i = 0; i < img.image.length; i += 4) {
        correctedImageBuffer[i] = img.image[i + 2]; // Blue to Red
        correctedImageBuffer[i + 1] = img.image[i + 1]; // Green to Green
        correctedImageBuffer[i + 2] = img.image[i];   // Red to Blue
        correctedImageBuffer[i + 3] = img.image[i + 3]; // Alpha to Alpha
    }
    
    // This is a simplified way to get a base64 string. For actual PNG, more processing is needed.
    // Using a library like 'pngjs' or 'sharp' would be better for robust PNG creation.
    // For now, this is a placeholder to demonstrate capturing the data.
    const base64Image = correctedImageBuffer.toString("base64");
    
    console.log(`Screen captured at absolute (${captureX}, ${captureY}) with size (${captureWidth}x${captureHeight})`);
    return { success: true, message: "Screen captured successfully (raw BGRA buffer as base64).", image: base64Image };

  } catch (error: any) {
    console.error("Error capturing screen:", error);
    return { success: false, message: `Error capturing screen: ${error.message}` };
  }
};

