import { Page, expect } from '@playwright/test';

export class App {
  readonly page: Page;
  readonly appName: string;

  constructor(page: Page, appName: string) {
    this.page = page;
    this.appName = appName;
  }

  async waitForIframe() {
    // Safari-compatible iframe waiting
    const elementHandle = await this.page.waitForSelector('div.cs-extension iframe', {
      state: 'attached',
      timeout: 60000,
    });

    // Extra wait for Safari to fully load the iframe
    await this.page.waitForTimeout(5000);

    return elementHandle;
  }

  async validateIframePresence() {
    const iframe = await this.waitForIframe();

    // Check if iframe has the expected attributes
    const src = await iframe.getAttribute('src');
    const className = await iframe.getAttribute('class');

    if (!src?.includes('entry-sidebar')) {
      throw new Error(`Expected iframe src to contain 'entry-sidebar', got: ${src}`);
    }

    if (!className?.includes('app-extension-component')) {
      throw new Error(`Expected iframe class to contain 'app-extension-component', got: ${className}`);
    }

    return iframe;
  }

  async validateNoUrlsFoundScreen() {
    const elementHandle = await this.page.waitForSelector('div.cs-extension iframe');
    const frame = await elementHandle.contentFrame();

    if (!frame) {
      throw new Error('Could not access app iframe');
    }

    // Validate the "No URLs Found" heading is visible
    await expect(frame.locator('h3:has-text("No URLs Found")')).toBeVisible();

    // Validate the descriptive text is visible
    await expect(frame.locator('p:has-text("No URLs found in this entry.")')).toBeVisible();
    await expect(frame.locator('p:has-text("Add some links to your content to see previews here.")')).toBeVisible();

    // Validate the link icon is present
    await expect(frame.locator('.empty-state-icon:has-text("🔗")')).toBeVisible();

    // Validate the empty state container has the correct styling class
    await expect(frame.locator('.empty-state.no-urls-message')).toBeVisible();
  }

  async validateLinkPreviewGrid() {
    const elementHandle = await this.page.waitForSelector('div.cs-extension iframe');
    const frame = await elementHandle.contentFrame();

    if (!frame) {
      throw new Error('Could not access app iframe');
    }

    // Wait for loading to complete - look for loading skeletons to disappear
    await frame.locator('.preview-skeleton').waitFor({ state: 'hidden', timeout: 30000 });

    // Wait for the actual previews grid to appear
    await frame.locator('.previews-grid').waitFor({ state: 'visible', timeout: 30000 });

    // Additional wait: ensure preview cards are actually visible
    await frame.locator('.preview-card').first().waitFor({ state: 'visible', timeout: 30000 });

    // Validate the previews container is visible
    await expect(frame.locator('.previews-container')).toBeVisible();
    await expect(frame.locator('.previews-grid')).toBeVisible();

    // Validate that at least one preview card is present
    await expect(frame.locator('.preview-card').first()).toBeVisible();
  }

  async validateLinkPreviewHeader() {
    const elementHandle = await this.page.waitForSelector('div.cs-extension iframe');
    const frame = await elementHandle.contentFrame();

    if (!frame) {
      throw new Error('Could not access app iframe');
    }

    // Validate the header is visible
    await expect(frame.locator('.sidebar-header')).toBeVisible();
    await expect(frame.locator('.header-title')).toBeVisible();

    // Validate the title and icon
    await expect(frame.locator('h2:has-text("Link Previews")')).toBeVisible();
    await expect(frame.locator('.header-icon')).toBeVisible();

    // Validate the refresh button is present
    await expect(frame.locator('.refresh-button')).toBeVisible();
  }

  async validateLinkPreviewCard() {
    const elementHandle = await this.page.waitForSelector('div.cs-extension iframe');
    const frame = await elementHandle.contentFrame();

    if (!frame) {
      throw new Error('Could not access app iframe');
    }

    // Wait for loading to complete before checking for preview cards
    await frame.locator('.preview-skeleton').waitFor({ state: 'hidden', timeout: 30000 });
    await frame.locator('.previews-grid').waitFor({ state: 'visible', timeout: 30000 });

    // Validate the preview card structure
    await expect(frame.locator('.preview-card').first()).toBeVisible();
    await expect(frame.locator('.preview-image').first()).toBeVisible();
    await expect(frame.locator('.preview-content').first()).toBeVisible();
    await expect(frame.locator('.preview-title').first()).toBeVisible();
  }

  async validateUrlCount(expectedCount: number) {
    const elementHandle = await this.page.waitForSelector('div.cs-extension iframe');
    const frame = await elementHandle.contentFrame();

    if (!frame) {
      throw new Error('Could not access app iframe');
    }

    // Validate the URL count in the header
    if (expectedCount === 0) {
      await expect(frame.locator('.header-url-count')).not.toBeVisible();
    } else {
      await expect(
        frame.locator(`.header-url-count:has-text("${expectedCount} URL${expectedCount !== 1 ? 's' : ''} found")`),
      ).toBeVisible();
    }
  }

  async validateNotAuthorizedScreen() {
    const elementHandle = await this.page.waitForSelector('div.cs-extension iframe');
    const frame = await elementHandle.contentFrame();

    if (!frame) {
      throw new Error('Could not access app iframe');
    }

    // Validate the error heading is visible
    await expect(frame.locator('h3:has-text("Error Loading Previews")')).toBeVisible();

    // Validate the error icon is present
    await expect(frame.locator('.empty-state-icon:has-text("⚠️")')).toBeVisible();

    // Validate the error state container has the correct styling class
    await expect(frame.locator('.empty-state.error-message')).toBeVisible();

    // Validate the retry button is present
    await expect(frame.locator('.retry-button:has-text("Try Again")')).toBeVisible();

    // Validate the specific authorization error message
    await expect(frame.locator('.error-text:has-text("Unauthorized: Please check your API key")')).toBeVisible();
  }
}
