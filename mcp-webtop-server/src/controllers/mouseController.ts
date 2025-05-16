import { Request, Response, NextFunction } from 'express';
import { MouseMovePayload, MouseClickPayload, MouseScrollPayload, ApiResponse } from '../types';
import { moveMouse, clickMouse, scrollMouse } from '../services/robotService';

export const handleMoveMouse = async (req: Request<{}, ApiResponse, MouseMovePayload>, res: Response<ApiResponse>, next: NextFunction): Promise<void> => {
  try {
    const { x, y } = req.body;
    if (typeof x !== 'number' || typeof y !== 'number') {
      res.status(400).json({ status: 'error', message: 'Invalid coordinates provided. x and y must be numbers.' });
      return;
    }
    const result = await moveMouse(x, y);
    if (result.success) {
      res.status(200).json({ status: 'success', message: result.message });
    } else {
      res.status(500).json({ status: 'error', message: result.message });
    }
  } catch (error: any) {
    console.error('Error in mouseController handleMoveMouse:', error);
    res.status(500).json({ status: 'error', message: error.message || 'Failed to move mouse' });
  }
};

export const handleClickMouse = async (req: Request<{}, ApiResponse, MouseClickPayload>, res: Response<ApiResponse>, next: NextFunction): Promise<void> => {
  try {
    const { button, double, x, y } = req.body;
    // Basic validation for x and y if provided
    if ((typeof x !== 'undefined' && typeof x !== 'number') || (typeof y !== 'undefined' && typeof y !== 'number')) {
        res.status(400).json({ status: 'error', message: 'If provided, x and y must be numbers.' });
        return;
    }
    const result = await clickMouse(button, double, x, y);
    if (result.success) {
      res.status(200).json({ status: 'success', message: result.message });
    } else {
      res.status(500).json({ status: 'error', message: result.message });
    }
  } catch (error: any) {
    console.error('Error in mouseController handleClickMouse:', error);
    res.status(500).json({ status: 'error', message: error.message || 'Failed to click mouse' });
  }
};

export const handleScrollMouse = async (req: Request<{}, ApiResponse, MouseScrollPayload>, res: Response<ApiResponse>, next: NextFunction): Promise<void> => {
  try {
    const { direction, amount } = req.body;
    if (!['up', 'down'].includes(direction) || typeof amount !== 'number' || amount <= 0) {
      res.status(400).json({ status: 'error', message: 'Invalid scroll parameters. Direction must be up/down and amount a positive number.' });
      return;
    }
    const result = await scrollMouse(direction, amount);
    if (result.success) {
      res.status(200).json({ status: 'success', message: result.message });
    } else {
      res.status(500).json({ status: 'error', message: result.message });
    }
  } catch (error: any) {
    console.error('Error in mouseController handleScrollMouse:', error);
    res.status(500).json({ status: 'error', message: error.message || 'Failed to scroll mouse' });
  }
};

