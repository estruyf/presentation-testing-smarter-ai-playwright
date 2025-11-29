// spec: sticker-inventory-test-plan.md
// seed: e2e/tests/seed.spec.ts

import { test, expect } from "@playwright/test";
import { TEST_IDS } from "../../constants/testIds";

const WEBSITE_URL = "http://localhost:5173";

test.describe("Sticker Inventory Display Tests", () => {
  test("Empty State Display", async ({ page }) => {
    // 1. Navigate to the homepage
    await page.goto(WEBSITE_URL);

    // Wait for initial loading to complete
    await expect(page.getByTestId(TEST_IDS.STICKER_INVENTORY.SPINNER)).not.toBeVisible({ timeout: 10000 });

    // 2. Apply a filter that returns no results (e.g., minimum stock > 100)
    const filterInput = page.getByTestId(TEST_IDS.STICKER_INVENTORY.FILTER.INPUT);
    await expect(filterInput).toBeVisible();

    await filterInput.fill("100");

    // 3. Click the filter button to execute the search
    const filterButton = page.getByTestId(TEST_IDS.STICKER_INVENTORY.FILTER.BUTTON);
    await expect(filterButton).toBeVisible();
    await filterButton.click();

    // 4. Wait for the request to complete
    await expect(page.getByTestId(TEST_IDS.STICKER_INVENTORY.SPINNER)).toBeVisible();
    await expect(page.getByTestId(TEST_IDS.STICKER_INVENTORY.SPINNER)).not.toBeVisible({ timeout: 10000 });

    // 5. Verify the empty state message is displayed
    const emptyState = page.getByTestId(TEST_IDS.STICKER_INVENTORY.EMPTY);
    await expect(emptyState).toBeVisible();

    // Check empty state styling
    await expect(emptyState).toHaveClass(/bg-white/);
    await expect(emptyState).toHaveClass(/flex/);
    await expect(emptyState).toHaveClass(/items-center/);
    await expect(emptyState).toHaveClass(/justify-center/);

    // 6. Check that the search icon and 'No stickers found' message appear
    const searchIcon = emptyState.locator("text=🔍");
    await expect(searchIcon).toBeVisible();

    const noStickersMessage = emptyState.getByText("No stickers found");
    await expect(noStickersMessage).toBeVisible();
    await expect(noStickersMessage).toHaveClass(/text-lg/);
    await expect(noStickersMessage).toHaveClass(/font-medium/);
    await expect(noStickersMessage).toHaveClass(/text-gray-900/);

    // 7. Confirm the suggestion to 'Try adjusting your filter criteria' is shown
    const suggestion = emptyState.getByText("Try adjusting your filter criteria");
    await expect(suggestion).toBeVisible();
    await expect(suggestion).toHaveClass(/text-gray-500/);

    // Verify no sticker cards are displayed
    const stickerCards = page.getByTestId(TEST_IDS.STICKER_INVENTORY.OVERVIEW.STICKER);
    await expect(stickerCards).toHaveCount(0);

    // Verify the grid container is not visible when empty
    const stickerGrid = page.getByTestId(TEST_IDS.STICKER_INVENTORY.OVERVIEW.ROOT);
    await expect(stickerGrid).not.toBeVisible();

    // Test that clearing the filter restores the stickers
    await filterInput.clear();
    await filterButton.click();

    // Wait for loading and verify stickers return
    await expect(page.getByTestId(TEST_IDS.STICKER_INVENTORY.SPINNER)).not.toBeVisible({ timeout: 10000 });
    await expect(stickerCards).toHaveCount(6);
    await expect(emptyState).not.toBeVisible();

    // Test with another filter value that should return empty results
    await filterInput.fill("999");
    await filterButton.click();

    await expect(page.getByTestId(TEST_IDS.STICKER_INVENTORY.SPINNER)).not.toBeVisible({ timeout: 10000 });
    await expect(emptyState).toBeVisible();
    await expect(stickerCards).toHaveCount(0);
  });
});
