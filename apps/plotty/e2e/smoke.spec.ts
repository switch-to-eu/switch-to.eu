import { test, expect } from "@playwright/test";

async function expectPageOk(
  page: import("@playwright/test").Page,
  urlPath: string,
) {
  const response = await page.goto(urlPath);
  expect(response?.status(), `${urlPath} returned ${response?.status()}`).toBe(
    200,
  );
  await expect(
    page.locator("#nextjs__container_errors_overlay"),
  ).toHaveCount(0);
  await expect(page.locator("body")).toBeVisible();
}

async function expectOgTags(
  page: import("@playwright/test").Page,
  urlPath: string,
) {
  await page.goto(urlPath);
  const ogUrl = await page
    .locator('meta[property="og:url"]')
    .getAttribute("content");
  expect(new URL(ogUrl ?? "").pathname).toBe(urlPath);

  const ogImage = await page
    .locator('meta[property="og:image"]')
    .getAttribute("content");
  const { pathname, search } = new URL(ogImage ?? "");
  const image = await page.request.get(`${pathname}${search}`);
  expect(image.status(), `${urlPath} image`).toBe(200);
  expect(image.headers()["content-type"]).toBe("image/png");
}

const locales = ["en", "nl"];
const sitemapPaths = ["", "/create", "/privacy"];

for (const locale of locales) {
  for (const path of sitemapPaths) {
    test(`${locale}: Open Graph tags on "${path}"`, async ({ page }) => {
      await expectOgTags(page, `/${locale}${path}`);
    });
  }

  test(`${locale}: home page`, async ({ page }) => {
    await expectPageOk(page, `/${locale}`);
  });

  test(`${locale}: about page`, async ({ page }) => {
    await expectPageOk(page, `/${locale}/about`);
  });

  test(`${locale}: privacy page`, async ({ page }) => {
    await expectPageOk(page, `/${locale}/privacy`);
  });

  test(`${locale}: create page`, async ({ page }) => {
    await expectPageOk(page, `/${locale}/create`);
  });
}
