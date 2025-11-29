import { test, expect } from "@playwright/test";
import { TEST_IDS } from "../../apps/website/src/constants/testIds";

const WEBSITE_URL = "http://localhost:5173";

test.describe("Sticker Inventory Website", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(WEBSITE_URL);
  });

  test("should load the homepage with correct title and hero section", async ({ page }) => {
    await expect(page).toHaveTitle(/Sticker Inventory/);

    // Check Header
    await expect(page.getByTestId(TEST_IDS.APP.HEADER.LOGO)).toBeVisible();

    // Check Navigation
    await expect(page.getByTestId(TEST_IDS.APP.NAV.STICKERS)).toBeVisible();
    await expect(page.getByTestId(TEST_IDS.APP.NAV.NEWS)).toBeVisible();

    // Check Hero
    await expect(page.getByTestId(TEST_IDS.APP.HERO.BROWSE_BUTTON)).toBeVisible();
    await expect(page.getByText("Make your laptop even more yours")).toBeVisible();
  });

  test("should display sticker inventory grid", async ({ page }) => {
    // Wait for stickers to load
    await expect(page.getByTestId(TEST_IDS.STICKER_INVENTORY.SPINNER)).not.toBeVisible();

    const inventory = page.getByTestId(TEST_IDS.STICKER_INVENTORY.ROOT);
    await expect(inventory).toBeVisible();

    const stickers = page.getByTestId(TEST_IDS.STICKER_INVENTORY.OVERVIEW.STICKER);
    await expect(stickers).toHaveCount(6); // Based on mock data
  });

  test("should filter stickers by stock amount", async ({ page }) => {
    // Wait for initial load
    await expect(page.getByTestId(TEST_IDS.STICKER_INVENTORY.SPINNER)).not.toBeVisible();

    // Filter for high stock items (e.g., > 20)
    const filterInput = page.getByTestId(TEST_IDS.STICKER_INVENTORY.FILTER.INPUT);
    await filterInput.fill("20");

    const filterButton = page.getByTestId(TEST_IDS.STICKER_INVENTORY.FILTER.BUTTON);
    await filterButton.click();

    // Wait for loading to finish
    await expect(page.getByTestId(TEST_IDS.STICKER_INVENTORY.SPINNER)).not.toBeVisible();

    // Verify filtered results
    const stickers = page.getByTestId(TEST_IDS.STICKER_INVENTORY.OVERVIEW.STICKER);
    // Mock data has: 50, 20, 5, 30, 15, 8.
    // >= 20 should be: 50, 20, 30 (3 items)
    await expect(stickers).toHaveCount(3);
  });

  test("should show empty state when no stickers match filter", async ({ page }) => {
    // Wait for initial load
    await expect(page.getByTestId(TEST_IDS.STICKER_INVENTORY.SPINNER)).not.toBeVisible();

    // Filter for impossible stock amount
    const filterInput = page.getByTestId(TEST_IDS.STICKER_INVENTORY.FILTER.INPUT);
    await filterInput.fill("1000");

    const filterButton = page.getByTestId(TEST_IDS.STICKER_INVENTORY.FILTER.BUTTON);
    await filterButton.click();

    // Wait for loading to finish
    await expect(page.getByTestId(TEST_IDS.STICKER_INVENTORY.SPINNER)).not.toBeVisible();

    // Verify empty state
    await expect(page.getByTestId(TEST_IDS.STICKER_INVENTORY.EMPTY)).toBeVisible();
    await expect(page.getByText("No stickers found")).toBeVisible();
  });

  test("should display sticker details correctly", async ({ page }) => {
    await expect(page.getByTestId(TEST_IDS.STICKER_INVENTORY.SPINNER)).not.toBeVisible();

    const firstSticker = page.getByTestId(TEST_IDS.STICKER_INVENTORY.OVERVIEW.STICKER).first();

    // Check price and stock visibility
    await expect(firstSticker.getByTestId(TEST_IDS.STICKER_INVENTORY.STICKER.PRICE)).toBeVisible();
    await expect(firstSticker.getByTestId(TEST_IDS.STICKER_INVENTORY.STICKER.TOTAL)).toBeVisible();

    // Check hover description (might need hover action)
    await firstSticker.hover();
    await expect(firstSticker.getByTestId(TEST_IDS.STICKER_INVENTORY.STICKER.DESCRIPTION)).toBeVisible();
  });
});
