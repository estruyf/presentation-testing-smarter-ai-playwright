// spec: sticker-inventory-test-plan.md
// seed: e2e/tests/seed.spec.ts

import { test, expect } from "@playwright/test";
import { TEST_IDS } from "../../constants/testIds";

const WEBSITE_URL = "http://localhost:5173";

test.describe("API Integration Tests", () => {
  test("Successful API Calls", async ({ page }) => {
    // Mock the /api/stickers endpoint to return successful response
    await page.route("/api/stickers*", async route => {
      const url = new URL(route.request().url());
      const minParam = url.searchParams.get("min");

      // Mock data based on filter
      const allStickers = [
        {
          Id: 1,
          Title: "Test Sticker 1",
          Description: "Test Description 1",
          Image: "test1.webp",
          Price: 5.0,
          Total: 50,
        },
        {
          Id: 2,
          Title: "Test Sticker 2",
          Description: "Test Description 2",
          Image: "test2.webp",
          Price: 3.5,
          Total: 20,
        },
        {
          Id: 3,
          Title: "Test Sticker 3",
          Description: "Test Description 3",
          Image: "test3.webp",
          Price: 4.0,
          Total: 5,
        },
      ];

      let filteredStickers = allStickers;
      if (minParam && parseInt(minParam) > 0) {
        filteredStickers = allStickers.filter(s => s.Total >= parseInt(minParam));
      }

      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ value: filteredStickers }),
      });
    });

    // Track API requests
    const apiRequests: any[] = [];
    page.on("request", request => {
      if (request.url().includes("/api/stickers")) {
        apiRequests.push({
          url: request.url(),
          method: request.method(),
          headers: request.headers(),
        });
      }
    });

    // 1. Navigate to the homepage
    await page.goto(WEBSITE_URL);

    // 2. Intercept and verify the initial API call is made correctly
    await expect(page.getByTestId(TEST_IDS.STICKER_INVENTORY.SPINNER)).not.toBeVisible({ timeout: 10000 });

    // Verify initial API call was made
    expect(apiRequests.length).toBeGreaterThan(0);
    const initialRequest = apiRequests[0];

    expect(initialRequest.method).toBe("GET");
    expect(initialRequest.url).toContain("/api/stickers");

    // 3. Check that request headers include proper Content-Type and Accept headers
    expect(initialRequest.headers["accept"]).toBe("application/json");
    expect(initialRequest.headers["content-type"]).toBe("application/json");

    // 4. Apply a filter and verify the filtered API call includes min parameter
    const filterInput = page.getByTestId(TEST_IDS.STICKER_INVENTORY.FILTER.INPUT);
    const filterButton = page.getByTestId(TEST_IDS.STICKER_INVENTORY.FILTER.BUTTON);

    await filterInput.fill("10");

    const requestCountBefore = apiRequests.length;
    await filterButton.click();

    // Wait for new request
    await expect(page.getByTestId(TEST_IDS.STICKER_INVENTORY.SPINNER)).not.toBeVisible({ timeout: 10000 });

    // Verify new API call was made with filter parameter
    expect(apiRequests.length).toBe(requestCountBefore + 1);
    const filterRequest = apiRequests[apiRequests.length - 1];

    expect(filterRequest.url).toContain("min=10");
    expect(filterRequest.method).toBe("GET");

    // 5. Verify response data is properly processed and displayed
    const stickerCards = page.getByTestId(TEST_IDS.STICKER_INVENTORY.OVERVIEW.STICKER);
    await expect(stickerCards).toHaveCount(2); // Based on our mock data with min=10

    // Check that sticker data is properly displayed
    const firstCard = stickerCards.first();
    await expect(firstCard.locator("h3")).toHaveText("Test Sticker 1");

    const priceElement = firstCard.getByTestId(TEST_IDS.STICKER_INVENTORY.STICKER.PRICE);
    await expect(priceElement).toHaveText("5.00");

    const stockElement = firstCard.getByTestId(TEST_IDS.STICKER_INVENTORY.STICKER.TOTAL);
    await expect(stockElement).toHaveText("50");

    // 6. Confirm network request timing and performance
    const performanceEntries = await page.evaluate(() => {
      return performance
        .getEntriesByType("resource")
        .filter((entry: any) => entry.name.includes("/api/stickers"))
        .map((entry: any) => ({
          name: entry.name,
          duration: entry.duration,
          responseStart: entry.responseStart,
          responseEnd: entry.responseEnd,
        }));
    });

    expect(performanceEntries.length).toBeGreaterThan(0);

    // Verify reasonable response times (under 2 seconds for mocked responses)
    performanceEntries.forEach(entry => {
      expect(entry.duration).toBeLessThan(2000);
    });

    // Test another filter to ensure API calls continue working
    await filterInput.fill("25");
    await filterButton.click();

    await expect(page.getByTestId(TEST_IDS.STICKER_INVENTORY.SPINNER)).not.toBeVisible({ timeout: 10000 });

    // Should now show only 1 sticker (Total: 50 >= 25)
    await expect(stickerCards).toHaveCount(1);

    // Verify the API was called with correct parameters
    const lastRequest = apiRequests[apiRequests.length - 1];
    expect(lastRequest.url).toContain("min=25");

    // Test clear filter (no min parameter)
    await filterInput.clear();
    await filterButton.click();

    await expect(page.getByTestId(TEST_IDS.STICKER_INVENTORY.SPINNER)).not.toBeVisible({ timeout: 10000 });

    // Should show all 3 mock stickers
    await expect(stickerCards).toHaveCount(3);

    // Verify API call without min parameter
    const clearRequest = apiRequests[apiRequests.length - 1];
    expect(clearRequest.url).not.toContain("min=");
  });
});
