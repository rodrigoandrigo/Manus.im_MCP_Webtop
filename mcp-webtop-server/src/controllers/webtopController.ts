import { Request, Response, NextFunction } from 'express';
import { initializePuppeteer, closePuppeteer } from '../services/puppeteerService';
import { ApiResponse } from '../types';

export const initializeWebtop = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await initializePuppeteer();
    if (result.success) {
      const response: ApiResponse = { status: 'success', message: result.message };
      res.status(200).json(response);
    } else {
      const response: ApiResponse = { status: 'error', message: result.message };
      res.status(500).json(response);
    }
  } catch (error: any) {
    console.error('Error in webtopController initializeWebtop:', error);
    const response: ApiResponse = { status: 'error', message: error.message || 'Failed to initialize webtop' };
    res.status(500).json(response);
    // next(error); // Pass to global error handler if preferred
  }
};

// Optional: Endpoint to close puppeteer gracefully if needed, though not in the original plan
export const shutdownWebtop = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await closePuppeteer();
    const response: ApiResponse = { status: 'success', message: 'Webtop (Puppeteer) shutdown successfully.' };
    res.status(200).json(response);
  } catch (error: any) {
    console.error('Error in webtopController shutdownWebtop:', error);
    const response: ApiResponse = { status: 'error', message: error.message || 'Failed to shutdown webtop' };
    res.status(500).json(response);
    // next(error);
  }
};

