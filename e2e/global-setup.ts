// global-setup.ts
import { chromium, FullConfig } from '@playwright/test';
import { LoginPage } from './pages/LoginPage';
import { getAuthToken } from './utils/helper';

const { EMAIL, PASSWORD }: any = process.env;

async function globalSetup(config: FullConfig) {
  let loginPage: LoginPage;
  const browser = await chromium.launch();
  const page = await browser.newPage({
    httpCredentials: {
      username: process.env.BASIC_AUTH_USERNAME || '',
      password: process.env.BASIC_AUTH_PASSWORD || '',
    },
  });

  try {
    loginPage = new LoginPage(page);
    await loginPage.visitLoginPage();
    await loginPage.performLogin(EMAIL, PASSWORD);
    await getAuthToken();
  } catch (error) {
    console.error('Global setup failed:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

export default globalSetup;
