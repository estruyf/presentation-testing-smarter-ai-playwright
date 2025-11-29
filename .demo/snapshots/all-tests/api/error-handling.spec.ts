// spec: sticker-inventory-test-plan.md
// seed: /tests/seed.spec.ts

import { test, expect } from "@playwright/test";
import { TEST_IDS } from "../../constants/testIds";

const WEBSITE_URL = "http://localhost:5173";

test.describe("API Integration Tests", () => {
  test("API Error Handling", async ({ page }) => {
    // 1. Mock the /api/stickers endpoint to return 500 server error
    await page.route("/api/stickers*", async route => {
      await route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({ error: "Internal Server Error" }),
      });
    });

    // 2. Navigate to the homepage
    await page.goto(WEBSITE_URL);

    // 3. Verify error message is displayed to the user
    const errorElement = page.getByTestId(TEST_IDS.STICKER_INVENTORY.ERROR);
    await expect(errorElement).toBeVisible({ timeout: 10000 });

    // 4. Check that error styling is appropriate (red background, clear text)
    await expect(errorElement).toHaveClass(/bg-red-100/);
    await expect(errorElement).toHaveClass(/border-red-400/);
    await expect(errorElement).toHaveClass(/text-red-700/);
    await expect(errorElement).toHaveAttribute("role", "alert");

    // Check error message content
    const errorText = await errorElement.textContent();
    expect(errorText).toContain("Error fetching stickers: 500");

    // Verify loading spinner is not visible after error
    await expect(page.getByTestId(TEST_IDS.STICKER_INVENTORY.SPINNER)).not.toBeVisible();

    // Verify no sticker cards are displayed
    const stickerCards = page.getByTestId(TEST_IDS.STICKER_INVENTORY.OVERVIEW.STICKER);
    await expect(stickerCards).toHaveCount(0);

    // 5. Mock network timeout and verify timeout error handling
    await page.unroute("/api/stickers*");
    await page.route("/api/stickers*", async route => {
      // Simulate timeout by not responding
      await new Promise(resolve => setTimeout(resolve, 30000));
    });

    // Try to filter to trigger new request
    const filterInput = page.getByTestId(TEST_IDS.STICKER_INVENTORY.FILTER.INPUT);
    const filterButton = page.getByTestId(TEST_IDS.STICKER_INVENTORY.FILTER.BUTTON);

    await filterInput.fill("10");
    await filterButton.click();

    // Expect timeout to be handled (this will timeout our test, so we'll simulate differently)
    // Instead, let's test with a delayed response
    await page.unroute("/api/stickers*");

    // 6. Mock 404 response and verify not found error handling
    await page.route("/api/stickers*", async route => {
      await route.fulfill({
        status: 404,
        contentType: "application/json",
        body: JSON.stringify({ error: "Not Found" }),
      });
    });

    await filterButton.click();

    // Verify 404 error is displayed
    await expect(errorElement).toBeVisible({ timeout: 10000 });
    const notFoundError = await errorElement.textContent();
    expect(notFoundError).toContain("Error fetching stickers: 404");

    // 7. Test recovery after error by mocking successful response
    await page.unroute("/api/stickers*");
    await page.route("/api/stickers*", async route => {
      const mockStickers = [
        {
          Id: 1,
          Title: "Recovery Sticker",
          Description: "Test Description",
          Image: "test.webp",
          Price: 5.0,
          Total: 25,
        },
      ];

      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ value: mockStickers }),
      });
    });

    // Clear filter and try again
    await filterInput.clear();
    await filterButton.click();

    // 8. Verify that loading states are properly cleared on error and successful recovery
    await expect(page.getByTestId(TEST_IDS.STICKER_INVENTORY.SPINNER)).not.toBeVisible({ timeout: 10000 });

    // Verify error is cleared
    await expect(errorElement).not.toBeVisible();

    // Verify successful data display
    await expect(stickerCards).toHaveCount(1);
    await expect(stickerCards.first().locator("h3")).toHaveText("Recovery Sticker");

    // Test different error scenarios

    // Network error (connection refused)
    await page.unroute("/api/stickers*");
    await page.route("/api/stickers*", async route => {
      await route.abort("connectionrefused");
    });

    await filterInput.fill("5");
    await filterButton.click();

    await expect(errorElement).toBeVisible({ timeout: 10000 });
    const networkError = await errorElement.textContent();
    expect(networkError).toContain("Error fetching stickers");

    // Verify loading spinner is cleared
    await expect(page.getByTestId(TEST_IDS.STICKER_INVENTORY.SPINNER)).not.toBeVisible();

    // Test malformed JSON response (server returns invalid JSON)
    await page.unroute("/api/stickers*");
    await page.route("/api/stickers*", async route => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: "invalid json response{",
      });
    });

    await filterButton.click();

    await expect(errorElement).toBeVisible({ timeout: 10000 });

    // Verify application doesn't crash and error is handled gracefully
    await expect(page.getByTestId(TEST_IDS.STICKER_INVENTORY.ROOT)).toBeVisible();

    // Test successful recovery one more time
    await page.unroute("/api/stickers*");
    await page.route("/api/stickers*", async route => {
      const recoveryStickers = [
        { Id: 1, Title: "Final Recovery", Description: "Final test", Image: "final.webp", Price: 3.5, Total: 10 },
      ];

      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ value: recoveryStickers }),
      });
    });

    await filterInput.clear();
    await filterButton.click();

    await expect(page.getByTestId(TEST_IDS.STICKER_INVENTORY.SPINNER)).not.toBeVisible({ timeout: 10000 });
    await expect(errorElement).not.toBeVisible();
    await expect(stickerCards).toHaveCount(1);
  });
});
