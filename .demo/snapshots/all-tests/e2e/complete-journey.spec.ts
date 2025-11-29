// spec: sticker-inventory-test-plan.md
// seed: e2e/tests/seed.spec.ts

import { test, expect } from "@playwright/test";
import { TEST_IDS } from "../../constants/testIds";

const WEBSITE_URL = "http://localhost:5173";

test.describe("End-to-End User Journey Tests", () => {
  test("Complete User Browse Journey", async ({ page }) => {
    // 1. Navigate to homepage as a new visitor
    await page.goto(WEBSITE_URL);

    // Simulate first-time visitor experience
    await expect(page).toHaveTitle(/Sticker Inventory/);

    // 2. Read hero section and understand the value proposition
    const heroSection = page.locator("div.bg-gray-900.text-white.py-20");
    await expect(heroSection).toBeVisible();

    // Check main headline is compelling and clear
    const headline = page.getByText("Make your laptop even more yours");
    await expect(headline).toBeVisible();
    await expect(headline).toHaveClass(/text-5xl|md:text-6xl/);

    // Read the value proposition
    const valueProposition = page.getByText("We provide you with unique dev and tech stickers");
    await expect(valueProposition).toBeVisible();

    // User should see the call-to-action
    const ctaButton = page.getByTestId(TEST_IDS.APP.HERO.BROWSE_BUTTON);
    await expect(ctaButton).toBeVisible();
    await expect(ctaButton).toHaveText("Browse Collection");

    // 3. Click 'Browse Collection' button to scroll to sticker section
    await ctaButton.click();

    // Should scroll to sticker section
    await page.waitForTimeout(1000); // Allow scroll animation
    const stickerSection = page.getByTestId(TEST_IDS.STICKER_INVENTORY.ROOT);
    await expect(stickerSection).toBeInViewport();

    // 4. Browse through all available stickers by viewing cards
    await expect(page.getByTestId(TEST_IDS.STICKER_INVENTORY.SPINNER)).not.toBeVisible({ timeout: 10000 });

    const stickerCards = page.getByTestId(TEST_IDS.STICKER_INVENTORY.OVERVIEW.STICKER);
    const cardCount = await stickerCards.count();
    expect(cardCount).toBeGreaterThan(0);

    // Browse each sticker card
    for (let i = 0; i < cardCount; i++) {
      const card = stickerCards.nth(i);
      await card.scrollIntoViewIfNeeded();

      // Check card is visible and contains expected elements
      await expect(card).toBeVisible();

      // Verify each card has essential information
      const image = card.locator("img");
      const title = card.locator("h3");
      const price = card.getByTestId(TEST_IDS.STICKER_INVENTORY.STICKER.PRICE);
      const stock = card.getByTestId(TEST_IDS.STICKER_INVENTORY.STICKER.TOTAL);

      await expect(image).toBeVisible();
      await expect(title).toBeVisible();
      await expect(price).toBeVisible();
      await expect(stock).toBeVisible();

      // Verify data makes sense
      const titleText = await title.textContent();
      expect(titleText).toBeTruthy();
      expect(titleText?.length).toBeGreaterThan(5);

      const priceText = await price.textContent();
      expect(priceText).toMatch(/^\d+\.\d{2}$/);

      const stockText = await stock.textContent();
      expect(stockText).toMatch(/^\d+$/);
    }

    // 5. Hover over stickers to read descriptions
    const firstCard = stickerCards.first();
    await firstCard.hover();

    // Description overlay should appear
    const descriptionOverlay = firstCard.getByTestId(TEST_IDS.STICKER_INVENTORY.STICKER.DESCRIPTION);
    await expect(descriptionOverlay).toBeVisible();

    // Read the description
    const description = descriptionOverlay.locator("p");
    await expect(description).toBeVisible();

    const descriptionText = await description.textContent();
    expect(descriptionText).toBeTruthy();
    expect(descriptionText?.length).toBeGreaterThan(10);

    // Hover over different cards to see various descriptions
    if (cardCount > 1) {
      const secondCard = stickerCards.nth(1);
      await secondCard.hover();

      const secondDescription = secondCard.getByTestId(TEST_IDS.STICKER_INVENTORY.STICKER.DESCRIPTION);
      await expect(secondDescription).toBeVisible();

      // Should be different from first description
      const secondDescText = await secondDescription.locator("p").textContent();
      expect(secondDescText).not.toBe(descriptionText);
    }

    // Move mouse away to hide overlay
    await page.mouse.move(0, 0);
    await expect(descriptionOverlay).toHaveClass(/opacity-0/);

    // 6. Apply filter to find stickers with high stock availability
    const filterInput = page.getByTestId(TEST_IDS.STICKER_INVENTORY.FILTER.INPUT);
    const filterButton = page.getByTestId(TEST_IDS.STICKER_INVENTORY.FILTER.BUTTON);

    await expect(filterInput).toBeVisible();
    await expect(filterButton).toBeVisible();

    // User wants to find stickers with good availability (>= 20 stock)
    await filterInput.fill("20");
    await filterButton.click();

    // Wait for filtering to complete
    await expect(page.getByTestId(TEST_IDS.STICKER_INVENTORY.SPINNER)).toBeVisible();
    await expect(page.getByTestId(TEST_IDS.STICKER_INVENTORY.SPINNER)).not.toBeVisible({ timeout: 10000 });

    // Check filtered results
    const filteredCards = page.getByTestId(TEST_IDS.STICKER_INVENTORY.OVERVIEW.STICKER);
    const filteredCount = await filteredCards.count();

    // Should have fewer or equal cards than before
    expect(filteredCount).toBeLessThanOrEqual(cardCount);

    // Verify all visible stickers meet the filter criteria
    for (let i = 0; i < filteredCount; i++) {
      const card = filteredCards.nth(i);
      const stockElement = card.getByTestId(TEST_IDS.STICKER_INVENTORY.STICKER.TOTAL);
      const stockValue = parseInt((await stockElement.textContent()) || "0");
      expect(stockValue).toBeGreaterThanOrEqual(20);
    }

    // Check that timestamp updated
    const refreshTimestamp = page.getByTestId(TEST_IDS.STICKER_INVENTORY.REFRESH);
    await expect(refreshTimestamp).toBeVisible();
    const timestampText = await refreshTimestamp.textContent();
    expect(timestampText).toMatch(/Updated: \d{1,2}:\d{2}:\d{2}/);

    // 7. Clear filter to see full inventory again
    await filterInput.clear();
    await filterButton.click();

    await expect(page.getByTestId(TEST_IDS.STICKER_INVENTORY.SPINNER)).not.toBeVisible({ timeout: 10000 });

    // Should show all stickers again
    const allCards = page.getByTestId(TEST_IDS.STICKER_INVENTORY.OVERVIEW.STICKER);
    const finalCount = await allCards.count();
    expect(finalCount).toBe(cardCount); // Back to original count

    // 8. Simulate finding a specific sticker type through filtering
    // User is looking for stickers with limited availability (< 10 stock)
    await filterInput.fill("1");
    await filterButton.click();
    await expect(page.getByTestId(TEST_IDS.STICKER_INVENTORY.SPINNER)).not.toBeVisible({ timeout: 10000 });

    // User realizes they want even more exclusive items
    await filterInput.clear();
    await filterInput.fill("5");
    await filterButton.click();
    await expect(page.getByTestId(TEST_IDS.STICKER_INVENTORY.SPINNER)).not.toBeVisible({ timeout: 10000 });

    // Browse the refined results
    const refinedCards = page.getByTestId(TEST_IDS.STICKER_INVENTORY.OVERVIEW.STICKER);
    const refinedCount = await refinedCards.count();

    if (refinedCount > 0) {
      // Look at the most interesting sticker (hover to see description)
      const interestingCard = refinedCards.first();
      await interestingCard.hover();

      const finalDescription = interestingCard.getByTestId(TEST_IDS.STICKER_INVENTORY.STICKER.DESCRIPTION);
      await expect(finalDescription).toBeVisible();

      // User reads the description and checks the price
      const finalPrice = interestingCard.getByTestId(TEST_IDS.STICKER_INVENTORY.STICKER.PRICE);
      const finalStock = interestingCard.getByTestId(TEST_IDS.STICKER_INVENTORY.STICKER.TOTAL);

      await expect(finalPrice).toBeVisible();
      await expect(finalStock).toBeVisible();

      // User has found what they're looking for
      const stockValue = parseInt((await finalStock.textContent()) || "0");
      expect(stockValue).toBeGreaterThanOrEqual(5);
    } else {
      // If no results, user should see empty state with helpful message
      const emptyState = page.getByTestId(TEST_IDS.STICKER_INVENTORY.EMPTY);
      await expect(emptyState).toBeVisible();
      await expect(emptyState.getByText("No stickers found")).toBeVisible();
      await expect(emptyState.getByText("Try adjusting your filter criteria")).toBeVisible();
    }

    // Verify the overall user experience was smooth
    // Check that no error states appeared during the journey
    const errorElement = page.getByTestId(TEST_IDS.STICKER_INVENTORY.ERROR);
    await expect(errorElement).not.toBeVisible();

    // Verify the page is still functional and responsive
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(stickerSection).toBeVisible();
    await expect(filterInput).toBeVisible();
    await expect(filterButton).toBeVisible();

    // User completes their journey successfully
    console.log(
      "User journey completed successfully - user found relevant stickers through intuitive browsing and filtering"
    );
  });
});
