# Articles Section Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a news/articles section to switch-to.eu, fully integrated with Payload CMS, the existing content pipeline skills, and the MCP-driven workflow.

**Architecture:** A new `Articles` Payload collection with flexible article types (news, evergreen, comparison, policy, opinion). Frontend listing + detail pages under `/[locale]/articles/`. New `/write-article` skill plus extensions to existing `/humanize`, `/seo-check`, `/translate`, and `/pipeline` skills so articles flow through the same content pipeline as services and guides. All content CRUD happens via MCP — no local files.

**Tech Stack:** Payload CMS (PostgreSQL), Next.js 16 App Router, Lexical rich text, next-intl v4, existing MCP plugin, Claude Code skills

---

## File Structure

### New files

```
apps/website/collections/Articles.ts           — Payload collection definition
apps/website/lib/articles.ts                    — Cached queries + helpers for articles
apps/website/app/(frontend)/[locale]/articles/page.tsx         — Article listing page
apps/website/app/(frontend)/[locale]/articles/[slug]/page.tsx  — Article detail page
apps/website/app/(frontend)/[locale]/articles/[slug]/opengraph-image.tsx — OG image generation
.claude/skills/write-article/SKILL.md           — Skill to write articles from a brief
.claude/skills/bulk-write-article/SKILL.md      — Parallel article writing skill
```

### Modified files

```
apps/website/collections/index.ts               — Export new Articles collection
apps/website/payload.config.ts                   — Register Articles + MCP config
apps/website/mcp/wipeContentTool.ts              — Add articles support
apps/website/app/sitemap.ts                      — Add article entries
apps/website/lib/llm-content.ts                  — Add articleToMarkdown export
apps/website/next.config.ts                      — Add /articles/:slug.md rewrite
.claude/skills/humanize/SKILL.md                 — Extend to support articles
.claude/skills/seo-check/SKILL.md                — Extend to support articles
.claude/skills/translate/SKILL.md                — Extend to support articles
.claude/skills/pipeline/SKILL.md                 — Extend to support articles
.claude/skills/bulk-humanize/SKILL.md            — Extend to support articles
.claude/skills/bulk-seo-check/SKILL.md           — Extend to support articles
.claude/skills/bulk-translate/SKILL.md           — Extend to support articles
packages/i18n/messages/website/en.json           — Add articles i18n keys
packages/i18n/messages/website/nl.json           — Add articles i18n keys
```

### Generated files (auto)

```
apps/website/payload-types.ts                    — Regenerated after collection changes
```

---

## Task 1: Create Articles Payload Collection

**Files:**
- Create: `apps/website/collections/Articles.ts`

This is the core data model. Articles are flexible — the `articleType` field classifies content, while `relatedServices` links to existing service pages. Uses the same patterns as Services and Guides: tabs, sidebar fields, localized text, SEO tab, content pipeline status, drafts, and cache revalidation.

- [ ] **Step 1: Create the Articles collection file**

```typescript
// apps/website/collections/Articles.ts
import type { CollectionConfig } from "payload";
import { revalidateTag } from "next/cache";
import { seoFields } from "../fields/seo";

export const Articles: CollectionConfig = {
  slug: "articles",
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "slug", "articleType", "publishedAt", "contentPipelineStatus"],
  },
  access: {
    read: () => true,
  },
  versions: {
    drafts: true,
  },
  hooks: {
    afterChange: [
      ({ doc }) => {
        try {
          revalidateTag("articles", "default");
        } catch {
          /* no-op outside Next.js */
        }
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return doc;
      },
    ],
  },
  fields: [
    // Sidebar fields
    {
      name: "slug",
      type: "text",
      required: true,
      unique: true,
      admin: { position: "sidebar" },
    },
    {
      name: "articleType",
      type: "select",
      required: true,
      options: [
        { label: "News", value: "news" },
        { label: "Evergreen", value: "evergreen" },
        { label: "Comparison", value: "comparison" },
        { label: "Policy", value: "policy" },
        { label: "Opinion", value: "opinion" },
      ],
      admin: {
        position: "sidebar",
        description: "Content type — determines editorial approach and URL grouping",
      },
    },
    {
      name: "featured",
      type: "checkbox",
      defaultValue: false,
      admin: { position: "sidebar" },
    },
    {
      name: "contentPipelineStatus",
      type: "select",
      options: [
        { label: "Not Started", value: "not-started" },
        { label: "In Progress", value: "in-progress" },
        { label: "Written", value: "written" },
        { label: "Humanized", value: "humanized" },
        { label: "SEO Checked", value: "seo-checked" },
        { label: "Translated", value: "translated" },
        { label: "Complete", value: "complete" },
      ],
      defaultValue: "not-started",
      admin: {
        position: "sidebar",
        description: "Tracks progress through the content pipeline",
      },
    },
    // Tabs
    {
      type: "tabs",
      tabs: [
        {
          label: "General",
          fields: [
            {
              name: "title",
              type: "text",
              required: true,
              localized: true,
            },
            {
              name: "description",
              type: "textarea",
              required: true,
              localized: true,
              admin: {
                description: "Article excerpt shown in cards and search results (1-2 sentences)",
              },
            },
            {
              name: "publishedAt",
              type: "date",
              required: true,
              admin: {
                description: "Publication date — controls display order",
                date: { pickerAppearance: "dayOnly" },
              },
            },
            {
              name: "author",
              type: "text",
              admin: {
                description: "Author name (leave blank for editorial team)",
              },
            },
            {
              name: "heroImage",
              type: "upload",
              relationTo: "media",
              admin: {
                description: "Hero image displayed at the top of the article",
              },
            },
            {
              name: "category",
              type: "relationship",
              relationTo: "categories",
              admin: {
                description: "Optional — link to a service category when the article is about that category",
              },
            },
            {
              name: "relatedServices",
              type: "relationship",
              relationTo: "services",
              hasMany: true,
              admin: {
                description: "Services mentioned or compared in this article",
              },
            },
            {
              name: "tags",
              type: "array",
              localized: true,
              fields: [{ name: "tag", type: "text", required: true }],
              admin: {
                description: "Flexible tags for filtering and related content",
              },
            },
            {
              name: "readingTime",
              type: "text",
              admin: {
                description: 'Estimated reading time, e.g. "5 min read"',
              },
            },
          ],
        },
        {
          label: "Content",
          fields: [
            {
              name: "content",
              type: "richText",
              required: true,
              localized: true,
              admin: {
                description: "Full article body in Lexical rich text",
              },
            },
            {
              name: "sources",
              type: "array",
              admin: {
                description: "Source URLs referenced in the article",
              },
              fields: [
                {
                  name: "url",
                  type: "text",
                  required: true,
                },
                {
                  name: "label",
                  type: "text",
                  required: true,
                  admin: {
                    description: "Display label for the source link",
                  },
                },
              ],
            },
          ],
        },
        {
          label: "SEO",
          description: "Search engine optimization metadata. Reviewed by AI SEO skills via MCP.",
          fields: seoFields,
        },
      ],
    },
  ],
};
```

- [ ] **Step 2: Verify the file was created correctly**

Run: `cat -n "apps/website/collections/Articles.ts" | head -5`
Expected: Lines 1-5 show the import statements.

- [ ] **Step 3: Commit**

```bash
git add apps/website/collections/Articles.ts
git commit -m "feat(articles): add Articles Payload collection definition"
```

---

## Task 2: Register Articles in Payload Config

**Files:**
- Modify: `apps/website/collections/index.ts`
- Modify: `apps/website/payload.config.ts`

Wire the new collection into Payload and enable MCP CRUD operations.

- [ ] **Step 1: Add Articles export to collections index**

In `apps/website/collections/index.ts`, add a new export line:

```typescript
export { Articles } from "./Articles";
```

The full file becomes:

```typescript
export { Articles } from "./Articles";
export { Categories } from "./Categories";
export { Guides } from "./Guides";
export { LandingPages } from "./LandingPages";
export { Media } from "./Media";
export { Pages } from "./Pages";
export { Services } from "./Services";
export { Users } from "./Users";
```

- [ ] **Step 2: Register Articles in payload.config.ts**

In `apps/website/payload.config.ts`:

**Import change** — add `Articles` to the import:

```typescript
import {
  Articles,
  Categories,
  Guides,
  LandingPages,
  Media,
  Pages,
  Services,
  Users,
} from "./collections";
```

**Collections array** — add `Articles`:

```typescript
collections: [Articles, Categories, Guides, LandingPages, Media, Pages, Services, Users],
```

**MCP plugin** — add articles to enabled collections:

```typescript
mcpPlugin({
  collections: {
    articles: { enabled: true },
    services: { enabled: true },
    categories: { enabled: true },
    guides: { enabled: true },
    "landing-pages": { enabled: true },
    pages: { enabled: true },
    media: {
      enabled: {
        find: true,
        create: false,
        update: false,
        delete: false,
      },
    },
  },
  mcp: {
    tools: [wipeContentTool],
  },
}),
```

- [ ] **Step 3: Generate Payload types**

Run: `pnpm --filter website payload generate:types`

This regenerates `apps/website/payload-types.ts` with the new `Article` type.

If the generate command isn't available as a script, run:
```bash
cd apps/website && npx payload generate:types
```

- [ ] **Step 4: Verify the Article type exists in payload-types.ts**

Run: `grep "export interface Article" apps/website/payload-types.ts`
Expected: A line like `export interface Article {`

- [ ] **Step 5: Commit**

```bash
git add apps/website/collections/index.ts apps/website/payload.config.ts apps/website/payload-types.ts
git commit -m "feat(articles): register Articles collection in Payload config and MCP"
```

---

## Task 3: Update wipeContentTool for Articles

**Files:**
- Modify: `apps/website/mcp/wipeContentTool.ts`

Add articles support so the wipe tool can reset article content for pipeline re-runs.

- [ ] **Step 1: Add ARTICLES_TEXT_FIELDS constant**

Add after the existing `GUIDES_TEXT_FIELDS` constant in `apps/website/mcp/wipeContentTool.ts`:

```typescript
const ARTICLES_TEXT_FIELDS = {
  // Localized fields
  // description is required, use placeholder
  description: "-",
  content: null,
  tags: [],
  readingTime: "",
  sources: [],
  // SEO tab
  metaTitle: "",
  metaDescription: "",
  keywords: [],
  ogTitle: "",
  ogDescription: "",
  seoScore: null,
  seoNotes: "",
  lastSeoReviewAt: null,
  // Pipeline status
  contentPipelineStatus: "not-started",
} as const;
```

- [ ] **Step 2: Update the collection parameter to accept "articles"**

Change the `collection` parameter schema from:

```typescript
collection: z
  .enum(["services", "guides"])
  .describe("Which collection to wipe content from"),
```

To:

```typescript
collection: z
  .enum(["services", "guides", "articles"])
  .describe("Which collection to wipe content from"),
```

- [ ] **Step 3: Update the handler to support the articles collection**

Change the `fields` assignment from:

```typescript
const fields =
  collection === "services" ? SERVICES_TEXT_FIELDS : GUIDES_TEXT_FIELDS;
```

To:

```typescript
const fieldsByCollection = {
  services: SERVICES_TEXT_FIELDS,
  guides: GUIDES_TEXT_FIELDS,
  articles: ARTICLES_TEXT_FIELDS,
};
const fields = fieldsByCollection[collection];
```

- [ ] **Step 4: Update the handler type annotation**

Change:

```typescript
const collection = args.collection as "services" | "guides";
```

To:

```typescript
const collection = args.collection as "services" | "guides" | "articles";
```

- [ ] **Step 5: Commit**

```bash
git add apps/website/mcp/wipeContentTool.ts
git commit -m "feat(articles): add articles support to wipe-content MCP tool"
```

---

## Task 4: Create Articles Data Layer

**Files:**
- Create: `apps/website/lib/articles.ts`

Cached queries and helpers for the frontend, following the same pattern as `lib/services.ts`.

- [ ] **Step 1: Create the articles data layer**

```typescript
// apps/website/lib/articles.ts
import { cache } from "react";
import type { Article } from "@/payload-types";
import { getPayload } from "@/lib/payload";

export const LOCALES = ["en", "nl"] as const;

/**
 * Fetch a single article by slug. Cached per request via React's cache().
 */
export const getArticleBySlug = cache(
  async (slug: string, locale: string): Promise<Article | null> => {
    const payload = await getPayload();
    const { docs } = await payload.find({
      collection: "articles",
      where: { slug: { equals: slug } },
      locale: locale as "en" | "nl",
      depth: 1,
      limit: 1,
    });
    return (docs[0] as Article | undefined) ?? null;
  }
);

/**
 * Fetch published articles, ordered by publishedAt descending.
 * Cached per request.
 */
export const getArticles = cache(
  async (
    locale: string,
    options?: {
      articleType?: Article["articleType"];
      limit?: number;
      page?: number;
    }
  ): Promise<{ docs: Article[]; totalPages: number; totalDocs: number }> => {
    const payload = await getPayload();
    const where: Record<string, unknown> = {};
    if (options?.articleType) {
      where.articleType = { equals: options.articleType };
    }

    const result = await payload.find({
      collection: "articles",
      where,
      locale: locale as "en" | "nl",
      depth: 1,
      limit: options?.limit ?? 12,
      page: options?.page ?? 1,
      sort: "-publishedAt",
    });

    return {
      docs: result.docs as Article[],
      totalPages: result.totalPages,
      totalDocs: result.totalDocs,
    };
  }
);

/**
 * Fetch articles related to a specific service.
 * Cached per request.
 */
export const getArticlesForService = cache(
  async (serviceId: number, locale: string): Promise<Article[]> => {
    const payload = await getPayload();
    const { docs } = await payload.find({
      collection: "articles",
      where: { relatedServices: { contains: serviceId } },
      locale: locale as "en" | "nl",
      depth: 0,
      limit: 5,
      sort: "-publishedAt",
    });
    return docs as Article[];
  }
);

/**
 * Returns all locale + slug combinations for articles.
 * Used in generateStaticParams.
 */
export async function getAllArticleSlugs() {
  const payload = await getPayload();
  const { docs } = await payload.find({
    collection: "articles",
    limit: 500,
    pagination: false,
  });
  return LOCALES.flatMap((locale) =>
    docs.map((a) => ({ locale, slug: a.slug }))
  );
}

/**
 * Resolve the hero image URL from an Article's heroImage field.
 */
export function getHeroImageUrl(
  heroImage: Article["heroImage"]
): string | undefined {
  if (typeof heroImage === "object" && heroImage !== null) {
    return heroImage.url ?? undefined;
  }
  return undefined;
}

/**
 * Maps an Article to the shape expected by article list cards.
 */
export function toArticleCard(article: Article) {
  return {
    title: article.title,
    slug: article.slug,
    description: article.description,
    articleType: article.articleType,
    publishedAt: article.publishedAt,
    author: article.author ?? undefined,
    heroImage: getHeroImageUrl(article.heroImage),
    readingTime: article.readingTime ?? undefined,
    tags: article.tags?.map((t) => t.tag) ?? [],
    featured: article.featured ?? false,
  };
}
```

- [ ] **Step 2: Verify the file compiles**

Run: `pnpm --filter website tsc --noEmit --pretty 2>&1 | head -20`

If there are type errors related to the `Article` type not existing, ensure Task 2 Step 3 (type generation) was completed first.

- [ ] **Step 3: Commit**

```bash
git add apps/website/lib/articles.ts
git commit -m "feat(articles): add cached article queries and helpers"
```

---

## Task 5: Add Articles to Sitemap

**Files:**
- Modify: `apps/website/app/sitemap.ts`

- [ ] **Step 1: Add Article type import**

In `apps/website/app/sitemap.ts`, add `Article` to the type import:

```typescript
import type { Service, Guide, Category, Article } from "@/payload-types";
```

- [ ] **Step 2: Add articles to the parallel fetch**

Change the `Promise.all` from:

```typescript
const [categoriesResult, servicesResult, guidesResult] = await Promise.all([
```

To:

```typescript
const [categoriesResult, servicesResult, guidesResult, articlesResult] = await Promise.all([
```

And add the articles query at the end of the array:

```typescript
    payload.find({
      collection: "articles",
      locale: defaultLocale,
      limit: 0,
      pagination: false,
    }),
```

- [ ] **Step 3: Generate article sitemap entries**

Add before the `return` statement:

```typescript
  const articlesEntries = articlesResult.docs.map((article: Article) => ({
    url: `${baseUrl}/${defaultLocale}/articles/${article.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));
```

- [ ] **Step 4: Include articles entries in the return array**

Add `...articlesEntries` to the return spread:

```typescript
  return [
    ...staticRouteEntries,
    ...localeEntries,
    ...categoriesEntries,
    ...servicesEntries,
    ...comparisonEntries,
    ...guidesEntries,
    ...articlesEntries,
  ];
```

- [ ] **Step 5: Add /articles to static routes**

Add `"/articles"` to the `staticRoutes` array so the listing page is in the sitemap:

```typescript
const staticRoutes = [
  "/",
  "/about",
  "/articles",
  "/contribute",
  "/tools",
  "/privacy",
  "/terms",
  "/feedback",
];
```

- [ ] **Step 6: Commit**

```bash
git add apps/website/app/sitemap.ts
git commit -m "feat(articles): add articles to sitemap generation"
```

---

## Task 6: Add i18n Keys for Articles

**Files:**
- Modify: `packages/i18n/messages/website/en.json`
- Modify: `packages/i18n/messages/website/nl.json`

- [ ] **Step 1: Read current en.json to find where to add keys**

Run: Read `packages/i18n/messages/website/en.json` to see the existing structure and find a logical place for article keys.

- [ ] **Step 2: Add articles section to en.json**

Add an `"articles"` key block alongside existing top-level keys (the exact insertion point depends on alphabetical order or grouping conventions in the file). The keys needed are:

```json
"articles": {
  "title": "Articles",
  "description": "News, analysis, and guides about European digital alternatives",
  "readMore": "Read more",
  "publishedOn": "Published on {date}",
  "byAuthor": "By {author}",
  "readingTime": "{time} read",
  "relatedArticles": "Related articles",
  "allArticles": "All articles",
  "filterByType": "Filter by type",
  "types": {
    "news": "News",
    "evergreen": "Evergreen",
    "comparison": "Comparison",
    "policy": "Policy",
    "opinion": "Opinion"
  },
  "noArticles": "No articles found",
  "sources": "Sources"
}
```

- [ ] **Step 3: Add corresponding Dutch translations to nl.json**

```json
"articles": {
  "title": "Artikelen",
  "description": "Nieuws, analyses en gidsen over Europese digitale alternatieven",
  "readMore": "Lees meer",
  "publishedOn": "Gepubliceerd op {date}",
  "byAuthor": "Door {author}",
  "readingTime": "{time} leestijd",
  "relatedArticles": "Gerelateerde artikelen",
  "allArticles": "Alle artikelen",
  "filterByType": "Filter op type",
  "types": {
    "news": "Nieuws",
    "evergreen": "Achtergrondartikel",
    "comparison": "Vergelijking",
    "policy": "Beleid",
    "opinion": "Opinie"
  },
  "noArticles": "Geen artikelen gevonden",
  "sources": "Bronnen"
}
```

- [ ] **Step 4: Commit**

```bash
git add packages/i18n/messages/website/en.json packages/i18n/messages/website/nl.json
git commit -m "feat(articles): add i18n keys for articles section"
```

---

## Task 7: Create Article Listing Page

**Files:**
- Create: `apps/website/app/(frontend)/[locale]/articles/page.tsx`

A server component listing page showing published articles with type filtering. Follows the same layout and component patterns as other listing pages.

- [ ] **Step 1: Create the listing page**

```typescript
// apps/website/app/(frontend)/[locale]/articles/page.tsx
import { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Locale } from "next-intl";
import { Container } from "@switch-to-eu/blocks/components/container";
import { PageLayout } from "@switch-to-eu/blocks/components/page-layout";
import { Link } from "@switch-to-eu/i18n/navigation";
import { getArticles, toArticleCard, getHeroImageUrl } from "@/lib/articles";
import type { Article } from "@/payload-types";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "articles" });
  return {
    title: t("title"),
    description: t("description"),
  };
}

function ArticleTypeLabel({
  type,
  labels,
}: {
  type: Article["articleType"];
  labels: Record<string, string>;
}) {
  const colorMap: Record<string, string> = {
    news: "bg-blue-100 text-blue-800",
    evergreen: "bg-green-100 text-green-800",
    comparison: "bg-purple-100 text-purple-800",
    policy: "bg-amber-100 text-amber-800",
    opinion: "bg-rose-100 text-rose-800",
  };
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${colorMap[type] ?? "bg-gray-100 text-gray-800"}`}
    >
      {labels[type] ?? type}
    </span>
  );
}

function ArticleCard({
  article,
  typeLabels,
}: {
  article: ReturnType<typeof toArticleCard>;
  typeLabels: Record<string, string>;
}) {
  return (
    <Link
      href={`/articles/${article.slug}`}
      className="group block rounded-lg border border-gray-200 p-5 transition-colors hover:border-gray-300 hover:bg-gray-50"
    >
      {article.heroImage && (
        <div className="mb-4 overflow-hidden rounded-md">
          <img
            src={article.heroImage}
            alt={article.title}
            className="aspect-[2/1] w-full object-cover transition-transform group-hover:scale-[1.02]"
          />
        </div>
      )}
      <div className="flex items-center gap-2 mb-2">
        <ArticleTypeLabel type={article.articleType} labels={typeLabels} />
        {article.readingTime && (
          <span className="text-xs text-gray-500">{article.readingTime}</span>
        )}
      </div>
      <h2 className="text-lg font-semibold mb-1 group-hover:text-blue-700 transition-colors">
        {article.title}
      </h2>
      <p className="text-sm text-gray-600 line-clamp-2">{article.description}</p>
      {article.publishedAt && (
        <time className="mt-3 block text-xs text-gray-400">
          {new Date(article.publishedAt).toLocaleDateString("en-GB", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </time>
      )}
    </Link>
  );
}

export default async function ArticlesPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: Locale }>;
  searchParams: Promise<{ type?: string; page?: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const search = await searchParams;
  const t = await getTranslations({ locale, namespace: "articles" });

  const articleType = search.type as Article["articleType"] | undefined;
  const page = search.page ? parseInt(search.page, 10) : 1;

  const { docs, totalPages } = await getArticles(locale, {
    articleType,
    page,
    limit: 12,
  });

  const typeLabels: Record<string, string> = {
    news: t("types.news"),
    evergreen: t("types.evergreen"),
    comparison: t("types.comparison"),
    policy: t("types.policy"),
    opinion: t("types.opinion"),
  };

  const types = ["news", "evergreen", "comparison", "policy", "opinion"];

  return (
    <PageLayout>
      <Container>
        <div className="py-12">
          <h1 className="text-3xl font-bold mb-2">{t("title")}</h1>
          <p className="text-gray-600 mb-8">{t("description")}</p>

          {/* Type filter */}
          <div className="flex flex-wrap gap-2 mb-8">
            <Link
              href="/articles"
              className={`rounded-full px-3 py-1 text-sm transition-colors ${
                !articleType
                  ? "bg-gray-900 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {t("allArticles")}
            </Link>
            {types.map((type) => (
              <Link
                key={type}
                href={`/articles?type=${type}`}
                className={`rounded-full px-3 py-1 text-sm transition-colors ${
                  articleType === type
                    ? "bg-gray-900 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {typeLabels[type]}
              </Link>
            ))}
          </div>

          {/* Article grid */}
          {docs.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {docs.map((article) => (
                <ArticleCard
                  key={article.slug}
                  article={toArticleCard(article)}
                  typeLabels={typeLabels}
                />
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-12">{t("noArticles")}</p>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-10">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (pageNum) => (
                  <Link
                    key={pageNum}
                    href={`/articles?${articleType ? `type=${articleType}&` : ""}page=${pageNum}`}
                    className={`rounded px-3 py-1 text-sm ${
                      pageNum === page
                        ? "bg-gray-900 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {pageNum}
                  </Link>
                )
              )}
            </div>
          )}
        </div>
      </Container>
    </PageLayout>
  );
}
```

- [ ] **Step 2: Verify the page compiles**

Run: `pnpm --filter website tsc --noEmit --pretty 2>&1 | grep -i "articles" | head -10`

- [ ] **Step 3: Commit**

```bash
git add "apps/website/app/(frontend)/[locale]/articles/page.tsx"
git commit -m "feat(articles): add article listing page with type filtering"
```

---

## Task 8: Create Article Detail Page

**Files:**
- Create: `apps/website/app/(frontend)/[locale]/articles/[slug]/page.tsx`

Server component rendering the full article with rich text content, metadata, related services, and sources.

- [ ] **Step 1: Create the detail page**

```typescript
// apps/website/app/(frontend)/[locale]/articles/[slug]/page.tsx
import { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Locale } from "next-intl";
import { notFound } from "next/navigation";
import { Container } from "@switch-to-eu/blocks/components/container";
import { PageLayout } from "@switch-to-eu/blocks/components/page-layout";
import { Link } from "@switch-to-eu/i18n/navigation";
import { RichText } from "@payloadcms/richtext-lexical/react";
import { getArticleBySlug, getAllArticleSlugs, getHeroImageUrl } from "@/lib/articles";
import type { Service } from "@/payload-types";

export async function generateStaticParams() {
  return getAllArticleSlugs();
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const article = await getArticleBySlug(slug, locale);

  if (!article) return { title: "Not Found" };

  const heroUrl = getHeroImageUrl(article.heroImage);

  return {
    title: article.metaTitle || article.title,
    description: article.metaDescription || article.description,
    openGraph: {
      title: article.ogTitle || article.metaTitle || article.title,
      description: article.ogDescription || article.metaDescription || article.description,
      type: "article",
      publishedTime: article.publishedAt,
      ...(heroUrl ? { images: [heroUrl] } : {}),
    },
  };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "articles" });
  const article = await getArticleBySlug(slug, locale);

  if (!article) notFound();

  const heroUrl = getHeroImageUrl(article.heroImage);
  const relatedServices = (article.relatedServices ?? []).filter(
    (s): s is Service => typeof s === "object" && s !== null
  );

  return (
    <PageLayout>
      <Container>
        <article className="py-12 mx-auto max-w-prose">
          {/* Back link */}
          <Link
            href="/articles"
            className="text-sm text-gray-500 hover:text-gray-700 mb-6 inline-block"
          >
            &larr; {t("allArticles")}
          </Link>

          {/* Header */}
          <header className="mb-8">
            <h1 className="text-3xl font-bold mb-3">{article.title}</h1>
            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
              {article.publishedAt && (
                <time>
                  {new Date(article.publishedAt).toLocaleDateString("en-GB", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </time>
              )}
              {article.author && <span>{article.author}</span>}
              {article.readingTime && <span>{article.readingTime}</span>}
            </div>
          </header>

          {/* Hero image */}
          {heroUrl && (
            <div className="mb-8 overflow-hidden rounded-lg">
              <img
                src={heroUrl}
                alt={article.title}
                className="w-full aspect-[2/1] object-cover"
              />
            </div>
          )}

          {/* Body */}
          <div className="prose prose-gray max-w-none">
            <RichText data={article.content} />
          </div>

          {/* Sources */}
          {article.sources && article.sources.length > 0 && (
            <section className="mt-10 pt-6 border-t border-gray-200">
              <h2 className="text-sm font-semibold text-gray-700 mb-3">
                {t("sources")}
              </h2>
              <ul className="space-y-1">
                {article.sources.map((source, i) => (
                  <li key={i}>
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline"
                    >
                      {source.label}
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Related services */}
          {relatedServices.length > 0 && (
            <section className="mt-10 pt-6 border-t border-gray-200">
              <h2 className="text-sm font-semibold text-gray-700 mb-3">
                Mentioned services
              </h2>
              <div className="flex flex-wrap gap-2">
                {relatedServices.map((service) => (
                  <Link
                    key={service.slug}
                    href={`/services/${service.region === "non-eu" ? "non-eu" : "eu"}/${service.slug}`}
                    className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700 hover:bg-gray-200 transition-colors"
                  >
                    {service.name}
                  </Link>
                ))}
              </div>
            </section>
          )}
        </article>
      </Container>
    </PageLayout>
  );
}
```

- [ ] **Step 2: Verify the page compiles**

Run: `pnpm --filter website tsc --noEmit --pretty 2>&1 | grep -i "error" | head -10`

- [ ] **Step 3: Commit**

```bash
git add "apps/website/app/(frontend)/[locale]/articles/[slug]/page.tsx"
git commit -m "feat(articles): add article detail page with rich text rendering"
```

---

## Task 9: Add LLM Markdown Export for Articles

**Files:**
- Modify: `apps/website/lib/llm-content.ts`
- Modify: `apps/website/next.config.ts`

Add a `/articles/:slug.md` route so LLMs and scrapers get a clean markdown version of articles. Follows the existing pattern for services and guides.

- [ ] **Step 1: Read the current llm-content.ts to understand the pattern**

Run: Read `apps/website/lib/llm-content.ts`

- [ ] **Step 2: Add articleToMarkdown function**

Add the following function to `apps/website/lib/llm-content.ts` (the exact import for the `Article` type and helper usage depends on the existing code structure — adapt to match):

```typescript
export function articleToMarkdown(article: Article): string {
  const lines: string[] = [];

  lines.push(`# ${article.title}`);
  if (article.description) {
    lines.push(`> ${article.description}`);
  }
  lines.push("");

  if (article.publishedAt) {
    lines.push(`**Published:** ${new Date(article.publishedAt).toLocaleDateString("en-GB", { year: "numeric", month: "long", day: "numeric" })}`);
  }
  if (article.author) {
    lines.push(`**Author:** ${article.author}`);
  }
  if (article.articleType) {
    lines.push(`**Type:** ${article.articleType}`);
  }
  lines.push("");

  const content = lexicalToMarkdown(article.content);
  if (content) lines.push(content);

  if (article.sources && article.sources.length > 0) {
    lines.push("");
    lines.push("## Sources");
    for (const source of article.sources) {
      lines.push(`- [${source.label}](${source.url})`);
    }
  }

  return lines.join("\n").trim();
}
```

Also add `Article` to the type import at the top of the file:

```typescript
import type { Service, Guide, Article } from "@/payload-types";
```

- [ ] **Step 3: Create the API route handler**

Check if there's an existing `apps/website/app/api/llm/` directory. If so, create `apps/website/app/api/llm/articles/[slug]/route.ts` following the same pattern as the services route handler. If the LLM routes use a different pattern (rewrites), add the rewrite to `next.config.ts` instead.

- [ ] **Step 4: Add rewrite to next.config.ts**

Add to the rewrites array in `apps/website/next.config.ts`:

```typescript
{
  source: "/articles/:slug.md",
  destination: "/api/llm/articles/:slug",
},
```

- [ ] **Step 5: Commit**

```bash
git add apps/website/lib/llm-content.ts apps/website/next.config.ts
git commit -m "feat(articles): add LLM markdown export route for articles"
```

---

## Task 10: Create `/write-article` Skill

**Files:**
- Create: `.claude/skills/write-article/SKILL.md`

This is the core skill for generating article content from a brief/topic. It reads from Payload CMS (existing services, categories) for context and writes the article via MCP. Follows the informational-copy tone of voice.

- [ ] **Step 1: Create the skill file**

```markdown
---
name: write-article
description: Write or rewrite an article for switch-to.eu and store it in Payload CMS. Handles news pieces, evergreen content, comparisons, policy analysis, and opinion pieces. Use when asked to "write an article", "draft an article", "write a news piece", "write about", or "create a blog post".
---

# Write Article

Write articles for the switch-to.eu news section. All content is stored in Payload CMS via MCP. Every article enters as a draft for human review.

## Before you start

1. **Invoke the informational-copy skill** — read it and internalize the tone rules. Every word you write must follow those rules. No exceptions.

2. **Understand the brief.** The user provides one of:
   - A topic or headline (e.g., "Write about the DMA's impact on app stores")
   - A topic + article type (e.g., "Write a comparison of Proton Drive vs Tresorit")
   - A detailed brief with sources and angles

3. **Check if the article already exists.** Use `mcp__Payload__findArticles` with the likely slug. If it exists and has content, ask the user whether to overwrite.

4. **Research the topic.** Use `WebSearch` and `WebFetch` to gather current facts, data points, and source URLs. Every claim needs a source.

## Article types

| Type | Purpose | Length | Structure |
|------|---------|--------|-----------|
| **news** | Timely event that creates switching demand | 400-800 words | Hook → Context → Impact → What to do → Sources |
| **evergreen** | Search-driven guide or listicle | 800-1500 words | Intro → Sections with H2s → Worth knowing → Sources |
| **comparison** | Head-to-head service comparison | 600-1200 words | Intro → Criteria → Service A → Service B → Verdict → Sources |
| **policy** | EU regulation explainer | 600-1000 words | What happened → Who it affects → What changes → What to do → Sources |
| **opinion** | Editorial perspective | 400-800 words | Position → Evidence → Counterpoint → Conclusion → Sources |

## Writing rules

Follow ALL rules from the informational-copy skill. Additionally:

### Article-specific rules

- **Lead with the news.** First sentence tells the reader what happened or what they'll learn. No throat-clearing.
- **Every claim gets a source.** No unsourced statistics, dates, or quotes. Add all source URLs to the `sources` array.
- **Link to existing services.** When you mention a service that exists on switch-to.eu, add it to `relatedServices`. Use `mcp__Payload__findServices` to look up slugs.
- **Time-stamp news articles.** News pieces must have a specific `publishedAt` date (today's date).
- **Reading time.** Calculate based on ~200 words/minute. Format as "X min read".
- **No clickbait.** Titles should be clear and specific. "ProtonMail adds PGP key management" not "You won't believe what ProtonMail just did".
- **Worth knowing section.** Every article over 500 words should end with a "Worth knowing" paragraph that acknowledges trade-offs or nuances.

### Consumer-friendly language

Same rewrites as the write skill for services:
- "zero-access encryption" → "only you can read your emails"
- "GDPR compliant" → "follows EU privacy rules"
- "end-to-end encrypted" → "encrypted so only you and the recipient can read it"
- "open source" → "anyone can inspect the code"
- "data sovereignty" → "your data stays in Europe"

## Slug generation

Generate from the title: lowercase, hyphens for spaces, no special characters, max 60 chars.
- "Google kills Podcasts app — here are EU alternatives" → `google-kills-podcasts-eu-alternatives`
- "Proton Drive vs Tresorit: EU cloud storage compared" → `proton-drive-vs-tresorit-comparison`

## MCP workflow

### Step 1: Research (if needed)

```
WebSearch("topic keywords site:noyb.eu OR site:techcrunch.com OR ...")
WebFetch("specific source URL")
```

Collect: facts, dates, quotes, source URLs, related service names.

### Step 2: Find related services

```
mcp__Payload__findServices({ where: { name: { like: "ServiceName" } }, limit: 5 })
```

Collect service IDs for the `relatedServices` field.

### Step 3: Check for existing category

```
mcp__Payload__findCategories({ where: { slug: { equals: "category-slug" } }, limit: 1 })
```

If the article relates to an existing service category (email, cloud-storage, etc.), link it.

### Step 4: Create or update the article

```
mcp__Payload__createArticles({
  slug: "generated-slug",
  title: "Article Title",
  description: "1-2 sentence excerpt for cards and search results",
  articleType: "news",
  publishedAt: "2026-04-08T00:00:00.000Z",
  author: "",
  readingTime: "4 min read",
  category: categoryId,           // optional, number
  relatedServices: [id1, id2],    // optional, number[]
  tags: [{ tag: "privacy" }, { tag: "GDPR" }],
  content: { ... },               // Lexical JSON
  sources: [
    { url: "https://...", label: "Source Name" }
  ],
  _status: "draft"
})
```

Or update an existing article:

```
mcp__Payload__updateArticles({
  id: existingArticleId,
  ...fields,
  _status: "draft"
})
```

### Step 5: Set pipeline status

After creating/updating, set `contentPipelineStatus` to `"written"`:

```
mcp__Payload__updateArticles({
  id: articleId,
  contentPipelineStatus: "written"
})
```

### Step 6: Confirm

Tell the user:
- Article title and slug
- Word count and reading time
- Number of sources
- Related services linked
- Status: draft (needs review in /admin before publishing)

## Lexical JSON format

Use the same Lexical JSON format as services and guides. Example paragraph:

```json
{
  "root": {
    "type": "root",
    "direction": "ltr",
    "format": "",
    "indent": 0,
    "version": 1,
    "children": [
      {
        "type": "paragraph",
        "version": 1,
        "direction": "ltr",
        "format": "",
        "indent": 0,
        "children": [
          { "type": "text", "text": "Your paragraph text here.", "format": 0, "mode": "normal", "version": 1 }
        ]
      }
    ]
  }
}
```

For headings, use `"type": "heading"` with `"tag": "h2"` (or h3). Never use h1 in body content — the article title is the h1.

## Quality checklist

Before saving, verify:
- [ ] Title is clear and specific (no clickbait)
- [ ] Description is 1-2 sentences, works as standalone excerpt
- [ ] Content follows informational-copy tone rules
- [ ] All claims have sources in the `sources` array
- [ ] Related services are linked where they exist on switch-to.eu
- [ ] Reading time is calculated
- [ ] Slug is clean and URL-friendly
- [ ] No em dashes, semicolons, or banned words
- [ ] "Worth knowing" section present (if article > 500 words)
- [ ] Saved as draft
```

- [ ] **Step 2: Commit**

```bash
git add .claude/skills/write-article/SKILL.md
git commit -m "feat(articles): add /write-article skill for article content generation"
```

---

## Task 11: Extend Existing Skills for Articles

**Files:**
- Modify: `.claude/skills/humanize/SKILL.md`
- Modify: `.claude/skills/seo-check/SKILL.md`
- Modify: `.claude/skills/translate/SKILL.md`
- Modify: `.claude/skills/pipeline/SKILL.md`

The existing pipeline skills (humanize, seo-check, translate, pipeline) need to know about articles so they can process them the same way they process services and guides.

- [ ] **Step 1: Read each skill file to find the exact lines to modify**

Read all four SKILL.md files. Look for:
- Argument parsing sections that mention "service" and "guide"
- MCP tool references (`findServices`, `findGuides`, `updateServices`, `updateGuides`)
- Content field mappings (which fields to process)

- [ ] **Step 2: Extend the humanize skill**

In `.claude/skills/humanize/SKILL.md`, find the section that describes what collections it supports. Add articles alongside services and guides. The key changes:

- **Argument parsing:** Add `article "slug"` as a valid argument format
- **MCP tools:** Add `mcp__Payload__findArticles` and `mcp__Payload__updateArticles`
- **Fields to humanize:** For articles, humanize `title`, `description`, and `content` (same approach as services — content is the main body)

Example addition to the argument parsing section:

```
### Article
- `article "article-slug"` — humanize a specific article
```

Example addition to the fields section:

```
### Article fields to humanize
- `title` — article headline
- `description` — article excerpt
- `content` — full article body (richText)
```

- [ ] **Step 3: Extend the seo-check skill**

In `.claude/skills/seo-check/SKILL.md`:

- Add `article "slug"` argument format
- Add MCP tool references for articles
- The 10-point checklist applies identically to articles (meta title, description, keywords, content length, OG tags, etc.)
- Article-specific note: check that `readingTime` is set and `sources` array is non-empty

- [ ] **Step 4: Extend the translate skill**

In `.claude/skills/translate/SKILL.md`:

- Add `article "slug"` argument format
- Add MCP tool references for articles
- Fields to translate: `title`, `description`, `content`, `tags` (localized array)
- Fields NOT to translate: `slug`, `articleType`, `publishedAt`, `author`, `readingTime`, `sources` (URLs are language-independent), `relatedServices`, `category`

- [ ] **Step 5: Extend the pipeline skill**

In `.claude/skills/pipeline/SKILL.md`:

- Add `article <name>`, `article all`, `article unwritten` argument formats
- The pipeline flow is identical: write-article → humanize → seo-check
- Use `mcp__Payload__findArticles` to build the item list
- Filter by `contentPipelineStatus` for `unwritten` argument

- [ ] **Step 6: Commit**

```bash
git add .claude/skills/humanize/SKILL.md .claude/skills/seo-check/SKILL.md .claude/skills/translate/SKILL.md .claude/skills/pipeline/SKILL.md
git commit -m "feat(articles): extend humanize, seo-check, translate, pipeline skills for articles"
```

---

## Task 12: Create Bulk Article Skills

**Files:**
- Create: `.claude/skills/bulk-write-article/SKILL.md`
- Modify: `.claude/skills/bulk-humanize/SKILL.md`
- Modify: `.claude/skills/bulk-seo-check/SKILL.md`
- Modify: `.claude/skills/bulk-translate/SKILL.md`

- [ ] **Step 1: Create the bulk-write-article skill**

Follow the exact same pattern as `.claude/skills/bulk-write/SKILL.md` but for articles. The key differences:

- Uses `mcp__Payload__findArticles` to build item list
- Dispatches subagents that invoke the `write-article` skill
- Argument formats: `article "name1", "name2"`, `article all`, `article unwritten`
- No research requirement (articles don't have a research tab)
- Max 10 parallel agents

```markdown
---
name: bulk-write-article
description: Write content for multiple articles in parallel using subagents. Use when asked to "write all articles", "bulk write articles", or need to generate content for many articles at once.
---

# Bulk Write Article

Write content for multiple articles in parallel using subagents. Each article gets its own Agent that runs the /write-article skill independently.

## Arguments

Parse the user's request to determine which articles to write:

- `article "Title 1", "Title 2"` — specific articles by title or slug
- `article all` — all articles with contentPipelineStatus "not-started"
- `article unwritten` — same as "all" (articles without content)

## Process

1. **Build item list.** Query `mcp__Payload__findArticles` with appropriate filters.
2. **Confirm with user.** Show the list and ask for confirmation before dispatching agents.
3. **Dispatch parallel agents.** One Agent per article, max 10 at a time. Each agent:
   - Receives the article title, slug, and any brief/topic info
   - Runs the write-article skill workflow
   - Reports success or failure
4. **Collect results.** Report how many articles were written successfully.

## Guardrails

- Max 10 parallel agents per batch
- All content saves as draft
- If an article already has content (contentPipelineStatus not "not-started"), skip unless user confirms overwrite
- Each agent is independent — one failure doesn't block others

## Agent prompt template

For each article, dispatch an Agent with:

```
Write an article for switch-to.eu using the /write-article skill.

Article: "{title}" (slug: {slug})
Article type: {articleType}
Brief: {description or user-provided brief}

Use the write-article skill workflow. Save as draft via MCP.
```
```

- [ ] **Step 2: Extend bulk-humanize, bulk-seo-check, bulk-translate**

Read each bulk skill file and add `article` as a supported collection type alongside `service` and `guide`. The changes mirror Task 11 — add article argument formats and MCP tool references.

For each bulk skill:
- Add `article "slug"`, `article all`, `article unhumanized`/`article unchecked`/`article untranslated` argument formats
- Use `mcp__Payload__findArticles` to build item lists
- Filter by `contentPipelineStatus` for status-based arguments

- [ ] **Step 3: Commit**

```bash
git add .claude/skills/bulk-write-article/SKILL.md .claude/skills/bulk-humanize/SKILL.md .claude/skills/bulk-seo-check/SKILL.md .claude/skills/bulk-translate/SKILL.md
git commit -m "feat(articles): add bulk-write-article and extend bulk skills for articles"
```

---

## Task 13: Update CLAUDE.md Documentation

**Files:**
- Modify: `CLAUDE.md`

Add articles to the content workflow documentation so future sessions know about the articles collection and skills.

- [ ] **Step 1: Read CLAUDE.md to find the content workflow section**

Read the file and locate the "Content Workflow" and "Skills" sections.

- [ ] **Step 2: Add articles to the single-item pipeline section**

After the guide pipeline example, add:

```markdown
For articles:
```
/write-article "DMA impact on app stores"    → Creates article from topic, saves as draft
/humanize article "dma-impact-app-stores"
/seo-check article "dma-impact-app-stores"
→ Review + publish
/translate article "dma-impact-app-stores" nl
→ Review Dutch + publish
```
```

- [ ] **Step 3: Add articles to the bulk pipeline section**

Add lines for bulk article operations:

```markdown
/bulk-write-article article all               → Write all unwritten articles in parallel
```

- [ ] **Step 4: Add write-article to the skills table**

Add a row:

```markdown
| `write-article` | `/write-article` | Write news/articles from topic or brief |
| `bulk-write-article` | `/bulk-write-article` | Parallel article writing via subagents |
```

- [ ] **Step 5: Add Articles collection description**

In the appropriate section (monorepo architecture or content system), add:

```markdown
**Articles** — News, analysis, comparisons, and opinion pieces. Types: news, evergreen, comparison, policy, opinion. Each article can link to related services and categories. Same content pipeline as services and guides.
```

- [ ] **Step 6: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: add articles section to CLAUDE.md content workflow documentation"
```

---

## Task 14: Smoke Test the Full Flow

This task verifies everything works end-to-end. No new files — just validation.

- [ ] **Step 1: Start the dev server**

Run: `pnpm --filter website dev`

Verify the server starts without errors.

- [ ] **Step 2: Check Payload admin panel**

Navigate to `/admin` in the browser. Verify:
- "Articles" appears in the sidebar
- You can create a new article with all fields
- The tabs (General, Content, SEO) render correctly
- Draft/publish toggle works

- [ ] **Step 3: Create a test article via MCP**

Use the MCP tools to create a test article:

```
mcp__Payload__createArticles({
  slug: "test-article",
  title: "Test Article",
  description: "This is a test article for the news section.",
  articleType: "news",
  publishedAt: "2026-04-08T00:00:00.000Z",
  readingTime: "2 min read",
  content: {
    "root": {
      "type": "root", "direction": "ltr", "format": "", "indent": 0, "version": 1,
      "children": [{
        "type": "paragraph", "version": 1, "direction": "ltr", "format": "", "indent": 0,
        "children": [{ "type": "text", "text": "Test content paragraph.", "format": 0, "mode": "normal", "version": 1 }]
      }]
    }
  },
  _status: "published"
})
```

- [ ] **Step 4: Verify the frontend pages**

- Visit `/en/articles` — listing page should show the test article
- Visit `/en/articles/test-article` — detail page should render
- Check that type filter pills work

- [ ] **Step 5: Verify the sitemap includes articles**

Visit `/sitemap.xml` and confirm the test article URL appears.

- [ ] **Step 6: Clean up test data**

```
mcp__Payload__deleteArticles({ id: <test-article-id> })
```

- [ ] **Step 7: Run type check**

Run: `pnpm --filter website tsc --noEmit`

Verify no type errors.

- [ ] **Step 8: Run lint**

Run: `pnpm --filter website lint`

Verify no lint errors.

---

## Summary

| Task | What it does | Files |
|------|-------------|-------|
| 1 | Create Articles Payload collection | `collections/Articles.ts` |
| 2 | Register in Payload config + MCP | `collections/index.ts`, `payload.config.ts` |
| 3 | Add articles to wipeContentTool | `mcp/wipeContentTool.ts` |
| 4 | Create data layer (cached queries) | `lib/articles.ts` |
| 5 | Add articles to sitemap | `app/sitemap.ts` |
| 6 | Add i18n keys | `en.json`, `nl.json` |
| 7 | Create listing page | `app/.../articles/page.tsx` |
| 8 | Create detail page | `app/.../articles/[slug]/page.tsx` |
| 9 | Add LLM markdown export | `lib/llm-content.ts`, `next.config.ts` |
| 10 | Create /write-article skill | `.claude/skills/write-article/SKILL.md` |
| 11 | Extend humanize/seo-check/translate/pipeline | 4 skill files |
| 12 | Create bulk-write-article + extend bulk skills | 4 skill files |
| 13 | Update CLAUDE.md docs | `CLAUDE.md` |
| 14 | Smoke test full flow | No new files |

**Dependencies:** Tasks 1-2 must run first (collection + types). Tasks 3-13 can run in any order after that. Task 14 runs last.
