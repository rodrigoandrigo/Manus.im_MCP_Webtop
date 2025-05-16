export interface MouseMovePayload {
  x: number;
  y: number;
}

export interface MouseClickPayload {
  button?: "left" | "right" | "middle";
  double?: boolean;
  x?: number;
  y?: number;
}

export interface MouseScrollPayload {
  direction: "up" | "down";
  amount: number;
}

export interface KeyboardTypePayload {
  text: string;
}

export interface KeyboardPressPayload {
  key: string;
  modifiers?: string[];
}

export interface ScreenCaptureParams {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
}

export interface ApiResponse<T = any> {
  status: "success" | "error";
  message?: string;
  data?: T;
}

