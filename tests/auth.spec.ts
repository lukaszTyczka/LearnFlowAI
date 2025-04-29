import { test, expect } from "@playwright/test";

test.describe("Authentication", () => {
  test("should log in successfully with valid credentials", async ({ page }) => {
    // Arrange: Navigate to the login page
    await page.goto("/login"); // Adjust '/login' if your login page URL is different

    // Retrieve credentials from environment variables
    const email = process.env.E2E_LOGIN;
    const password = process.env.E2E_PASSWORD;

    // Ensure environment variables are set
    if (!email || !password) {
      throw new Error("E2E_LOGIN and E2E_PASSWORD environment variables must be set in .env.test");
    }
    // Act: Fill the form and submit
    // Assuming input fields have data-testid attributes like 'email-input' and 'password-input'
    // and the submit button has 'login-button'
    await page.getByTestId("email-input").fill(email);
    await page.getByTestId("password-input").fill(password);
    await page.getByTestId("login-button").focus();

    // Assert: Check for successful login redirection
    // Assuming successful login redirects to the root '/'
    // Adjust the URL if the redirect target is different (e.g., '/dashboard')

    await expect(page).toHaveURL("/app/dashboard");

    // Optional: Add more assertions, like checking for a specific element that only appears when logged in
    // Example: await expect(page.getByTestId('user-profile-menu')).toBeVisible();
  });

  // Add more tests for authentication flows (e.g., invalid credentials, logout) here
});
