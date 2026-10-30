/**
 * Explore page E2E tests.
 *
 * Tests the business listing page with search, filtering,
 * and business card rendering.
 */

import { test, expect } from "@playwright/test";

test.describe("Explore Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/explore");
  });

  test("displays the explore page", async ({ page }) => {
    await expect(page).toHaveTitle(/explore|browse|search/i);
  });

  test("renders search input", async ({ page }) => {
    const searchInput = page.locator(
      'input[type="text"], input[type="search"], input[placeholder*="search" i]'
    ).first();
    await expect(searchInput).toBeVisible();
  });

  test("renders business cards or empty state", async ({ page }) => {
    await page.waitForTimeout(1000);

    // Either business cards are rendered, or an empty state message
    const businessCards = page.locator('[class*="card"], [class*="business"]');
    const emptyState = page.getByText(/no businesses|no results|not found/i).first();

    const hasCards = await businessCards.first().isVisible().catch(() => false);
    const hasEmpty = await emptyState.isVisible().catch(() => false);

    expect(hasCards || hasEmpty).toBe(true);
  });

  test("search filters update URL", async ({ page }) => {
    const searchInput = page.locator(
      'input[type="text"], input[type="search"], input[placeholder*="search" i]'
    ).first();

    await searchInput.fill("salon");
    await searchInput.press("Enter");

    await page.waitForTimeout(500);
    await expect(page).toHaveURL(/q=salon/);
  });

  test("displays category filters", async ({ page }) => {
    // Should have category filter options
    const categoryFilter = page.locator(
      'select, [role="combobox"], [role="listbox"], button:has-text("Category"), button:has-text("All Categories")'
    ).first();

    const hasFilter = await categoryFilter.isVisible().catch(() => false);
    // Categories may also be shown as links/buttons
    const categoryLinks = page.getByRole("link", { name: /clinic|salon|spa|diagnostic/i }).first();
    const hasLinks = await categoryLinks.isVisible().catch(() => false);

    // At least one form of category browsing should exist
    expect(hasFilter || hasLinks).toBe(true);
  });
});

test.describe("Category Page", () => {
  test("displays category-specific businesses", async ({ page }) => {
    await page.goto("/categories/health-medical");

    await page.waitForTimeout(1000);

    // Should display the category name
    const heading = page.locator("h1").first();
    await expect(heading).toBeVisible();
  });

  test("navigates to business detail from category page", async ({ page }) => {
    await page.goto("/categories/beauty-wellness");
    await page.waitForTimeout(1000);

    // Click on a business card if available
    const businessLink = page.locator('a[href*="/business/"]').first();
    const hasLink = await businessLink.isVisible().catch(() => false);

    if (hasLink) {
      await businessLink.click();
      await expect(page).toHaveURL(/\/business\//);
    }
  });
});

test.describe("Static Pages", () => {
  const pages = [
    { path: "/about", title: /about/i },
    { path: "/contact", title: /contact/i },
    { path: "/privacy", title: /privacy/i },
    { path: "/terms", title: /terms/i },
    { path: "/refund-policy", title: /refund/i },
    { path: "/business-terms", title: /business.*terms/i },
  ];

  for (const p of pages) {
    test(`${p.path} loads successfully`, async ({ page }) => {
      const response = await page.goto(p.path);
      expect(response?.status()).toBeLessThan(400);

      const heading = page.locator("h1").first();
      await expect(heading).toBeVisible();
    });
  }

  test("404 page renders for unknown routes", async ({ page }) => {
    await page.goto("/this-does-not-exist-at-all");

    // Should show a 404 page or redirect
    const notFound = page.getByText(/not found|404/i).first();
    const hasNotFound = await notFound.isVisible().catch(() => false);

    // Either shows 404 content or returns to a valid page
    expect(hasNotFound || page.url().includes("not-found")).toBe(true);
  });
});
