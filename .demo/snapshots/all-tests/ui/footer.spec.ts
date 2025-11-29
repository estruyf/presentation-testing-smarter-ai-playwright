// spec: sticker-inventory-test-plan.md
// seed: e2e/tests/seed.spec.ts

import { test, expect } from "@playwright/test";
import { TEST_IDS } from "../../constants/testIds";

const WEBSITE_URL = "http://localhost:5173";

test.describe("UI Component Tests", () => {
  test("Footer Content and Links", async ({ page }) => {
    // 1. Navigate to the homepage
    await page.goto(WEBSITE_URL);

    // 2. Scroll to the footer section
    const footer = page.locator("footer.bg-gray-900");
    await footer.scrollIntoViewIfNeeded();

    // 3. Verify footer logo and company description
    const footerLogo = page.getByTestId(TEST_IDS.APP.FOOTER.LOGO);
    await expect(footerLogo).toBeVisible();
    await expect(footerLogo).toHaveAttribute("alt", "PYOD");

    // Check company description
    const description = page.getByText("Do you think your laptop is a bit boring?");
    await expect(description).toBeVisible();

    // 4. Check social media icons are displayed
    const socialIcons = page.locator("footer span.w-8.h-8.bg-gray-800");
    await expect(socialIcons).toHaveCount(3);

    // Test social media icon hover effects
    const firstIcon = socialIcons.first();
    await firstIcon.hover();
    await expect(firstIcon).toHaveClass(/hover:bg-pink-600/);

    // 5. Verify Navigate section links (Stickers, News, Our Mission, Contact)
    const navigateSection = page.getByText("Navigate").locator("..").locator("ul");
    const navigateLinks = navigateSection.locator("a");

    await expect(navigateLinks.nth(0)).toHaveText("Stickers");
    await expect(navigateLinks.nth(1)).toHaveText("News");
    await expect(navigateLinks.nth(2)).toHaveText("Our Mission");
    await expect(navigateLinks.nth(3)).toHaveText("Contact");

    // Test link hover effects
    await navigateLinks.first().hover();
    await expect(navigateLinks.first()).toHaveClass(/hover:text-pink-500/);

    // 6. Check Our Policies section links (Shipping, Returns, Privacy)
    const policiesSection = page.getByText("Our Policies").locator("..").locator("ul");
    const policyLinks = policiesSection.locator("a");

    await expect(policyLinks.nth(0)).toHaveText("Shipping");
    await expect(policyLinks.nth(1)).toHaveText("Returns");
    await expect(policyLinks.nth(2)).toHaveText("Privacy");

    // Test policy link hover effects
    await policyLinks.first().hover();
    await expect(policyLinks.first()).toHaveClass(/hover:text-pink-500/);

    // 7. Verify copyright information and PowerAutomate branding
    const copyright = page.getByText("© PIMP YOUR OWN DEVICE - PROVIDED WITH ♥ BY LUISE FREESE AND ELIO STRUYF");
    await expect(copyright).toBeVisible();

    const powerAutomate = page.getByText("POWERED BY #POWERAUTOMATE");
    await expect(powerAutomate).toBeVisible();

    // Verify footer styling
    await expect(footer).toHaveClass(/bg-gray-900/);
    await expect(footer).toHaveClass(/text-gray-400/);
  });
});
