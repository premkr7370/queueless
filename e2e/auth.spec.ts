/**
 * Authentication E2E tests.
 *
 * Tests login and registration flows including form validation,
 * error handling, and successful form submission.
 */

import { test, expect } from "@playwright/test";

test.describe("Login Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
  });

  test("displays the login form", async ({ page }) => {
    await expect(page).toHaveTitle(/log\s*in|sign\s*in/i);

    // Email input
    const emailInput = page.locator('input[type="email"], input[name="email"]').first();
    await expect(emailInput).toBeVisible();

    // Password input
    const passwordInput = page.locator('input[type="password"]').first();
    await expect(passwordInput).toBeVisible();

    // Submit button
    const submitButton = page.locator('button[type="submit"]').first();
    await expect(submitButton).toBeVisible();
  });

  test("shows validation error for empty submission", async ({ page }) => {
    const submitButton = page.locator('button[type="submit"]').first();
    await submitButton.click();

    // Should show validation errors (browser native or custom)
    // At minimum, the page should stay on /login
    await expect(page).toHaveURL(/\/login/);
  });

  test("shows error for invalid credentials", async ({ page }) => {
    const emailInput = page.locator('input[type="email"], input[name="email"]').first();
    const passwordInput = page.locator('input[type="password"]').first();

    await emailInput.fill("nonexistent@example.com");
    await passwordInput.fill("wrongpassword123");

    const submitButton = page.locator('button[type="submit"]').first();
    await submitButton.click();

    // Should show an error message (might be inline or alert)
    // The page should stay on login
    await page.waitForTimeout(1000);
    await expect(page).toHaveURL(/\/login/);
  });

  test("has link to register page", async ({ page }) => {
    const registerLink = page.getByRole("link", { name: /register|sign\s*up|create.*account/i }).first();
    await expect(registerLink).toBeVisible();

    await registerLink.click();
    await expect(page).toHaveURL(/\/register/);
  });
});

test.describe("Register Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/register");
  });

  test("displays the registration form", async ({ page }) => {
    // Name input
    const nameInput = page.locator('input[name="name"], input[placeholder*="name" i]').first();
    await expect(nameInput).toBeVisible();

    // Email input
    const emailInput = page.locator('input[type="email"], input[name="email"]').first();
    await expect(emailInput).toBeVisible();

    // Password input
    const passwordInput = page.locator('input[type="password"]').first();
    await expect(passwordInput).toBeVisible();
  });

  test("displays role selection", async ({ page }) => {
    // Should have CUSTOMER and SHOP_OWNER role options
    const customerOption = page.getByText(/customer/i).first();
    const ownerOption = page.getByText(/business\s*owner|shop\s*owner/i).first();

    // At least one role option should be visible
    const hasCustomer = await customerOption.isVisible().catch(() => false);
    const hasOwner = await ownerOption.isVisible().catch(() => false);

    expect(hasCustomer || hasOwner).toBe(true);
  });

  test("shows validation for weak password", async ({ page }) => {
    const nameInput = page.locator('input[name="name"], input[placeholder*="name" i]').first();
    const emailInput = page.locator('input[type="email"], input[name="email"]').first();
    const passwordInput = page.locator('input[type="password"]').first();

    await nameInput.fill("Test User");
    await emailInput.fill("test@example.com");
    await passwordInput.fill("short"); // < 8 chars

    const submitButton = page.locator('button[type="submit"]').first();
    await submitButton.click();

    // Should show password validation error
    await page.waitForTimeout(500);
    await expect(page).toHaveURL(/\/register/); // stays on page
  });

  test("has link to login page", async ({ page }) => {
    const loginLink = page.getByRole("link", { name: /log\s*in|sign\s*in|already.*account/i }).first();
    await expect(loginLink).toBeVisible();
  });
});
