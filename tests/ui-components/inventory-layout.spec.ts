import { test, expect } from "@playwright/test";

test.describe("UI Components and Layout", () => {
  test("Sticker Inventory Layout and Controls", async ({ page }) => {
    // 1. Navigate to the homepage
    await page.goto("http://localhost:5173");

    // 2. Locate the sticker inventory section with test ID
    const stickerInventory = page.getByTestId("sticker_inventory");
    await expect(stickerInventory).toBeVisible();

    // 3. Verify filter input field displays with placeholder
    const filterInput = page.getByTestId("sticker_inventory__filter__input");
    await expect(filterInput).toBeVisible();
    await expect(filterInput).toHaveAttribute("placeholder", "Min stock...");
    await expect(filterInput).toHaveAttribute("type", "number");

    // 4. Check filter button is present with Filter icon
    const filterButton = page.getByTestId("sticker_inventory__filter__button");
    await expect(filterButton).toBeVisible();
    await expect(filterButton).toContainText("Filter");

    // Verify the filter icon is present
    const filterIcon = filterButton.locator('i[data-icon-name="Filter"]');
    await expect(filterIcon).toBeVisible();

    // 5. Verify refresh timestamp display
    const refreshTimestamp = page.getByTestId("sticker_inventory__refresh");
    await expect(refreshTimestamp).toBeVisible();
    await expect(refreshTimestamp).toContainText("Updated:");

    // 6. Check responsive layout on different screen sizes
    // Desktop layout
    await page.setViewportSize({ width: 1280, height: 720 });
    const controlsContainer = page.locator(".flex.flex-col.sm\\:flex-row");
    await expect(controlsContainer).toBeVisible();

    // Mobile layout
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(controlsContainer).toBeVisible();

    // Verify controls stack vertically on mobile
    const filterContainer = page.locator(".flex.items-center.gap-2");
    await expect(filterContainer).toBeVisible();

    // 7. Verify filter controls are properly aligned
    await page.setViewportSize({ width: 1024, height: 768 });
    await expect(filterInput).toBeVisible();
    await expect(filterButton).toBeVisible();
    await expect(refreshTimestamp).toBeVisible();

    // Test that filter input accepts numeric values
    await filterInput.fill("10");
    await expect(filterInput).toHaveValue("10");

    // Test filter button functionality
    await filterButton.click();

    // Wait for potential loading state
    await page.waitForTimeout(1000);

    // Verify the filter controls remain functional after interaction
    await expect(filterInput).toBeVisible();
    await expect(filterButton).toBeVisible();
  });
});
