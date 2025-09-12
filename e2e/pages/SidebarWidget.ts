import { expect, Page } from '@playwright/test';

export class SidebarWidget {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async validateWidgetSidebarLoadedProperly(appName) {
    await expect(this.page.locator('text=Widgets').first()).toBeVisible();
    await expect(this.page.locator(`text=${appName}`)).toBeVisible();
  }

  async selectSidebarWidgetApp(appName) {
    const selectorAppName = appName.toLowerCase().split(' ').join('-');
    await this.page.locator(`[data-test-id="cs-app-${selectorAppName}-title"] [data-test-id="cs-truncate"]`).click();
  }

  async accessFrame() {
    const elementHandle = await this.page.waitForSelector('div.cs-extension iframe');
    const frame = await elementHandle.contentFrame();
    return frame;
  }

  async wait(milliseconds) {
    const frame = await this.accessFrame();
    await frame?.waitForTimeout(milliseconds);
  }
}
