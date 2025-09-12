import { Page } from '@playwright/test';

export class AppConfig {
  readonly page: Page;
  readonly installationId: string;

  constructor(page: Page, installationId: string) {
    this.page = page;
    this.installationId = installationId;
  }

  async navigateToConfig() {
    await this.page.goto(`/#!/marketplace/installed-apps/${this.installationId}/configuration?tab=configuration`);
    await this.page.waitForLoadState();
  }
}
