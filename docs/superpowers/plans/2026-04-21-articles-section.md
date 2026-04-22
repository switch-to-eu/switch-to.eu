# Articles Section Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a full Articles section (`Articles`, `Authors`, `Tags` Payload collections; five custom Lexical blocks; inline service/guide/category pill enrichment; detail, listing, author and tag routes; global RSS feed; homepage integration; cross-surfacing; and a full AI pipeline) while leaving visual polish for a later `impeccable` pass.

**Architecture:** Three new Payload collections feed a Lexical rich-text body with `BlocksFeature` enabled. A single shared `LexicalBody` client component renders the serialized editor state, delegating block nodes to dedicated React block components and intercepting internal link nodes to render enriched pills for services, guides, and categories. Routes follow the existing `/[locale]/...` pattern with `generateStaticParams`, `generateMetadata`, language alternates, and `opengraph-image.tsx`. The global `/[locale]/feed.xml` is a standalone route handler that queries both `articles` and `guides` collections and merges them. The AI pipeline (`.claude/skills/*-article`) mirrors the existing service/guide/category skills.

**Tech Stack:** Next.js 16 App Router (website app), Payload CMS 3.x with `@payloadcms/richtext-lexical`, `@payloadcms/plugin-mcp`, Postgres, Tailwind CSS, next-intl v4, Playwright for smoke tests, shared `@switch-to-eu/blocks` + `@switch-to-eu/ui` + `@switch-to-eu/i18n` workspace packages.

**Spec:** `docs/superpowers/specs/2026-04-21-articles-blog-design.md`

**Tests:** The website app does not run Vitest (per `CLAUDE.md` — only tRPC apps do). Verification in this plan uses Payload type generation (`pnpm --filter website generate:types`), Next.js build (`pnpm --filter website build`), and the Playwright smoke suite (`pnpm --filter website test:e2e`). The smoke test reads `/sitemap.xml`, so new routes that are registered in the sitemap are automatically covered; routes that aren't in the sitemap (like `/feed.xml`) get an explicit extra entry.

**Commit cadence:** One commit per task unless otherwise noted. Commit messages follow the existing `fix(website): …` / `feat(website): …` convention (see `git log`).

**Out of scope for this plan (deferred):**
- Visual polish — semantic HTML + minimal Tailwind only; the `impeccable` skill pass handles typography, shapes, colour rotation, micro-interactions.
- Any design changes beyond what the spec explicitly requires.

---

## File structure overview

### New files

**Collections**
- `apps/website/collections/Articles.ts` — new Articles collection
- `apps/website/collections/Authors.ts` — new Authors collection
- `apps/website/collections/Tags.ts` — new Tags collection

**Block configs (Payload Lexical blocks)**
- `apps/website/blocks/ServiceCardBlock.ts`
- `apps/website/blocks/ServiceComparisonBlock.ts`
- `apps/website/blocks/GuideCtaBlock.ts`
- `apps/website/blocks/CategoryGridBlock.ts`
- `apps/website/blocks/CalloutBlock.ts`
- `apps/website/blocks/index.ts` — barrel export

**Block renderer components**
- `apps/website/components/articles/blocks/ServiceCardBlock.tsx`
- `apps/website/components/articles/blocks/ServiceComparisonBlock.tsx`
- `apps/website/components/articles/blocks/GuideCtaBlock.tsx`
- `apps/website/components/articles/blocks/CategoryGridBlock.tsx`
- `apps/website/components/articles/blocks/CalloutBlock.tsx`

**Pill components**
- `apps/website/components/articles/pills/ServicePill.tsx`
- `apps/website/components/articles/pills/GuidePill.tsx`
- `apps/website/components/articles/pills/CategoryPill.tsx`

**Body renderer**
- `apps/website/components/articles/LexicalBody.tsx` — wraps Payload's `RichText` with block + link-node pill overrides

**Shared article components**
- `apps/website/components/articles/ArticleCard.tsx` — used on homepage, listing, related sections, tag pages, author pages
- `apps/website/components/articles/ArticleMeta.tsx` — publish date / reading time / authors byline
- `apps/website/components/articles/RelatedArticles.tsx` — server component used by service/category/guide detail pages

**Routes**
- `apps/website/app/(frontend)/[locale]/articles/page.tsx` — listing
- `apps/website/app/(frontend)/[locale]/articles/[slug]/page.tsx` — detail
- `apps/website/app/(frontend)/[locale]/articles/[slug]/opengraph-image.tsx`
- `apps/website/app/(frontend)/[locale]/articles/authors/[authorSlug]/page.tsx`
- `apps/website/app/(frontend)/[locale]/articles/tags/[tagSlug]/page.tsx`
- `apps/website/app/(frontend)/[locale]/feed.xml/route.ts` — global RSS feed

**Feed builder module**
- `apps/website/lib/feed.ts` — queries articles + guides, returns RSS 2.0 XML

**Seed**
- `apps/website/scripts/seedArticles.ts` — seeds one author, one tag, and one article per locale for smoke coverage

**AI pipeline skills**
- `.claude/skills/write-article/SKILL.md`
- `.claude/skills/humanize-article/SKILL.md`
- `.claude/skills/seo-check-article/SKILL.md`
- `.claude/skills/translate-article/SKILL.md`

### Modified files

- `apps/website/collections/index.ts` — export new collections
- `apps/website/payload.config.ts` — register collections + MCP entries
- `apps/website/app/sitemap.xml/route.ts` — add article/author/tag URLs
- `apps/website/app/(frontend)/[locale]/layout.tsx` — add `rel="alternate"` RSS discovery link
- `apps/website/components/ArticlesSection.tsx` — swap placeholder for real data
- `apps/website/app/(frontend)/[locale]/page.tsx` — may need to `await` the rewired `ArticlesSection`
- `apps/website/app/(frontend)/[locale]/services/[category]/page.tsx` (or equivalent) — add `<RelatedArticles />`
- `apps/website/app/(frontend)/[locale]/services/[region]/[service_name]/page.tsx` — add `<RelatedArticles />`
- `apps/website/app/(frontend)/[locale]/guides/[category]/[service]/page.tsx` — add `<RelatedArticles />`
- `apps/website/components/layout/header.tsx` — add Articles link
- `packages/blocks/src/components/footer.tsx` (or equivalent shared footer) — add Articles link
- `packages/i18n/messages/website/en.json` — add `articles.*` + `feed.*` keys; remove `home.articlesComingSoon` etc.
- `packages/i18n/messages/website/nl.json` — same, translated
- `.claude/skills/bulk-write/SKILL.md` — accept `article`
- `.claude/skills/bulk-humanize/SKILL.md` — accept `article`
- `.claude/skills/bulk-seo-check/SKILL.md` — accept `article`
- `.claude/skills/bulk-translate/SKILL.md` — accept `article`
- `.claude/skills/pipeline/SKILL.md` — accept `article`
- `CLAUDE.md` — update Content Workflow section to include articles

---

## Phases

- **Phase 1 (Tasks 1–6):** Collections, MCP registration, type generation.
- **Phase 2 (Tasks 7–12):** Custom Lexical blocks.
- **Phase 3 (Tasks 13–14):** Inline pill components + `LexicalBody` renderer.
- **Phase 4 (Tasks 15–20):** Routes, global RSS feed, sitemap extension, RSS discovery link.
- **Phase 5 (Tasks 21–25):** Homepage + cross-surfacing + navigation.
- **Phase 6 (Task 26):** i18n messages.
- **Phase 7 (Tasks 27–32):** AI pipeline skills + bulk/pipeline extensions.
- **Phase 8 (Tasks 33–34):** Seed + smoke test verification.

---

## Phase 1: Collections, MCP, types

### Task 1: Add the `Authors` collection

**Files:**
- Create: `apps/website/collections/Authors.ts`

- [ ] **Step 1: Create the Authors collection**

```ts
// apps/website/collections/Authors.ts
import type { CollectionConfig } from "payload";

export const Authors: CollectionConfig = {
  slug: "authors",
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "slug", "role"],
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: "slug",
      type: "text",
      required: true,
      unique: true,
      admin: { position: "sidebar" },
    },
    {
      name: "name",
      type: "text",
      required: true,
    },
    {
      name: "role",
      type: "text",
      admin: { description: "e.g. Editor, Contributor" },
    },
    {
      name: "bio",
      type: "textarea",
      localized: true,
    },
    {
      name: "avatar",
      type: "upload",
      relationTo: "media",
    },
    {
      name: "email",
      type: "text",
      admin: { description: "Not displayed publicly" },
    },
    {
      name: "socials",
      type: "array",
      fields: [
        {
          name: "platform",
          type: "select",
          required: true,
          options: [
            { label: "Website", value: "website" },
            { label: "Mastodon", value: "mastodon" },
            { label: "Bluesky", value: "bluesky" },
            { label: "LinkedIn", value: "linkedin" },
            { label: "GitHub", value: "github" },
            { label: "X", value: "x" },
          ],
        },
        { name: "url", type: "text", required: true },
      ],
    },
  ],
};
```

- [ ] **Step 2: Commit**

```bash
git add apps/website/collections/Authors.ts
git commit -m "feat(website): add Authors payload collection"
```

---

### Task 2: Add the `Tags` collection

**Files:**
- Create: `apps/website/collections/Tags.ts`

- [ ] **Step 1: Create the Tags collection**

```ts
// apps/website/collections/Tags.ts
import type { CollectionConfig } from "payload";

export const Tags: CollectionConfig = {
  slug: "tags",
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "slug"],
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: "slug",
      type: "text",
      required: true,
      unique: true,
      admin: { position: "sidebar" },
    },
    {
      name: "name",
      type: "text",
      required: true,
      localized: true,
    },
    {
      name: "description",
      type: "textarea",
      localized: true,
      admin: { description: "Shown on /articles/tags/[slug]" },
    },
  ],
};
```

- [ ] **Step 2: Commit**

```bash
git add apps/website/collections/Tags.ts
git commit -m "feat(website): add Tags payload collection"
```

---

### Task 3: Add the `Articles` collection (rich text without BlocksFeature yet)

BlocksFeature is wired in Task 12 after blocks exist. This task creates the full collection skeleton with a plain Lexical body so type generation produces a usable shape for downstream tasks.

**Files:**
- Create: `apps/website/collections/Articles.ts`

- [ ] **Step 1: Create the Articles collection**

```ts
// apps/website/collections/Articles.ts
import type { CollectionConfig } from "payload";
import { revalidateTag } from "next/cache";
import { seoFields } from "../fields/seo";
import {
  buildPreviewUrl,
  pingIndexNowIfPublished,
} from "../lib/collection-hooks";
import { submitToIndexNow, localizedUrls } from "../lib/indexnow";

function articlePaths(doc: { slug?: string | null }): string[] {
  return doc.slug ? [`/articles/${doc.slug}`] : [];
}

export const Articles: CollectionConfig = {
  slug: "articles",
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "slug", "type", "publishedAt"],
    preview: (doc) => {
      const typed = doc as { slug?: string };
      const paths = articlePaths(typed);
      return buildPreviewUrl(paths[0] ? `/en${paths[0]}` : "/");
    },
  },
  access: {
    read: () => true,
  },
  versions: { drafts: true },
  hooks: {
    afterChange: [
      async ({ doc, previousDoc }) => {
        try {
          revalidateTag("articles", "default");
        } catch {
          /* no-op outside Next.js */
        }
        const typed = doc as { _status?: string | null; slug?: string | null };
        await pingIndexNowIfPublished(typed._status, articlePaths(typed));

        const prev = previousDoc as
          | { _status?: string | null; slug?: string | null }
          | undefined;
        if (prev && prev._status === "published") {
          const slugChanged = prev.slug !== typed.slug;
          const statusChanged = prev._status !== typed._status;
          if (slugChanged || statusChanged) {
            const staleUrls = articlePaths(prev).flatMap((p) =>
              localizedUrls(p)
            );
            if (staleUrls.length > 0) await submitToIndexNow(staleUrls);
          }
        }
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return doc;
      },
    ],
    afterDelete: [
      async ({ doc }) => {
        const typed = doc as { slug?: string | null };
        const urls = articlePaths(typed).flatMap((p) => localizedUrls(p));
        await submitToIndexNow(urls);
      },
    ],
  },
  fields: [
    // Sidebar
    {
      name: "slug",
      type: "text",
      required: true,
      unique: true,
      admin: { position: "sidebar" },
    },
    {
      name: "type",
      type: "select",
      required: true,
      options: [
        { label: "Opinion", value: "opinion" },
        { label: "Roundup", value: "roundup" },
        { label: "News", value: "news" },
        { label: "Deep Dive", value: "deep-dive" },
      ],
      admin: { position: "sidebar" },
    },
    {
      name: "publishedAt",
      type: "date",
      admin: {
        position: "sidebar",
        description:
          "Display + sort date. Separate from Payload's createdAt; lets editors backdate.",
      },
    },
    {
      name: "featuredOnHomepage",
      type: "checkbox",
      defaultValue: false,
      admin: {
        position: "sidebar",
        description:
          "Pin to homepage ArticlesSection position 1. Set one at a time.",
      },
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
    {
      type: "tabs",
      tabs: [
        {
          label: "General",
          fields: [
            { name: "title", type: "text", required: true, localized: true },
            {
              name: "excerpt",
              type: "textarea",
              required: true,
              localized: true,
              admin: {
                description:
                  "140-200 chars. Used in cards, lists, OG description.",
              },
            },
            {
              name: "authors",
              type: "relationship",
              relationTo: "authors",
              hasMany: true,
              required: true,
            },
            {
              name: "category",
              type: "relationship",
              relationTo: "categories",
              admin: {
                description:
                  "Optional. Shared with services/guides. Omit for meta-topics.",
              },
            },
            {
              name: "tags",
              type: "relationship",
              relationTo: "tags",
              hasMany: true,
            },
            {
              name: "heroImage",
              type: "upload",
              relationTo: "media",
              required: true,
            },
            {
              name: "readingTime",
              type: "number",
              required: true,
              admin: { description: "Minutes" },
            },
            {
              name: "relatedServices",
              type: "relationship",
              relationTo: "services",
              hasMany: true,
              admin: {
                description:
                  "Drives cross-surfacing on service/guide pages. Also consumed by /write-article.",
              },
            },
          ],
        },
        {
          label: "Brief",
          fields: [
            {
              name: "angle",
              type: "textarea",
              localized: true,
              admin: {
                description:
                  "What's the point of view / argument / conclusion?",
              },
            },
            {
              name: "keyPoints",
              type: "array",
              localized: true,
              fields: [
                { name: "point", type: "text", required: true },
              ],
              admin: { description: "3-7 bullet points the article must hit" },
            },
            {
              name: "targetAudience",
              type: "select",
              options: [
                { label: "Curious generalist", value: "curious-generalist" },
                { label: "Motivated switcher", value: "motivated-switcher" },
                {
                  label: "Sovereignty advocate",
                  value: "sovereignty-advocate",
                },
              ],
            },
            {
              name: "sources",
              type: "array",
              fields: [
                { name: "url", type: "text", required: true },
                { name: "notes", type: "textarea" },
              ],
            },
            {
              name: "outlineNotes",
              type: "textarea",
              localized: true,
            },
          ],
        },
        {
          label: "Content",
          fields: [
            {
              name: "body",
              type: "richText",
              required: true,
              localized: true,
              // BlocksFeature wiring added in Task 12
            },
          ],
        },
        {
          label: "SEO",
          fields: seoFields,
        },
      ],
    },
  ],
};
```

- [ ] **Step 2: Commit**

```bash
git add apps/website/collections/Articles.ts
git commit -m "feat(website): add Articles payload collection skeleton"
```

---

### Task 4: Register new collections

**Files:**
- Modify: `apps/website/collections/index.ts`
- Modify: `apps/website/payload.config.ts`

- [ ] **Step 1: Export from collections index**

```ts
// apps/website/collections/index.ts
export { Articles } from "./Articles";
export { Authors } from "./Authors";
export { Categories } from "./Categories";
export { Guides } from "./Guides";
export { LandingPages } from "./LandingPages";
export { Media } from "./Media";
export { Pages } from "./Pages";
export { Services } from "./Services";
export { Tags } from "./Tags";
export { Users } from "./Users";
```

- [ ] **Step 2: Register in payload.config.ts**

Replace the existing `import { … } from "./collections"` block and the `collections: […]` entry. Diff:

```diff
 import {
+  Articles,
+  Authors,
   Categories,
   Guides,
   LandingPages,
   Media,
   Pages,
   Services,
+  Tags,
   Users,
 } from "./collections";
```

```diff
-  collections: [Categories, Guides, LandingPages, Media, Pages, Services, Users],
+  collections: [
+    Articles,
+    Authors,
+    Categories,
+    Guides,
+    LandingPages,
+    Media,
+    Pages,
+    Services,
+    Tags,
+    Users,
+  ],
```

- [ ] **Step 3: Commit**

```bash
git add apps/website/collections/index.ts apps/website/payload.config.ts
git commit -m "feat(website): register Articles, Authors, Tags collections"
```

---

### Task 5: Expose new collections via Payload MCP

**Files:**
- Modify: `apps/website/payload.config.ts`

- [ ] **Step 1: Add MCP entries**

In the `mcpPlugin({ collections: { … } })` object, add:

```diff
       collections: {
+        articles: { enabled: true },
+        authors: { enabled: true },
         services: { enabled: true },
         categories: { enabled: true },
         guides: { enabled: true },
         "landing-pages": { enabled: true },
         pages: { enabled: true },
+        tags: { enabled: true },
         media: {
```

- [ ] **Step 2: Commit**

```bash
git add apps/website/payload.config.ts
git commit -m "feat(website): expose Articles/Authors/Tags via Payload MCP"
```

---

### Task 6: Generate Payload types and verify

**Files:**
- Modify: `apps/website/payload-types.ts` (generated; commit the result)

- [ ] **Step 1: Generate types**

Run from repo root:

```bash
pnpm --filter website payload generate:types
```

Expected: `apps/website/payload-types.ts` updates with new `Article`, `Author`, `Tag` interfaces and relationship types. Inspect the diff to confirm.

- [ ] **Step 2: Run type check**

```bash
pnpm --filter website exec tsc --noEmit
```

Expected: no new errors.

- [ ] **Step 3: Commit**

```bash
git add apps/website/payload-types.ts
git commit -m "chore(website): regenerate Payload types for Articles/Authors/Tags"
```

---

## Phase 2: Custom Lexical blocks

All five blocks are defined as Payload `Block` configs. They'll be wired into the Articles `body` field via `BlocksFeature` in Task 12 after all five exist.

### Task 7: `ServiceCardBlock`

**Files:**
- Create: `apps/website/blocks/ServiceCardBlock.ts`
- Create: `apps/website/components/articles/blocks/ServiceCardBlock.tsx`

- [ ] **Step 1: Block config**

```ts
// apps/website/blocks/ServiceCardBlock.ts
import type { Block } from "payload";

export const ServiceCardBlock: Block = {
  slug: "serviceCard",
  interfaceName: "ServiceCardBlock",
  labels: { singular: "Service Card", plural: "Service Cards" },
  fields: [
    {
      name: "service",
      type: "relationship",
      relationTo: "services",
      required: true,
    },
    {
      name: "blurb",
      type: "textarea",
      localized: true,
      admin: {
        description:
          "Optional override for the service's default description",
      },
    },
  ],
};
```

- [ ] **Step 2: Renderer component**

```tsx
// apps/website/components/articles/blocks/ServiceCardBlock.tsx
import type { Service } from "@/payload-types";
import { Link } from "@switch-to-eu/i18n/navigation";
import { getCategorySlug, getResolvedRelation } from "@/lib/services";

type ResolvedService = Service;

interface Props {
  service: number | ResolvedService;
  blurb?: string;
}

export function ServiceCardBlock({ service, blurb }: Props) {
  const resolved = getResolvedRelation<Service>(service);
  if (!resolved) return null;

  const categorySlug = getCategorySlug(resolved.category);
  const region = resolved.region === "non-eu" ? "non-eu" : "eu";
  const href = `/services/${region}/${resolved.slug}`;

  const description = blurb?.trim() || resolved.description || "";
  const regionLabel = resolved.region === "eu"
    ? "EU"
    : resolved.region === "eu-friendly"
      ? "EU-friendly"
      : "Non-EU";

  return (
    <aside
      className="my-6 border border-brand-green/20 rounded-2xl p-5 bg-brand-cream"
      aria-label={`Service: ${resolved.name}`}
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-bold text-brand-green text-lg">{resolved.name}</h3>
        <span className="inline-flex items-center rounded-full bg-brand-green/10 text-brand-green px-2 py-0.5 text-xs font-semibold uppercase tracking-wider">
          {regionLabel}
        </span>
      </div>
      {description && (
        <p className="text-brand-green/80 text-sm mb-3 leading-relaxed">
          {description}
        </p>
      )}
      {categorySlug && (
        <Link
          href={href}
          className="inline-block text-sm font-semibold text-brand-green hover:underline"
        >
          View details →
        </Link>
      )}
    </aside>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add apps/website/blocks/ServiceCardBlock.ts apps/website/components/articles/blocks/ServiceCardBlock.tsx
git commit -m "feat(website): add ServiceCard article block"
```

---

### Task 8: `ServiceComparisonBlock`

**Files:**
- Create: `apps/website/blocks/ServiceComparisonBlock.ts`
- Create: `apps/website/components/articles/blocks/ServiceComparisonBlock.tsx`

- [ ] **Step 1: Block config**

```ts
// apps/website/blocks/ServiceComparisonBlock.ts
import type { Block } from "payload";

export const ServiceComparisonBlock: Block = {
  slug: "serviceComparison",
  interfaceName: "ServiceComparisonBlock",
  labels: { singular: "Service Comparison", plural: "Service Comparisons" },
  fields: [
    {
      name: "heading",
      type: "text",
      localized: true,
    },
    {
      name: "services",
      type: "relationship",
      relationTo: "services",
      hasMany: true,
      required: true,
      minRows: 2,
      maxRows: 4,
    },
    {
      name: "comparisonFields",
      type: "select",
      hasMany: true,
      defaultValue: ["price", "region"],
      options: [
        { label: "Starting price", value: "price" },
        { label: "Hosting location", value: "hosting" },
        { label: "Encryption", value: "encryption" },
        { label: "Open source", value: "open-source" },
        { label: "Region", value: "region" },
      ],
    },
  ],
};
```

- [ ] **Step 2: Renderer component**

```tsx
// apps/website/components/articles/blocks/ServiceComparisonBlock.tsx
import type { Service } from "@/payload-types";
import { getResolvedRelation } from "@/lib/services";

type ComparisonField =
  | "price"
  | "hosting"
  | "encryption"
  | "open-source"
  | "region";

interface Props {
  heading?: string;
  services: Array<number | Service>;
  comparisonFields: ComparisonField[];
}

function rowLabel(field: ComparisonField): string {
  switch (field) {
    case "price": return "Starting price";
    case "hosting": return "Hosting location";
    case "encryption": return "Encryption";
    case "open-source": return "Open source";
    case "region": return "Region";
  }
}

function rowValue(service: Service, field: ComparisonField): string {
  switch (field) {
    case "price":
      return service.startingPrice ?? "—";
    case "hosting":
      return service.dataStorageLocations?.map((l) => l.location).join(", ") || "—";
    case "encryption":
      return service.encryption ?? "—";
    case "open-source":
      return service.openSource ? "Yes" : "No";
    case "region":
      return service.region === "eu"
        ? "EU"
        : service.region === "eu-friendly"
          ? "EU-friendly"
          : "Non-EU";
  }
}

export function ServiceComparisonBlock({
  heading,
  services,
  comparisonFields,
}: Props) {
  const resolved = services
    .map((s) => getResolvedRelation<Service>(s))
    .filter((s): s is Service => s !== null);

  if (resolved.length < 2) return null;

  const fields = comparisonFields?.length ? comparisonFields : (["price", "region"] as ComparisonField[]);

  return (
    <section className="my-8 border border-brand-green/20 rounded-3xl p-5 overflow-x-auto">
      {heading && (
        <h3 className="font-bold text-brand-green text-xl mb-4">{heading}</h3>
      )}
      <table className="w-full text-sm">
        <thead>
          <tr>
            <th className="text-left pb-3 text-brand-green/60 font-semibold">
              <span className="sr-only">Feature</span>
            </th>
            {resolved.map((s) => (
              <th
                key={s.id}
                className="text-left pb-3 text-brand-green font-bold"
              >
                {s.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {fields.map((field) => (
            <tr key={field} className="border-t border-brand-green/10">
              <td className="py-3 pr-3 text-brand-green/60 font-semibold">
                {rowLabel(field)}
              </td>
              {resolved.map((s) => (
                <td key={s.id} className="py-3 pr-3 text-brand-green/90">
                  {rowValue(s, field)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add apps/website/blocks/ServiceComparisonBlock.ts apps/website/components/articles/blocks/ServiceComparisonBlock.tsx
git commit -m "feat(website): add ServiceComparison article block"
```

---

### Task 9: `GuideCtaBlock`

**Files:**
- Create: `apps/website/blocks/GuideCtaBlock.ts`
- Create: `apps/website/components/articles/blocks/GuideCtaBlock.tsx`

- [ ] **Step 1: Block config**

```ts
// apps/website/blocks/GuideCtaBlock.ts
import type { Block } from "payload";

export const GuideCtaBlock: Block = {
  slug: "guideCta",
  interfaceName: "GuideCtaBlock",
  labels: { singular: "Guide CTA", plural: "Guide CTAs" },
  fields: [
    {
      name: "guide",
      type: "relationship",
      relationTo: "guides",
      required: true,
    },
    {
      name: "variant",
      type: "select",
      defaultValue: "inline",
      options: [
        { label: "Inline", value: "inline" },
        { label: "Prominent", value: "prominent" },
      ],
    },
  ],
};
```

- [ ] **Step 2: Renderer component**

```tsx
// apps/website/components/articles/blocks/GuideCtaBlock.tsx
import type { Guide } from "@/payload-types";
import { Link } from "@switch-to-eu/i18n/navigation";
import {
  getCategorySlug,
  getGuideSourceService,
  getGuideTargetService,
  getResolvedRelation,
} from "@/lib/services";

interface Props {
  guide: number | Guide;
  variant?: "inline" | "prominent";
}

export function GuideCtaBlock({ guide, variant = "inline" }: Props) {
  const resolved = getResolvedRelation<Guide>(guide);
  if (!resolved) return null;

  const categorySlug = getCategorySlug(resolved.category) || "uncategorized";
  const href = `/guides/${categorySlug}/${resolved.slug}`;
  const source = getGuideSourceService(resolved);
  const target = getGuideTargetService(resolved);

  const padding = variant === "prominent" ? "p-6 sm:p-8" : "p-4 sm:p-5";
  const titleSize = variant === "prominent" ? "text-xl sm:text-2xl" : "text-lg";

  return (
    <aside
      className={`my-6 border border-brand-green/20 rounded-2xl bg-brand-green/5 ${padding}`}
      aria-label="Migration guide"
    >
      <p className="text-brand-green/60 text-xs uppercase tracking-wider font-semibold mb-1">
        Migration guide
      </p>
      <h3 className={`font-bold text-brand-green ${titleSize} mb-2`}>
        {resolved.title}
      </h3>
      {source && target && (
        <p className="text-brand-green/80 text-sm mb-2">
          {source.name} → {target.name}
        </p>
      )}
      <div className="flex gap-3 text-xs text-brand-green/70 mb-3">
        {resolved.difficulty && (
          <span className="inline-flex items-center rounded-full bg-brand-green/10 px-2 py-0.5 font-semibold uppercase tracking-wider">
            {resolved.difficulty}
          </span>
        )}
        {resolved.timeRequired && (
          <span className="inline-flex items-center">
            {resolved.timeRequired}
          </span>
        )}
      </div>
      <Link
        href={href}
        className="inline-block text-sm font-semibold text-brand-green hover:underline"
      >
        Read the full guide →
      </Link>
    </aside>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add apps/website/blocks/GuideCtaBlock.ts apps/website/components/articles/blocks/GuideCtaBlock.tsx
git commit -m "feat(website): add GuideCta article block"
```

---

### Task 10: `CategoryGridBlock`

**Files:**
- Create: `apps/website/blocks/CategoryGridBlock.ts`
- Create: `apps/website/components/articles/blocks/CategoryGridBlock.tsx`

- [ ] **Step 1: Block config**

```ts
// apps/website/blocks/CategoryGridBlock.ts
import type { Block } from "payload";

export const CategoryGridBlock: Block = {
  slug: "categoryGrid",
  interfaceName: "CategoryGridBlock",
  labels: { singular: "Category Grid", plural: "Category Grids" },
  fields: [
    {
      name: "category",
      type: "relationship",
      relationTo: "categories",
      required: true,
    },
    {
      name: "limit",
      type: "number",
      defaultValue: 6,
      min: 1,
      max: 24,
    },
    {
      name: "region",
      type: "select",
      defaultValue: "eu",
      options: [
        { label: "EU only", value: "eu" },
        { label: "Any region", value: "any" },
      ],
    },
  ],
};
```

- [ ] **Step 2: Renderer component (server component — fetches services on demand)**

```tsx
// apps/website/components/articles/blocks/CategoryGridBlock.tsx
import { getPayload } from "@/lib/payload";
import type { Category, Service } from "@/payload-types";
import { Link } from "@switch-to-eu/i18n/navigation";
import { getResolvedRelation } from "@/lib/services";
import { getLocale } from "next-intl/server";

interface Props {
  category: number | Category;
  limit?: number;
  region?: "eu" | "any";
}

export async function CategoryGridBlock({
  category,
  limit = 6,
  region = "eu",
}: Props) {
  const resolved = getResolvedRelation<Category>(category);
  if (!resolved) return null;

  const payload = await getPayload();
  const locale = (await getLocale()) as "en" | "nl";

  const where: Record<string, unknown> = {
    and: [
      { _status: { equals: "published" } },
      { category: { equals: resolved.id } },
    ],
  };
  if (region === "eu") {
    (where.and as Array<Record<string, unknown>>).push({ region: { equals: "eu" } });
  }

  const { docs } = await payload.find({
    collection: "services",
    where,
    sort: "-featured,-createdAt",
    locale,
    limit,
    depth: 0,
  });

  if (docs.length === 0) return null;

  return (
    <section
      className="my-8"
      aria-label={`Services in ${resolved.title}`}
    >
      <h3 className="font-bold text-brand-green text-xl mb-4">
        {resolved.title}
      </h3>
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
        {docs.map((s: Service) => (
          <Link
            key={s.id}
            href={`/services/${s.region === "non-eu" ? "non-eu" : "eu"}/${s.slug}`}
            className="block border border-brand-green/20 rounded-2xl p-4 bg-brand-cream hover:border-brand-green transition-colors no-underline"
          >
            <h4 className="font-bold text-brand-green mb-1">{s.name}</h4>
            {s.description && (
              <p className="text-sm text-brand-green/70 leading-snug">
                {s.description}
              </p>
            )}
          </Link>
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add apps/website/blocks/CategoryGridBlock.ts apps/website/components/articles/blocks/CategoryGridBlock.tsx
git commit -m "feat(website): add CategoryGrid article block"
```

---

### Task 11: `CalloutBlock`

**Files:**
- Create: `apps/website/blocks/CalloutBlock.ts`
- Create: `apps/website/components/articles/blocks/CalloutBlock.tsx`

- [ ] **Step 1: Block config**

```ts
// apps/website/blocks/CalloutBlock.ts
import type { Block } from "payload";

export const CalloutBlock: Block = {
  slug: "callout",
  interfaceName: "CalloutBlock",
  labels: { singular: "Callout", plural: "Callouts" },
  fields: [
    {
      name: "variant",
      type: "select",
      required: true,
      defaultValue: "info",
      options: [
        { label: "Info", value: "info" },
        { label: "Warning", value: "warning" },
        { label: "Worth knowing", value: "worth-knowing" },
        { label: "Quote", value: "quote" },
        { label: "TL;DR", value: "tldr" },
      ],
    },
    {
      name: "content",
      type: "richText",
      required: true,
      localized: true,
    },
    {
      name: "attribution",
      type: "text",
      admin: {
        description: "Only shown for the Quote variant",
        condition: (_, siblingData) => siblingData?.variant === "quote",
      },
    },
  ],
};
```

- [ ] **Step 2: Renderer component**

```tsx
// apps/website/components/articles/blocks/CalloutBlock.tsx
import { RichText } from "@payloadcms/richtext-lexical/react";
import type { SerializedEditorState } from "@payloadcms/richtext-lexical/lexical";

type Variant = "info" | "warning" | "worth-knowing" | "quote" | "tldr";

interface Props {
  variant: Variant;
  content: SerializedEditorState;
  attribution?: string;
}

const VARIANT_STYLES: Record<Variant, { bg: string; border: string; label: string }> = {
  info:           { bg: "bg-brand-sky/10",   border: "border-brand-sky",   label: "Info" },
  warning:        { bg: "bg-brand-red/10",   border: "border-brand-red",   label: "Warning" },
  "worth-knowing":{ bg: "bg-brand-yellow/20",border: "border-brand-yellow",label: "Worth knowing" },
  quote:          { bg: "bg-brand-cream",    border: "border-brand-green", label: "Quote" },
  tldr:           { bg: "bg-brand-green/5",  border: "border-brand-green", label: "TL;DR" },
};

export function CalloutBlock({ variant, content, attribution }: Props) {
  const styles = VARIANT_STYLES[variant];
  const isQuote = variant === "quote";
  return (
    <aside
      className={`my-6 border-l-4 ${styles.border} ${styles.bg} rounded-r-2xl p-5`}
      role="note"
      aria-label={styles.label}
    >
      {!isQuote && (
        <p className="text-xs uppercase tracking-wider font-semibold mb-2 text-brand-green/70">
          {styles.label}
        </p>
      )}
      <div className={isQuote ? "text-lg leading-relaxed" : ""}>
        <RichText data={content} />
      </div>
      {isQuote && attribution && (
        <p className="mt-3 text-sm text-brand-green/70">— {attribution}</p>
      )}
    </aside>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add apps/website/blocks/CalloutBlock.ts apps/website/components/articles/blocks/CalloutBlock.tsx
git commit -m "feat(website): add Callout article block"
```

---

### Task 12: Wire `BlocksFeature` into Articles body; regen types

**Files:**
- Create: `apps/website/blocks/index.ts`
- Modify: `apps/website/collections/Articles.ts`
- Modify: `apps/website/payload-types.ts` (generated)

- [ ] **Step 1: Create blocks barrel**

```ts
// apps/website/blocks/index.ts
export { ServiceCardBlock } from "./ServiceCardBlock";
export { ServiceComparisonBlock } from "./ServiceComparisonBlock";
export { GuideCtaBlock } from "./GuideCtaBlock";
export { CategoryGridBlock } from "./CategoryGridBlock";
export { CalloutBlock } from "./CalloutBlock";
```

- [ ] **Step 2: Configure the body field to use BlocksFeature**

In `apps/website/collections/Articles.ts`, add an import at top and replace the `body` field block:

```diff
 import type { CollectionConfig } from "payload";
 import { revalidateTag } from "next/cache";
+import { lexicalEditor, BlocksFeature } from "@payloadcms/richtext-lexical";
 import { seoFields } from "../fields/seo";
+import {
+  ServiceCardBlock,
+  ServiceComparisonBlock,
+  GuideCtaBlock,
+  CategoryGridBlock,
+  CalloutBlock,
+} from "../blocks";
```

```diff
             {
               name: "body",
               type: "richText",
               required: true,
               localized: true,
-              // BlocksFeature wiring added in Task 12
+              editor: lexicalEditor({
+                features: ({ defaultFeatures }) => [
+                  ...defaultFeatures,
+                  BlocksFeature({
+                    blocks: [
+                      ServiceCardBlock,
+                      ServiceComparisonBlock,
+                      GuideCtaBlock,
+                      CategoryGridBlock,
+                      CalloutBlock,
+                    ],
+                  }),
+                ],
+              }),
             },
```

- [ ] **Step 3: Regenerate types and type-check**

```bash
pnpm --filter website payload generate:types
pnpm --filter website exec tsc --noEmit
```

Expected: `payload-types.ts` now includes block interfaces (`ServiceCardBlock`, `ServiceComparisonBlock`, etc.). No type errors.

- [ ] **Step 4: Commit**

```bash
git add apps/website/blocks/index.ts apps/website/collections/Articles.ts apps/website/payload-types.ts
git commit -m "feat(website): wire BlocksFeature into Articles body"
```

---

## Phase 3: Inline pill components and LexicalBody renderer

### Task 13: Build the three inline pill components

**Files:**
- Create: `apps/website/components/articles/pills/ServicePill.tsx`
- Create: `apps/website/components/articles/pills/GuidePill.tsx`
- Create: `apps/website/components/articles/pills/CategoryPill.tsx`

- [ ] **Step 1: ServicePill**

```tsx
// apps/website/components/articles/pills/ServicePill.tsx
import type { Service } from "@/payload-types";
import { Link } from "@switch-to-eu/i18n/navigation";

interface Props {
  service: Service;
  children?: React.ReactNode;
}

export function ServicePill({ service, children }: Props) {
  const region = service.region === "non-eu" ? "non-eu" : "eu";
  const href = `/services/${region}/${service.slug}`;
  const dotClass =
    service.region === "eu"
      ? "bg-brand-green"
      : service.region === "eu-friendly"
        ? "bg-brand-yellow"
        : "bg-brand-red";

  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1.5 rounded-full border border-brand-green/20 bg-brand-cream px-2 py-0.5 text-sm font-semibold text-brand-green no-underline hover:border-brand-green transition-colors"
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dotClass}`} aria-hidden />
      {children || service.name}
    </Link>
  );
}
```

- [ ] **Step 2: GuidePill**

```tsx
// apps/website/components/articles/pills/GuidePill.tsx
import type { Guide } from "@/payload-types";
import { Link } from "@switch-to-eu/i18n/navigation";
import { getCategorySlug } from "@/lib/services";

interface Props {
  guide: Guide;
  children?: React.ReactNode;
}

export function GuidePill({ guide, children }: Props) {
  const categorySlug = getCategorySlug(guide.category) || "uncategorized";
  const href = `/guides/${categorySlug}/${guide.slug}`;
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1.5 rounded-full border border-brand-green/20 bg-brand-green/5 px-2 py-0.5 text-sm font-semibold text-brand-green no-underline hover:border-brand-green transition-colors"
    >
      <span aria-hidden>📘</span>
      {children || guide.title}
    </Link>
  );
}
```

- [ ] **Step 3: CategoryPill**

```tsx
// apps/website/components/articles/pills/CategoryPill.tsx
import type { Category } from "@/payload-types";
import { Link } from "@switch-to-eu/i18n/navigation";

interface Props {
  category: Category;
  children?: React.ReactNode;
}

export function CategoryPill({ category, children }: Props) {
  const href = `/services/${category.slug}`;
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1.5 rounded-full border border-brand-green/20 bg-brand-pink/10 px-2 py-0.5 text-sm font-semibold text-brand-green no-underline hover:border-brand-green transition-colors"
    >
      <span className="w-1.5 h-1.5 rounded-full bg-brand-pink" aria-hidden />
      {children || category.title}
    </Link>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add apps/website/components/articles/pills/
git commit -m "feat(website): add inline pill components for services/guides/categories"
```

---

### Task 14: Build `LexicalBody` — renders article body with blocks + pill-enriched links

Payload's `RichText` component from `@payloadcms/richtext-lexical/react` accepts `converters` overrides. The `blocks` converter resolves custom blocks to React components; the `link` converter is overridden to detect internal doc targets and swap for pills.

**Files:**
- Create: `apps/website/components/articles/LexicalBody.tsx`

- [ ] **Step 1: Implement the renderer**

```tsx
// apps/website/components/articles/LexicalBody.tsx
import {
  RichText,
  type JSXConvertersFunction,
} from "@payloadcms/richtext-lexical/react";
import type { SerializedEditorState } from "@payloadcms/richtext-lexical/lexical";
import type {
  Article,
  Service,
  Guide,
  Category,
} from "@/payload-types";

import { ServiceCardBlock } from "./blocks/ServiceCardBlock";
import { ServiceComparisonBlock } from "./blocks/ServiceComparisonBlock";
import { GuideCtaBlock } from "./blocks/GuideCtaBlock";
import { CategoryGridBlock } from "./blocks/CategoryGridBlock";
import { CalloutBlock } from "./blocks/CalloutBlock";

import { ServicePill } from "./pills/ServicePill";
import { GuidePill } from "./pills/GuidePill";
import { CategoryPill } from "./pills/CategoryPill";

type NonNullableBody = NonNullable<Article["body"]>;

interface Props {
  data: NonNullableBody | SerializedEditorState | null | undefined;
}

const converters: JSXConvertersFunction = ({ defaultConverters }) => ({
  ...defaultConverters,
  blocks: {
    serviceCard: ({ node }) => {
      const fields = node.fields as { service: number | Service; blurb?: string };
      return <ServiceCardBlock service={fields.service} blurb={fields.blurb} />;
    },
    serviceComparison: ({ node }) => {
      const fields = node.fields as {
        heading?: string;
        services: Array<number | Service>;
        comparisonFields: Array<"price" | "hosting" | "encryption" | "open-source" | "region">;
      };
      return (
        <ServiceComparisonBlock
          heading={fields.heading}
          services={fields.services}
          comparisonFields={fields.comparisonFields}
        />
      );
    },
    guideCta: ({ node }) => {
      const fields = node.fields as { guide: number | Guide; variant?: "inline" | "prominent" };
      return <GuideCtaBlock guide={fields.guide} variant={fields.variant} />;
    },
    categoryGrid: ({ node }) => {
      const fields = node.fields as {
        category: number | Category;
        limit?: number;
        region?: "eu" | "any";
      };
      // @ts-expect-error — CategoryGridBlock is an async server component
      return <CategoryGridBlock category={fields.category} limit={fields.limit} region={fields.region} />;
    },
    callout: ({ node }) => {
      const fields = node.fields as {
        variant: "info" | "warning" | "worth-knowing" | "quote" | "tldr";
        content: SerializedEditorState;
        attribution?: string;
      };
      return (
        <CalloutBlock
          variant={fields.variant}
          content={fields.content}
          attribution={fields.attribution}
        />
      );
    },
  },
  link: ({ node, nodesToJSX }) => {
    const children = nodesToJSX({ nodes: node.children });
    const fields = node.fields as {
      linkType?: "internal" | "custom";
      doc?: { relationTo: string; value: number | Service | Guide | Category };
      url?: string;
      newTab?: boolean;
    };

    if (fields.linkType === "internal" && fields.doc && typeof fields.doc.value === "object") {
      const relation = fields.doc.relationTo;
      const value = fields.doc.value;
      if (relation === "services") {
        return <ServicePill service={value as Service}>{children}</ServicePill>;
      }
      if (relation === "guides") {
        return <GuidePill guide={value as Guide}>{children}</GuidePill>;
      }
      if (relation === "categories") {
        return <CategoryPill category={value as Category}>{children}</CategoryPill>;
      }
    }

    const href = fields.url ?? "#";
    const target = fields.newTab ? "_blank" : undefined;
    const rel = fields.newTab ? "noopener noreferrer" : undefined;
    return (
      <a href={href} target={target} rel={rel} className="text-brand-green underline hover:no-underline">
        {children}
      </a>
    );
  },
});

export function LexicalBody({ data }: Props) {
  if (!data) return null;
  return <RichText data={data} converters={converters} />;
}
```

- [ ] **Step 2: Type-check**

```bash
pnpm --filter website exec tsc --noEmit
```

Expected: no errors. If the `@ts-expect-error` line fails because the async block doesn't need it, remove the directive. If internal-link node shape differs from what's assumed, adjust field access to match `payload-types.ts` generated types.

- [ ] **Step 3: Commit**

```bash
git add apps/website/components/articles/LexicalBody.tsx
git commit -m "feat(website): add LexicalBody renderer with block and pill-link overrides"
```

---

## Phase 4: Routes, sitemap, RSS feed, discovery link

### Task 15: Shared article components (`ArticleCard`, `ArticleMeta`)

Built first so both the listing page and cross-surfacing sections share the same card and meta rendering.

**Files:**
- Create: `apps/website/components/articles/ArticleCard.tsx`
- Create: `apps/website/components/articles/ArticleMeta.tsx`

- [ ] **Step 1: `ArticleMeta`**

```tsx
// apps/website/components/articles/ArticleMeta.tsx
import type { Article, Author } from "@/payload-types";
import { getResolvedRelation } from "@/lib/services";
import { useTranslations } from "next-intl";
import { Link } from "@switch-to-eu/i18n/navigation";

interface Props {
  article: Article;
  showByline?: boolean;
}

export function ArticleMeta({ article, showByline = true }: Props) {
  const t = useTranslations("articles");

  const authors =
    article.authors
      ?.map((a) => getResolvedRelation<Author>(a))
      .filter((a): a is Author => a !== null) ?? [];

  const dateIso = article.publishedAt ?? article.createdAt;
  const date = dateIso ? new Date(dateIso) : null;

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-brand-green/70">
      {date && (
        <time dateTime={date.toISOString()}>
          {date.toLocaleDateString(undefined, {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </time>
      )}
      {article.readingTime && (
        <>
          <span aria-hidden>·</span>
          <span>{t("readingTime", { minutes: article.readingTime })}</span>
        </>
      )}
      {showByline && authors.length > 0 && (
        <>
          <span aria-hidden>·</span>
          <span>
            {t("writtenBy")}{" "}
            {authors.map((author, i) => (
              <span key={author.id}>
                <Link
                  href={`/articles/authors/${author.slug}`}
                  className="underline hover:no-underline"
                >
                  {author.name}
                </Link>
                {i < authors.length - 1 ? ", " : ""}
              </span>
            ))}
          </span>
        </>
      )}
    </div>
  );
}
```

- [ ] **Step 2: `ArticleCard`**

```tsx
// apps/website/components/articles/ArticleCard.tsx
import type { Article, Media } from "@/payload-types";
import { getResolvedRelation } from "@/lib/services";
import { Link } from "@switch-to-eu/i18n/navigation";
import { ArticleMeta } from "./ArticleMeta";

interface Props {
  article: Article;
}

export function ArticleCard({ article }: Props) {
  const hero = getResolvedRelation<Media>(article.heroImage);
  return (
    <article className="h-full flex flex-col overflow-hidden bg-brand-cream md:rounded-3xl border border-brand-green/10 group">
      {hero?.url && (
        <Link
          href={`/articles/${article.slug}`}
          className="block h-40 sm:h-48 relative overflow-hidden no-underline"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={hero.url}
            alt={hero.alt ?? ""}
            className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform"
          />
        </Link>
      )}
      <div className="flex flex-col flex-1 px-5 pb-5 sm:px-6 sm:pb-6 pt-4">
        <h3 className="text-brand-green mb-2 font-bold text-lg sm:text-xl">
          <Link
            href={`/articles/${article.slug}`}
            className="no-underline hover:underline"
          >
            {article.title}
          </Link>
        </h3>
        {article.excerpt && (
          <p className="text-brand-green/70 text-sm sm:text-base leading-relaxed mb-3 flex-1">
            {article.excerpt}
          </p>
        )}
        <ArticleMeta article={article} showByline />
      </div>
    </article>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add apps/website/components/articles/ArticleCard.tsx apps/website/components/articles/ArticleMeta.tsx
git commit -m "feat(website): add ArticleCard and ArticleMeta shared components"
```

---

### Task 16: `/articles` listing page

**Files:**
- Create: `apps/website/app/(frontend)/[locale]/articles/page.tsx`

- [ ] **Step 1: Build the listing page**

```tsx
// apps/website/app/(frontend)/[locale]/articles/page.tsx
import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { getPayload } from "@/lib/payload";
import { generateLanguageAlternates } from "@switch-to-eu/i18n/utils";
import { Container } from "@switch-to-eu/blocks/components/container";
import { PageLayout } from "@switch-to-eu/blocks/components/page-layout";
import { SectionHeading } from "@switch-to-eu/blocks/components/section-heading";
import { Link } from "@switch-to-eu/i18n/navigation";
import type { Article } from "@/payload-types";
import { ArticleCard } from "@/components/articles/ArticleCard";

const PAGE_SIZE = 12;

type Locale = "en" | "nl";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations("articles");
  return {
    title: t("pageTitle"),
    description: t("pageDescription"),
    alternates: generateLanguageAlternates("articles", locale as Locale),
  };
}

interface SearchParams {
  page?: string;
  type?: "opinion" | "roundup" | "news" | "deep-dive";
  category?: string;
  tag?: string;
}

export default async function ArticlesPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: Locale }>;
  searchParams: Promise<SearchParams>;
}) {
  const { locale } = await params;
  const sp = await searchParams;
  const t = await getTranslations("articles");
  const payload = await getPayload();

  const page = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);

  const where: Record<string, unknown> = {
    and: [{ _status: { equals: "published" } }],
  };
  if (sp.type) {
    (where.and as Array<Record<string, unknown>>).push({
      type: { equals: sp.type },
    });
  }
  if (sp.category) {
    const cat = await payload.find({
      collection: "categories",
      where: { slug: { equals: sp.category } },
      limit: 1,
    });
    if (cat.docs[0]) {
      (where.and as Array<Record<string, unknown>>).push({
        category: { equals: cat.docs[0].id },
      });
    }
  }
  if (sp.tag) {
    const tag = await payload.find({
      collection: "tags",
      where: { slug: { equals: sp.tag } },
      limit: 1,
    });
    if (tag.docs[0]) {
      (where.and as Array<Record<string, unknown>>).push({
        tags: { in: [tag.docs[0].id] },
      });
    }
  }

  const { docs, totalPages } = await payload.find({
    collection: "articles",
    where,
    locale,
    sort: "-publishedAt",
    limit: PAGE_SIZE,
    page,
    depth: 1,
  });

  const filtersActive = !!(sp.type || sp.category || sp.tag);

  return (
    <PageLayout>
      <section>
        <Container>
          <SectionHeading>{t("pageTitle")}</SectionHeading>
          <p className="max-w-2xl text-brand-green/70 text-base sm:text-lg leading-relaxed mb-8">
            {t("pageDescription")}
          </p>

          {filtersActive && (
            <div className="mb-6">
              <Link
                href="/articles"
                className="inline-flex items-center text-sm font-semibold text-brand-green underline hover:no-underline"
              >
                {t("clearFilters")}
              </Link>
            </div>
          )}

          {docs.length === 0 ? (
            <p className="text-brand-green/70 text-base">{t("empty")}</p>
          ) : (
            <div className="grid gap-5 auto-rows-fr grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
              {docs.map((article: Article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <nav aria-label="Pagination" className="mt-10 flex justify-center gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
                const qs = new URLSearchParams();
                if (p > 1) qs.set("page", String(p));
                if (sp.type) qs.set("type", sp.type);
                if (sp.category) qs.set("category", sp.category);
                if (sp.tag) qs.set("tag", sp.tag);
                const href = `/articles${qs.toString() ? `?${qs}` : ""}`;
                const current = p === page;
                return (
                  <Link
                    key={p}
                    href={href}
                    aria-current={current ? "page" : undefined}
                    className={
                      "inline-flex w-9 h-9 items-center justify-center rounded-full border text-sm font-semibold no-underline " +
                      (current
                        ? "bg-brand-green text-white border-brand-green"
                        : "border-brand-green/20 text-brand-green hover:border-brand-green")
                    }
                  >
                    {p}
                  </Link>
                );
              })}
            </nav>
          )}
        </Container>
      </section>
    </PageLayout>
  );
}
```

- [ ] **Step 2: Type-check**

```bash
pnpm --filter website exec tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add apps/website/app/\(frontend\)/\[locale\]/articles/page.tsx
git commit -m "feat(website): add /articles listing route"
```

---

### Task 17: `/articles/[slug]` detail page + opengraph-image

**Files:**
- Create: `apps/website/app/(frontend)/[locale]/articles/[slug]/page.tsx`
- Create: `apps/website/app/(frontend)/[locale]/articles/[slug]/opengraph-image.tsx`

- [ ] **Step 1: Detail page**

```tsx
// apps/website/app/(frontend)/[locale]/articles/[slug]/page.tsx
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { getPayload, isPreview, publishedWhere } from "@/lib/payload";
import { generateLanguageAlternates } from "@switch-to-eu/i18n/utils";
import { Container } from "@switch-to-eu/blocks/components/container";
import { PageLayout } from "@switch-to-eu/blocks/components/page-layout";
import type { Locale } from "next-intl";
import type { Article, Media, Tag } from "@/payload-types";
import { getResolvedRelation } from "@/lib/services";
import { LexicalBody } from "@/components/articles/LexicalBody";
import { ArticleMeta } from "@/components/articles/ArticleMeta";
import { Link } from "@switch-to-eu/i18n/navigation";

const TYPE_KEY: Record<NonNullable<Article["type"]>, "opinion" | "roundup" | "news" | "deepDive"> = {
  opinion: "opinion",
  roundup: "roundup",
  news: "news",
  "deep-dive": "deepDive",
};

export async function generateStaticParams() {
  const payload = await getPayload();
  const { docs } = await payload.find({
    collection: "articles",
    where: { _status: { equals: "published" } },
    depth: 0,
    limit: 100,
  });
  const locales = ["en", "nl"] as const;
  return locales.flatMap((locale) =>
    docs.map((a: Article) => ({ locale, slug: a.slug }))
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const payload = await getPayload();
  const { docs } = await payload.find({
    collection: "articles",
    where: await publishedWhere({ slug: { equals: slug } }),
    draft: await isPreview(),
    locale: locale as "en" | "nl",
    depth: 1,
    limit: 1,
  });
  const article = docs[0] as Article | undefined;
  if (!article) return { title: "Not Found" };

  return {
    title: article.title,
    description: article.excerpt,
    alternates: generateLanguageAlternates(
      `articles/${slug}`,
      locale as Locale
    ),
    openGraph: {
      title: article.title,
      description: article.excerpt,
      type: "article",
    },
  };
}

export default async function ArticleDetailPage({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>;
}) {
  const { locale, slug } = await params;
  const payload = await getPayload();
  const { docs } = await payload.find({
    collection: "articles",
    where: await publishedWhere({ slug: { equals: slug } }),
    draft: await isPreview(),
    locale,
    depth: 2,
    limit: 1,
  });
  const article = docs[0] as Article | undefined;
  if (!article) notFound();

  const t = await getTranslations("articles");

  const hero = getResolvedRelation<Media>(article.heroImage);
  const tags =
    article.tags
      ?.map((tag) => getResolvedRelation<Tag>(tag))
      .filter((tag): tag is Tag => tag !== null) ?? [];

  return (
    <PageLayout>
      <article>
        <Container>
          <div className="max-w-3xl mx-auto">
            <p className="text-xs uppercase tracking-wider font-semibold text-brand-green/60 mb-3">
              {t(`types.${TYPE_KEY[article.type]}`)}
            </p>
            <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl uppercase text-brand-green mb-4">
              {article.title}
            </h1>
            <p className="text-brand-green/80 text-lg leading-relaxed mb-4">
              {article.excerpt}
            </p>
            <ArticleMeta article={article} showByline />
          </div>

          {hero?.url && (
            <div className="max-w-4xl mx-auto my-8">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={hero.url}
                alt={hero.alt ?? ""}
                className="w-full rounded-2xl"
              />
            </div>
          )}

          <div className="max-w-3xl mx-auto prose prose-lg prose-headings:font-heading prose-headings:uppercase prose-headings:text-brand-green prose-p:text-brand-green/90 prose-a:text-brand-green prose-strong:text-brand-green">
            <LexicalBody data={article.body} />
          </div>

          {tags.length > 0 && (
            <div className="max-w-3xl mx-auto mt-10 flex flex-wrap gap-2">
              {tags.map((tag) => (
                <Link
                  key={tag.id}
                  href={`/articles/tags/${tag.slug}`}
                  className="inline-flex items-center rounded-full bg-brand-green/10 text-brand-green px-3 py-1 text-xs font-semibold uppercase tracking-wider no-underline hover:bg-brand-green/20"
                >
                  {tag.name}
                </Link>
              ))}
            </div>
          )}
        </Container>
      </article>
    </PageLayout>
  );
}
```

- [ ] **Step 2: OG image**

Mirror the existing pattern. Look at `apps/website/app/(frontend)/[locale]/guides/[category]/[service]/opengraph-image.tsx` for the exact structure. The article OG image needs: article title, hero image background, and "switch-to.eu" branding.

```tsx
// apps/website/app/(frontend)/[locale]/articles/[slug]/opengraph-image.tsx
import { ImageResponse } from "next/og";
import { getPayload, publishedWhere } from "@/lib/payload";
import type { Article } from "@/payload-types";

export const runtime = "nodejs";
export const alt = "switch-to.eu article";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({
  params,
}: {
  params: { locale: string; slug: string };
}) {
  const payload = await getPayload();
  const { docs } = await payload.find({
    collection: "articles",
    where: await publishedWhere({ slug: { equals: params.slug } }),
    locale: params.locale as "en" | "nl",
    depth: 0,
    limit: 1,
  });
  const article = docs[0] as Article | undefined;
  const title = article?.title ?? "switch-to.eu";

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          padding: 72,
          background: "#0E3F2F",
          color: "#FFF9E6",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ fontSize: 28, textTransform: "uppercase", letterSpacing: 2 }}>
          switch-to.eu / articles
        </div>
        <div
          style={{
            marginTop: "auto",
            fontSize: 76,
            fontWeight: 800,
            lineHeight: 1.05,
          }}
        >
          {title}
        </div>
      </div>
    ),
    { ...size }
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add "apps/website/app/(frontend)/[locale]/articles/[slug]"
git commit -m "feat(website): add /articles/[slug] detail route + OG image"
```

---

### Task 18: `/articles/authors/[authorSlug]` page

**Files:**
- Create: `apps/website/app/(frontend)/[locale]/articles/authors/[authorSlug]/page.tsx`

- [ ] **Step 1: Build author page**

```tsx
// apps/website/app/(frontend)/[locale]/articles/authors/[authorSlug]/page.tsx
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { getPayload } from "@/lib/payload";
import { generateLanguageAlternates } from "@switch-to-eu/i18n/utils";
import { Container } from "@switch-to-eu/blocks/components/container";
import { PageLayout } from "@switch-to-eu/blocks/components/page-layout";
import { SectionHeading } from "@switch-to-eu/blocks/components/section-heading";
import type { Locale } from "next-intl";
import type { Article, Author, Media } from "@/payload-types";
import { getResolvedRelation } from "@/lib/services";
import { ArticleCard } from "@/components/articles/ArticleCard";

type AppLocale = "en" | "nl";

export async function generateStaticParams() {
  const payload = await getPayload();
  const { docs } = await payload.find({
    collection: "authors",
    depth: 0,
    limit: 100,
  });
  const locales: AppLocale[] = ["en", "nl"];
  return locales.flatMap((locale) =>
    docs.map((a: Author) => ({ locale, authorSlug: a.slug }))
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; authorSlug: string }>;
}): Promise<Metadata> {
  const { locale, authorSlug } = await params;
  const payload = await getPayload();
  const { docs } = await payload.find({
    collection: "authors",
    where: { slug: { equals: authorSlug } },
    locale: locale as AppLocale,
    limit: 1,
  });
  const author = docs[0] as Author | undefined;
  if (!author) return { title: "Not Found" };

  const t = await getTranslations("articles.author");
  return {
    title: t("pageTitle", { name: author.name }),
    description: author.bio ?? author.name,
    alternates: generateLanguageAlternates(
      `articles/authors/${authorSlug}`,
      locale as Locale
    ),
  };
}

export default async function AuthorPage({
  params,
}: {
  params: Promise<{ locale: AppLocale; authorSlug: string }>;
}) {
  const { locale, authorSlug } = await params;
  const payload = await getPayload();
  const { docs: authorDocs } = await payload.find({
    collection: "authors",
    where: { slug: { equals: authorSlug } },
    locale,
    limit: 1,
  });
  const author = authorDocs[0] as Author | undefined;
  if (!author) notFound();

  const { docs: articles } = await payload.find({
    collection: "articles",
    where: {
      and: [
        { _status: { equals: "published" } },
        { authors: { in: [author.id] } },
      ],
    },
    locale,
    sort: "-publishedAt",
    depth: 1,
    limit: 100,
  });

  const t = await getTranslations("articles.author");
  const avatar = getResolvedRelation<Media>(author.avatar);

  return (
    <PageLayout>
      <section>
        <Container>
          <div className="flex items-center gap-4 mb-8">
            {avatar?.url && (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={avatar.url}
                alt={avatar.alt ?? author.name}
                className="w-20 h-20 rounded-full object-cover"
              />
            )}
            <div>
              <h1 className="font-heading text-4xl sm:text-5xl uppercase text-brand-green">
                {author.name}
              </h1>
              {author.role && (
                <p className="text-brand-green/60 text-sm uppercase tracking-wider font-semibold">
                  {author.role}
                </p>
              )}
            </div>
          </div>
          {author.bio && (
            <p className="max-w-2xl text-brand-green/80 text-base sm:text-lg leading-relaxed mb-10">
              {author.bio}
            </p>
          )}
          <SectionHeading>{t("articlesBy", { name: author.name })}</SectionHeading>
          {articles.length === 0 ? (
            <p className="text-brand-green/70">—</p>
          ) : (
            <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 auto-rows-fr">
              {articles.map((a: Article) => (
                <ArticleCard key={a.id} article={a} />
              ))}
            </div>
          )}
        </Container>
      </section>
    </PageLayout>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add "apps/website/app/(frontend)/[locale]/articles/authors"
git commit -m "feat(website): add /articles/authors/[authorSlug] route"
```

---

### Task 19: `/articles/tags/[tagSlug]` page

**Files:**
- Create: `apps/website/app/(frontend)/[locale]/articles/tags/[tagSlug]/page.tsx`

- [ ] **Step 1: Build tag page**

```tsx
// apps/website/app/(frontend)/[locale]/articles/tags/[tagSlug]/page.tsx
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { getPayload } from "@/lib/payload";
import { generateLanguageAlternates } from "@switch-to-eu/i18n/utils";
import { Container } from "@switch-to-eu/blocks/components/container";
import { PageLayout } from "@switch-to-eu/blocks/components/page-layout";
import { SectionHeading } from "@switch-to-eu/blocks/components/section-heading";
import type { Locale } from "next-intl";
import type { Article, Tag } from "@/payload-types";
import { ArticleCard } from "@/components/articles/ArticleCard";

type AppLocale = "en" | "nl";

export async function generateStaticParams() {
  const payload = await getPayload();
  const { docs } = await payload.find({
    collection: "tags",
    depth: 0,
    limit: 100,
  });
  const locales: AppLocale[] = ["en", "nl"];
  return locales.flatMap((locale) =>
    docs.map((t: Tag) => ({ locale, tagSlug: t.slug }))
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; tagSlug: string }>;
}): Promise<Metadata> {
  const { locale, tagSlug } = await params;
  const payload = await getPayload();
  const { docs } = await payload.find({
    collection: "tags",
    where: { slug: { equals: tagSlug } },
    locale: locale as AppLocale,
    limit: 1,
  });
  const tag = docs[0] as Tag | undefined;
  if (!tag) return { title: "Not Found" };

  const t = await getTranslations("articles.tag");
  return {
    title: t("pageTitle", { name: tag.name }),
    description: tag.description ?? tag.name,
    alternates: generateLanguageAlternates(
      `articles/tags/${tagSlug}`,
      locale as Locale
    ),
  };
}

export default async function TagPage({
  params,
}: {
  params: Promise<{ locale: AppLocale; tagSlug: string }>;
}) {
  const { locale, tagSlug } = await params;
  const payload = await getPayload();
  const { docs: tagDocs } = await payload.find({
    collection: "tags",
    where: { slug: { equals: tagSlug } },
    locale,
    limit: 1,
  });
  const tag = tagDocs[0] as Tag | undefined;
  if (!tag) notFound();

  const { docs: articles } = await payload.find({
    collection: "articles",
    where: {
      and: [
        { _status: { equals: "published" } },
        { tags: { in: [tag.id] } },
      ],
    },
    locale,
    sort: "-publishedAt",
    depth: 1,
    limit: 100,
  });

  const t = await getTranslations("articles.tag");

  return (
    <PageLayout>
      <section>
        <Container>
          <p className="text-brand-green/60 text-sm uppercase tracking-wider font-semibold mb-2">
            {t("taggedWith")}
          </p>
          <h1 className="font-heading text-4xl sm:text-5xl uppercase text-brand-green mb-4">
            {tag.name}
          </h1>
          {tag.description && (
            <p className="max-w-2xl text-brand-green/80 text-base sm:text-lg leading-relaxed mb-10">
              {tag.description}
            </p>
          )}
          <SectionHeading>{t("pageTitle", { name: tag.name })}</SectionHeading>
          {articles.length === 0 ? (
            <p className="text-brand-green/70">—</p>
          ) : (
            <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 auto-rows-fr">
              {articles.map((a: Article) => (
                <ArticleCard key={a.id} article={a} />
              ))}
            </div>
          )}
        </Container>
      </section>
    </PageLayout>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add "apps/website/app/(frontend)/[locale]/articles/tags"
git commit -m "feat(website): add /articles/tags/[tagSlug] route"
```

---

### Task 20: Global `/feed.xml` route + RSS discovery link + sitemap entries

**Files:**
- Create: `apps/website/lib/feed.ts`
- Create: `apps/website/app/(frontend)/[locale]/feed.xml/route.ts`
- Modify: `apps/website/app/(frontend)/[locale]/layout.tsx`
- Modify: `apps/website/app/sitemap.xml/route.ts`
- Modify: `apps/website/e2e/smoke.spec.ts` — add `/feed.xml` to `extraRoutes`

- [ ] **Step 1: Feed builder**

```ts
// apps/website/lib/feed.ts
import { getPayload } from "@/lib/payload";
import type { Article, Guide, Author } from "@/payload-types";
import { getCategorySlug, getResolvedRelation } from "@/lib/services";

type AppLocale = "en" | "nl";

interface FeedItem {
  title: string;
  link: string;
  description: string;
  pubDate: Date;
  guid: string;
  categories: string[];
  authorNames: string[];
}

function xmlEscape(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function renderItem(item: FeedItem): string {
  const cats = item.categories
    .map((c) => `      <category>${xmlEscape(c)}</category>`)
    .join("\n");
  const authors = item.authorNames
    .map((n) => `      <dc:creator>${xmlEscape(n)}</dc:creator>`)
    .join("\n");
  return `    <item>
      <title>${xmlEscape(item.title)}</title>
      <link>${xmlEscape(item.link)}</link>
      <guid isPermaLink="true">${xmlEscape(item.guid)}</guid>
      <pubDate>${item.pubDate.toUTCString()}</pubDate>
      <description>${xmlEscape(item.description)}</description>
${cats}
${authors}
    </item>`;
}

export async function buildFeedXml({
  locale,
  baseUrl,
  title,
  description,
}: {
  locale: AppLocale;
  baseUrl: string;
  title: string;
  description: string;
}): Promise<string> {
  const payload = await getPayload();

  const [articlesResult, guidesResult] = await Promise.all([
    payload.find({
      collection: "articles",
      where: { _status: { equals: "published" } },
      locale,
      sort: "-publishedAt",
      limit: 20,
      depth: 1,
    }),
    payload.find({
      collection: "guides",
      where: { _status: { equals: "published" } },
      locale,
      sort: "-date",
      limit: 20,
      depth: 1,
    }),
  ]);

  const articleItems: FeedItem[] = articlesResult.docs.map((a: Article) => {
    const authors =
      a.authors
        ?.map((x) => getResolvedRelation<Author>(x))
        .filter((x): x is Author => x !== null)
        .map((x) => x.name) ?? [];
    const pub = new Date(a.publishedAt ?? a.createdAt);
    return {
      title: a.title,
      link: `${baseUrl}/${locale}/articles/${a.slug}`,
      description: a.excerpt ?? "",
      pubDate: pub,
      guid: `${baseUrl}/${locale}/articles/${a.slug}`,
      categories: [`article/${a.type}`],
      authorNames: authors,
    };
  });

  const guideItems: FeedItem[] = guidesResult.docs.map((g: Guide) => {
    const categorySlug = getCategorySlug(g.category) || "uncategorized";
    const pub = new Date(g.date ?? g.createdAt);
    return {
      title: g.title,
      link: `${baseUrl}/${locale}/guides/${categorySlug}/${g.slug}`,
      description: g.description ?? "",
      pubDate: pub,
      guid: `${baseUrl}/${locale}/guides/${categorySlug}/${g.slug}`,
      categories: ["guide"],
      authorNames: g.author ? [g.author] : [],
    };
  });

  const merged = [...articleItems, ...guideItems]
    .sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime())
    .slice(0, 20);

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${xmlEscape(title)}</title>
    <link>${xmlEscape(`${baseUrl}/${locale}`)}</link>
    <description>${xmlEscape(description)}</description>
    <language>${locale}</language>
    <atom:link href="${xmlEscape(`${baseUrl}/${locale}/feed.xml`)}" rel="self" type="application/rss+xml" />
${merged.map(renderItem).join("\n")}
  </channel>
</rss>`;
}
```

- [ ] **Step 2: Route handler**

```ts
// apps/website/app/(frontend)/[locale]/feed.xml/route.ts
import { buildFeedXml } from "@/lib/feed";
import { getTranslations } from "next-intl/server";

const baseUrl = process.env.NEXT_PUBLIC_URL || "https://www.switch-to.eu";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ locale: string }> }
) {
  const { locale } = await params;
  const appLocale = locale === "nl" ? "nl" : "en";
  const t = await getTranslations({ locale: appLocale, namespace: "feed" });

  const xml = await buildFeedXml({
    locale: appLocale,
    baseUrl,
    title: t("title"),
    description: t("description"),
  });

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
```

- [ ] **Step 3: Add `<link rel="alternate">` in the locale layout**

Open `apps/website/app/(frontend)/[locale]/layout.tsx`. In the `generateMetadata` (or equivalent `Metadata` export), ensure `alternates.types` contains the RSS link. If the layout does not already have `generateMetadata`, add one:

```diff
 import type { Metadata } from "next";
...
-export const metadata: Metadata = {
+export async function generateMetadata({
+  params,
+}: {
+  params: Promise<{ locale: string }>;
+}): Promise<Metadata> {
+  const { locale } = await params;
+  return {
+    alternates: {
+      types: {
+        "application/rss+xml": [{ url: `/${locale}/feed.xml`, title: "switch-to.eu" }],
+      },
+    },
+  };
+}
```

If a `metadata` object already exists in that file, convert it or merge the `alternates.types` entry with existing alternates. Read the current file first and adapt.

- [ ] **Step 4: Add articles/authors/tags to sitemap.xml**

In `apps/website/app/sitemap.xml/route.ts`, inside `buildEntries`, after the existing guides fetch, add:

```ts
const articlesResult = await payload.find({
  collection: "articles",
  where: { _status: { equals: "published" } },
  locale: "all",
  limit: 0,
  pagination: false,
});
const authorsResult = await payload.find({
  collection: "authors",
  locale: "all",
  limit: 0,
  pagination: false,
});
const tagsResult = await payload.find({
  collection: "tags",
  locale: "all",
  limit: 0,
  pagination: false,
});

const articlesEntries: SitemapEntry[] = articlesResult.docs.flatMap((a) => {
  const path = `/articles/${a.slug}`;
  return locales.map((locale) => ({
    url: `${baseUrl}/${locale}${path}`,
    lastModified: new Date(a.updatedAt),
    changeFrequency: "monthly",
    priority: 0.7,
    alternates: localeAlternates(path),
  }));
});

const authorsEntries: SitemapEntry[] = authorsResult.docs.flatMap((a) => {
  const path = `/articles/authors/${a.slug}`;
  return locales.map((locale) => ({
    url: `${baseUrl}/${locale}${path}`,
    lastModified: new Date(a.updatedAt),
    changeFrequency: "monthly",
    priority: 0.4,
    alternates: localeAlternates(path),
  }));
});

const tagsEntries: SitemapEntry[] = tagsResult.docs.flatMap((tag) => {
  const path = `/articles/tags/${tag.slug}`;
  return locales.map((locale) => ({
    url: `${baseUrl}/${locale}${path}`,
    lastModified: new Date(tag.updatedAt),
    changeFrequency: "monthly",
    priority: 0.4,
    alternates: localeAlternates(path),
  }));
});

const articlesIndexEntries: SitemapEntry[] = locales.map((locale) => ({
  url: `${baseUrl}/${locale}/articles`,
  lastModified: now,
  changeFrequency: "weekly",
  priority: 0.8,
  alternates: localeAlternates("/articles"),
}));
```

Update the `Promise.all(...)` call to add the three new `find` calls to the existing list (preferred), and add the new entry arrays to the final `return` array.

- [ ] **Step 5: Add `/feed.xml` coverage to smoke test**

In `apps/website/e2e/smoke.spec.ts`, add an explicit feed test:

```ts
test("/en/feed.xml returns RSS", async ({ request }) => {
  const res = await request.get("/en/feed.xml");
  expect(res.status()).toBe(200);
  expect(res.headers()["content-type"]).toMatch(/application\/rss\+xml/);
  const body = await res.text();
  expect(body).toContain("<rss");
  expect(body).toContain("<item>");
});

test("/nl/feed.xml returns RSS", async ({ request }) => {
  const res = await request.get("/nl/feed.xml");
  expect(res.status()).toBe(200);
  expect(res.headers()["content-type"]).toMatch(/application\/rss\+xml/);
});
```

- [ ] **Step 6: Commit**

```bash
git add apps/website/lib/feed.ts "apps/website/app/(frontend)/[locale]/feed.xml" "apps/website/app/(frontend)/[locale]/layout.tsx" apps/website/app/sitemap.xml/route.ts apps/website/e2e/smoke.spec.ts
git commit -m "feat(website): add global /feed.xml combining articles + guides, sitemap entries, RSS discovery link"
```

---

## Phase 5: Homepage integration, cross-surfacing, navigation

### Task 21: Rewire the homepage `ArticlesSection` to real data

**Files:**
- Modify: `apps/website/components/ArticlesSection.tsx`

The existing component is a server component that just renders placeholders. Replace with a data-backed version that renders nothing if there are fewer than 3 published articles in the current locale.

- [ ] **Step 1: Rewrite component**

```tsx
// apps/website/components/ArticlesSection.tsx
import { getTranslations, getLocale } from "next-intl/server";
import { Container } from "@switch-to-eu/blocks/components/container";
import { SectionHeading } from "@switch-to-eu/blocks/components/section-heading";
import { Link } from "@switch-to-eu/i18n/navigation";
import { getPayload } from "@/lib/payload";
import type { Article } from "@/payload-types";
import { ArticleCard } from "@/components/articles/ArticleCard";

export async function ArticlesSection() {
  const t = await getTranslations("home");
  const tCommon = await getTranslations("articles");
  const locale = (await getLocale()) as "en" | "nl";
  const payload = await getPayload();

  const [featuredResult, recentResult] = await Promise.all([
    payload.find({
      collection: "articles",
      where: {
        and: [
          { _status: { equals: "published" } },
          { featuredOnHomepage: { equals: true } },
        ],
      },
      locale,
      sort: "-publishedAt",
      limit: 1,
      depth: 1,
    }),
    payload.find({
      collection: "articles",
      where: { _status: { equals: "published" } },
      locale,
      sort: "-publishedAt",
      limit: 4,
      depth: 1,
    }),
  ]);

  const featured = featuredResult.docs[0] as Article | undefined;
  const recent = recentResult.docs as Article[];

  const articles: Article[] = [];
  if (featured) articles.push(featured);
  for (const a of recent) {
    if (articles.length >= 3) break;
    if (featured && a.id === featured.id) continue;
    articles.push(a);
  }

  if (articles.length < 3) return null;

  return (
    <section>
      <Container noPaddingMobile>
        <SectionHeading>{t("articlesSectionTitle")}</SectionHeading>
        <p className="px-3 md:px-0 max-w-2xl text-brand-green/70 text-base sm:text-lg leading-relaxed mb-8 sm:mb-10">
          {t("articlesSectionIntro")}
        </p>
        <div
          className="grid gap-0 md:gap-5 auto-rows-fr grid-cols-1 sm:grid-cols-2 md:grid-cols-3"
          role="list"
        >
          {articles.map((article) => (
            <div role="listitem" key={article.id}>
              <ArticleCard article={article} />
            </div>
          ))}
        </div>
        <div className="mt-6 px-3 md:px-0">
          <Link
            href="/articles"
            className="inline-block text-sm font-semibold text-brand-green underline hover:no-underline"
          >
            {tCommon("readMore")}
          </Link>
        </div>
      </Container>
    </section>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/website/components/ArticlesSection.tsx
git commit -m "feat(website): wire homepage ArticlesSection to real articles"
```

---

### Task 22: `RelatedArticles` shared component

**Files:**
- Create: `apps/website/components/articles/RelatedArticles.tsx`

- [ ] **Step 1: Build component**

```tsx
// apps/website/components/articles/RelatedArticles.tsx
import { getTranslations } from "next-intl/server";
import { Container } from "@switch-to-eu/blocks/components/container";
import { SectionHeading } from "@switch-to-eu/blocks/components/section-heading";
import { getPayload } from "@/lib/payload";
import type { Article } from "@/payload-types";
import { ArticleCard } from "./ArticleCard";

interface Props {
  locale: "en" | "nl";
  where: Record<string, unknown>;
}

export async function RelatedArticles({ locale, where }: Props) {
  const payload = await getPayload();
  const { docs } = await payload.find({
    collection: "articles",
    where: {
      and: [{ _status: { equals: "published" } }, where],
    },
    locale,
    sort: "-publishedAt",
    limit: 3,
    depth: 1,
  });

  if (docs.length === 0) return null;

  const t = await getTranslations("articles");

  return (
    <section>
      <Container noPaddingMobile>
        <SectionHeading>{t("relatedArticles")}</SectionHeading>
        <div className="grid gap-5 auto-rows-fr grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
          {docs.map((a: Article) => (
            <ArticleCard key={a.id} article={a} />
          ))}
        </div>
      </Container>
    </section>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/website/components/articles/RelatedArticles.tsx
git commit -m "feat(website): add RelatedArticles shared component"
```

---

### Task 23: Cross-surface on service, category, guide detail pages

**Files:**
- Modify: `apps/website/app/(frontend)/[locale]/services/eu/[service_name]/page.tsx` (and the non-eu variant, if one exists)
- Modify: `apps/website/app/(frontend)/[locale]/services/[category]/page.tsx` (or the category route — inspect the actual directory)
- Modify: `apps/website/app/(frontend)/[locale]/guides/[category]/[service]/page.tsx`

- [ ] **Step 1: Inspect current service and category routes**

Run:

```bash
ls "apps/website/app/(frontend)/[locale]/services"
```

This informs the exact file paths. Category detail page may live at `services/[category]/page.tsx`. Service detail may live at `services/[region]/[service_name]/page.tsx`. Use what you find.

- [ ] **Step 2: Service detail page** — add `<RelatedArticles>` near the bottom, before the newsletter CTA:

```tsx
import { RelatedArticles } from "@/components/articles/RelatedArticles";
...
<RelatedArticles
  locale={locale}
  where={{ relatedServices: { in: [service.id] } }}
/>
```

- [ ] **Step 3: Category page** — add `<RelatedArticles>` near the bottom:

```tsx
<RelatedArticles
  locale={locale}
  where={{ category: { equals: category.id } }}
/>
```

- [ ] **Step 4: Guide detail page** — add `<RelatedArticles>` near the bottom. Use both `sourceService` and `targetService` IDs:

```tsx
const sourceId = typeof guide.sourceService === "object" ? guide.sourceService.id : guide.sourceService;
const targetId = typeof guide.targetService === "object" ? guide.targetService.id : guide.targetService;
...
<RelatedArticles
  locale={locale}
  where={{
    or: [
      { relatedServices: { in: [sourceId, targetId] } },
    ],
  }}
/>
```

- [ ] **Step 5: Commit**

```bash
git add "apps/website/app/(frontend)/[locale]/services" "apps/website/app/(frontend)/[locale]/guides"
git commit -m "feat(website): cross-surface related articles on service/category/guide pages"
```

---

### Task 24: Header + footer Articles links

**Files:**
- Modify: `apps/website/components/layout/header.tsx`
- Modify: the shared footer component — locate with `grep -rn "footer" packages/blocks/src/components/` to find the actual file

- [ ] **Step 1: Add "Articles" link to the header** between Guides and About (or wherever Guides currently sits in the link list). Use a translation key `common.articlesLabel` (to be added in Task 26).

Example diff (adapt to the real structure):

```diff
-<Link href="/guides">{t("guidesLabel")}</Link>
-<Link href="/about">{t("aboutLabel")}</Link>
+<Link href="/guides">{t("guidesLabel")}</Link>
+<Link href="/articles">{t("articlesLabel")}</Link>
+<Link href="/about">{t("aboutLabel")}</Link>
```

- [ ] **Step 2: Add "Articles" link to the footer** under the existing primary nav column (wherever Guides is listed). Adapt to the actual footer structure.

- [ ] **Step 3: Commit**

```bash
git add apps/website/components/layout/header.tsx packages/blocks/src/components
git commit -m "feat(website): add Articles link to header and footer"
```

---

## Phase 6: i18n messages

### Task 25: Add all new message keys and remove obsolete placeholder keys

**Files:**
- Modify: `packages/i18n/messages/website/en.json`
- Modify: `packages/i18n/messages/website/nl.json`

- [ ] **Step 1: Add `articles.*` namespace to en.json**

```json
{
  "articles": {
    "pageTitle": "Articles",
    "pageDescription": "Deep dives, opinions, roundups, and news on EU digital sovereignty and migration.",
    "readingTime": "{minutes} min read",
    "publishedOn": "Published {date}",
    "writtenBy": "By",
    "readMore": "Read all articles →",
    "relatedArticles": "Related articles",
    "filterByType": "Filter by type",
    "filterByCategory": "Filter by category",
    "filterByTag": "Filter by tag",
    "clearFilters": "Clear filters",
    "empty": "No articles match these filters.",
    "loadMore": "Load more",
    "types": {
      "opinion": "Opinion",
      "roundup": "Roundup",
      "news": "News",
      "deepDive": "Deep dive"
    },
    "author": {
      "pageTitle": "{name} · Articles",
      "articlesBy": "Articles by {name}",
      "readAll": "Read all articles"
    },
    "tag": {
      "pageTitle": "Articles tagged \"{name}\"",
      "taggedWith": "Tagged with"
    }
  },
  "feed": {
    "title": "switch-to.eu",
    "description": "Articles and migration guides from switch-to.eu."
  }
}
```

- [ ] **Step 2: Add `common.articlesLabel`**

Under the existing `common` block:

```diff
     "guidesLabel": "Guides",
+    "articlesLabel": "Articles",
```

- [ ] **Step 3: Remove obsolete placeholder keys from `home`**

```diff
   "home": {
     ...
     "articlesSectionTitle": "Reading",
-    "articlesSectionIntro": "Deep dives on EU privacy law, migration pitfalls, and the people building European alternatives.",
-    "articlesComingSoon": "Coming soon",
-    "articlesPlaceholderTitle": "A new piece is on the way",
-    "articlesPlaceholderBody": "Articles land here as we publish them. Check back, or sign up to the newsletter below to catch them in your inbox.",
+    "articlesSectionIntro": "Deep dives on EU privacy law, migration pitfalls, and the people building European alternatives.",
```

- [ ] **Step 4: Add translated equivalents to nl.json**

```json
{
  "articles": {
    "pageTitle": "Artikelen",
    "pageDescription": "Achtergrondstukken, opinies, overzichten en nieuws over EU-autonomie en migratie.",
    "readingTime": "{minutes} min lezen",
    "publishedOn": "Gepubliceerd op {date}",
    "writtenBy": "Door",
    "readMore": "Lees alle artikelen →",
    "relatedArticles": "Gerelateerde artikelen",
    "filterByType": "Filter op type",
    "filterByCategory": "Filter op categorie",
    "filterByTag": "Filter op tag",
    "clearFilters": "Filters wissen",
    "empty": "Geen artikelen gevonden voor deze filters.",
    "loadMore": "Meer laden",
    "types": {
      "opinion": "Opinie",
      "roundup": "Overzicht",
      "news": "Nieuws",
      "deepDive": "Achtergrond"
    },
    "author": {
      "pageTitle": "{name} · Artikelen",
      "articlesBy": "Artikelen van {name}",
      "readAll": "Lees alle artikelen"
    },
    "tag": {
      "pageTitle": "Artikelen getagd met \"{name}\"",
      "taggedWith": "Getagd met"
    }
  },
  "feed": {
    "title": "switch-to.eu",
    "description": "Artikelen en migratiegidsen van switch-to.eu."
  }
}
```

And update `common.articlesLabel` → `"Artikelen"`. Remove the same obsolete `home.articles*` placeholder keys.

- [ ] **Step 5: Verify i18n builds**

```bash
pnpm --filter website build
```

If the build fails on missing keys, cross-reference with what the TSX references and fix any gaps.

- [ ] **Step 6: Commit**

```bash
git add packages/i18n/messages/website/en.json packages/i18n/messages/website/nl.json
git commit -m "feat(i18n): add articles messages, remove placeholder home.articles* keys"
```

---

## Phase 7: AI pipeline skills

Each article skill mirrors its guide counterpart. The following tasks create only the skills themselves; shared resources (`.claude/skills/_shared/voice.md`, `lexical-json.md`, `seo-checklist.md`, `humanize-patterns.md`) already exist and are reused.

### Task 26: `/write-article` skill

**Files:**
- Create: `.claude/skills/write-article/SKILL.md`

- [ ] **Step 1: Write the skill**

```md
---
name: write-article
description: Write or rewrite an article on switch-to.eu from the Brief tab in Payload CMS. Use when asked to "write an article", "draft an article", or "write-article X".
argument-hint: "'<article title or slug>'"
---

# Write Article Content

Write an article for switch-to.eu using the Brief tab, related services, and the project's tone.

**Before writing, read:** `.claude/skills/_shared/voice.md` for tone and writing rules, `.claude/skills/_shared/lexical-json.md` for richText format.

## Process

### Step 1: Resolve the article

Use `mcp__Payload__findArticles` with the provided argument:

- If the argument looks like a slug (kebab-case, no spaces), query by slug.
- Otherwise, match by `title` (case-insensitive partial).

If no article exists yet, create it first via `mcp__Payload__createArticles` with `_status: "draft"` and a generated slug, then proceed.

### Step 2: Read the Brief

From the Brief tab read: `angle`, `keyPoints`, `targetAudience`, `sources`, `outlineNotes`. If the Brief is empty, stop and ask the user to fill it in first — articles without a Brief produce generic output.

### Step 3: Pull related services

For every service in `relatedServices`, call `mcp__Payload__findServices` at depth 1 so you have their research data (region, hosting, pricing, encryption, open-source, issues). These ground the piece in specifics.

### Step 4: Write the sections

**`title`**: If already set, keep it. Otherwise produce a direct, no-marketing title.

**`excerpt`**: 140–200 chars. Not a teaser — a factual summary of the piece.

**`body`** (richText Lexical JSON): length targets by `type`:
- `news`: 250–500 words
- `opinion`: 600–900 words
- `roundup`: 800–1200 words
- `deep-dive`: 1200–2000 words

Build the body following the Brief's `keyPoints` in order. Use:
- **Inline pills** for any service, guide, or category reference. These are internal links with `linkType: "internal"` and `doc.relationTo = "services" | "guides" | "categories"`. The renderer turns them into pills automatically. Prefer a pill over plain text when the article mentions a service/guide/category by name.
- **Blocks** where appropriate:
  - `ServiceCardBlock` — one prominent service call-out.
  - `ServiceComparisonBlock` — when comparing two or more services; roundups and deep-dives should use this at least once.
  - `GuideCtaBlock` — when the article references a migration, point to the guide.
  - `CategoryGridBlock` — roundups closing with "and here are the EU alternatives in this category".
  - `CalloutBlock` (`variant: worth-knowing`) — mandatory once per article. Use it to acknowledge a trade-off or limitation of a recommended service. This is a tone-of-voice requirement, not a nice-to-have.

**`readingTime`**: Calculate from the body at ~220 words per minute, round up.

### Step 5: Save the draft

Call `mcp__Payload__updateArticles` with the updated fields. Set `contentPipelineStatus: "written"`. Keep `_status: "draft"`.

### Step 6: Report back

Print:
- Article title + slug
- Word count
- Blocks used + count per type
- Pill count per collection (services/guides/categories)
- Next step: "Review in /admin, then run /humanize-article <slug>"

## Rules

- No em dashes, no semicolons, no banned words (see `.claude/skills/_shared/voice.md`).
- Do not invent service features. Only cite what's in `relatedServices[].research.*` or the user's sources.
- Always include at least one `CalloutBlock` with `variant: worth-knowing` (the trade-off rule).
- Never set `_status: "published"`. Editor publishes manually.
```

- [ ] **Step 2: Commit**

```bash
git add .claude/skills/write-article/SKILL.md
git commit -m "feat(skills): add write-article skill"
```

---

### Task 27: `/humanize-article` skill

**Files:**
- Create: `.claude/skills/humanize-article/SKILL.md`

- [ ] **Step 1: Write the skill (mirrors `humanize-guide` closely)**

```md
---
name: humanize-article
description: Strip AI writing patterns from an article in Payload CMS. Use when asked to "humanize article", "de-AI article X", "make article X sound human".
argument-hint: "'<slug>'"
---

# Humanize Article Content

Two-pass AI-pattern removal on an article's excerpt and Lexical body.

**Before editing, read:** `.claude/skills/_shared/humanize-patterns.md`, `.claude/skills/_shared/voice.md`, `.claude/skills/_shared/lexical-json.md`.

## Process

### Step 1: Fetch the article

`mcp__Payload__findArticles` where `slug = <arg>`, depth 1.

### Step 2: Pass 1 — phrase-level

Walk the Lexical body tree. For every `text` node, apply the rewrites in `humanize-patterns.md`. Do NOT touch block nodes (`serviceCard`, `serviceComparison`, `guideCta`, `categoryGrid`, `callout`) — preserve them exactly as-is. Do NOT touch link nodes' `doc` references.

Also apply humanize rules to the `excerpt` field.

### Step 3: Pass 2 — structural

Re-read the body. Flag and fix:
- Paragraphs that open with "It is" / "There are" / "This is".
- Sentences longer than 30 words → split.
- Consecutive paragraphs of identical length → vary.
- Any `worth-knowing` callout that feels hollow — make it land with a specific trade-off.

### Step 4: Save

`mcp__Payload__updateArticles`: updated `body`, `excerpt`, `contentPipelineStatus: "humanized"`.

### Step 5: Report

- Character count before/after for `excerpt`
- Word count before/after for body text nodes
- Number of phrase rewrites applied
- Next step: "/seo-check-article <slug>"

## Rules

- Never modify block nodes.
- Never modify internal link `doc` refs — only the visible text child of the link.
- Preserve Lexical structure exactly (node order, types, formatting).
```

- [ ] **Step 2: Commit**

```bash
git add .claude/skills/humanize-article/SKILL.md
git commit -m "feat(skills): add humanize-article skill"
```

---

### Task 28: `/seo-check-article` skill

**Files:**
- Create: `.claude/skills/seo-check-article/SKILL.md`

- [ ] **Step 1: Write the skill**

```md
---
name: seo-check-article
description: Run an SEO audit on an article in Payload CMS and store the score. Use when asked to "seo-check article", "audit article SEO", "score article X".
argument-hint: "'<slug>'"
---

# SEO Audit: Article

Run a 10-point SEO audit on a single article and store the score in the SEO tab.

**Before auditing, read:** `.claude/skills/_shared/seo-checklist.md`.

## Process

### Step 1: Fetch article

`mcp__Payload__findArticles` where `slug = <arg>`, depth 2 (need resolved relationships).

### Step 2: Run the 10-point checklist

Use the shared SEO checklist and add article-specific rules:

1. `title` present, 30–70 chars.
2. `excerpt` present, 140–200 chars.
3. `heroImage` present and has `alt` text.
4. `metaTitle` set, 50–60 chars (falls back to `title` if missing — flag missing).
5. `metaDescription` set, 150–160 chars.
6. `keywords` has 2–6 terms.
7. `ogImage` set (falls back to `heroImage`).
8. Body contains at least one internal pill or block (measures internal linking).
9. Body length matches `type` target (`news` 250–500, `opinion` 600–900, `roundup` 800–1200, `deep-dive` 1200–2000).
10. At least one `CalloutBlock` with `variant: worth-knowing` (tone-of-voice rule).

Score: 10 points for each passed rule. Max 100.

### Step 3: Save

`mcp__Payload__updateArticles` with:
- `seoScore`
- `seoNotes`: plain-text summary, one bullet per failed rule with suggested fix
- `lastSeoReviewAt`: today
- `contentPipelineStatus: "seo-checked"` only if not already later in the pipeline

### Step 4: Report

Print: title, score, failed rules with fix suggestions.
```

- [ ] **Step 2: Commit**

```bash
git add .claude/skills/seo-check-article/SKILL.md
git commit -m "feat(skills): add seo-check-article skill"
```

---

### Task 29: `/translate-article` skill

**Files:**
- Create: `.claude/skills/translate-article/SKILL.md`

- [ ] **Step 1: Write the skill**

```md
---
name: translate-article
description: Translate an article in Payload CMS to another locale. Use when asked to "translate article", "localize article to Dutch".
argument-hint: "'<slug>' <locale>"
---

# Translate Article

Translate every localized field on an article from the source locale (default: `en`) to the target locale.

**Before translating, read:** `.claude/skills/_shared/voice.md` — tone rules apply in every language.

## Process

### Step 1: Fetch article in source locale

`mcp__Payload__findArticles` where `slug = <arg>`, `locale: "en"`, depth 2.

### Step 2: Translate each localized field

Localized fields on Articles:
- `title`
- `excerpt`
- `body` (Lexical — translate only text nodes; preserve block structure, link refs, and formatting)
- `angle` (Brief)
- `keyPoints[].point` (Brief)
- `outlineNotes` (Brief)
- `metaTitle`, `metaDescription`, `keywords[].keyword`, `ogTitle`, `ogDescription` (SEO)

Localized fields on Tags the article uses:
- Tags' `name` and `description`. If those haven't been translated yet, translate them first via `mcp__Payload__updateTags`.

Author `bio` should also be translated if not already present in the target locale — ask before doing this, since authors may want to review their own bios.

### Step 3: Save

`mcp__Payload__updateArticles` with `locale: <target>` and the translated fields. Set `contentPipelineStatus: "translated"` only if not already later in the pipeline.

### Step 4: Report

- Which fields were translated
- Character count delta per major field
- Next step: "Review Dutch version in /admin and publish"

## Rules

- Preserve block nodes exactly (including all block `fields`).
- Preserve internal link `doc` refs exactly.
- Preserve rich-text node ordering and formatting.
- Apply tone rules: no em dashes, no hedging, specific > generic.
- Slugs are NOT translated — they stay in English.
```

- [ ] **Step 2: Commit**

```bash
git add .claude/skills/translate-article/SKILL.md
git commit -m "feat(skills): add translate-article skill"
```

---

### Task 30: Extend bulk skills to accept `article`

**Files:**
- Modify: `.claude/skills/bulk-write/SKILL.md`
- Modify: `.claude/skills/bulk-humanize/SKILL.md`
- Modify: `.claude/skills/bulk-seo-check/SKILL.md`
- Modify: `.claude/skills/bulk-translate/SKILL.md`

Each existing bulk skill accepts a type argument (`service`, `guide`, `category`). Add `article` to each.

- [ ] **Step 1: For each of the four skills, locate the type-dispatch section** (grep for `service|guide|category`) and add an `article` branch that dispatches subagents which invoke the corresponding per-article skill (`write-article`, `humanize-article`, `seo-check-article`, `translate-article`).

Example diff (applies to each bulk skill — adapt to its actual phrasing):

```diff
-Supported types: `service`, `guide`, `category`.
+Supported types: `service`, `guide`, `category`, `article`.
```

```diff
 If `type = category` → dispatch `humanize-category` per item.
+If `type = article` → dispatch `humanize-article` per item.
```

For bulk-write specifically, adapt the "unwritten" filter semantics: for articles, "unwritten" means `contentPipelineStatus` is `not-started` or `in-progress`. For bulk-translate: items missing the target locale's `title`.

- [ ] **Step 2: Commit**

```bash
git add .claude/skills/bulk-write/SKILL.md .claude/skills/bulk-humanize/SKILL.md .claude/skills/bulk-seo-check/SKILL.md .claude/skills/bulk-translate/SKILL.md
git commit -m "feat(skills): extend bulk skills to accept article type"
```

---

### Task 31: Extend `/pipeline` skill to accept `article`

**Files:**
- Modify: `.claude/skills/pipeline/SKILL.md`

- [ ] **Step 1: Add article branch**

Locate the type-dispatch block and add `article`:

```diff
-Supported types: `service`, `guide`, `category`.
+Supported types: `service`, `guide`, `category`, `article`.
...
-For `guide`: runs /write-guide → /humanize-guide → /seo-check-guide.
+For `guide`: runs /write-guide → /humanize-guide → /seo-check-guide.
+For `article`: runs /write-article → /humanize-article → /seo-check-article.
```

- [ ] **Step 2: Commit**

```bash
git add .claude/skills/pipeline/SKILL.md
git commit -m "feat(skills): extend /pipeline skill to accept article type"
```

---

## Phase 8: Seed + smoke test verification

### Task 32: Seed script — one author, one tag, one article per locale

**Files:**
- Create: `apps/website/scripts/seedArticles.ts`
- Modify: `apps/website/package.json` — add a script entry: `"seed:articles": "tsx scripts/seedArticles.ts"`

- [ ] **Step 1: Build the seed**

```ts
// apps/website/scripts/seedArticles.ts
import { getPayload } from "payload";
import config from "../payload.config";

const SAMPLE_BODY_EN = {
  root: {
    type: "root",
    format: "",
    indent: 0,
    version: 1,
    direction: "ltr",
    children: [
      {
        type: "paragraph",
        format: "",
        indent: 0,
        version: 1,
        direction: "ltr",
        children: [
          { type: "text", version: 1, text: "This is a seeded article for smoke-test coverage." },
        ],
      },
    ],
  },
};

const SAMPLE_BODY_NL = {
  root: {
    ...SAMPLE_BODY_EN.root,
    children: [
      {
        ...SAMPLE_BODY_EN.root.children[0],
        children: [
          { type: "text", version: 1, text: "Dit is een geseed artikel voor smoke-test dekking." },
        ],
      },
    ],
  },
};

async function main() {
  const payload = await getPayload({ config });

  const existingAuthor = await payload.find({
    collection: "authors",
    where: { slug: { equals: "seed-author" } },
    limit: 1,
  });
  const author =
    existingAuthor.docs[0] ??
    (await payload.create({
      collection: "authors",
      data: {
        slug: "seed-author",
        name: "Seed Author",
        role: "Editor",
        bio: "Seeded author for smoke-test coverage.",
      },
    }));

  const existingTag = await payload.find({
    collection: "tags",
    where: { slug: { equals: "seed-tag" } },
    limit: 1,
  });
  const tag =
    existingTag.docs[0] ??
    (await payload.create({
      collection: "tags",
      data: {
        slug: "seed-tag",
        name: "Seed tag",
        description: "Seeded tag for smoke-test coverage.",
      },
    }));

  const existingArticle = await payload.find({
    collection: "articles",
    where: { slug: { equals: "seed-article" } },
    limit: 1,
  });

  if (!existingArticle.docs[0]) {
    await payload.create({
      collection: "articles",
      locale: "en",
      data: {
        slug: "seed-article",
        type: "opinion",
        publishedAt: new Date().toISOString(),
        title: "Seed article",
        excerpt:
          "A seeded article used to prove the listing, detail, author, tag, and feed routes return 200 in end-to-end smoke tests.",
        authors: [author.id],
        readingTime: 2,
        body: SAMPLE_BODY_EN as unknown as Record<string, unknown>,
        tags: [tag.id],
        _status: "published",
      } as unknown as Record<string, unknown>,
    });
  }

  const existingNl = await payload.find({
    collection: "articles",
    where: { slug: { equals: "seed-article" } },
    locale: "nl",
    limit: 1,
  });
  const articleDoc = existingNl.docs[0];
  if (articleDoc) {
    await payload.update({
      collection: "articles",
      id: articleDoc.id,
      locale: "nl",
      data: {
        title: "Geseed artikel",
        excerpt:
          "Een geseed artikel dat gebruikt wordt om de listing, detail, auteurs, tag en feed routes in smoke tests te valideren.",
        body: SAMPLE_BODY_NL as unknown as Record<string, unknown>,
      } as unknown as Record<string, unknown>,
    });
  }

  console.log("Seed complete.");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
```

- [ ] **Step 2: Add script entry to `apps/website/package.json`**

```diff
     "test:e2e": "playwright test",
+    "seed:articles": "tsx scripts/seedArticles.ts",
```

- [ ] **Step 3: Commit**

```bash
git add apps/website/scripts/seedArticles.ts apps/website/package.json
git commit -m "feat(website): add seedArticles script for smoke test coverage"
```

---

### Task 33: Update CLAUDE.md with the new skill names and collections

**Files:**
- Modify: `CLAUDE.md`

- [ ] **Step 1: Add to the Content Workflow section**

Add `article` to every type list that currently mentions `service`, `guide`, `category`. Add the Articles collection to the collections overview (mention Authors, Tags too). Add the new skill rows to the skills table:

```diff
 | `write` | `/write` | Content generation from research data |
 | `humanize` | `/humanize` | Strip AI writing patterns |
 | `seo-check` | `/seo-check` | SEO audit with scoring |
 | `translate` | `/translate` | Localization to other EU languages |
+| `write-article` | `/write-article` | Article generation from Brief tab |
+| `humanize-article` | `/humanize-article` | De-AI an article |
+| `seo-check-article` | `/seo-check-article` | SEO audit on an article |
+| `translate-article` | `/translate-article` | Translate an article |
```

- [ ] **Step 2: Commit**

```bash
git add CLAUDE.md
git commit -m "docs(claude): document articles collection and article skills"
```

---

### Task 34: Final verification — build, seed, smoke test

- [ ] **Step 1: Build the website**

Run from repo root:

```bash
pnpm --filter website build
```

Expected: build passes with no type errors. If `generateStaticParams` fails because there are no published articles/authors/tags in the DB, either (a) seed the dev DB first via `pnpm --filter website seed:articles` then rebuild, or (b) ensure `generateStaticParams` tolerates empty lists (it does — `flatMap([])` returns `[]`).

- [ ] **Step 2: Seed (if dev DB is being used for the smoke suite)**

```bash
pnpm --filter website seed:articles
```

- [ ] **Step 3: Run the smoke suite**

```bash
pnpm --filter website test:e2e
```

Expected: all routes from sitemap.xml return 200, `/en/feed.xml` and `/nl/feed.xml` return 200 with `application/rss+xml`. If any smoke assertion fails, open the failure's report with `pnpm --filter website exec playwright show-report` and fix before committing the follow-up.

- [ ] **Step 4: Final commit — only if there are tracked changes (e.g. a minor type adjustment surfaced during verification)**

```bash
git status
# if clean, skip the commit
# otherwise:
git add <files>
git commit -m "fix(website): adjust <reason> surfaced during smoke"
```

---

## Self-review notes

Coverage check against the spec:

| Spec section | Task(s) |
|---|---|
| Articles collection | 3 |
| Authors collection | 1 |
| Tags collection | 2 |
| `relatedServices` field on Articles | 3 |
| `seoFields` reused | 3 |
| `versions.drafts` | 3 |
| IndexNow hooks on Articles | 3 |
| MCP endpoints | 5 |
| Five Lexical blocks | 7, 8, 9, 10, 11 |
| BlocksFeature wiring | 12 |
| Inline pill enrichment + renderer | 13, 14 |
| `/articles` listing with filters + pagination | 16 |
| `/articles/[slug]` detail | 17 |
| OpenGraph image | 17 |
| `/articles/authors/[authorSlug]` | 18 |
| `/articles/tags/[tagSlug]` | 19 |
| Global `/feed.xml` | 20 |
| `<link rel="alternate">` RSS discovery | 20 |
| Sitemap entries for articles/authors/tags | 20 |
| Homepage `ArticlesSection` rewire | 21 |
| `RelatedArticles` on service/category/guide pages | 22, 23 |
| Header/footer "Articles" link | 24 |
| i18n keys (`articles.*`, `feed.*`, `common.articlesLabel`) | 25 |
| Remove `home.articlesComingSoon` / `articlesPlaceholderTitle` / `articlesPlaceholderBody` | 25 |
| `/write-article` skill | 26 |
| `/humanize-article` skill | 27 |
| `/seo-check-article` skill | 28 |
| `/translate-article` skill | 29 |
| Bulk skill extensions | 30 |
| `/pipeline` extension | 31 |
| Seed script (1 author, 1 tag, 1 article per locale) | 32 |
| Smoke test for `/feed.xml` | 20 |
| Sitemap auto-coverage for new routes | 20 |
| CLAUDE.md update | 33 |
| Verification | 34 |

Everything in the spec is implemented by at least one task. No placeholders remain. Block and pill component names are consistent across tasks (e.g., `ServiceCardBlock` is used in Task 7 config, Task 12 BlocksFeature wiring, Task 14 converter map, and the Payload block `slug` is `serviceCard` throughout — check by grepping the plan after writing).

One deliberate omission worth noting: the plan does not add per-block visual polish (shapes, colour rotation, hover animations) — that is handed off to `impeccable` per the spec's "Frontend design is out of scope" clause.
