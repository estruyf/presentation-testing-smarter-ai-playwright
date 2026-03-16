import { test, expect } from "@playwright/test";

test.describe("UI Components and Layout", () => {
  test("Hero Section Content and Interaction", async ({ page }) => {
    // 1. Navigate to the homepage
    await page.goto("http://localhost:5173");

    // 2. Verify the promotional banner text displays correctly
    const promoBanner = page.locator(".bg-gray-900.text-white.text-xs.py-2");
    await expect(promoBanner).toBeVisible();
    await expect(promoBanner).toContainText("We sell high-quality unique stickers");
    await expect(promoBanner).toContainText("Free worldwide shipping");

    // 3. Check hero section background image and overlay
    const heroSection = page.locator(".bg-gray-900.text-white.py-20");
    await expect(heroSection).toBeVisible();
    const backgroundOverlay = page.locator(".absolute.inset-0.opacity-20");
    await expect(backgroundOverlay).toBeVisible();

    // 4. Verify main headline with pink accent
    const headline = page.locator("h2.text-5xl");
    await expect(headline).toBeVisible();
    await expect(headline).toContainText("Make your laptop");
    await expect(headline).toContainText("even more yours");

    const pinkAccent = page.locator(".text-pink-500");
    await expect(pinkAccent).toContainText("even more yours");

    // 5. Check description text is readable and properly formatted
    const description = page.locator("p.text-xl.text-gray-300");
    await expect(description).toBeVisible();
    await expect(description).toContainText("We provide you with unique dev and tech stickers");

    // 6. Locate Browse Collection button with test ID
    const browseButton = page.getByTestId("app__hero__browse_button");
    await expect(browseButton).toBeVisible();
    await expect(browseButton).toContainText("Browse Collection");

    // 7. Test button hover effects and transformation
    await expect(browseButton).toHaveClass(/bg-pink-600/);
    await browseButton.hover();
    await expect(browseButton).toHaveClass(/hover:bg-pink-700/);
    await expect(browseButton).toHaveClass(/hover:scale-105/);

    // 8. Click the Browse Collection button
    await browseButton.click();

    // 9. Verify button click scrolls to sticker inventory section
    await page.waitForTimeout(1000); // Wait for scroll animation
    const stickerInventory = page.getByTestId("sticker_inventory");
    await expect(stickerInventory).toBeInViewport();
  });
});
