// src/controllers/robotjsController.ts
import robot from 'robotjs';
import Jimp from 'jimp';

export class RobotjsController {
  constructor() {
    // RobotJS não requer inicialização assíncrona complexa como o Puppeteer
    // Configurações iniciais podem ser feitas aqui, se necessário
    // robot.setMouseDelay(2); // Exemplo: pequeno delay para movimentos do mouse
  }

  getScreenSize(): { width: number; height: number } {
    const screenSize = robot.getScreenSize();
    console.log(`Tamanho da tela detectado: ${screenSize.width}x${screenSize.height}`);
    return screenSize;
  }

  moveMouse(x: number, y: number): void {
    try {
      robot.moveMouse(x, y);
      console.log(`Mouse movido para: (${x}, ${y})`);
    } catch (error) {
      console.error(`Erro ao mover o mouse para (${x}, ${y}):`, error);
      throw error;
    }
  }

  mouseClick(button: 'left' | 'right' | 'middle' = 'left', doubleClick: boolean = false): void {
    try {
      robot.mouseClick(button, doubleClick);
      console.log(`Mouse clicado: ${button}${doubleClick ? ' (duplo)' : ''}`);
    } catch (error) {
      console.error(`Erro ao clicar com o mouse (${button}):`, error);
      throw error;
    }
  }

  typeString(text: string): void {
    try {
      robot.typeString(text);
      console.log(`Texto digitado: ${text}`);
    } catch (error) {
      console.error(`Erro ao digitar texto "${text}":`, error);
      throw error;
    }
  }

  keyTap(key: string, modifier?: string | string[]): void {
    try {
      if (modifier) {
        robot.keyTap(key, modifier);
        console.log(`Tecla pressionada: ${key} com modificador(es): ${modifier}`);
      } else {
        robot.keyTap(key);
        console.log(`Tecla pressionada: ${key}`);
      }
    } catch (error) {
      console.error(`Erro ao pressionar tecla "${key}":`, error);
      throw error;
    }
  }

  async captureAndSaveScreen(filePath: string, x?: number, y?: number, width?: number, height?: number): Promise<void> {
    try {
      const bitmap = robot.screen.capture(x, y, width, height);
      console.log(`Tela capturada (bitmap). Dimensões: ${bitmap.width}x${bitmap.height}. Tentando salvar em: ${filePath}`);
      
      // RobotJS retorna a imagem com canais BGR e Alpha no final (BGRA)
      // Jimp espera RGBA. Precisamos converter BGRA para RGBA.
      const image = new Jimp(bitmap.width, bitmap.height);
      let k = 0;
      for (let j = 0; j < bitmap.height; j++) {
        for (let i = 0; i < bitmap.width; i++) {
          const r = bitmap.image.readUInt8(k + 2);
          const g = bitmap.image.readUInt8(k + 1);
          const b = bitmap.image.readUInt8(k + 0);
          const a = bitmap.image.readUInt8(k + 3);
          image.setPixelColor(Jimp.rgbaToInt(r, g, b, a), i, j);
          k += 4;
        }
      }

      await image.writeAsync(filePath);
      console.log(`Screenshot salvo com sucesso em: ${filePath}`);
    } catch (error) {
      console.error(`Erro ao capturar e salvar a tela com RobotJS e Jimp em ${filePath}:`, error);
      throw error;
    }
  }

  // TODO: Adicionar mais métodos de controle do RobotJS conforme necessário
  // Ex: arrastar mouse, scroll, etc.
  getMousePos(): { x: number; y: number } {
    const pos = robot.getMousePos();
    console.log(`Posição atual do mouse: (${pos.x}, ${pos.y})`);
    return pos;
  }

  scrollMouse(x: number, y: number): void {
    try {
      robot.scrollMouse(x, y);
      console.log(`Scroll do mouse: x=${x}, y=${y}`);
    } catch (error) {
      console.error(`Erro ao fazer scroll com o mouse (x=${x}, y=${y}):`, error);
      throw error;
    }
  }

  dragMouse(x: number, y: number): void {
    try {
      robot.dragMouse(x, y);
      console.log(`Mouse arrastado para: (${x}, ${y})`);
    } catch (error) {
      console.error(`Erro ao arrastar o mouse para (${x}, ${y}):`, error);
      throw error;
    }
  }
}

