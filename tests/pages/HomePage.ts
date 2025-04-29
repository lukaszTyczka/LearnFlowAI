import { type Page, type Locator, expect } from "@playwright/test";

export class HomePage {
  readonly page: Page;
  readonly heading: Locator;
  readonly navigationLinks: Locator;
  readonly mobileMenuButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole("heading", { level: 1 });
    this.navigationLinks = page.getByRole("navigation").getByRole("link");
    this.mobileMenuButton = page.getByRole("button", { name: /menu/i });
  }

  async goto() {
    await this.page.goto("/");
  }

  async expectTitleContains(text: string) {
    const title = await this.page.title();
    expect(title).toContain(text);
  }

  async openMobileMenu() {
    // Only click if the menu button is visible (mobile view)
    if (await this.mobileMenuButton.isVisible()) {
      await this.mobileMenuButton.click();
    }
  }

  async getNavigationLinkCount() {
    return await this.navigationLinks.count();
  }

  async clickNavigationLink(linkText: string) {
    await this.page.getByRole("link", { name: linkText }).click();
  }

  async takeScreenshot(name: string) {
    await expect(this.page).toHaveScreenshot(name, {
      maxDiffPixelRatio: 0.05,
    });
  }
}
