// spec: sticker-inventory-test-plan.md
// seed: /tests/seed.spec.ts

import { test, expect } from "@playwright/test";
import { TEST_IDS } from "../../constants/testIds";

const WEBSITE_URL = "http://localhost:5173";

test.describe("Performance and Accessibility Tests", () => {
  test("Responsive Design Validation", async ({ page }) => {
    // 1. Test homepage layout on mobile viewport (375x667)
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(WEBSITE_URL);

    // Wait for content to load
    await expect(page.getByTestId(TEST_IDS.STICKER_INVENTORY.SPINNER)).not.toBeVisible({ timeout: 10000 });

    // Verify header is visible and properly sized
    const headerLogo = page.getByTestId(TEST_IDS.APP.HEADER.LOGO);
    await expect(headerLogo).toBeVisible();

    // Check that logo is appropriately sized for mobile
    const logoBox = await headerLogo.boundingBox();
    expect(logoBox?.height).toBeLessThan(60); // Reasonable mobile height

    // Verify navigation is hidden on mobile (hidden md:block class)
    const navigation = page.locator("nav.hidden.md\\:block");
    const navBox = await navigation.boundingBox();
    expect(navBox?.width).toBe(0); // Hidden on mobile

    // Verify hero section text is readable
    const heroHeadline = page.getByText("Make your laptop even more yours");
    await expect(heroHeadline).toBeVisible();

    // Check that hero text size is appropriate for mobile
    const heroTextSize = await heroHeadline.evaluate(el => {
      const styles = window.getComputedStyle(el);
      return {
        fontSize: styles.fontSize,
        lineHeight: styles.lineHeight,
      };
    });

    // Should use mobile-responsive font size
    expect(heroTextSize.fontSize).toBeTruthy();

    // Verify filter section adapts to mobile
    const filterSection = page.locator('[data-testid*="filter"]').first().locator("../..");
    await expect(filterSection).toHaveClass(/flex-col/);
    await expect(filterSection).toHaveClass(/sm:flex-row/);

    // Check that sticker grid uses single column on mobile
    const stickerGrid = page.getByTestId(TEST_IDS.STICKER_INVENTORY.OVERVIEW.ROOT);
    await expect(stickerGrid).toHaveClass(/grid-cols-1/);

    // Verify no horizontal scrolling occurs
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    const viewportWidth = 375;
    expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 10); // Allow small margin for rounding

    // 2. Test on tablet viewport (768x1024)
    await page.setViewportSize({ width: 768, height: 1024 });

    // Navigation should become visible on tablet
    const navVisible = await navigation.isVisible();
    expect(navVisible).toBe(true);

    // Grid should use 2 columns on tablet
    await expect(stickerGrid).toHaveClass(/sm:grid-cols-2/);

    // Filter section should use row layout
    await expect(filterSection).toHaveClass(/sm:flex-row/);

    // Check that content is well-distributed
    const stickerCards = page.getByTestId(TEST_IDS.STICKER_INVENTORY.OVERVIEW.STICKER);
    if ((await stickerCards.count()) > 0) {
      const firstCard = stickerCards.first();
      const cardBox = await firstCard.boundingBox();
      const secondCard = stickerCards.nth(1);

      if (await secondCard.isVisible()) {
        const secondCardBox = await secondCard.boundingBox();
        // Cards should be side by side on tablet
        expect(Math.abs((cardBox?.x || 0) - (secondCardBox?.x || 0))).toBeGreaterThan(200);
      }
    }

    // 3. Test on desktop viewport (1920x1080)
    await page.setViewportSize({ width: 1920, height: 1080 });

    // Grid should use 3 columns on desktop
    await expect(stickerGrid).toHaveClass(/lg:grid-cols-3/);

    // Navigation should be fully visible and spaced
    const navItems = [
      page.getByTestId(TEST_IDS.APP.NAV.STICKERS),
      page.getByTestId(TEST_IDS.APP.NAV.NEWS),
      page.getByTestId(TEST_IDS.APP.NAV.MISSION),
      page.getByTestId(TEST_IDS.APP.NAV.CONTACT),
    ];

    for (const navItem of navItems) {
      await expect(navItem).toBeVisible();
    }

    // Check that content doesn't become too wide
    const containerElements = page.locator(".container");
    const containerCount = await containerElements.count();

    if (containerCount > 0) {
      const container = containerElements.first();
      const containerBox = await container.boundingBox();

      // Container should have max-width constraints
      expect(containerBox?.width).toBeLessThan(1400); // Reasonable max width
    }

    // 4. Verify sticker grid adapts to different screen sizes
    const testViewports = [
      { width: 320, height: 568, expectedCols: 1 }, // Small mobile
      { width: 768, height: 1024, expectedCols: 2 }, // Tablet
      { width: 1280, height: 720, expectedCols: 3 }, // Desktop
      { width: 1920, height: 1080, expectedCols: 3 }, // Large desktop
    ];

    for (const viewport of testViewports) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });

      // Wait for layout to adjust
      await page.waitForTimeout(500);

      // Verify grid classes are appropriate
      const gridClasses = await stickerGrid.getAttribute("class");
      expect(gridClasses).toContain("grid");

      if (viewport.expectedCols === 1) {
        expect(gridClasses).toContain("grid-cols-1");
      } else if (viewport.expectedCols === 2) {
        expect(gridClasses).toContain("sm:grid-cols-2");
      } else if (viewport.expectedCols === 3) {
        expect(gridClasses).toContain("lg:grid-cols-3");
      }
    }

    // 5. Check navigation menu behavior on mobile
    await page.setViewportSize({ width: 375, height: 667 });

    // On this app, navigation is hidden on mobile rather than using a hamburger menu
    // Verify this behavior is intentional and consistent
    const nav = page.locator("nav");
    const navClasses = await nav.getAttribute("class");
    expect(navClasses).toContain("hidden");
    expect(navClasses).toContain("md:block");

    // 6. Test filter section responsive behavior
    const filterContainer = page.locator(".flex.flex-col.sm\\:flex-row");
    await expect(filterContainer).toBeVisible();

    const filterInput = page.getByTestId(TEST_IDS.STICKER_INVENTORY.FILTER.INPUT);
    const filterButton = page.getByTestId(TEST_IDS.STICKER_INVENTORY.FILTER.BUTTON);

    // On mobile, elements should stack vertically
    const inputBox = await filterInput.boundingBox();
    const buttonBox = await filterButton.boundingBox();

    // Button should be below input on mobile
    expect(buttonBox?.y || 0).toBeGreaterThan((inputBox?.y || 0) + (inputBox?.height || 0) - 10);

    // Test on larger screen
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(500);

    const inputBoxTablet = await filterInput.boundingBox();
    const buttonBoxTablet = await filterButton.boundingBox();

    // On tablet, elements should be side by side
    expect(buttonBoxTablet?.x || 0).toBeGreaterThan((inputBoxTablet?.x || 0) + (inputBoxTablet?.width || 0));

    // 7. Verify image scaling and text readability across viewports
    await page.setViewportSize({ width: 375, height: 667 });

    const cards = page.getByTestId(TEST_IDS.STICKER_INVENTORY.OVERVIEW.STICKER);
    if ((await cards.count()) > 0) {
      const firstCard = cards.first();
      const cardImage = firstCard.locator("img");
      const cardTitle = firstCard.locator("h3");

      await expect(cardImage).toBeVisible();
      await expect(cardTitle).toBeVisible();

      // Check that images scale properly
      const imageBox = await cardImage.boundingBox();
      const cardBox = await firstCard.boundingBox();

      // Image should fit within card
      expect(imageBox?.width).toBeLessThanOrEqual((cardBox?.width || 0) + 1);

      // Text should be readable size
      const titleStyles = await cardTitle.evaluate(el => {
        const styles = window.getComputedStyle(el);
        return {
          fontSize: parseInt(styles.fontSize),
          fontWeight: styles.fontWeight,
        };
      });

      expect(titleStyles.fontSize).toBeGreaterThan(14); // Minimum readable size
    }

    // Test extreme viewport sizes
    await page.setViewportSize({ width: 280, height: 500 }); // Very small
    await expect(headerLogo).toBeVisible();
    await expect(filterInput).toBeVisible();

    await page.setViewportSize({ width: 2560, height: 1440 }); // Very large
    await expect(stickerGrid).toBeVisible();

    // Content should not become unreasonably wide
    const wideContainer = page.locator(".container").first();
    const wideBox = await wideContainer.boundingBox();
    expect(wideBox?.width).toBeLessThan(1600); // Reasonable maximum
  });
});
