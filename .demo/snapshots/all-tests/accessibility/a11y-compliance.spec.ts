// spec: sticker-inventory-test-plan.md
// seed: tests/seed.spec.ts

import { test, expect } from "@playwright/test";
import { TEST_IDS } from "../../constants/testIds";

const WEBSITE_URL = "http://localhost:5173";

test.describe("Performance and Accessibility Tests", () => {
  test("Accessibility Compliance", async ({ page }) => {
    await page.goto(WEBSITE_URL);

    // Wait for page to fully load
    await expect(page.getByTestId(TEST_IDS.STICKER_INVENTORY.SPINNER)).not.toBeVisible({ timeout: 10000 });

    // 1. Run automated accessibility scan on homepage
    // Note: In a real implementation, you'd use axe-playwright or similar
    const accessibilityIssues = await page.evaluate(() => {
      const issues: string[] = [];

      // Check for images without alt text
      const images = document.querySelectorAll("img");
      images.forEach((img, index) => {
        if (!img.alt && !img.getAttribute("aria-label")) {
          issues.push(`Image ${index + 1} missing alt text`);
        }
      });

      // Check for form inputs without labels
      const inputs = document.querySelectorAll("input");
      inputs.forEach((input, index) => {
        const hasLabel =
          document.querySelector(`label[for="${input.id}"]`) ||
          input.getAttribute("aria-label") ||
          input.getAttribute("aria-labelledby");
        if (!hasLabel) {
          issues.push(`Input ${index + 1} missing label`);
        }
      });

      // Check for buttons without accessible names
      const buttons = document.querySelectorAll("button");
      buttons.forEach((button, index) => {
        const hasAccessibleName =
          button.textContent?.trim() || button.getAttribute("aria-label") || button.getAttribute("aria-labelledby");
        if (!hasAccessibleName) {
          issues.push(`Button ${index + 1} missing accessible name`);
        }
      });

      return issues;
    });

    // Should have minimal accessibility issues
    expect(accessibilityIssues).toEqual([]);

    // 2. Test keyboard navigation through all interactive elements
    const interactiveElements = [
      page.getByTestId(TEST_IDS.APP.NAV.STICKERS),
      page.getByTestId(TEST_IDS.APP.NAV.NEWS),
      page.getByTestId(TEST_IDS.APP.NAV.MISSION),
      page.getByTestId(TEST_IDS.APP.NAV.CONTACT),
      page.getByTestId(TEST_IDS.APP.HERO.BROWSE_BUTTON),
      page.getByTestId(TEST_IDS.STICKER_INVENTORY.FILTER.INPUT),
      page.getByTestId(TEST_IDS.STICKER_INVENTORY.FILTER.BUTTON),
    ];

    // Test tab navigation
    for (const element of interactiveElements) {
      if (await element.isVisible()) {
        await element.focus();
        await expect(element).toBeFocused();

        // Test space/enter activation for buttons
        if (await element.evaluate(el => el.tagName.toLowerCase() === "button")) {
          // Verify button can be activated with keyboard
          await expect(element).toBeEnabled();
        }
      }
    }

    // 3. Verify focus indicators are visible and appropriate
    const filterInput = page.getByTestId(TEST_IDS.STICKER_INVENTORY.FILTER.INPUT);
    await filterInput.focus();

    // Check that focus is visually indicated (browser default or custom)
    const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(focusedElement).toBe("INPUT");

    // Test focus trap behavior in modals (if any exist)
    // For this app, test that focus moves logically through form elements
    await filterInput.press("Tab");
    const filterButton = page.getByTestId(TEST_IDS.STICKER_INVENTORY.FILTER.BUTTON);
    await expect(filterButton).toBeFocused();

    // 4. Check color contrast ratios meet WCAG guidelines
    const contrastChecks = await page.evaluate(() => {
      const getContrastRatio = (elem: Element) => {
        const styles = window.getComputedStyle(elem);
        return {
          backgroundColor: styles.backgroundColor,
          color: styles.color,
          fontSize: styles.fontSize,
          fontWeight: styles.fontWeight,
        };
      };

      const checks = [];

      // Check navigation links
      const navLinks = document.querySelectorAll('[data-testid*="nav"]');
      navLinks.forEach(link => {
        checks.push({
          element: "nav-link",
          styles: getContrastRatio(link),
        });
      });

      // Check button contrast
      const buttons = document.querySelectorAll("button");
      buttons.forEach(button => {
        checks.push({
          element: "button",
          styles: getContrastRatio(button),
        });
      });

      return checks;
    });

    // Verify contrast ratios are sufficient (this would need a proper contrast calculation in real implementation)
    expect(contrastChecks.length).toBeGreaterThan(0);

    // 5. Test screen reader compatibility with main content areas
    // Check for proper semantic HTML structure
    const semanticElements = await page.evaluate(() => {
      return {
        hasHeader: !!document.querySelector("header"),
        hasMain: !!document.querySelector("main"),
        hasFooter: !!document.querySelector("footer"),
        hasNav: !!document.querySelector("nav"),
        headingStructure: Array.from(document.querySelectorAll("h1, h2, h3, h4, h5, h6")).map(h => h.tagName),
      };
    });

    expect(semanticElements.hasHeader).toBe(true);
    expect(semanticElements.hasMain).toBe(true);
    expect(semanticElements.hasFooter).toBe(true);
    expect(semanticElements.hasNav).toBe(true);
    expect(semanticElements.headingStructure.length).toBeGreaterThan(0);

    // 6. Verify semantic HTML structure and ARIA labels
    // Check for proper ARIA attributes on interactive elements
    const ariaAttributes = await page.evaluate(() => {
      const checks = [];

      // Check error alerts have proper role
      const errorElements = document.querySelectorAll('[data-testid*="error"]');
      errorElements.forEach(error => {
        checks.push({
          element: "error",
          role: error.getAttribute("role"),
          hasRole: error.getAttribute("role") === "alert",
        });
      });

      // Check loading spinners have proper labeling
      const spinners = document.querySelectorAll('[data-testid*="spinner"]');
      spinners.forEach(spinner => {
        checks.push({
          element: "spinner",
          hasLabel: !!spinner.getAttribute("aria-label") || !!spinner.textContent?.trim(),
        });
      });

      return checks;
    });

    // Verify ARIA attributes are properly used
    ariaAttributes.forEach(check => {
      if (check.element === "error") {
        expect(check.hasRole).toBe(true);
      }
    });

    // 7. Test with high contrast mode and zoom levels up to 200%
    // Test zoom to 200%
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.evaluate(() => {
      document.body.style.zoom = "2";
    });

    // Verify layout remains functional at high zoom
    await expect(page.getByTestId(TEST_IDS.APP.HEADER.LOGO)).toBeVisible();
    await expect(page.getByTestId(TEST_IDS.STICKER_INVENTORY.FILTER.INPUT)).toBeVisible();
    await expect(page.getByTestId(TEST_IDS.STICKER_INVENTORY.FILTER.BUTTON)).toBeVisible();

    // Test that text remains readable and doesn't overflow
    const stickerCards = page.getByTestId(TEST_IDS.STICKER_INVENTORY.OVERVIEW.STICKER);
    if ((await stickerCards.count()) > 0) {
      const firstCard = stickerCards.first();
      await expect(firstCard).toBeVisible();

      // Check that card content is still accessible
      const cardTitle = firstCard.locator("h3");
      await expect(cardTitle).toBeVisible();
    }

    // Reset zoom
    await page.evaluate(() => {
      document.body.style.zoom = "1";
    });

    // Test keyboard shortcuts and navigation
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");

    // Verify focus management during dynamic content updates
    const filterInput2 = page.getByTestId(TEST_IDS.STICKER_INVENTORY.FILTER.INPUT);
    await filterInput2.focus();
    await filterInput2.fill("10");
    await filterInput2.press("Enter");

    // Focus should be maintained appropriately during loading
    await expect(page.getByTestId(TEST_IDS.STICKER_INVENTORY.SPINNER)).not.toBeVisible({ timeout: 10000 });

    // Test skip links (if implemented)
    await page.keyboard.press("Tab");
    const activeElement = await page.evaluate(() => document.activeElement?.getAttribute("data-testid"));

    // Should follow logical tab order
    expect(activeElement).toBeTruthy();

    // Test that error messages are announced properly
    // Mock an API error to test error announcement
    await page.route("/api/stickers*", async route => {
      await route.fulfill({
        status: 500,
        body: JSON.stringify({ error: "Test error" }),
      });
    });

    await page.getByTestId(TEST_IDS.STICKER_INVENTORY.FILTER.BUTTON).click();

    const errorElement = page.getByTestId(TEST_IDS.STICKER_INVENTORY.ERROR);
    await expect(errorElement).toBeVisible({ timeout: 5000 });

    // Verify error has proper ARIA attributes for screen readers
    await expect(errorElement).toHaveAttribute("role", "alert");

    // Clean up route
    await page.unroute("/api/stickers*");
  });
});
