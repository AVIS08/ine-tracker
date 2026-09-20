/**
 * Browser management for Playwright.
 * Provides lazy browser launch, context creation, and graceful shutdown.
 * Supports both headless (production) and headed (demo/recording) modes.
 */

const { chromium } = require('playwright');
const { execSync } = require('child_process');

let browserInstance = null;

const BROWSER_OPTS = {
  headless: process.env.HEADED_MODE !== 'true',
  args: [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',
    '--disable-gpu',
  ],
};

/**
 * Get or create a shared browser instance.
 * Reuses the browser across scrapes to save startup time on Render free tier.
 */
async function getBrowser() {
  if (browserInstance && browserInstance.isConnected()) {
    return browserInstance;
  }

  console.log(`[Browser] Launching Chromium (headless: ${BROWSER_OPTS.headless})...`);
  
  try {
    browserInstance = await chromium.launch(BROWSER_OPTS);
  } catch (err) {
    if (err.message.includes("Executable doesn't exist") || err.message.includes("browserType.launch")) {
      console.warn('[Browser] Chromium executable missing. Auto-installing Chromium binaries...');
      try {
        execSync('npx playwright install chromium', { stdio: 'inherit' });
        browserInstance = await chromium.launch(BROWSER_OPTS);
      } catch (installErr) {
        console.error('[Browser] Failed to auto-install Chromium:', installErr.message);
        throw err;
      }
    } else {
      throw err;
    }
  }

  browserInstance.on('disconnected', () => {
    console.log('[Browser] Browser disconnected');
    browserInstance = null;
  });

  return browserInstance;
}

/**
 * Create a new browser context with realistic settings.
 * Each scrape session gets its own context for isolation.
 */
async function createContext(browser) {
  const context = await browser.newContext({
    userAgent:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
    viewport: { width: 1280, height: 800 },
    locale: 'en-IN',
    timezoneId: 'Asia/Kolkata',
    javaScriptEnabled: true,
  });

  // Set reasonable timeouts
  context.setDefaultTimeout(30000);
  context.setDefaultNavigationTimeout(30000);

  return context;
}

/**
 * Gracefully close the browser instance.
 */
async function closeBrowser() {
  if (browserInstance) {
    console.log('[Browser] Closing browser...');
    await browserInstance.close().catch(() => {});
    browserInstance = null;
  }
}

module.exports = { getBrowser, createContext, closeBrowser };
