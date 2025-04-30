import { test, expect, type Page } from "@playwright/test";

async function login(page: Page) {
  await page.goto("/login");

  const email = process.env.E2E_LOGIN;
  const password = process.env.E2E_PASSWORD;

  if (!email || !password) {
    throw new Error("E2E_LOGIN and E2E_PASSWORD environment variables must be set in .env.test");
  }

  await page.getByTestId("email-input").fill(email);
  await page.getByTestId("password-input").fill(password);
  await page.getByTestId("login-button").click();

  await expect(page).toHaveURL("/app/dashboard"); // Use regex for flexibility
}

test.describe.serial("Notes Functionality", () => {
  const categoryName = "Others";
  const categoryTestId = `category-button-${categoryName.toLowerCase()}`;
  const noteText =
    "This is a test note created by Playwright for E2E testing. ".repeat(10) +
    "It needs to be long enough to pass the 300 character validation.";

  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test("should add a new note successfully and wait for summary", async ({ page }) => {
    // Login and navigation to dashboard happen in beforeEach

    await page.getByTestId(categoryTestId).click();

    await page.getByTestId("note-content-input").fill(noteText);

    await page.getByTestId("save-note-button").click();

    await expect(
      page.locator('[data-testid="note-card"]').filter({ hasText: noteText.substring(0, 50) })
    ).toBeVisible();
  });

  test("should delete the previously added note", async ({ page }) => {
    // Login and navigation to dashboard happen in beforeEach

    await page.getByTestId(categoryTestId).click();

    const noteCardLocator = page.locator('[data-testid="note-card"]').filter({ hasText: noteText.substring(0, 50) });
    await expect(noteCardLocator).toBeVisible({ timeout: 10000 });

    const noteCard = noteCardLocator.first();

    page.on("dialog", (dialog) => dialog.accept());

    await noteCard.getByTestId("delete-note-button").click();

    await expect(noteCardLocator).not.toBeVisible();
  });
});
