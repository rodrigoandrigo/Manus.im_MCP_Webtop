// src/toolDefinitions.ts

// Interfaces para os parâmetros de entrada das ferramentas

export interface NavigateInput {
  url: string;
}

export interface TakeScreenshotInput {
  path: string;
}

export interface MoveMouseInput {
  x: number;
  y: number;
}

export interface MouseClickInput {
  button?: "left" | "right" | "middle";
  doubleClick?: boolean;
}

export interface TypeStringInput {
  text: string;
}

export interface KeyTapInput {
  key: string;
  modifier?: string | string[];
}

export interface CaptureScreenInput {
  path: string; // Caminho para salvar a imagem
  x?: number;
  y?: number;
  width?: number;
  height?: number;
}

export interface ScrollMouseInput {
  x: number; // quantidade de scroll horizontal (pixels)
  y: number; // quantidade de scroll vertical (pixels)
}

export interface DragMouseInput {
  x: number;
  y: number;
}

// Schemas JSON para o MCP SDK

export const puppeteerNavigateSchema = {
  type: "object",
  properties: {
    url: { type: "string", description: "A URL para a qual navegar." },
  },
  required: ["url"],
};

export const puppeteerTakeScreenshotSchema = {
  type: "object",
  properties: {
    path: { type: "string", description: "Caminho absoluto para salvar o screenshot (ex: /tmp/screenshot.png)." },
  },
  required: ["path"],
};

export const puppeteerGetTitleSchema = {
  type: "object",
  properties: {},
};

export const robotjsGetScreenSizeSchema = {
  type: "object",
  properties: {},
};

export const robotjsMoveMouseSchema = {
  type: "object",
  properties: {
    x: { type: "number", description: "Coordenada X para mover o mouse." },
    y: { type: "number", description: "Coordenada Y para mover o mouse." },
  },
  required: ["x", "y"],
};

export const robotjsMouseClickSchema = {
  type: "object",
  properties: {
    button: { type: "string", enum: ["left", "right", "middle"], default: "left", description: "Botão do mouse a ser clicado." },
    doubleClick: { type: "boolean", default: false, description: "Se deve ser um clique duplo." },
  },
};

export const robotjsTypeStringSchema = {
  type: "object",
  properties: {
    text: { type: "string", description: "O texto a ser digitado." },
  },
  required: ["text"],
};

export const robotjsKeyTapSchema = {
  type: "object",
  properties: {
    key: { type: "string", description: "A tecla a ser pressionada (ex: 'enter', 'a')." },
    modifier: { type: ["string", "array"], items: { type: "string" }, description: "Modificador(es) (ex: 'control', ['shift', 'alt'])." },
  },
  required: ["key"],
};

export const robotjsCaptureScreenSchema = {
  type: "object",
  properties: {
    path: { type: "string", description: "Caminho absoluto para salvar a imagem (ex: /tmp/screenshot.png)." },
    x: { type: "number", description: "Coordenada X inicial da região (opcional)." },
    y: { type: "number", description: "Coordenada Y inicial da região (opcional)." },
    width: { type: "number", description: "Largura da região (opcional)." },
    height: { type: "number", description: "Altura da região (opcional)." },
  },
  required: ["path"],
};

export const robotjsGetMousePosSchema = {
    type: "object",
    properties: {},
};

export const robotjsScrollMouseSchema = {
    type: "object",
    properties: {
        x: { type: "number", description: "Quantidade de scroll horizontal em pixels." },
        y: { type: "number", description: "Quantidade de scroll vertical em pixels." },
    },
    required: ["x", "y"],
};

export const robotjsDragMouseSchema = {
    type: "object",
    properties: {
        x: { type: "number", description: "Coordenada X final para arrastar o mouse." },
        y: { type: "number", description: "Coordenada Y final para arrastar o mouse." },
    },
    required: ["x", "y"],
};


console.log("Definições de interface de ferramentas atualizadas em src/toolDefinitions.ts");

