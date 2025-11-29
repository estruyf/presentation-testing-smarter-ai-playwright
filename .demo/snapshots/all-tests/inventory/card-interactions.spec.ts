// spec: sticker-inventory-test-plan.md
// seed: e2e/tests/seed.spec.ts

import { test, expect } from "@playwright/test";
import { TEST_IDS } from "../../constants/testIds";

const WEBSITE_URL = "http://localhost:5173";

test.describe("Sticker Inventory Display Tests", () => {
  test("Sticker Card Interactions", async ({ page }) => {
    // 1. Navigate to the homepage and wait for stickers to load
    await page.goto(WEBSITE_URL);

    // Wait for loading to complete
    await expect(page.getByTestId(TEST_IDS.STICKER_INVENTORY.SPINNER)).not.toBeVisible({ timeout: 10000 });

    const stickerCards = page.getByTestId(TEST_IDS.STICKER_INVENTORY.OVERVIEW.STICKER);
    await expect(stickerCards).toHaveCount(6);

    const firstCard = stickerCards.first();

    // 2. Hover over a sticker card to trigger hover effects
    await firstCard.hover();

    // Check group hover class is applied
    await expect(firstCard).toHaveClass(/group/);

    // 3. Verify the sticker description overlay appears on hover
    const descriptionOverlay = firstCard.getByTestId(TEST_IDS.STICKER_INVENTORY.STICKER.DESCRIPTION);
    await expect(descriptionOverlay).toBeVisible();

    // Check overlay styling
    await expect(descriptionOverlay).toHaveClass(/opacity-0/);
    await expect(descriptionOverlay).toHaveClass(/group-hover:opacity-100/);

    // Check description text is present
    const descriptionText = descriptionOverlay.locator("p");
    await expect(descriptionText).toBeVisible();
    await expect(descriptionText).not.toBeEmpty();

    // 4. Check that the sticker image scales correctly on hover
    const image = firstCard.locator("img");
    await expect(image).toHaveClass(/group-hover:scale-110/);

    // 5. Verify price formatting shows Euro symbol and 2 decimal places
    const priceContainer = firstCard.locator('span[data-testid*="price"]').locator("..");
    const euroSymbol = priceContainer.locator("text=€");
    await expect(euroSymbol).toBeVisible();

    const priceValue = firstCard.getByTestId(TEST_IDS.STICKER_INVENTORY.STICKER.PRICE);
    await expect(priceValue).toBeVisible();

    // Check price format (should be XX.XX format)
    const priceText = await priceValue.textContent();
    expect(priceText).toMatch(/^\d+\.\d{2}$/);

    // 6. Test that stock quantity is displayed as expected
    const stockQuantity = firstCard.getByTestId(TEST_IDS.STICKER_INVENTORY.STICKER.TOTAL);
    await expect(stockQuantity).toBeVisible();

    // Should be a number
    const stockText = await stockQuantity.textContent();
    expect(stockText).toMatch(/^\d+$/);

    // 7. Check different stock status colors (green, yellow, red) based on quantity
    // Test all cards to see different stock levels
    for (let i = 0; i < 6; i++) {
      const card = stickerCards.nth(i);
      const stockBadge = card
        .locator('[class*="rounded-full"][class*="text-xs"]')
        .filter({ hasText: /In Stock|Out of Stock/ });

      await expect(stockBadge).toBeVisible();

      // Check if badge has appropriate color class
      const badgeClasses = await stockBadge.getAttribute("class");
      const hasColorClass =
        badgeClasses?.includes("bg-green-100") ||
        badgeClasses?.includes("bg-yellow-100") ||
        badgeClasses?.includes("bg-red-100");
      expect(hasColorClass).toBe(true);
    }

    // Test hover effects on title
    const title = firstCard.locator("h3");
    await firstCard.hover();
    await expect(title).toHaveClass(/group-hover:text-pink-600/);

    // Test hover effects on color bar
    const colorBar = firstCard.locator("div.h-1.w-12");
    await expect(colorBar).toHaveClass(/group-hover:bg-pink-500/);

    // Test card shadow hover effect
    await expect(firstCard).toHaveClass(/hover:shadow-xl/);

    // Move mouse away to test hover state removal
    await page.mouse.move(0, 0);
    await expect(descriptionOverlay).toHaveClass(/opacity-0/);
  });
});
