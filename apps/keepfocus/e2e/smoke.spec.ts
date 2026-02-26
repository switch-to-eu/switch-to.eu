import { test, expect } from "@playwright/test";

async function expectPageOk(
  page: import("@playwright/test").Page,
  urlPath: string,
) {
  const response = await page.goto(urlPath);
  expect(response?.status(), `${urlPath} returned ${response?.status()}`).toBe(
    200,
  );
  await expect(page.locator("#nextjs__container_errors_overlay")).toHaveCount(0);
  await expect(page.locator("body")).toBeVisible();
}

const locales = ["en", "nl"];

for (const locale of locales) {
  test(`${locale}: home page`, async ({ page }) => {
    await expectPageOk(page, `/${locale}`);
  });

  test(`${locale}: about page`, async ({ page }) => {
    await expectPageOk(page, `/${locale}/about`);
  });
}

// Privacy page redirects to external https://switch-to.eu/privacy — skip smoke test
