import { test as base, Browser, Page, BrowserContext } from '@playwright/test';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';
import { LoginPage } from './tests/page-objects/loginPage';

const __dirname = dirname(fileURLToPath(import.meta.url));
const authFile = join(__dirname, '.auth/auth.json');

export type TestOptions = {
  baseUrl: string;
  apiUrl: string;
  authenticatedPage: Page;
};

interface LocalStorageItem {
  name: string;
  value: string;
}

interface StorageOrigin {
  origin: string;
  localStorage: LocalStorageItem[];
}

interface StorageState {
  cookies: [];
  origins: StorageOrigin[];
}

interface JWTPayload {
  sub: string;
  type: string;
  iat: number;
  exp: number;
}

async function authenticate() {
  const { chromium } = await import('@playwright/test');
  const { BASE_URL, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;

  if (!BASE_URL || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
    throw new Error('BASE_URL, ADMIN_EMAIL y ADMIN_PASSWORD son requeridos');
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

function shouldReauthenticate(): boolean {
  if (!fs.existsSync(authFile)) {
    return true;
  }

  try {
    const authData: StorageState = JSON.parse(fs.readFileSync(authFile, 'utf-8'));
    const refreshToken = authData.origins[0]?.localStorage.find((item) => item.name === 'refreshToken')?.value;

    if (!refreshToken) {
      return true;
    }

    const payload: JWTPayload = JSON.parse(Buffer.from(refreshToken.split('.')[1], 'base64').toString());
    const expirationTime = payload.exp * 1000;
    const oneDayInMs = 24 * 60 * 60 * 1000;

    return expirationTime - Date.now() < oneDayInMs;
  } catch {
    return true;
  }
}

export const test = base.extend<TestOptions>({
  baseUrl: [process.env.BASE_URL!, { option: true }],
  apiUrl: [process.env.API_URL!, { option: true }],

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
