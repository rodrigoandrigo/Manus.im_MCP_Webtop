import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import puppeteer from 'puppeteer';
import robot from 'robotjs';
import { PNG } from 'pngjs';
import fs from 'fs';

// Funções de utilidade
async function moveMouse(x, y) {
  console.log(`Movendo mouse para: ${x}, ${y}`);
  robot.moveMouse(x,y);
  return { success: true, message: `Mouse movido para ${x}, ${y}` };
}

async function clickMouse(button = 'left', double = false) {
  console.log(`Clicando mouse: ${button}, double: ${double}`);
  robot.mouseClick(button, double);
  return { success: true, message: `Mouse clicado: ${button}, double: ${double}` };
}

async function scrollMouse(x, y) {
  console.log(`Rolando mouse para: ${x}, ${y}`);
  robot.scrollMouse(x,y);
  return { success: true, message: `Mouse rolado para ${x}, ${y}` };
}

async function typeKeyboard(text) {
  console.log(`Digitando texto: ${text}`);
  robot.typeString(text);
  return { success: true, message: `Texto digitado: ${text}` };
}

async function keyTap(key, modifier) {
  console.log(`Pressionando tecla: ${key}, modificador: ${modifier}`);
  if (modifier && modifier.length > 0) {
    robot.keyTap(key, modifier);
  } else {
    robot.keyTap(key);
  }
  return { success: true, message: `Tecla pressionada: ${key}` };
}

async function listWindows() {
  console.log('Listando janelas...');
  // robotjs não tem uma forma direta de listar todas as janelas com títulos em todos os SOs.
  // Esta funcionalidade pode ser limitada ou requerer abordagens específicas do SO.
  // Tentativa de obter a janela ativa como um proxy limitado.
  try {
    const activeWindow = robot.getActiveWindow();
    if (activeWindow) {
        // A informação disponível pode variar muito entre sistemas operacionais
        const title = activeWindow.title; // Pode ser indefinido ou vazio
        const pid = activeWindow.pid; // Pode ser indefinido
        return { success: true, windows: [{ title: title || 'Janela Ativa (título não disponível)', pid: pid || 'N/A' }], message: 'Retornada a janela ativa. Listagem completa de janelas não é suportada de forma robusta por robotjs.' };
    } else {
        return { success: false, message: 'Não foi possível obter a janela ativa.' };
    }
  } catch (error) {
    console.error('Erro ao tentar obter janela ativa para listagem:', error);
    return { success: false, message: 'Erro ao tentar listar janelas via janela ativa.', error: error.message };
  }
}

async function getActiveWindow() {
  console.log('Obtendo janela ativa...');
  try {
    const activeWindow = robot.getActiveWindow();
    if (activeWindow) {
      const title = activeWindow.title;
      const pid = activeWindow.pid;
      return { success: true, window: { title: title || 'Título não disponível', pid: pid || 'PID não disponível' } };
    } else {
      return { success: false, message: 'Não foi possível obter a janela ativa.' };
    }
  } catch (error) {
    console.error('Erro ao obter janela ativa:', error);
    return { success: false, message: 'Erro ao obter janela ativa.', error: error.message };
  }
}

async function captureScreen(filePath) {
  console.log(`Capturando tela para: ${filePath}`);
  try {
    const screenSize = robot.getScreenSize();
    const img = robot.screen.capture(0, 0, screenSize.width, screenSize.height);
    
    // img.image é um Buffer contendo os dados RGBA da imagem
    // Precisamos converter para o formato PNG
    const png = new PNG({
      width: img.width,
      height: img.height,
      filterType: -1 // Autodetectar tipo de filtro
    });

    // robotjs retorna BGRA, mas pngjs espera RGBA. Precisamos converter.
    for (let i = 0; i < img.image.length; i += 4) {
      const b = img.image[i];
      const g = img.image[i + 1];
      const r = img.image[i + 2];
      // const a = img.image[i + 3]; // Alpha, geralmente 255
      png.data[i] = r;
      png.data[i + 1] = g;
      png.data[i + 2] = b;
      png.data[i + 3] = img.image[i+3]; // Alpha
    }

    await new Promise((resolve, reject) => {
      const stream = png.pack().pipe(fs.createWriteStream(filePath));
      stream.on('finish', resolve);
      stream.on('error', reject);
    });

    return { success: true, message: `Tela capturada e salva em ${filePath}`, filePath: filePath };
  } catch (error) {
    console.error('Erro ao capturar ou salvar tela:', error);
    return { success: false, message: 'Erro ao capturar ou salvar tela.', error: error.message };
  }
}


const server = new Server(new StdioServerTransport());

server.setContext({ 
    browser: null,
    page: null
});

async function initPuppeteer(context) {
  if (!context.browser) {
    try {
      console.log('Inicializando Puppeteer...');
      context.browser = await puppeteer.launch({ 
        headless: false, // Para interagir com o webtop visível
        args: [
          '--no-sandbox', 
          '--disable-setuid-sandbox', 
          '--disable-dev-shm-usage', // Comum em ambientes Docker
          '--remote-debugging-port=9222', // Para inspeção, se necessário
          `--window-size=${robot.getScreenSize().width},${robot.getScreenSize().height}` // Abrir com tamanho da tela
        ]
      });
      context.page = await context.browser.newPage();
      await context.page.setViewport({ width: robot.getScreenSize().width, height: robot.getScreenSize().height });
      console.log('Navegando para http://localhost:3000/');
      await context.page.goto('http://localhost:3000/', { waitUntil: 'networkidle0', timeout: 60000 });
      console.log('Puppeteer inicializado e conectado a http://localhost:3000/');
    } catch (error) {
        console.error('Falha ao inicializar o Puppeteer:', error);
        // Se o Puppeteer falhar, as ferramentas que dependem dele não funcionarão corretamente.
        // O servidor MCP ainda pode funcionar para ferramentas baseadas apenas em robotjs.
        // Considerar lançar um erro ou ter um estado de falha mais explícito.
        if (context.browser) {
            await context.browser.close();
            context.browser = null;
            context.page = null;
        }
        throw new Error(`Falha ao inicializar Puppeteer: ${error.message}`);
    }
  }
}

// Ferramentas MCP
server.tools.define('mouse_move', {
  description: 'Move o cursor do mouse para as coordenadas X e Y especificadas.',
  inputSchema: {
    type: 'object',
    properties: {
      x: { type: 'integer', description: 'Coordenada X' },
      y: { type: 'integer', description: 'Coordenada Y' },
    },
    required: [('x'), ('y')],
  },
  execute: async (context, { x, y }) => {
    await initPuppeteer(context); 
    return await moveMouse(x, y);
  },
});

server.tools.define('mouse_click', {
  description: 'Executa um clique do mouse. Opcionalmente, especifica o botão e clique duplo.',
  inputSchema: {
    type: 'object',
    properties: {
      button: { type: 'string', enum: [('left'), ('right'), ('middle')], default: 'left', description: 'Botão do mouse a ser clicado.' },
      doubleClick: { type: 'boolean', default: false, description: 'Se deve ser um clique duplo.' },
    },
  },
  execute: async (context, { button, doubleClick }) => {
    await initPuppeteer(context);
    return await clickMouse(button, doubleClick);
  },
});

server.tools.define('mouse_drag', {
    description: 'Clica e arrasta o mouse de uma posição inicial para uma posição final.',
    inputSchema: {
        type: 'object',
        properties: {
            startX: { type: 'integer', description: 'Coordenada X inicial.' },
            startY: { type: 'integer', description: 'Coordenada Y inicial.' },
            endX: { type: 'integer', description: 'Coordenada X final.' },
            endY: { type: 'integer', description: 'Coordenada Y final.' },
            button: { type: 'string', enum: [('left'), ('right'), ('middle')], default: 'left', description: 'Botão do mouse a ser usado.' },
        },
        required: [('startX'), ('startY'), ('endX'), ('endY')],
    },
    execute: async (context, { startX, startY, endX, endY, button }) => {
        await initPuppeteer(context);
        robot.moveMouse(startX, startY);
        robot.mouseToggle('down', button);
        robot.dragMouse(endX, endY);
        robot.mouseToggle('up', button);
        return { success: true, message: `Mouse arrastado de ${startX},${startY} para ${endX},${endY} com o botão ${button}` };
    },
});

server.tools.define('mouse_scroll', {
  description: 'Rola a roda do mouse horizontalmente e verticalmente.',
  inputSchema: {
    type: 'object',
    properties: {
      x: { type: 'integer', description: 'Quantidade de rolagem horizontal (pixels). Valores negativos rolam para a esquerda, positivos para a direita.' },
      y: { type: 'integer', description: 'Quantidade de rolagem vertical (pixels). Valores negativos rolam para cima, positivos para baixo.' },
    },
    required: [('x'), ('y')],
  },
  execute: async (context, { x, y }) => {
    await initPuppeteer(context);
    return await scrollMouse(x, y);
  },
});

server.tools.define('keyboard_type_string', {
  description: 'Digita a string de texto fornecida.',
  inputSchema: {
    type: 'object',
    properties: {
      text: { type: 'string', description: 'O texto a ser digitado.' },
    },
    required: [('text')],
  },
  execute: async (context, { text }) => {
    await initPuppeteer(context);
    return await typeKeyboard(text);
  },
});

server.tools.define('keyboard_key_tap', {
  description: 'Pressiona uma tecla específica, opcionalmente com modificadores (shift, control, alt, command).',
  inputSchema: {
    type: 'object',
    properties: {
      key: { type: 'string', description: 'A tecla a ser pressionada (ex: \'enter\', \'a\', \'f1\', \'space\'). Veja a documentação do robotjs para todas as teclas.' },
      modifier: { type: 'array', items: { type: 'string', enum: [('alt'), ('command'), ('control'), ('shift'), ('win')] }, description: 'Uma lista de modificadores (ex: [\'shift\', \'control\']).' },
    },
    required: [('key')],
  },
  execute: async (context, { key, modifier }) => {
    await initPuppeteer(context);
    return await keyTap(key, modifier);
  },
});

server.tools.define('keyboard_key_toggle', {
    description: 'Mantém uma tecla pressionada ou a solta.',
    inputSchema: {
        type: 'object',
        properties: {
            key: { type: 'string', description: 'A tecla a ser pressionada/solta.' },
            downOrUp: { type: 'string', enum: [('down'), ('up')], description: 'Se a tecla deve ser pressionada (down) ou solta (up).' },
            modifier: { type: 'array', items: { type: 'string', enum: [('alt'), ('command'), ('control'), ('shift'), ('win')] }, description: 'Modificadores a serem usados.' },
        },
        required: [('key'), ('downOrUp')],
    },
    execute: async (context, { key, downOrUp, modifier }) => {
        await initPuppeteer(context);
        robot.keyToggle(key, downOrUp, modifier || []);
        return { success: true, message: `Tecla ${key} ${downOrUp} ${modifier ? 'com modificador(es)' : ''}` };
    },
});

server.tools.define('window_list_all', {
  description: 'Lista todas as janelas abertas. (Funcionalidade limitada com robotjs, retorna principalmente a janela ativa)',
  inputSchema: { type: 'object', properties: {} },
  execute: async (context) => {
    // initPuppeteer não é estritamente necessário aqui, mas garante que o contexto do webtop esteja ativo se for relevante
    // await initPuppeteer(context); 
    return await listWindows();
  },
});

server.tools.define('window_get_active', {
  description: 'Obtém informações sobre a janela atualmente ativa.',
  inputSchema: { type: 'object', properties: {} },
  execute: async (context) => {
    // await initPuppeteer(context);
    return await getActiveWindow();
  },
});

server.tools.define('window_focus', {
    description: 'Tenta focar uma janela pelo seu PID (Process ID). (Funcionalidade depende do SO e pode não funcionar via robotjs).',
    inputSchema: {
        type: 'object',
        properties: {
            pid: { type: 'integer', description: 'O PID da janela para focar.' },
        },
        required: [('pid')],
    },
    execute: async (context, { pid }) => {
        // robotjs não tem uma função direta robot.focusWindow(pid). 
        // Esta é uma limitação conhecida. A interação com janelas específicas por PID é complexa e dependente do SO.
        // Puppeteer controla o foco dentro do browser que ele lançou.
        // Para focar o browser do webtop, a inicialização do puppeteer já faz isso.
        await initPuppeteer(context); 
        if (context.page) {
            await context.page.bringToFront(); // Traz a página do Puppeteer para frente
            return { success: true, message: `Tentativa de focar a janela do browser (webtop). Foco de PID específico (${pid}) não suportado diretamente.` };
        } else {
            return { success: false, message: 'Puppeteer não inicializado, não é possível focar a janela do browser.' };
        }
    },
});

server.tools.define('screen_capture', {
  description: 'Captura a tela inteira e salva em um arquivo PNG.',
  inputSchema: {
    type: 'object',
    properties: {
      filePath: { type: 'string', description: 'O caminho do arquivo para salvar a captura de tela (ex: /home/ubuntu/screenshot.png). Deve terminar com .png' },
    },
    required: [('filePath')],
  },
  execute: async (context, { filePath }) => {
    // initPuppeteer não é estritamente necessário para captura de tela inteira com robotjs,
    // mas se a intenção é capturar o webtop, é bom que ele esteja ativo.
    // await initPuppeteer(context); 
    if (!filePath.endsWith('.png')) {
        return { success: false, message: 'O caminho do arquivo deve terminar com .png' };
    }
    return await captureScreen(filePath);
  },
});

console.log('Servidor MCP iniciado. Aguardando comandos via StdioTransport...');

// Adiciona um handler para garantir que o Puppeteer seja fechado ao sair
async function cleanup() {
  if (server && server.context && server.context.browser) {
    console.log('Fechando o Puppeteer...');
    try {
      await server.context.browser.close();
      console.log('Puppeteer fechado.');
    } catch (e) {
      console.error('Erro ao fechar o Puppeteer:', e);
    }
  }
}

process.on('exit', cleanup);
process.on('SIGINT', async () => {
  console.log('Recebido SIGINT. Encerrando...');
  await cleanup();
  process.exit(0);
});
process.on('SIGTERM', async () => {
  console.log('Recebido SIGTERM. Encerrando...');
  await cleanup();
  process.exit(0);
});

// Inicia o servidor
server.listen();

