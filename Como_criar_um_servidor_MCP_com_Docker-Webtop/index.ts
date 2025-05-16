// src/index.ts
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { PuppeteerController } from "./controllers/puppeteerController.js";
import { RobotjsController } from "./controllers/robotjsController.js";
import {
  NavigateInput,
  TakeScreenshotInput,
  MoveMouseInput,
  MouseClickInput,
  TypeStringInput,
  KeyTapInput,
  CaptureScreenInput,
  ScrollMouseInput,
  DragMouseInput,
  puppeteerNavigateSchema,
  puppeteerTakeScreenshotSchema,
  puppeteerGetTitleSchema,
  robotjsGetScreenSizeSchema,
  robotjsMoveMouseSchema,
  robotjsMouseClickSchema,
  robotjsTypeStringSchema,
  robotjsKeyTapSchema,
  robotjsCaptureScreenSchema,
  robotjsGetMousePosSchema,
  robotjsScrollMouseSchema,
  robotjsDragMouseSchema
} from "./toolDefinitions.js";

// --- Instanciar Controladores ---
const puppeteerController = new PuppeteerController();
const robotjsController = new RobotjsController();

async function main() {
  console.log("Iniciando servidor MCP para Docker-Webtop...");

  // --- Inicializar Puppeteer ---
  try {
    await puppeteerController.launchBrowser();
  } catch (error) {
    console.error("Falha ao iniciar o Puppeteer durante a inicialização do servidor:", error);
  }

  // --- Criar Servidor MCP ---
  const server = new McpServer({
    name: "MCPWebtopServer",
    version: "1.0.0",
    description: "Servidor MCP para controlar Docker-Webtop com Puppeteer e RobotJS"
  });

  // --- Definir e Adicionar Ferramentas (Capabilities) ---
  const toolDefinitions = {
    "puppeteer_navigate": {
      description: "Navega o browser Puppeteer para uma URL específica.",
      inputSchema: puppeteerNavigateSchema,
      handler: async (params: NavigateInput) => {
        try {
          await puppeteerController.navigate(params.url);
          return { content: [{ type: "text", text: `Navegado com sucesso para: ${params.url}` }] };
        } catch (e: any) {
          return { content: [{ type: "text", text: `Erro ao navegar para ${params.url}: ${e.message}` }] };
        }
      },
    },
    "puppeteer_take_screenshot": {
      description: "Tira um screenshot da página atual do Puppeteer e salva no caminho especificado.",
      inputSchema: puppeteerTakeScreenshotSchema,
      handler: async (params: TakeScreenshotInput) => {
        try {
          await puppeteerController.takeScreenshot(params.path);
          return { content: [{ type: "text", text: `Screenshot salvo em: ${params.path}` }] };
        } catch (e: any) {
          return { content: [{ type: "text", text: `Erro ao tirar screenshot: ${e.message}` }] };
        }
      },
    },
    "puppeteer_get_title": {
      description: "Obtém o título da página atual do Puppeteer.",
      inputSchema: puppeteerGetTitleSchema, // Assuming empty schema is okay
      handler: async () => {
        try {
          const title = await puppeteerController.getPageTitle();
          return { content: [{ type: "text", text: `Título da página: ${title}` }] };
        } catch (e: any) {
          return { content: [{ type: "text", text: `Erro ao obter título da página: ${e.message}` }] };
        }
      },
    },
    "robotjs_get_screen_size": {
      description: "Obtém o tamanho da tela (largura e altura).",
      inputSchema: robotjsGetScreenSizeSchema, // Assuming empty schema is okay
      handler: async () => {
        try {
          const size = robotjsController.getScreenSize();
          return { content: [{ type: "text", text: `Tamanho da tela: ${size.width}x${size.height}` }] };
        } catch (e: any) {
          return { content: [{ type: "text", text: `Erro ao obter tamanho da tela: ${e.message}` }] };
        }
      },
    },
    "robotjs_move_mouse": {
      description: "Move o cursor do mouse para as coordenadas X e Y especificadas.",
      inputSchema: robotjsMoveMouseSchema,
      handler: async (params: MoveMouseInput) => {
        try {
          robotjsController.moveMouse(params.x, params.y);
          return { content: [{ type: "text", text: `Mouse movido para (${params.x}, ${params.y}).` }] };
        } catch (e: any) {
          return { content: [{ type: "text", text: `Erro ao mover o mouse: ${e.message}` }] };
        }
      },
    },
    "robotjs_mouse_click": {
      description: "Executa um clique do mouse na posição atual.",
      inputSchema: robotjsMouseClickSchema,
      handler: async (params: MouseClickInput) => {
        try {
          robotjsController.mouseClick(params.button, params.doubleClick);
          return { content: [{ type: "text", text: `Mouse clicado (${params.button || "left"}${params.doubleClick ? ", duplo" : ""}).` }] };
        } catch (e: any) {
          return { content: [{ type: "text", text: `Erro ao clicar com o mouse: ${e.message}` }] };
        }
      },
    },
    "robotjs_type_string": {
      description: "Digita a string de texto fornecida.",
      inputSchema: robotjsTypeStringSchema,
      handler: async (params: TypeStringInput) => {
        try {
          robotjsController.typeString(params.text);
          return { content: [{ type: "text", text: `Texto digitado: \"${params.text}\"` }] };
        } catch (e: any) {
          return { content: [{ type: "text", text: `Erro ao digitar texto: ${e.message}` }] };
        }
      },
    },
    "robotjs_key_tap": {
      description: "Pressiona uma tecla especificada, com modificadores opcionais.",
      inputSchema: robotjsKeyTapSchema,
      handler: async (params: KeyTapInput) => {
        try {
          robotjsController.keyTap(params.key, params.modifier);
          return { content: [{ type: "text", text: `Tecla '${params.key}' pressionada${params.modifier ? " com modificador(es) " + params.modifier : ""}.` }] };
        } catch (e: any) {
          return { content: [{ type: "text", text: `Erro ao pressionar tecla: ${e.message}` }] };
        }
      },
    },
    "robotjs_capture_screen": {
        description: "Captura a tela inteira ou uma região e salva em um arquivo PNG.",
        inputSchema: robotjsCaptureScreenSchema,
        handler: async (params: CaptureScreenInput) => {
            try {
                await robotjsController.captureAndSaveScreen(params.path, params.x, params.y, params.width, params.height);
                return { content: [{ type: "text", text: `Captura de tela salva em: ${params.path}` }] };
            } catch (e: any) {
                return { content: [{ type: "text", text: `Erro ao capturar e salvar tela com RobotJS: ${e.message}` }] };
            }
        },
    },
    "robotjs_get_mouse_position": {
        description: "Obtém a posição atual do cursor do mouse.",
        inputSchema: robotjsGetMousePosSchema, // Assuming empty schema is okay
        handler: async () => {
            try {
                const pos = robotjsController.getMousePos();
                return { content: [{ type: "text", text: `Posição atual do mouse: (${pos.x}, ${pos.y}).` }] };
            } catch (e: any) {
                return { content: [{ type: "text", text: `Erro ao obter posição do mouse: ${e.message}` }] };
            }
        },
    },
    "robotjs_scroll_mouse": {
        description: "Rola o scroll do mouse horizontalmente e/ou verticalmente.",
        inputSchema: robotjsScrollMouseSchema,
        handler: async (params: ScrollMouseInput) => {
            try {
                robotjsController.scrollMouse(params.x, params.y);
                return { content: [{ type: "text", text: `Scroll do mouse realizado: x=${params.x}, y=${params.y}.` }] };
            } catch (e: any) {
                return { content: [{ type: "text", text: `Erro ao realizar scroll do mouse: ${e.message}` }] };
            }
        },
    },
    "robotjs_drag_mouse": {
        description: "Clica e arrasta o mouse da posição atual para as coordenadas X e Y especificadas.",
        inputSchema: robotjsDragMouseSchema,
        handler: async (params: DragMouseInput) => {
            try {
                robotjsController.dragMouse(params.x, params.y);
                return { content: [{ type: "text", text: `Mouse arrastado para (${params.x}, ${params.y}).` }] };
            } catch (e: any) {
                return { content: [{ type: "text", text: `Erro ao arrastar o mouse: ${e.message}` }] };
            }
        },
    },
  };

  for (const [toolName, toolDef] of Object.entries(toolDefinitions)) {
    server.tool(toolName, toolDef.inputSchema as any, toolDef.handler as any);
  }

  // --- Conectar Transporte e Escutar ---
  const transport = new StdioServerTransport();
  
  // --- Graceful Shutdown ---
  const gracefulShutdown = async (signal: string) => {
    console.log(`Recebido ${signal}. Desligando servidor MCP...`);
    try {
      await puppeteerController.closeBrowser();
    } catch (error) {
      console.error("Erro durante o graceful shutdown do Puppeteer:", error);
    }
    // O SDK mais recente pode lidar com o fechamento do servidor de forma diferente.
    // A documentação sugere que `server.connect` bloqueia até que o transporte seja fechado.
    // Fechar o transporte pode ser a maneira correta de desligar.
    if (transport && typeof (transport as any).close === 'function') {
        (transport as any).close();
    }
    console.log("Servidor MCP e transporte STDIO (tentativa de) desligados.");
    process.exit(0);
  };

  process.on("SIGINT", () => gracefulShutdown("SIGINT"));
  process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));

  try {
    await server.connect(transport);
    console.log("Servidor MCP conectado ao transporte STDIO e escutando.");
  } catch (error) {
    console.error("Erro ao conectar o servidor MCP ao transporte:", error);
    await puppeteerController.closeBrowser();
    process.exit(1);
  }
}

main().catch(async error => {
  console.error("Erro inesperado na função main:", error);
  try {
    await puppeteerController.closeBrowser();
  } catch (shutdownError) {
    console.error("Erro ao fechar o Puppeteer após erro em main:", shutdownError);
  }
  process.exit(1);
});

