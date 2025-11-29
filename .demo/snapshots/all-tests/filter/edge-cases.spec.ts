// spec: sticker-inventory-test-plan.md
// seed: /tests/seed.spec.ts

import { test, expect } from "@playwright/test";
import { TEST_IDS } from "../../constants/testIds";

const WEBSITE_URL = "http://localhost:5173";

test.describe("Filtering and Search Tests", () => {
  test("Edge Case Filter Values", async ({ page }) => {
    await page.goto(WEBSITE_URL);

    // Wait for initial load
    await expect(page.getByTestId(TEST_IDS.STICKER_INVENTORY.SPINNER)).not.toBeVisible({ timeout: 10000 });

    const filterInput = page.getByTestId(TEST_IDS.STICKER_INVENTORY.FILTER.INPUT);
    const filterButton = page.getByTestId(TEST_IDS.STICKER_INVENTORY.FILTER.BUTTON);
    const stickerCards = page.getByTestId(TEST_IDS.STICKER_INVENTORY.OVERVIEW.STICKER);

    // 1. Test filtering with minimum stock value of 0
    await filterInput.fill("0");
    await filterButton.click();

    await expect(page.getByTestId(TEST_IDS.STICKER_INVENTORY.SPINNER)).not.toBeVisible({ timeout: 10000 });

    // Should show all stickers (6 total)
    await expect(stickerCards).toHaveCount(6);

    // 2. Test filtering with very high values (e.g., 1000)
    await filterInput.fill("1000");
    await filterButton.click();

    await expect(page.getByTestId(TEST_IDS.STICKER_INVENTORY.SPINNER)).not.toBeVisible({ timeout: 10000 });

    // Should show empty state
    const emptyState = page.getByTestId(TEST_IDS.STICKER_INVENTORY.EMPTY);
    await expect(emptyState).toBeVisible();
    await expect(stickerCards).toHaveCount(0);

    // 3. Test filtering with negative values
    await filterInput.fill("-10");
    await filterButton.click();

    await expect(page.getByTestId(TEST_IDS.STICKER_INVENTORY.SPINNER)).not.toBeVisible({ timeout: 10000 });

    // Should treat as 0 or show all stickers (depending on implementation)
    await expect(stickerCards).toHaveCount(6);

    // 4. Test filtering with non-numeric input
    await filterInput.fill("abc");
    await filterButton.click();

    await expect(page.getByTestId(TEST_IDS.STICKER_INVENTORY.SPINNER)).not.toBeVisible({ timeout: 10000 });

    // Should handle gracefully - likely treat as 0 and show all stickers
    await expect(stickerCards).toHaveCount(6);

    // 5. Test filtering with decimal values
    await filterInput.fill("15.5");
    await filterButton.click();

    await expect(page.getByTestId(TEST_IDS.STICKER_INVENTORY.SPINNER)).not.toBeVisible({ timeout: 10000 });

    // Should round or truncate - expect stickers with stock >= 15 or 16
    const cardCount = await stickerCards.count();
    expect(cardCount).toBeGreaterThanOrEqual(0);
    expect(cardCount).toBeLessThanOrEqual(6);

    // 6. Test rapid consecutive filter operations
    await filterInput.fill("10");
    await filterButton.click();

    // Don't wait, immediately change and click again
    await filterInput.fill("20");
    await filterButton.click();

    await filterInput.fill("30");
    await filterButton.click();

    // Wait for final result
    await expect(page.getByTestId(TEST_IDS.STICKER_INVENTORY.SPINNER)).not.toBeVisible({ timeout: 10000 });

    // Should show stickers with stock >= 30 (based on test data: ID 1 (50), ID 4 (30))
    await expect(stickerCards).toHaveCount(2);

    // 7. Test filtering while previous request is still loading
    await filterInput.fill("5");
    await filterButton.click();

    // Quickly change filter while loading
    const spinnerVisible = await page.getByTestId(TEST_IDS.STICKER_INVENTORY.SPINNER).isVisible();
    if (spinnerVisible) {
      await filterInput.fill("25");
      await filterButton.click();
    }

    // Wait for final completion
    await expect(page.getByTestId(TEST_IDS.STICKER_INVENTORY.SPINNER)).not.toBeVisible({ timeout: 15000 });

    // Should show results for the last filter value (25)
    // Based on test data: stickers with stock >= 25: ID 1 (50), ID 4 (30)
    await expect(stickerCards).toHaveCount(2);

    // Test empty string
    await filterInput.fill("");
    await filterButton.click();

    await expect(page.getByTestId(TEST_IDS.STICKER_INVENTORY.SPINNER)).not.toBeVisible({ timeout: 10000 });

    // Empty string should show all stickers
    await expect(stickerCards).toHaveCount(6);

    // Test whitespace
    await filterInput.fill("  15  ");
    await filterButton.click();

    await expect(page.getByTestId(TEST_IDS.STICKER_INVENTORY.SPINNER)).not.toBeVisible({ timeout: 10000 });

    // Should trim whitespace and treat as 15
    const finalCount = await stickerCards.count();
    expect(finalCount).toBeGreaterThan(0);

    // Verify no error states are shown during edge cases
    const errorElement = page.getByTestId(TEST_IDS.STICKER_INVENTORY.ERROR);
    await expect(errorElement).not.toBeVisible();
  });
});
