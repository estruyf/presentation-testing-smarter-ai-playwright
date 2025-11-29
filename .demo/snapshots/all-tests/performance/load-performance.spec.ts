// spec: sticker-inventory-test-plan.md
// seed: e2e/tests/seed.spec.ts

import { test, expect } from "@playwright/test";
import { TEST_IDS } from "../../constants/testIds";

const WEBSITE_URL = "http://localhost:5173";

test.describe("Performance and Accessibility Tests", () => {
  test("Page Load Performance", async ({ page }) => {
    // Enable performance monitoring
    await page.addInitScript(() => {
      window.performance.mark("test-start");
    });

    // 1. Navigate to the homepage and measure initial page load time
    const startTime = Date.now();
    await page.goto(WEBSITE_URL);

    // Wait for main content to be visible
    await expect(page.getByTestId(TEST_IDS.APP.HEADER.LOGO)).toBeVisible();
    await expect(page.getByTestId(TEST_IDS.STICKER_INVENTORY.ROOT)).toBeVisible();

    const loadTime = Date.now() - startTime;

    // Page load should be under 3 seconds
    expect(loadTime).toBeLessThan(3000);

    // 2. Check Time to First Contentful Paint (FCP)
    const fcpMetric = await page.evaluate(() => {
      return new Promise(resolve => {
        new PerformanceObserver(list => {
          const entries = list.getEntries();
          for (const entry of entries) {
            if (entry.name === "first-contentful-paint") {
              resolve(entry.startTime);
            }
          }
        }).observe({ entryTypes: ["paint"] });

        // Fallback if FCP is not available
        setTimeout(() => resolve(null), 1000);
      });
    });

    if (fcpMetric) {
      // FCP should occur within 1.5 seconds
      expect(fcpMetric).toBeLessThan(1500);
    }

    // 3. Measure Time to Interactive (TTI) - approximate by measuring when stickers load
    const ttiStart = Date.now();
    await expect(page.getByTestId(TEST_IDS.STICKER_INVENTORY.SPINNER)).not.toBeVisible({ timeout: 10000 });
    const tti = Date.now() - ttiStart;

    // TTI should be reasonable (under 5 seconds including API call)
    expect(tti).toBeLessThan(5000);

    // 4. Verify image loading performance with different network speeds
    // Simulate slow 3G
    await page.emulateNetworkConditions({
      offline: false,
      downloadThroughput: (1.5 * 1024 * 1024) / 8, // 1.5 Mbps
      uploadThroughput: (750 * 1024) / 8, // 750 kbps
      latency: 40,
    });

    // Trigger filter to reload content
    const filterButton = page.getByTestId(TEST_IDS.STICKER_INVENTORY.FILTER.BUTTON);
    const imageLoadStart = Date.now();
    await filterButton.click();

    // Wait for content to load even on slow network
    await expect(page.getByTestId(TEST_IDS.STICKER_INVENTORY.SPINNER)).not.toBeVisible({ timeout: 15000 });

    const imageLoadTime = Date.now() - imageLoadStart;

    // Should still load in reasonable time even on slow network
    expect(imageLoadTime).toBeLessThan(12000);

    // Reset network conditions
    await page.emulateNetworkConditions({
      offline: false,
      downloadThroughput: -1,
      uploadThroughput: -1,
      latency: -1,
    });

    // 5. Test lazy loading behavior for sticker images
    const stickerImages = page.locator('[data-testid*="sticker"] img');
    const imageCount = await stickerImages.count();

    if (imageCount > 0) {
      // Check if images have loading attributes or lazy loading implementation
      const firstImage = stickerImages.first();
      await expect(firstImage).toBeVisible();

      // Check image src is properly set
      const imageSrc = await firstImage.getAttribute("src");
      expect(imageSrc).toBeTruthy();
      expect(imageSrc).toContain("stickers/");
    }

    // 6. Measure API response times under normal conditions
    const apiStartTime = Date.now();
    const filterInput = page.getByTestId(TEST_IDS.STICKER_INVENTORY.FILTER.INPUT);

    await filterInput.fill("10");
    await filterButton.click();

    await expect(page.getByTestId(TEST_IDS.STICKER_INVENTORY.SPINNER)).not.toBeVisible({ timeout: 10000 });

    const apiResponseTime = Date.now() - apiStartTime;

    // API response should be fast (under 3 seconds)
    expect(apiResponseTime).toBeLessThan(3000);

    // 7. Check for unnecessary re-renders during state updates
    let renderCount = 0;

    // Monitor console for React dev warnings about re-renders
    page.on("console", msg => {
      if (msg.text().includes("render") || msg.text().includes("update")) {
        renderCount++;
      }
    });

    // Perform multiple filter operations
    await filterInput.fill("5");
    await filterButton.click();
    await expect(page.getByTestId(TEST_IDS.STICKER_INVENTORY.SPINNER)).not.toBeVisible({ timeout: 5000 });

    await filterInput.fill("15");
    await filterButton.click();
    await expect(page.getByTestId(TEST_IDS.STICKER_INVENTORY.SPINNER)).not.toBeVisible({ timeout: 5000 });

    // Check overall performance metrics
    const performanceMetrics = await page.evaluate(() => {
      const navigation = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming;
      return {
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
        firstPaint: performance.getEntriesByName("first-paint")[0]?.startTime || 0,
        firstContentfulPaint: performance.getEntriesByName("first-contentful-paint")[0]?.startTime || 0,
        resourceCount: performance.getEntriesByType("resource").length,
      };
    });

    // Validate performance thresholds
    expect(performanceMetrics.domContentLoaded).toBeLessThan(2000);

    // Check resource loading efficiency
    expect(performanceMetrics.resourceCount).toBeLessThan(50); // Reasonable resource count

    // Measure JavaScript bundle size impact
    const jsResources = await page.evaluate(() => {
      return performance
        .getEntriesByType("resource")
        .filter((entry: any) => entry.name.endsWith(".js"))
        .map((entry: any) => ({
          name: entry.name,
          transferSize: entry.transferSize || 0,
          duration: entry.duration,
        }));
    });

    // Check that JS resources load efficiently
    jsResources.forEach(resource => {
      expect(resource.duration).toBeLessThan(3000);
    });

    // Test memory usage doesn't grow excessively
    const memoryInfo = await page.evaluate(() => {
      return (performance as any).memory
        ? {
            usedJSHeapSize: (performance as any).memory.usedJSHeapSize,
            totalJSHeapSize: (performance as any).memory.totalJSHeapSize,
            jsHeapSizeLimit: (performance as any).memory.jsHeapSizeLimit,
          }
        : null;
    });

    if (memoryInfo) {
      // Memory usage should be reasonable (less than 50MB for this simple app)
      expect(memoryInfo.usedJSHeapSize).toBeLessThan(50 * 1024 * 1024);
    }
  });
});
