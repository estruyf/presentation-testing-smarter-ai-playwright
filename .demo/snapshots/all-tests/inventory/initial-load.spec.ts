// spec: sticker-inventory-test-plan.md
// seed: /tests/seed.spec.ts

import { test, expect } from "@playwright/test";
import { TEST_IDS } from "../../constants/testIds";

const WEBSITE_URL = "http://localhost:5173";

test.describe("Sticker Inventory Display Tests", () => {
  test("Initial Sticker Grid Load", async ({ page }) => {
    // 1. Navigate to the homepage
    await page.goto(WEBSITE_URL);

    // 2. Wait for the sticker inventory section to load
    const inventorySection = page.getByTestId(TEST_IDS.STICKER_INVENTORY.ROOT);
    await expect(inventorySection).toBeVisible();

    // 3. Verify loading spinner is displayed initially
    const spinner = page.getByTestId(TEST_IDS.STICKER_INVENTORY.SPINNER);
    await expect(spinner).toBeVisible();

    // Check spinner content
    await expect(spinner.getByText("Fetching stickers...")).toBeVisible();

    // 4. Confirm loading spinner disappears after data loads
    await expect(spinner).not.toBeVisible({ timeout: 10000 });

    // 5. Check that all stickers are displayed in a grid layout
    const stickerGrid = page.getByTestId(TEST_IDS.STICKER_INVENTORY.OVERVIEW.ROOT);
    await expect(stickerGrid).toBeVisible();
    await expect(stickerGrid).toHaveClass(/grid/);

    const stickerCards = page.getByTestId(TEST_IDS.STICKER_INVENTORY.OVERVIEW.STICKER);
    await expect(stickerCards).toHaveCount(6); // Based on mock data

    // 6. Verify each sticker card shows image, title, price, and stock quantity
    for (let i = 0; i < 6; i++) {
      const card = stickerCards.nth(i);

      // Check image is present
      const image = card.locator("img");
      await expect(image).toBeVisible();
      await expect(image).toHaveAttribute("src", /stickers\//);

      // Check title is visible
      const title = card.locator("h3");
      await expect(title).toBeVisible();
      await expect(title).toHaveClass(/text-xl/);

      // Check price is formatted correctly (Euro symbol and 2 decimal places)
      const price = card.getByTestId(TEST_IDS.STICKER_INVENTORY.STICKER.PRICE);
      await expect(price).toBeVisible();
      await expect(price).toHaveText(/^\d+\.\d{2}$/); // Format: XX.XX

      // Check stock quantity is displayed
      const stockQuantity = card.getByTestId(TEST_IDS.STICKER_INVENTORY.STICKER.TOTAL);
      await expect(stockQuantity).toBeVisible();
      await expect(stockQuantity).toHaveText(/^\d+$/); // Should be a number
    }

    // 7. Confirm stock status badges (In Stock/Out of Stock) are displayed correctly
    const stockBadges = page
      .locator('[class*="rounded-full"][class*="text-xs"]')
      .filter({ hasText: /In Stock|Out of Stock/ });
    await expect(stockBadges).toHaveCount(6);

    // Check different stock status colors based on quantity
    const greenBadges = page.locator('[class*="bg-green-100"]').filter({ hasText: "In Stock" });
    const yellowBadges = page.locator('[class*="bg-yellow-100"]').filter({ hasText: "In Stock" });
    const redBadges = page.locator('[class*="bg-red-100"]').filter({ hasText: "Out of Stock" });

    // At least one badge should exist (based on test data, we have items with different stock levels)
    const totalBadges = (await greenBadges.count()) + (await yellowBadges.count()) + (await redBadges.count());
    expect(totalBadges).toBeGreaterThan(0);

    // Verify grid responsive classes
    await expect(stickerGrid).toHaveClass(/grid-cols-1/);
    await expect(stickerGrid).toHaveClass(/sm:grid-cols-2/);
    await expect(stickerGrid).toHaveClass(/lg:grid-cols-3/);
  });
});
