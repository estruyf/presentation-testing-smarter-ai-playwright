// spec: sticker-inventory-test-plan.md
// seed: e2e/tests/seed.spec.ts

import { test, expect } from "@playwright/test";
import { TEST_IDS } from "../../constants/testIds";

const WEBSITE_URL = "http://localhost:5173";

test.describe("UI Component Tests", () => {
  test("Hero Section Display", async ({ page }) => {
    // 1. Navigate to the homepage
    await page.goto(WEBSITE_URL);

    // 2. Verify the hero section background and styling
    const heroSection = page.locator("div.bg-gray-900.text-white.py-20");
    await expect(heroSection).toBeVisible();

    // Check for background image overlay
    const backgroundOverlay = page.locator("div.absolute.inset-0.opacity-20");
    await expect(backgroundOverlay).toBeVisible();

    // 3. Check the main headline 'Make your laptop even more yours'
    const headline = page.getByText("Make your laptop even more yours");
    await expect(headline).toBeVisible();
    await expect(headline).toHaveClass(/text-5xl|md:text-6xl/);

    // Check for the pink highlighted text
    const pinkHighlight = page.locator("span.text-pink-500");
    await expect(pinkHighlight).toBeVisible();
    await expect(pinkHighlight).toHaveText("even more yours");

    // 4. Verify the description text is displayed correctly
    const description = page.getByText("We provide you with unique dev and tech stickers");
    await expect(description).toBeVisible();
    await expect(description).toHaveClass(/text-xl/);

    // 5. Test the 'Browse Collection' button visibility and styling
    const browseButton = page.getByTestId(TEST_IDS.APP.HERO.BROWSE_BUTTON);
    await expect(browseButton).toBeVisible();
    await expect(browseButton).toHaveText("Browse Collection");
    await expect(browseButton).toHaveClass(/bg-pink-600/);
    await expect(browseButton).toHaveClass(/hover:bg-pink-700/);

    // 6. Click the Browse Collection button and verify scroll behavior
    await browseButton.hover();
    await expect(browseButton).toHaveClass(/hover:scale-105/);

    // Test button click (should scroll to sticker section)
    const initialScrollY = await page.evaluate(() => window.scrollY);
    await browseButton.click();

    // Wait for scroll animation to complete
    await page.waitForTimeout(1000);

    const afterScrollY = await page.evaluate(() => window.scrollY);
    expect(afterScrollY).toBeGreaterThan(initialScrollY);

    // Verify we scrolled to the sticker section
    const stickerSection = page.getByTestId(TEST_IDS.STICKER_INVENTORY.ROOT);
    await expect(stickerSection).toBeInViewport();
  });
});
