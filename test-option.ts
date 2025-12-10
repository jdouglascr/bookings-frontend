import { test as base, Browser, Page, BrowserContext } from '@playwright/test';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';
import { LoginPage } from './tests/page-objects/loginPage';

const __dirname = dirname(fileURLToPath(import.meta.url));
const authFile = join(__dirname, '.auth/workspace.json');

export type TestOptions = {
  baseUrl: string;
  authenticatedPage: Page;
};

async function authenticate() {
  const { chromium } = await import('@playwright/test');
  const { BASE_URL, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;

  if (!BASE_URL || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
    throw new Error('WKS_URL, ADMIN_EMAIL y ADMIN_PASSWORD son requeridos');
  }

  const browser = await chromium.launch();
  const page = await browser.newPage();
  const loginPage = new LoginPage(page);

  try {
    await loginPage.navigateToLoginPage(BASE_URL);
    await loginPage.fillEmailField(ADMIN_EMAIL);
    await loginPage.fillPasswordField(ADMIN_PASSWORD);
    await loginPage.clickEnterButton();
    await page.getByRole('button', { name: 'Sitio público' }).waitFor({ state: 'visible' });

    const authDir = dirname(authFile);
    if (!fs.existsSync(authDir)) {
      fs.mkdirSync(authDir, { recursive: true });
    }

    await page.context().storageState({ path: authFile });
  } finally {
    await browser.close();
  }
}

export const test = base.extend<TestOptions>({
  baseUrl: [process.env.BASE_URL!, { option: true }],

  authenticatedPage: async ({ browser }: { browser: Browser }, use: (page: Page) => Promise<void>) => {
    await authenticate();

    const context: BrowserContext = await browser.newContext({
      storageState: authFile,
    });

    const page: Page = await context.newPage();
    await use(page);
    await context.close();
  },
});
