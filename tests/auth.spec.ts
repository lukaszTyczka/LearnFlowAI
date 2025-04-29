import { test, expect } from "@playwright/test";

test.describe("Authentication", () => {
  test("should log in successfully with valid credentials", async ({ page }) => {
    // Arrange: Navigate to the login page
    await page.goto("/login");

    // Retrieve credentials from environment variables
    const email = process.env.E2E_LOGIN;
    const password = process.env.E2E_PASSWORD;
    console.log("Email length: ", email?.length);
    console.log("Password length: ", password?.length);

    if (!email || !password) {
      throw new Error("E2E_LOGIN and E2E_PASSWORD environment variables must be set in .env.test");
    }

    await page.getByTestId("email-input").fill(email);
    await page.getByTestId("password-input").fill(password);
    await page.getByTestId("login-button").click();

    await expect(page).toHaveURL("/app/dashboard");
  });
});
