// spec: sticker-inventory-test-plan.md
// seed: /tests/seed.spec.ts

import { test, expect } from "@playwright/test";
import { TEST_IDS } from "../../constants/testIds";

const WEBSITE_URL = "http://localhost:5173";

test.describe("API Integration Tests", () => {
  test("API Response Variations", async ({ page }) => {
    // 1. Mock API to return empty array response
    await page.route("/api/stickers*", async route => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ value: [] }),
      });
    });

    await page.goto(WEBSITE_URL);

    // Wait for loading to complete
    await expect(page.getByTestId(TEST_IDS.STICKER_INVENTORY.SPINNER)).not.toBeVisible({ timeout: 10000 });

    // Should show empty state
    const emptyState = page.getByTestId(TEST_IDS.STICKER_INVENTORY.EMPTY);
    await expect(emptyState).toBeVisible();
    await expect(emptyState.getByText("No stickers found")).toBeVisible();

    const stickerCards = page.getByTestId(TEST_IDS.STICKER_INVENTORY.OVERVIEW.STICKER);
    await expect(stickerCards).toHaveCount(0);

    // 2. Mock API to return single sticker response
    await page.unroute("/api/stickers*");
    await page.route("/api/stickers*", async route => {
      const singleSticker = [
        {
          Id: 1,
          Title: "Single Test Sticker",
          Description: "This is the only sticker available",
          Image: "single.webp",
          Price: 4.99,
          Total: 15,
        },
      ];

      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ value: singleSticker }),
      });
    });

    const filterButton = page.getByTestId(TEST_IDS.STICKER_INVENTORY.FILTER.BUTTON);
    await filterButton.click();

    await expect(page.getByTestId(TEST_IDS.STICKER_INVENTORY.SPINNER)).not.toBeVisible({ timeout: 10000 });

    // Should display single sticker correctly
    await expect(stickerCards).toHaveCount(1);
    await expect(stickerCards.first().locator("h3")).toHaveText("Single Test Sticker");

    const priceElement = stickerCards.first().getByTestId(TEST_IDS.STICKER_INVENTORY.STICKER.PRICE);
    await expect(priceElement).toHaveText("4.99");

    // 3. Mock API to return maximum number of stickers (stress test)
    await page.unroute("/api/stickers*");
    await page.route("/api/stickers*", async route => {
      const manyStickers = Array.from({ length: 50 }, (_, i) => ({
        Id: i + 1,
        Title: `Sticker ${i + 1}`,
        Description: `Description for sticker number ${i + 1}`,
        Image: `sticker${i + 1}.webp`,
        Price: Math.round((Math.random() * 10 + 1) * 100) / 100,
        Total: Math.floor(Math.random() * 100),
      }));

      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ value: manyStickers }),
      });
    });

    await filterButton.click();

    await expect(page.getByTestId(TEST_IDS.STICKER_INVENTORY.SPINNER)).not.toBeVisible({ timeout: 10000 });

    // Should handle large dataset efficiently
    await expect(stickerCards).toHaveCount(50);

    // Check that the grid is still responsive and well-formatted
    const stickerGrid = page.getByTestId(TEST_IDS.STICKER_INVENTORY.OVERVIEW.ROOT);
    await expect(stickerGrid).toHaveClass(/grid/);
    await expect(stickerGrid).toHaveClass(/grid-cols-1/);

    // 4. Mock API with malformed JSON response
    await page.unroute("/api/stickers*");
    await page.route("/api/stickers*", async route => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: '{ "value": [ invalid json',
      });
    });

    await filterButton.click();

    // Should show error state
    const errorElement = page.getByTestId(TEST_IDS.STICKER_INVENTORY.ERROR);
    await expect(errorElement).toBeVisible({ timeout: 10000 });

    // 5. Mock API with missing required fields in sticker data
    await page.unroute("/api/stickers*");
    await page.route("/api/stickers*", async route => {
      const incompleteStickers = [
        { Id: 1, Title: "Incomplete Sticker 1", Image: "test1.webp" }, // Missing Description, Price, Total
        { Id: 2, Description: "Has description but no title", Price: 5.0, Total: 10 }, // Missing Title, Image
        { Id: 3, Title: "Complete Sticker", Description: "Full data", Image: "test3.webp", Price: 3.5, Total: 20 },
      ];

      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ value: incompleteStickers }),
      });
    });

    await filterButton.click();

    await expect(page.getByTestId(TEST_IDS.STICKER_INVENTORY.SPINNER)).not.toBeVisible({ timeout: 10000 });

    // Application should handle missing fields gracefully
    await expect(stickerCards).toHaveCount(3);

    // Check that cards with missing data still render without crashing
    const firstCard = stickerCards.first();
    await expect(firstCard).toBeVisible();

    // 6. Mock API with unexpected additional fields
    await page.unroute("/api/stickers*");
    await page.route("/api/stickers*", async route => {
      const stickersWithExtraFields = [
        {
          Id: 1,
          Title: "Extended Sticker",
          Description: "Sticker with extra data",
          Image: "extended.webp",
          Price: 6.5,
          Total: 30,
          // Extra fields that shouldn't break the app
          extraField1: "unexpected data",
          category: "dev-stickers",
          metadata: { tags: ["react", "typescript"], featured: true },
          createdAt: "2023-01-01T00:00:00Z",
        },
      ];

      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ value: stickersWithExtraFields }),
      });
    });

    await filterButton.click();

    await expect(page.getByTestId(TEST_IDS.STICKER_INVENTORY.SPINNER)).not.toBeVisible({ timeout: 10000 });

    // Should handle extra fields without issues
    await expect(stickerCards).toHaveCount(1);
    await expect(stickerCards.first().locator("h3")).toHaveText("Extended Sticker");

    // 7. Test API response with extremely long text fields
    await page.unroute("/api/stickers*");
    await page.route("/api/stickers*", async route => {
      const longTextSticker = [
        {
          Id: 1,
          Title: "A".repeat(200), // Very long title
          Description: "B".repeat(1000), // Very long description
          Image: "long-text.webp",
          Price: 7.99,
          Total: 40,
        },
      ];

      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ value: longTextSticker }),
      });
    });

    await filterButton.click();

    await expect(page.getByTestId(TEST_IDS.STICKER_INVENTORY.SPINNER)).not.toBeVisible({ timeout: 10000 });

    // Should handle long text without breaking layout
    await expect(stickerCards).toHaveCount(1);
    const cardWithLongText = stickerCards.first();
    await expect(cardWithLongText).toBeVisible();

    // Check that long text doesn't overflow container
    const titleElement = cardWithLongText.locator("h3");
    await expect(titleElement).toBeVisible();

    // 8. Mock delayed API responses to test loading states
    await page.unroute("/api/stickers*");
    await page.route("/api/stickers*", async route => {
      // Simulate slow network
      await new Promise(resolve => setTimeout(resolve, 2000));

      const delayedStickers = [
        {
          Id: 1,
          Title: "Delayed Sticker",
          Description: "This sticker loaded slowly",
          Image: "delayed.webp",
          Price: 8.0,
          Total: 12,
        },
      ];

      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ value: delayedStickers }),
      });
    });

    await filterButton.click();

    // Should show loading state
    await expect(page.getByTestId(TEST_IDS.STICKER_INVENTORY.SPINNER)).toBeVisible();

    // And then hide it after loading completes
    await expect(page.getByTestId(TEST_IDS.STICKER_INVENTORY.SPINNER)).not.toBeVisible({ timeout: 5000 });

    // Should display the delayed sticker
    await expect(stickerCards).toHaveCount(1);
    await expect(stickerCards.first().locator("h3")).toHaveText("Delayed Sticker");
  });
});
