import { test } from "@playwright/test";
import { HomePage } from "./pages/HomePage";

test("navigation works correctly", async ({ page }) => {
  const homePage = new HomePage(page);

  // Navigate to home page
  await homePage.goto();

  // Verify page title
  await homePage.expectTitleContains("LearnFlowAI");

  // Take a screenshot for visual comparison
  await homePage.takeScreenshot("home-page.png");
});
