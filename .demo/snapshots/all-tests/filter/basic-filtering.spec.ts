// spec: sticker-inventory-test-plan.md
// seed: /tests/seed.spec.ts

import { test, expect } from "@playwright/test";
import { TEST_IDS } from "../../constants/testIds";

const WEBSITE_URL = "http://localhost:5173";

test.describe("Filtering and Search Tests", () => {
  test("Basic Stock Filter Functionality", async ({ page }) => {
    // 1. Navigate to the homepage and wait for initial load
    await page.goto(WEBSITE_URL);

    // Wait for initial stickers to load
    await expect(page.getByTestId(TEST_IDS.STICKER_INVENTORY.SPINNER)).not.toBeVisible({ timeout: 10000 });

    const stickerCards = page.getByTestId(TEST_IDS.STICKER_INVENTORY.OVERVIEW.STICKER);
    await expect(stickerCards).toHaveCount(6); // All stickers initially

    // 2. Locate the stock filter input field
    const filterInput = page.getByTestId(TEST_IDS.STICKER_INVENTORY.FILTER.INPUT);
    await expect(filterInput).toBeVisible();
    await expect(filterInput).toHaveAttribute("placeholder", "Min stock...");
    await expect(filterInput).toHaveAttribute("type", "number");

    // 3. Enter a minimum stock value of 20
    await filterInput.fill("20");

    // Verify input value
    await expect(filterInput).toHaveValue("20");

    // 4. Click the Filter button
    const filterButton = page.getByTestId(TEST_IDS.STICKER_INVENTORY.FILTER.BUTTON);
    await expect(filterButton).toBeVisible();
    await expect(filterButton).toHaveText(/Filter/);

    // Get initial timestamp before filtering
    const refreshElement = page.getByTestId(TEST_IDS.STICKER_INVENTORY.REFRESH);
    const initialTimestamp = await refreshElement.textContent();

    await filterButton.click();

    // 5. Wait for the loading spinner to complete
    await expect(page.getByTestId(TEST_IDS.STICKER_INVENTORY.SPINNER)).toBeVisible();
    await expect(page.getByTestId(TEST_IDS.STICKER_INVENTORY.SPINNER)).not.toBeVisible({ timeout: 10000 });

    // 6. Verify that only stickers with stock >= 20 are displayed
    const filteredCards = page.getByTestId(TEST_IDS.STICKER_INVENTORY.OVERVIEW.STICKER);

    // Based on test data, stickers with stock >= 20: ID 1 (50), ID 2 (20), ID 4 (30)
    await expect(filteredCards).toHaveCount(3);

    // Verify each visible sticker has stock >= 20
    for (let i = 0; i < (await filteredCards.count()); i++) {
      const card = filteredCards.nth(i);
      const stockQuantity = card.getByTestId(TEST_IDS.STICKER_INVENTORY.STICKER.TOTAL);
      const stockText = await stockQuantity.textContent();
      const stockNumber = parseInt(stockText || "0");
      expect(stockNumber).toBeGreaterThanOrEqual(20);
    }

    // 7. Check that the refresh timestamp is updated
    const updatedTimestamp = await refreshElement.textContent();
    expect(updatedTimestamp).not.toBe(initialTimestamp);
    expect(updatedTimestamp).toMatch(/Updated: \d{1,2}:\d{2}:\d{2}/);

    // 8. Clear the filter and verify all stickers return
    await filterInput.clear();
    await expect(filterInput).toHaveValue("");

    await filterButton.click();

    // Wait for loading
    await expect(page.getByTestId(TEST_IDS.STICKER_INVENTORY.SPINNER)).not.toBeVisible({ timeout: 10000 });

    // Verify all stickers are back
    await expect(stickerCards).toHaveCount(6);

    // Test with different filter value
    await filterInput.fill("10");
    await filterButton.click();

    await expect(page.getByTestId(TEST_IDS.STICKER_INVENTORY.SPINNER)).not.toBeVisible({ timeout: 10000 });

    // Based on test data, stickers with stock >= 10: ID 1 (50), ID 2 (20), ID 4 (30), ID 5 (15)
    await expect(filteredCards).toHaveCount(4);

    // Test with value that includes all stickers
    await filterInput.fill("5");
    await filterButton.click();

    await expect(page.getByTestId(TEST_IDS.STICKER_INVENTORY.SPINNER)).not.toBeVisible({ timeout: 10000 });

    // All stickers have stock >= 5 based on test data
    await expect(filteredCards).toHaveCount(6);
  });
});
