import { test, expect } from "@playwright/test";

test.describe("UI Components and Layout", () => {
  test("Header and Navigation Elements", async ({ page }) => {
    // 1. Navigate to the homepage
    await page.goto("http://localhost:5173");

    // 2. Verify the PYOD logo is displayed in the header with correct test ID
    const logo = page.getByTestId("app__header__logo");
    await expect(logo).toBeVisible();
    await expect(logo).toHaveAttribute("src", "https://ik.imagekit.io/pyodstickers/img/pyod-white-nolaptop.png");
    await expect(logo).toHaveAttribute("alt", "Pimp Your Own Device");

    // 3. Check that all navigation menu items are present
    const stickersNav = page.getByTestId("app__nav__stickers");
    const newsNav = page.getByTestId("app__nav__news");
    const missionNav = page.getByTestId("app__nav__mission");
    const contactNav = page.getByTestId("app__nav__contact");

    await expect(stickersNav).toBeVisible();
    await expect(newsNav).toBeVisible();
    await expect(missionNav).toBeVisible();
    await expect(contactNav).toBeVisible();

    // 4. Verify each navigation link has correct test IDs and text content
    await expect(stickersNav).toContainText("Stickers");
    await expect(newsNav).toContainText("News");
    await expect(missionNav).toContainText("Our Mission");
    await expect(contactNav).toContainText("Contact");

    // 5. Test hover effects on navigation links
    await stickersNav.hover();
    await expect(stickersNav).toHaveClass(/hover:text-pink-600/);

    await newsNav.hover();
    await expect(newsNav).toHaveClass(/hover:text-pink-600/);

    // 6. Verify navigation is hidden on mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    const navContainer = page.locator("nav.hidden.md\\:block");
    await expect(navContainer).not.toBeVisible();

    // 7. Check header stays sticky when scrolling
    await page.setViewportSize({ width: 1024, height: 768 });
    const header = page.locator("header.sticky");
    await expect(header).toHaveClass(/sticky/);

    // Scroll down and verify header is still visible
    await page.evaluate(() => window.scrollTo(0, 500));
    await expect(header).toBeVisible();
  });
});
