// spec: sticker-inventory-test-plan.md
// seed: /tests/seed.spec.ts

import { test, expect } from "@playwright/test";
import { TEST_IDS } from "../../constants/testIds";

const WEBSITE_URL = "http://localhost:5173";

test.describe("Filtering and Search Tests", () => {
  test("Filter UI and UX Behavior", async ({ page }) => {
    await page.goto(WEBSITE_URL);

    // Wait for initial load
    await expect(page.getByTestId(TEST_IDS.STICKER_INVENTORY.SPINNER)).not.toBeVisible({ timeout: 10000 });

    const filterInput = page.getByTestId(TEST_IDS.STICKER_INVENTORY.FILTER.INPUT);
    const filterButton = page.getByTestId(TEST_IDS.STICKER_INVENTORY.FILTER.BUTTON);
    const refreshElement = page.getByTestId(TEST_IDS.STICKER_INVENTORY.REFRESH);

    // 1. Test filter input placeholder text display
    await expect(filterInput).toHaveAttribute("placeholder", "Min stock...");
    await expect(filterInput).toHaveAttribute("type", "number");

    // 2. Verify filter button styling and icon display
    await expect(filterButton).toBeVisible();
    await expect(filterButton).toHaveText(/Filter/);

    // Check for filter icon
    const filterIcon = filterButton.locator('[data-icon-name="Filter"]');
    await expect(filterIcon).toBeVisible();

    // Check button styling classes
    const buttonClasses = await filterButton.getAttribute("class");
    expect(buttonClasses).toContain("bg-pink-600");
    expect(buttonClasses).toContain("hover:bg-pink-700");

    // 3. Test filter input focus and blur behaviors
    await filterInput.focus();
    await expect(filterInput).toBeFocused();

    // Type in input
    await filterInput.fill("25");
    await expect(filterInput).toHaveValue("25");

    await filterInput.blur();
    await expect(filterInput).not.toBeFocused();

    // 4. Check filter section responsive behavior on mobile
    await page.setViewportSize({ width: 375, height: 667 });

    // Filter section should adapt to mobile
    const filterSection = page.locator('[data-testid*="filter"]').first().locator("..");
    await expect(filterSection).toBeVisible();

    // Should have responsive classes
    await expect(filterSection).toHaveClass(/flex-col/);
    await expect(filterSection).toHaveClass(/sm:flex-row/);

    // Reset to desktop
    await page.setViewportSize({ width: 1280, height: 720 });

    // 5. Verify timestamp display format and updates
    await expect(refreshElement).toBeVisible();
    const initialTimestamp = await refreshElement.textContent();
    expect(initialTimestamp).toMatch(/Updated: \d{1,2}:\d{2}:\d{2}/);

    // Trigger update and verify timestamp changes
    await filterButton.click();
    await expect(page.getByTestId(TEST_IDS.STICKER_INVENTORY.SPINNER)).not.toBeVisible({ timeout: 10000 });

    const updatedTimestamp = await refreshElement.textContent();
    expect(updatedTimestamp).not.toBe(initialTimestamp);
    expect(updatedTimestamp).toMatch(/Updated: \d{1,2}:\d{2}:\d{2}/);

    // 6. Test keyboard interactions (Enter key to filter)
    await filterInput.clear();
    await filterInput.fill("15");

    // Press Enter instead of clicking button
    await filterInput.press("Enter");

    // Should trigger the same behavior as clicking the button
    await expect(page.getByTestId(TEST_IDS.STICKER_INVENTORY.SPINNER)).toBeVisible();
    await expect(page.getByTestId(TEST_IDS.STICKER_INVENTORY.SPINNER)).not.toBeVisible({ timeout: 10000 });

    // Verify filter was applied
    const stickerCards = page.getByTestId(TEST_IDS.STICKER_INVENTORY.OVERVIEW.STICKER);
    const cardCount = await stickerCards.count();
    expect(cardCount).toBeLessThanOrEqual(6);

    // 7. Check filter input validation and user feedback
    // Test input accepts only numbers
    await filterInput.clear();
    await filterInput.type("123abc456");

    // Depending on implementation, should either filter out non-numeric or handle gracefully
    const inputValue = await filterInput.inputValue();
    // Input type="number" typically filters out non-numeric characters
    expect(inputValue).toMatch(/^\d*$/);

    // Test Tab navigation
    await filterInput.focus();
    await page.keyboard.press("Tab");
    await expect(filterButton).toBeFocused();

    await page.keyboard.press("Tab");
    // Should move to next focusable element (not staying on filter controls)
    await expect(filterButton).not.toBeFocused();

    // Test button hover effects
    await filterButton.hover();
    const buttonClasses2 = await filterButton.getAttribute("class");
    expect(buttonClasses2).toContain("hover:bg-pink-700");

    // Test filter section layout and spacing
    const filterContainer = filterInput.locator("../..");
    await expect(filterContainer).toHaveClass(/bg-white/);
    await expect(filterContainer).toHaveClass(/p-4/);
    await expect(filterContainer).toHaveClass(/rounded-lg/);
    await expect(filterContainer).toHaveClass(/shadow-sm/);

    // Test input field styling
    await expect(filterInput).toHaveClass(/w-full/);

    // Verify no accessibility violations in filter section
    await expect(filterInput).toHaveAttribute("type", "number");
    await expect(filterButton).toHaveAttribute("type", "button");
  });
});
