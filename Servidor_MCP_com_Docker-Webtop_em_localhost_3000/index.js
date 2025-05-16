const http = require("http");
const express = require("express");
const puppeteer = require("puppeteer");
const robot = require("robotjs");

const app = express();
app.use(express.json()); // Para parsear JSON no corpo das requisições

const hostname = "127.0.0.1";
const port = 8080;

// Variáveis globais para o browser e page do Puppeteer
let pptrBrowser;
let pptrPage;

// Rota principal com link para Docker Webtop
app.get('/', (req, res) => {
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.send(`
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Servidor MCP - Computer Use</title>
      <style>
        body { font-family: sans-serif; margin: 20px; background-color: #f4f4f4; color: #333; }
        h1 { color: #0056b3; }
        a { color: #007bff; text-decoration: none; font-size: 1.2em; }
        a:hover { text-decoration: underline; }
        .container { background-color: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
        ul { list-style-type: none; padding: 0; }
        li { margin-bottom: 10px; }
        code { background-color: #e9e9e9; padding: 2px 5px; border-radius: 3px; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Servidor MCP "computer use"</h1>
        <p>Este servidor facilita o acesso aos recursos necessários e fornece APIs para automação.</p>
        <p><a href="http://localhost:3000/" target="_blank">Acessar Docker Webtop (http://localhost:3000/)</a></p>
        <h2>APIs Disponíveis:</h2>
        <h3>Puppeteer (Automação Web):</h3>
        <ul>
          <li><code>POST /puppeteer/start</code>: Inicia o navegador Puppeteer.</li>
          <li><code>POST /puppeteer/goto</code>: Navega para uma URL. Body: <code>{"url": "https://example.com"}</code></li>
          <li><code>POST /puppeteer/click</code>: Clica em um seletor. Body: <code>{"selector": "#myButton"}</code></li>
          <li><code>POST /puppeteer/type</code>: Digita texto em um seletor. Body: <code>{"selector": "#myInput", "text": "Olá Mundo"}</code></li>
          <li><code>GET /puppeteer/screenshot</code>: Captura um screenshot da página atual.</li>
          <li><code>POST /puppeteer/close</code>: Fecha o navegador Puppeteer.</li>
        </ul>
        <h3>RobotJS (Controle de Desktop):</h3>
        <ul>
          <li><code>POST /robot/movemouse</code>: Move o cursor do mouse. Body: <code>{"x": 100, "y": 100}</code></li>
          <li><code>POST /robot/mouseclick</code>: Clica com o mouse. Body: <code>{"button": "left", "double": false}</code> (opcional)</li>
          <li><code>POST /robot/typestring</code>: Digita uma string. Body: <code>{"text": "Olá do RobotJS"}</code></li>
          <li><code>POST /robot/keytap</code>: Pressiona uma tecla. Body: <code>{"key": "enter", "modifier": ["control"]}</code> (modifier opcional)</li>
        </ul>
      </div>
    </body>
    </html>
  `);
});

// --- Rotas Puppeteer ---
app.post('/puppeteer/start', async (req, res) => {
  try {
    if (!pptrBrowser) {
      pptrBrowser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
      pptrPage = await pptrBrowser.newPage();
      await pptrPage.setViewport({ width: 1280, height: 720 });
    }
    const screenshot = await pptrPage.screenshot({ encoding: 'base64' });
    res.json({ message: 'Puppeteer browser started and page ready.', screenshot });
  } catch (error) {
    console.error("Puppeteer start error:", error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/puppeteer/goto', async (req, res) => {
  const { url } = req.body;
  if (!pptrPage) return res.status(400).json({ error: 'Puppeteer not started. Call /puppeteer/start first.' });
  if (!url) return res.status(400).json({ error: 'URL is required.' });
  try {
    await pptrPage.goto(url, { waitUntil: 'networkidle2' });
    const screenshot = await pptrPage.screenshot({ encoding: 'base64' });
    res.json({ message: `Navigated to ${url}`, screenshot });
  } catch (error) {
    console.error("Puppeteer goto error:", error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/puppeteer/click', async (req, res) => {
  const { selector } = req.body;
  if (!pptrPage) return res.status(400).json({ error: 'Puppeteer not started.' });
  if (!selector) return res.status(400).json({ error: 'Selector is required.' });
  try {
    await pptrPage.click(selector);
    const screenshot = await pptrPage.screenshot({ encoding: 'base64' });
    res.json({ message: `Clicked on ${selector}`, screenshot });
  } catch (error) {
    console.error("Puppeteer click error:", error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/puppeteer/type', async (req, res) => {
  const { selector, text } = req.body;
  if (!pptrPage) return res.status(400).json({ error: 'Puppeteer not started.' });
  if (!selector || text === undefined) return res.status(400).json({ error: 'Selector and text are required.' });
  try {
    await pptrPage.type(selector, text, { delay: 100 });
    const screenshot = await pptrPage.screenshot({ encoding: 'base64' });
    res.json({ message: `Typed "${text}" into ${selector}`, screenshot });
  } catch (error) {
    console.error("Puppeteer type error:", error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/puppeteer/screenshot', async (req, res) => {
  if (!pptrPage) return res.status(400).json({ error: 'Puppeteer not started.' });
  try {
    const screenshot = await pptrPage.screenshot({ encoding: 'base64' });
    res.json({ screenshot });
  } catch (error) {
    console.error("Puppeteer screenshot error:", error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/puppeteer/close', async (req, res) => {
  try {
    if (pptrBrowser) {
      await pptrBrowser.close();
      pptrBrowser = null;
      pptrPage = null;
    }
    res.json({ message: 'Puppeteer browser closed.' });
  } catch (error) {
    console.error("Puppeteer close error:", error);
    res.status(500).json({ error: error.message });
  }
});

// --- Rotas RobotJS ---
app.post('/robot/movemouse', (req, res) => {
  const { x, y } = req.body;
  if (x === undefined || y === undefined) return res.status(400).json({ error: 'x and y coordinates are required.'});
  try {
    robot.moveMouse(x, y);
    res.json({ message: `Mouse moved to ${x},${y}` });
  } catch (error) {
    console.error("RobotJS movemouse error:", error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/robot/mouseclick', (req, res) => {
  const { button = 'left', double = false } = req.body;
  try {
    robot.mouseClick(button, double);
    res.json({ message: `Mouse clicked (button: ${button}, double: ${double})` });
  } catch (error) {
    console.error("RobotJS mouseclick error:", error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/robot/typestring', (req, res) => {
  const { text } = req.body;
  if (text === undefined) return res.status(400).json({ error: 'Text is required.'});
  try {
    robot.typeString(text);
    res.json({ message: `Typed string: "${text}"` });
  } catch (error) {
    console.error("RobotJS typestring error:", error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/robot/keytap', (req, res) => {
  const { key, modifier } = req.body;
  if (!key) return res.status(400).json({ error: 'Key is required.'});
  try {
    if (modifier && Array.isArray(modifier) && modifier.length > 0) {
      robot.keyTap(key, modifier);
      res.json({ message: `Key tapped: ${key} with modifier(s): ${modifier.join('+')}` });
    } else {
      robot.keyTap(key);
      res.json({ message: `Key tapped: ${key}` });
    }
  } catch (error) {
    console.error("RobotJS keytap error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Iniciar o servidor HTTP
const httpServer = http.createServer(app);
httpServer.listen(port, hostname, () => {
  console.log(`Servidor "computer use" rodando em http://${hostname}:${port}/`);
  console.log("Acesse o Docker Webtop diretamente em http://localhost:3000/");
  console.log("Endpoints para Puppeteer e RobotJS estão disponíveis. Consulte a página inicial para detalhes.");
});

