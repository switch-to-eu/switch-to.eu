import { test, expect, type Page } from "@playwright/test";

async function expectPageOk(page: Page, urlPath: string) {
  const response = await page.goto(urlPath);
  expect(response?.status(), `${urlPath} returned ${response?.status()}`).toBe(
    200,
  );
  await expect(page.locator("#nextjs__container_errors_overlay")).toHaveCount(0);
  await expect(page.locator("body")).toBeVisible();
}

// Routes not listed in sitemap.xml but still need smoke coverage.
const extraRoutes = [
  "/en/contribute/guide",
];

test("all routes from sitemap.xml return 200", async ({ page, request }) => {
  test.setTimeout(10 * 60_000);

  const res = await request.get("/sitemap.xml");
  expect(res.ok(), `sitemap.xml returned ${res.status()}`).toBe(true);
  const xml = await res.text();

  const paths = Array.from(
    new Set(
      [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(
        (m) => new URL(m[1]).pathname,
      ),
    ),
  );
  expect(paths.length).toBeGreaterThan(0);

  for (const p of paths) {
    await test.step(p, async () => {
      await expectPageOk(page, p);
    });
  }
});

for (const p of extraRoutes) {
  test(`static: ${p}`, async ({ page }) => {
    await expectPageOk(page, p);
  });
}
