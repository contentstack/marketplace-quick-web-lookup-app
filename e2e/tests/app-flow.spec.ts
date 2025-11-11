import { expect, test } from '@playwright/test';

import {
  createApp,
  createContentType,
  createEntry,
  deleteApp,
  deleteContentType,
  entryPageFlow,
  initializeApp,
  initializeAppConfig,
  initializeEntry,
  initializeSidebarWidget,
  installApp,
  uninstallApp,
  updateApp,
  updateEntry,
  updateServerConfiguration,
} from '../utils/helper';

const jsonFile = require('jsonfile');

let randomTestNumber = Math.floor(Math.random() * 1000);
let savedCredentials: any = {};
let authToken: string;

// Setup test data
test.beforeAll(async () => {
  const file = 'data.json';
  const token = jsonFile.readFileSync(file);
  authToken = token.authToken;

  if (authToken) {
    const { appId, appName } = await createApp(authToken, randomTestNumber);
    savedCredentials.appName = appName;
    savedCredentials.appId = appId;

    await updateApp(authToken, appId, appName);
    const installationId: string = await installApp(authToken, appId, process.env.STACK_API_KEY);

    await updateServerConfiguration(authToken, installationId, {
      peekalink_api_key: process.env.PEEKALINK_API_KEY,
    });

    savedCredentials.installationId = installationId;
    const contentTypeResp = await createContentType(authToken, appName);

    if (contentTypeResp.notice === 'Content Type created successfully.') {
      savedCredentials.contentTypeId = contentTypeResp.content_type.uid;
      const entryResp = await createEntry(authToken, appName, contentTypeResp.content_type.uid);
      savedCredentials.entryUid = entryResp.entry.uid;
      savedCredentials.entryTitle = entryResp.entry.title;
    }
  }
});

// Cleanup test data
test.afterAll(async () => {
  await uninstallApp(authToken, savedCredentials.installationId);
  await deleteApp(authToken, savedCredentials.appId);
  await deleteContentType(authToken, savedCredentials.contentTypeId);
});

// Helper function to setup common test flow
async function setupTestFlow(page: any, appName: string) {
  const entryPage = await initializeEntry(page);
  await entryPageFlow(savedCredentials, entryPage);
  await entryPage.widgetSelector();
  const sidebarWidget = await initializeSidebarWidget(page);
  await sidebarWidget.selectSidebarWidgetApp(appName);
  return await initializeApp(page, appName);
}

test('should show no urls found screen when entry has no urls', async ({ page, browserName }) => {
  await updateEntry(authToken, savedCredentials.contentTypeId, savedCredentials.entryUid, {
    title: savedCredentials.entryTitle,
    rich_text_editor: '',
    json_rte: {
      uid: '200d3403be2645328860763fa61d7449',
      type: 'doc',
      attrs: {},
      children: [{ type: 'p', uid: '7991d4fcd3fa4b59b3ff9f1b1999ee53', attrs: {}, children: [{ text: '' }] }],
    },
  });

  const app = await setupTestFlow(page, savedCredentials.appName);
  await page.waitForTimeout(3000);

  if (browserName === 'webkit') {
    await app.validateIframePresence();
  } else {
    await app.validateNoUrlsFoundScreen();
  }
});

test('should show link previews from entry screen when app is configured', async ({ page, browserName }) => {
  await updateEntry(authToken, savedCredentials.contentTypeId, savedCredentials.entryUid, {
    title: savedCredentials.entryTitle,
    rich_text_editor: '<p>Adding links to the text https://www.google.com </p><p>https://www.contentstack.com/</p>',
    json_rte: {
      uid: '200d3403be2645328860763fa61d7449',
      type: 'doc',
      attrs: {},
      children: [
        {
          uid: '5f5a7c9fcdb441688cd53909cfa00d78',
          type: 'p',
          attrs: {},
          children: [{ text: 'Adding links to the text https://www.google.com ' }],
        },
        {
          uid: 'bf2fbabce9224be989c4334294d13ef6',
          type: 'p',
          attrs: {},
          children: [{ text: 'https://www.contentstack.com/' }],
        },
      ],
    },
  });

  await page.waitForTimeout(2000);

  const configPage = await initializeAppConfig(page, savedCredentials.installationId);
  await configPage.navigateToConfig();

  const app = await setupTestFlow(page, savedCredentials.appName);
  await page.waitForTimeout(3000);

  if (browserName === 'webkit') {
    await app.validateIframePresence();
  } else {
    await app.validateUrlCount(2);
    await app.validateLinkPreviewHeader();
    await app.validateLinkPreviewGrid();
    await app.validateLinkPreviewCard();
  }
});

test('should show image preview even if some of the urls are not valid', async ({ page, browserName }) => {
  await updateEntry(authToken, savedCredentials.contentTypeId, savedCredentials.entryUid, {
    title: savedCredentials.entryTitle,
    rich_text_editor:
      '<p>Valid URL: https://www.google.com</p><p>Another valid URL: https://www.contentstack.com/</p><p>Invalid URL: https://www.notexisting.com/abc</p>',
    json_rte: {
      uid: '200d3403be2645328860763fa61d7449',
      type: 'doc',
      attrs: {},
      children: [
        {
          uid: '5f5a7c9fcdb441688cd53909cfa00d78',
          type: 'p',
          attrs: {},
          children: [{ text: 'Valid URL: https://www.google.com' }],
        },
        {
          uid: 'edcedb9e56ec4e7ab9049520096f38e0',
          type: 'p',
          attrs: {},
          children: [{ text: 'Another valid URL: https://www.contentstack.com/' }],
        },
        {
          uid: 'bf2fbabce9224be989c4334294d13ef6',
          type: 'p',
          attrs: {},
          children: [{ text: 'Invalid URL: https://www.notexisting.com/abc' }],
        },
      ],
    },
  });

  await page.waitForTimeout(2000);

  const app = await setupTestFlow(page, savedCredentials.appName);
  await page.waitForTimeout(3000);

  if (browserName === 'webkit') {
    await app.validateIframePresence();
  } else {
    await app.validateUrlCount(3);
    await app.validateLinkPreviewHeader();
    await app.validateLinkPreviewGrid();

    // Validate mixed results
    const elementHandle = await page.waitForSelector('div.cs-extension iframe');
    const frame = await elementHandle.contentFrame();

    if (!frame) {
      throw new Error('Could not access app iframe');
    }

    // eslint-disable-next-line jest/no-conditional-expect
    const errorPreviews = frame.locator('.preview-card .error-display, .preview-card .no-preview');
    // eslint-disable-next-line jest/no-conditional-expect
    await expect(errorPreviews).toHaveCount(1);

    // eslint-disable-next-line jest/no-conditional-expect
    const subtitle = frame.locator('.header-subtitle');
    // eslint-disable-next-line jest/no-conditional-expect
    await expect(subtitle).toContainText('2 successful, 1 failed');
  }
});

test('should show not authorized screen when app is not configured', async ({ page, browserName }) => {
  await updateServerConfiguration(authToken, savedCredentials.installationId, {
    peekalink_api_key: '',
  });

  const app = await setupTestFlow(page, savedCredentials.appName);
  await page.waitForTimeout(3000);

  if (browserName === 'webkit') {
    await app.validateIframePresence();
  } else {
    await app.validateNotAuthorizedScreen();
  }
});
