import { test, expect } from "@playwright/test";
import fs from "fs";
import path from "path";
import matter from "gray-matter";

// ---------------------------------------------------------------------------
// Discover all routes directly from the content filesystem
// (avoids importing @switch-to-eu/content which triggers dev server HMR)
// ---------------------------------------------------------------------------

const contentRoot = path.resolve(__dirname, "../../../packages/content/content/en");

function readMdSlugs(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".md") && !f.startsWith(".") && f !== "README.md")
    .map((f) => f.replace(".md", ""));
}

function readDirNames(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);
}

// Categories
const categories = readMdSlugs(path.join(contentRoot, "categories"));

// Services — read frontmatter to get name → slug and region
function getServiceSlugs(region: "eu" | "non-eu"): string[] {
  const dir = path.join(contentRoot, "services", region);
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".md"))
    .map((f) => {
      const content = fs.readFileSync(path.join(dir, f), "utf-8");
      const { data } = matter(content);
      const name = (data as { name?: string }).name ?? f.replace(".md", "");
      return name.toLowerCase().replace(/\s+/g, "-");
    });
}

const euServices = getServiceSlugs("eu");
const nonEuServices = getServiceSlugs("non-eu");

// Guides — each guide is a directory under guides/<category>/
function getAllGuides(): Array<{ category: string; slug: string }> {
  const guidesRoot = path.join(contentRoot, "guides");
  if (!fs.existsSync(guidesRoot)) return [];
  const guides: Array<{ category: string; slug: string }> = [];
  for (const category of readDirNames(guidesRoot)) {
    for (const slug of readDirNames(path.join(guidesRoot, category))) {
      guides.push({ category, slug });
    }
  }
  return guides;
}

const guides = getAllGuides();

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Static pages
// ---------------------------------------------------------------------------

const staticRoutes = [
  "/en",
  "/en/about",
  "/en/search",
  "/en/privacy",
  "/en/contribute",
  "/en/contribute/guide",
  "/en/feedback",
  "/en/tools/website",
];

for (const urlPath of staticRoutes) {
  test(`static: ${urlPath}`, async ({ page }) => {
    await expectPageOk(page, urlPath);
  });
}

// ---------------------------------------------------------------------------
// Category pages
// ---------------------------------------------------------------------------

for (const slug of categories) {
  test(`category: /en/services/${slug}`, async ({ page }) => {
    await expectPageOk(page, `/en/services/${slug}`);
  });
}

// ---------------------------------------------------------------------------
// EU service pages
// ---------------------------------------------------------------------------

for (const slug of euServices) {
  test(`eu service: /en/services/eu/${slug}`, async ({ page }) => {
    await expectPageOk(page, `/en/services/eu/${slug}`);
  });
}

// ---------------------------------------------------------------------------
// Non-EU service pages
// ---------------------------------------------------------------------------

for (const slug of nonEuServices) {
  test(`non-eu service: /en/services/non-eu/${slug}`, async ({ page }) => {
    await expectPageOk(page, `/en/services/non-eu/${slug}`);
  });
}

// ---------------------------------------------------------------------------
// Guide pages
// ---------------------------------------------------------------------------

for (const guide of guides) {
  test(`guide: /en/guides/${guide.category}/${guide.slug}`, async ({
    page,
  }) => {
    await expectPageOk(page, `/en/guides/${guide.category}/${guide.slug}`);
  });
}

// ---------------------------------------------------------------------------
// i18n — Dutch locale
// ---------------------------------------------------------------------------

test("i18n: /nl", async ({ page }) => {
  await expectPageOk(page, "/nl");
});
