// spec: sticker-inventory-test-plan.md
// seed: /tests/seed.spec.ts

import { test, expect } from "@playwright/test";
import { TEST_IDS } from "../../constants/testIds";

const WEBSITE_URL = "http://localhost:5173";

test.describe("End-to-End User Journey Tests", () => {
  test("Error Recovery User Experience", async ({ page }) => {
    // 1. Navigate to homepage during simulated API outage
    // Mock API to fail initially
    let apiCallCount = 0;
    await page.route("/api/stickers*", async route => {
      apiCallCount++;

      // First few calls fail (simulating outage)
      if (apiCallCount <= 2) {
        await route.fulfill({
          status: 500,
          contentType: "application/json",
          body: JSON.stringify({ error: "Service temporarily unavailable" }),
        });
      } else {
        // Later calls succeed (simulating recovery)
        const mockStickers = [
          {
            Id: 1,
            Title: "Recovery Sticker 1",
            Description: "This sticker shows recovery works",
            Image: "recovery1.webp",
            Price: 5.5,
            Total: 25,
          },
          {
            Id: 2,
            Title: "Recovery Sticker 2",
            Description: "Another recovered sticker",
            Image: "recovery2.webp",
            Price: 4.0,
            Total: 15,
          },
          {
            Id: 3,
            Title: "Recovery Sticker 3",
            Description: "Final recovery sticker",
            Image: "recovery3.webp",
            Price: 6.0,
            Total: 30,
          },
        ];

        const url = new URL(route.request().url());
        const minParam = url.searchParams.get("min");
        let filteredStickers = mockStickers;

        if (minParam && parseInt(minParam) > 0) {
          filteredStickers = mockStickers.filter(s => s.Total >= parseInt(minParam));
        }

        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ value: filteredStickers }),
        });
      }
    });

    await page.goto(WEBSITE_URL);

    // 2. Observe error message display and user guidance
    const errorElement = page.getByTestId(TEST_IDS.STICKER_INVENTORY.ERROR);
    await expect(errorElement).toBeVisible({ timeout: 10000 });

    // Check error message is user-friendly
    const errorText = await errorElement.textContent();
    expect(errorText).toContain("Error fetching stickers");
    expect(errorText).toContain("500"); // Status code should be mentioned

    // Verify error styling provides clear visual feedback
    await expect(errorElement).toHaveClass(/bg-red-100/);
    await expect(errorElement).toHaveClass(/text-red-700/);
    await expect(errorElement).toHaveAttribute("role", "alert");

    // Verify no stickers are displayed during error state
    const stickerCards = page.getByTestId(TEST_IDS.STICKER_INVENTORY.OVERVIEW.STICKER);
    await expect(stickerCards).toHaveCount(0);

    // Verify loading spinner is not stuck visible
    const spinner = page.getByTestId(TEST_IDS.STICKER_INVENTORY.SPINNER);
    await expect(spinner).not.toBeVisible();

    // User sees the interface is still functional
    const filterInput = page.getByTestId(TEST_IDS.STICKER_INVENTORY.FILTER.INPUT);
    const filterButton = page.getByTestId(TEST_IDS.STICKER_INVENTORY.FILTER.BUTTON);

    await expect(filterInput).toBeVisible();
    await expect(filterButton).toBeVisible();
    await expect(filterInput).toBeEnabled();
    await expect(filterButton).toBeEnabled();

    // User can still interact with the interface during error state
    await filterInput.fill("10");
    await expect(filterInput).toHaveValue("10");

    // 3. Wait for API to recover (simulate fix)
    // User tries again - this will trigger the third API call which should succeed
    await filterButton.click();

    // Show loading state during recovery attempt
    await expect(spinner).toBeVisible();

    // 4. Apply filter to trigger new API call
    await expect(spinner).not.toBeVisible({ timeout: 10000 });

    // 5. Verify that system recovers and displays stickers correctly
    // Error should be cleared
    await expect(errorElement).not.toBeVisible();

    // Stickers should now be displayed
    await expect(stickerCards).toHaveCount(3); // All recovery stickers meet min=10 criteria

    // Verify sticker data is displayed correctly
    const firstCard = stickerCards.first();
    await expect(firstCard.locator("h3")).toHaveText("Recovery Sticker 1");

    const price = firstCard.getByTestId(TEST_IDS.STICKER_INVENTORY.STICKER.PRICE);
    await expect(price).toHaveText("5.50");

    const stock = firstCard.getByTestId(TEST_IDS.STICKER_INVENTORY.STICKER.TOTAL);
    await expect(stock).toHaveText("25");

    // 6. Test user's ability to continue browsing after error recovery
    // User should be able to use all features normally

    // Test filtering works after recovery
    await filterInput.clear();
    await filterInput.fill("20");
    await filterButton.click();

    await expect(spinner).not.toBeVisible({ timeout: 10000 });

    // Should show filtered results (stickers with stock >= 20)
    const filteredCards = page.getByTestId(TEST_IDS.STICKER_INVENTORY.OVERVIEW.STICKER);
    await expect(filteredCards).toHaveCount(2); // Recovery Sticker 1 (25) and Recovery Sticker 3 (30)

    // Verify filtering worked correctly
    for (let i = 0; i < (await filteredCards.count()); i++) {
      const card = filteredCards.nth(i);
      const stockElement = card.getByTestId(TEST_IDS.STICKER_INVENTORY.STICKER.TOTAL);
      const stockValue = parseInt((await stockElement.textContent()) || "0");
      expect(stockValue).toBeGreaterThanOrEqual(20);
    }

    // Test hover interactions work after recovery
    const recoveredCard = filteredCards.first();
    await recoveredCard.hover();

    const description = recoveredCard.getByTestId(TEST_IDS.STICKER_INVENTORY.STICKER.DESCRIPTION);
    await expect(description).toBeVisible();
    await expect(description.locator("p")).toHaveText("This sticker shows recovery works");

    // Test clearing filter works
    await filterInput.clear();
    await filterButton.click();

    await expect(spinner).not.toBeVisible({ timeout: 10000 });
    await expect(stickerCards).toHaveCount(3); // All stickers back

    // Test that timestamp updates properly after recovery
    const refreshElement = page.getByTestId(TEST_IDS.STICKER_INVENTORY.REFRESH);
    await expect(refreshElement).toBeVisible();
    const timestampText = await refreshElement.textContent();
    expect(timestampText).toMatch(/Updated: \d{1,2}:\d{2}:\d{2}/);

    // Simulate another error to test resilience
    let secondErrorCallCount = 0;
    await page.unroute("/api/stickers*");
    await page.route("/api/stickers*", async route => {
      secondErrorCallCount++;

      if (secondErrorCallCount === 1) {
        // Simulate network timeout
        await route.abort("connectionrefused");
      } else {
        // Recovery
        const recoveryStickers = [
          {
            Id: 1,
            Title: "Resilient Sticker",
            Description: "System is resilient to errors",
            Image: "resilient.webp",
            Price: 7.99,
            Total: 40,
          },
        ];

        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ value: recoveryStickers }),
        });
      }
    });

    // Trigger another error
    await filterInput.fill("5");
    await filterButton.click();

    // Error should appear again
    await expect(errorElement).toBeVisible({ timeout: 10000 });
    const secondErrorText = await errorElement.textContent();
    expect(secondErrorText).toContain("Error fetching stickers");

    // User tries again
    await filterButton.click();

    // Should recover again
    await expect(spinner).not.toBeVisible({ timeout: 10000 });
    await expect(errorElement).not.toBeVisible();
    await expect(stickerCards).toHaveCount(1);
    await expect(stickerCards.first().locator("h3")).toHaveText("Resilient Sticker");

    // Verify user confidence is maintained through clear communication
    // Check that the UI remains stable and predictable
    await expect(page.getByTestId(TEST_IDS.STICKER_INVENTORY.ROOT)).toBeVisible();
    await expect(filterInput).toBeEnabled();
    await expect(filterButton).toBeEnabled();

    // Test responsive behavior during and after errors
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(errorElement).not.toBeVisible();
    await expect(stickerCards).toHaveCount(1);

    // Reset to desktop
    await page.setViewportSize({ width: 1280, height: 720 });

    // Final verification that everything works normally
    await filterInput.clear();
    await filterButton.click();

    await expect(spinner).not.toBeVisible({ timeout: 10000 });
    await expect(stickerCards).toHaveCount(1);

    // User journey concludes successfully despite encountering errors
    console.log(
      "Error recovery journey completed - user maintained confidence and successfully continued browsing after multiple error scenarios"
    );

    // Clean up
    await page.unroute("/api/stickers*");
  });
});
