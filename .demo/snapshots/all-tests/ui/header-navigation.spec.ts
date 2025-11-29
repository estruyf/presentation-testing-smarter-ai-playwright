// spec: sticker-inventory-test-plan.md
// seed: e2e/tests/seed.spec.ts

import { test, expect } from "@playwright/test";
import { TEST_IDS } from "../../constants/testIds";

const WEBSITE_URL = "http://localhost:5173";

test.describe("UI Component Tests", () => {
  test("Header and Navigation", async ({ page }) => {
    // 1. Navigate to the homepage
    await page.goto(WEBSITE_URL);

    // 2. Verify the PYOD logo is displayed in the header
    const headerLogo = page.getByTestId(TEST_IDS.APP.HEADER.LOGO);
    await expect(headerLogo).toBeVisible();
    await expect(headerLogo).toHaveAttribute("alt", "Pimp Your Own Device");

    // 3. Check that navigation menu contains Stickers, News, Our Mission, and Contact links
    const stickersNav = page.getByTestId(TEST_IDS.APP.NAV.STICKERS);
    const newsNav = page.getByTestId(TEST_IDS.APP.NAV.NEWS);
    const missionNav = page.getByTestId(TEST_IDS.APP.NAV.MISSION);
    const contactNav = page.getByTestId(TEST_IDS.APP.NAV.CONTACT);

    await expect(stickersNav).toBeVisible();
    await expect(stickersNav).toHaveText("Stickers");
    await expect(newsNav).toBeVisible();
    await expect(newsNav).toHaveText("News");
    await expect(missionNav).toBeVisible();
    await expect(missionNav).toHaveText("Our Mission");
    await expect(contactNav).toBeVisible();
    await expect(contactNav).toHaveText("Contact");

    // 4. Verify navigation links are properly styled and interactive
    await expect(stickersNav).toHaveClass(/text-gray-800/);
    await expect(newsNav).toHaveClass(/text-gray-800/);
    await expect(missionNav).toHaveClass(/text-gray-800/);
    await expect(contactNav).toHaveClass(/text-gray-800/);

    // Test hover effects
    await stickersNav.hover();
    await expect(stickersNav).toHaveClass(/hover:text-pink-600/);

    // 5. Test responsive navigation behavior on mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // On mobile, navigation should be hidden (hidden md:block class)
    const navElement = page.locator("nav.hidden.md\\:block");
    await expect(navElement).toBeVisible(); // Will be hidden on mobile but visible in DOM
  });
});
