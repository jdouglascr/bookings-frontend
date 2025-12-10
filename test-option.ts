import { test as base, Browser, Page, BrowserContext } from '@playwright/test';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';
import { LoginPage } from './apps/gastronomy/page-objects/loginPage';

const __dirname = dirname(fileURLToPath(import.meta.url));
const authFile = join(__dirname, '.auth/workspace.json');
const AUTH_EXPIRY_DAYS = 7;

export type TestOptions = {
  tuuCartURL: string;
  workspaceURL: string;
  authenticatedPage: Page;
};

async function authenticate() {
  const { chromium } = await import('@playwright/test');
  const { WKS_OWNER_USER, WKS_OWNER_PASSWORD, WKS_URL } = process.env;

  if (!WKS_OWNER_USER || !WKS_OWNER_PASSWORD || !WKS_URL) {
    throw new Error('WKS_OWNER_USER, WKS_OWNER_PASSWORD y WKS_URL son requeridos');
  }

  const browser = await chromium.launch();
  const page = await browser.newPage();
  const loginPage = new LoginPage(page);

  try {
    await loginPage.navigateToLoginPage(WKS_URL);
    await loginPage.fillEmailField(WKS_OWNER_USER);
    await loginPage.fillPasswordField(WKS_OWNER_PASSWORD);
    await loginPage.clickStartButton();
    await page.getByRole('link', { name: 'Gastronomía' }).waitFor({ state: 'visible' });

    const authDir = dirname(authFile);
    if (!fs.existsSync(authDir)) {
      fs.mkdirSync(authDir, { recursive: true });
    }

    await page.context().storageState({ path: authFile });
  } finally {
    await browser.close();
  }
}

function shouldReauthenticate(): boolean {
  if (!fs.existsSync(authFile)) return true;

  const fileAge = Date.now() - fs.statSync(authFile).mtimeMs;
  const daysSinceCreation = fileAge / (1000 * 60 * 60 * 24);

  return daysSinceCreation >= AUTH_EXPIRY_DAYS;
}

export const test = base.extend<TestOptions>({
  tuuCartURL: [process.env.TUU_CART_URL || 'https://website-tuu-cl.haulmer.dev/cart/', { option: true }],
  workspaceURL: [process.env.WKS_URL || 'https://workspace.haulmer.dev/', { option: true }],

  authenticatedPage: async ({ browser }: { browser: Browser }, use: (page: Page) => Promise<void>) => {
    if (shouldReauthenticate()) {
      await authenticate();
    }

    const context: BrowserContext = await browser.newContext({
      storageState: authFile,
    });

    const page: Page = await context.newPage();
    await use(page);
    await context.close();
  },
});
