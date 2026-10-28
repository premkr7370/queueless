/**
 * Homepage E2E tests.
 *
 * Verifies that the homepage loads correctly, all major sections
 * are visible, navigation works, and the search bar is functional.
 */

import { test, expect } from "@playwright/test";

test.describe("Homepage", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("displays the page title", async ({ page }) => {
    await expect(page).toHaveTitle(/QueueLess/);
  });

  test("renders the navigation header", async ({ page }) => {
    const header = page.locator("header");
    await expect(header).toBeVisible();

    // Logo/brand
    await expect(header.getByText("QueueLess")).toBeVisible();
  });

  test("renders the hero section with search", async ({ page }) => {
    // Hero heading
    const heroHeading = page.locator("h1");
    await expect(heroHeading).toBeVisible();
    await expect(heroHeading).toContainText(/queue|book|service|wait/i);

    // Search bar
    const searchInput = page.locator('input[type="text"], input[type="search"]').first();
    await expect(searchInput).toBeVisible();
  });

  test("renders category cards", async ({ page }) => {
    // Category section
    const categorySection = page.getByText(/categories|browse/i).first();
    await expect(categorySection).toBeVisible();
  });

  test("renders the How It Works section", async ({ page }) => {
    const howItWorks = page.getByText(/how it works/i).first();
    await expect(howItWorks).toBeVisible();
  });

  test("renders the footer", async ({ page }) => {
    const footer = page.locator("footer");
    await expect(footer).toBeVisible();

    // Footer links
    await expect(footer.getByText(/privacy/i).first()).toBeVisible();
    await expect(footer.getByText(/terms/i).first()).toBeVisible();
  });

  test("navigate to explore page via search", async ({ page }) => {
    const searchInput = page.locator('input[type="text"], input[type="search"]').first();
    await searchInput.fill("salon");
    await searchInput.press("Enter");

    await expect(page).toHaveURL(/\/explore/);
  });

  test("navigate to login page", async ({ page }) => {
    const loginLink = page.getByRole("link", { name: /log\s*in|sign\s*in/i }).first();
    if (await loginLink.isVisible()) {
      await loginLink.click();
      await expect(page).toHaveURL(/\/login/);
    }
  });

  test("navigate to about page", async ({ page }) => {
    const aboutLink = page.getByRole("link", { name: /about/i }).first();
    if (await aboutLink.isVisible()) {
      await aboutLink.click();
      await expect(page).toHaveURL(/\/about/);
    }
  });

  test("responsive: mobile menu toggle works", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });

    // Look for a mobile menu button (hamburger)
    const menuButton = page.locator(
      'button[aria-label*="menu" i], button:has(svg[class*="menu" i])'
    ).first();

    if (await menuButton.isVisible()) {
      await menuButton.click();
      // Should show the mobile navigation
      const mobileNav = page.locator('[role="dialog"], [data-state="open"]').first();
      await expect(mobileNav).toBeVisible();
    }
  });
});
