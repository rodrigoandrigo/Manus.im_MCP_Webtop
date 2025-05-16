// src/controllers/puppeteerController.ts
import puppeteer, { Browser, Page } from 'puppeteer';

export class PuppeteerController {
  private browser: Browser | null = null;
  private page: Page | null = null;

  constructor() {
    // Inicialização pode ser adiada para um método async init()
  }

  async launchBrowser(): Promise<void> {
    if (this.browser) {
      console.log('Navegador Puppeteer já está em execução.');
      return;
    }
    try {
      // No Docker-Webtop, o Chrome/Chromium já está instalado.
      // Precisamos descobrir o executável correto ou conectar a uma instância existente se possível.
      // Por enquanto, vamos tentar lançar uma nova instância.
      // Opções importantes para rodar no Docker sem sandbox:
      this.browser = await puppeteer.launch({
        headless: false, // Queremos ver o navegador no Docker-Webtop
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          // '--disable-dev-shm-usage', // Pode ser necessário dependendo do ambiente Docker
          // '--window-size=1920,1080', // Definir tamanho da janela
          // Se o Docker-Webtop expõe um endpoint de depuração do Chrome, poderíamos usar puppeteer.connect()
        ],
        // Se o Docker-Webtop já tem um Chrome rodando e acessível via DevTools protocol:
        // browserURL: 'http://localhost:9222' // Exemplo de porta de depuração
      });
      this.page = (await this.browser.pages())[0] || await this.browser.newPage();
      console.log('Navegador Puppeteer iniciado e nova página criada.');
      // Por padrão, o Puppeteer pode abrir 'about:blank'.
      // Podemos navegar para a interface do Docker-Webtop se necessário, ou para localhost:3000
      // await this.page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
    } catch (error) {
      console.error('Erro ao iniciar o Puppeteer:', error);
      throw error;
    }
  }

  async closeBrowser(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      this.page = null;
      console.log('Navegador Puppeteer fechado.');
    }
  }

  async navigate(url: string): Promise<void> {
    if (!this.page) {
      throw new Error('A página do Puppeteer não está inicializada. Chame launchBrowser() primeiro.');
    }
    try {
      await this.page.goto(url, { waitUntil: 'networkidle2' });
      console.log(`Navegado para: ${url}`);
    } catch (error) {
      console.error(`Erro ao navegar para ${url}:`, error);
      throw error;
    }
  }

  async getPageTitle(): Promise<string> {
    if (!this.page) {
      throw new Error('A página do Puppeteer não está inicializada.');
    }
    return this.page.title();
  }

  async takeScreenshot(path: string): Promise<void> {
    if (!this.page) {
      throw new Error('A página do Puppeteer não está inicializada.');
    }
    try {
      await this.page.screenshot({ path });
      console.log(`Screenshot salvo em: ${path}`);
    } catch (error) {
      console.error('Erro ao tirar screenshot com Puppeteer:', error);
      throw error;
    }
  }

  // TODO: Adicionar mais métodos de controle do Puppeteer conforme necessário
  // Ex: clicar em elementos, preencher formulários, executar JS, etc.
}

