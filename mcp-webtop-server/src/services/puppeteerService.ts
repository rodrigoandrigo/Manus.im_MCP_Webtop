import puppeteer, { Browser, Page } from 'puppeteer';
import { WEBTOP_URL } from '../config';

let browser: Browser | null = null;
let page: Page | null = null;

interface PuppeteerInitializationResult {
  success: boolean;
  message: string;
  browser?: Browser;
  page?: Page;
}

export const initializePuppeteer = async (): Promise<PuppeteerInitializationResult> => {
  try {
    if (browser && page) {
      console.log('Puppeteer already initialized. Bringing page to front.');
      await page.bringToFront();
      return { success: true, message: 'Puppeteer already initialized and page brought to front.', browser, page };
    }

    console.log(`Launching Puppeteer and navigating to ${WEBTOP_URL}...`);
    browser = await puppeteer.launch({
      headless: false, // Must be false for RobotJS to interact with the screen
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        // '--start-maximized', // This might be useful depending on the environment
        // You might need to specify a display if running in a headless Linux environment
        // process.env.DISPLAY ? `--display=${process.env.DISPLAY}` : ''
      ].filter(Boolean)
    });

    const pages = await browser.pages();
    page = pages.length > 0 ? pages[0] : await browser.newPage();
    
    // Set a reasonable viewport. This might need adjustment.
    // await page.setViewport({ width: 1280, height: 720 }); 

    await page.goto(WEBTOP_URL, { waitUntil: 'networkidle2' });
    await page.bringToFront();

    console.log('Puppeteer initialized successfully, Webtop page loaded and focused.');
    return { success: true, message: 'Puppeteer initialized successfully, Webtop page loaded and focused.', browser, page };

  } catch (error: any) {
    console.error('Error initializing Puppeteer:', error);
    if (browser) {
      await browser.close();
      browser = null;
      page = null;
    }
    return { success: false, message: `Error initializing Puppeteer: ${error.message}` };
  }
};

export const getPage = (): Page | null => page;
export const getBrowser = (): Browser | null => browser;

export const closePuppeteer = async (): Promise<void> => {
  if (browser) {
    await browser.close();
    browser = null;
    page = null;
    console.log('Puppeteer browser closed.');
  }
};

