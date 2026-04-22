# Articles section design spec

**Date:** 2026-04-21
**Status:** Approved design (spec phase) — implementation plan to follow.
**Owner:** Simon
**Frontend visual design:** deferred to the `impeccable` skill pass after scaffold is in place. This spec defines structure and contracts, not styling.

---

## Overview

Add an Articles section to switch-to.eu. Articles are mixed-type editorial content (opinion, roundup, news, deep-dive) that can easily **link to and embed** services, guides, and categories. They integrate into the existing Payload CMS, i18n, IndexNow, and content-pipeline AI skill stack.

The homepage already contains an `ArticlesSection` placeholder ("Coming Soon" cards). This spec replaces the placeholder with real content.

## Goals

- First-class support for **inline links to internal content** (services, guides, categories) that render as enriched pills within prose.
- First-class support for **structural mid-article embeds** via custom Lexical blocks (service card, comparison, guide CTA, category grid, callout).
- Bilingual (`en` + `nl`) at launch, same localization workflow as other collections.
- Full AI content pipeline (`write`, `humanize`, `seo-check`, `translate` + bulk variants) mirroring Services/Guides/Categories.
- Cross-surface articles on existing Service / Category / Guide detail pages so editorial content reinforces the directory.
- Add a **global site RSS feed** combining articles and guides, per-locale. Services/categories/pages stay out of the feed.
- Reuse every existing platform convention: Payload `versions.drafts`, `revalidateTag`, IndexNow afterChange/afterDelete hooks, `seoFields`, localized fields, Payload MCP-driven admin tooling.

## Non-goals (out of scope)

- Comments, reactions, likes.
- Article series / multi-part structure.
- Per-type or per-author RSS feeds (only the site-wide global feed ships).
- Table-of-contents block (YAGNI until a deep-dive exceeds 2,500 words).
- Search integration for articles (defer until Fuse.js cache or a replacement supports it).
- `/research-article` skill — articles are voice-driven; the human fills the Brief.
- Newsletter delivery tied to individual articles.
- Social share buttons (rely on OG image + URL).
- Frontend visual design polish — deferred to impeccable.

---

## Data model

Three new Payload collections plus one additive field on the existing pattern.

### `Articles` collection

All fields follow existing Guides/Pages conventions where applicable (`seoFields`, `versions: { drafts: true }`, IndexNow hooks on afterChange/afterDelete, `revalidateTag("articles")`).

**Sidebar fields**

| Field | Type | Notes |
|---|---|---|
| `slug` | text, required, unique | English-only, matches Guides/Services convention. |
| `type` | select, required | `opinion` / `roundup` / `news` / `deep-dive`. |
| `publishedAt` | date | Used for sort order and display. Separate from Payload `createdAt`. |
| `featuredOnHomepage` | checkbox, default false | Pins article to homepage ArticlesSection position 1. Same pattern as Guides. |
| `contentPipelineStatus` | select | `not-started` → `in-progress` → `written` → `humanized` → `seo-checked` → `translated` → `complete`. Identical to Guides. |

**General tab**

| Field | Type | Notes |
|---|---|---|
| `title` | text, required, localized | |
| `excerpt` | textarea, required, localized | 140–200 chars. Used in cards, lists, OG description. |
| `authors` | relationship, `hasMany: true` → `authors`, required | Supports co-bylines. |
| `category` | relationship → `categories`, optional | Shared with services/guides. Omit for meta-topics (policy, news). |
| `tags` | relationship, `hasMany: true` → `tags` | |
| `heroImage` | upload → `media`, required | Used in hero, cards, OG image. |
| `readingTime` | number, required | Minutes. Manually set by editor. |
| `relatedServices` | relationship, `hasMany: true` → `services` | Powers cross-surfacing on service/guide pages. Also consumed by `/write-article` to ground generation. |

**Brief tab** (input to `/write-article`)

| Field | Type | Notes |
|---|---|---|
| `angle` | textarea, localized | "What's the point of view / argument / conclusion?" |
| `keyPoints` | array of `{ point: text (localized) }` | 3–7 bullets the article must hit. |
| `targetAudience` | select | `curious-generalist` / `motivated-switcher` / `sovereignty-advocate` (matches design-context audiences). |
| `sources` | array of `{ url: text, notes: textarea }` | |
| `outlineNotes` | textarea, localized, optional | |

**Content tab**

| Field | Type | Notes |
|---|---|---|
| `body` | richText (Lexical), required, localized | With `BlocksFeature` enabled, five custom blocks (below). |

**SEO tab** — existing `seoFields`.

**Hooks & admin**

- `afterChange`: `revalidateTag("articles")`, `pingIndexNowIfPublished`, stale-URL ping on slug/status change (same pattern as Pages).
- `afterDelete`: IndexNow submit for deleted URLs.
- `admin.preview`: previews `/articles/[slug]` in draft.

### `Authors` collection

No drafts versioning (authors are metadata).

| Field | Type | Notes |
|---|---|---|
| `name` | text, required | |
| `slug` | text, required, unique | English. |
| `bio` | textarea, localized | |
| `avatar` | upload → `media` | |
| `role` | text, optional | "Editor", "Contributor". |
| `socials` | array of `{ platform: select, url: text }` | Platforms: `website`, `mastodon`, `bluesky`, `linkedin`, `github`, `x`. |
| `email` | text, optional | Not displayed publicly. |

### `Tags` collection

No drafts versioning.

| Field | Type | Notes |
|---|---|---|
| `slug` | text, required, unique | English. |
| `name` | text, required, localized | |
| `description` | textarea, localized, optional | Shown on `/articles/tags/[slug]` page. |

### Additive change — none on existing collections

`relatedServices` lives on Articles, not Services. No schema changes to Services, Guides, Categories, Pages.

---

## Embeds: blocks + inline link enrichment

### Five custom blocks in the Articles `body` field

Registered via Payload Lexical `BlocksFeature`. Each block has a Payload block config (fields) and a React renderer component on the frontend.

**1. `ServiceCardBlock`**

- Fields: `service` (relationship → services, required), `blurb` (textarea, localized, optional override for service.description)
- Renders: card with service icon, name, region badge (EU / non-EU / EU-friendly), blurb, CTA link to `/services/[category]/[region]/[slug]`.

**2. `ServiceComparisonBlock`**

- Fields: `services` (relationship `hasMany: true`, min 2, max 4), `heading` (text, localized, optional), `comparisonFields` (select `hasMany`: `price`, `hosting`, `encryption`, `open-source`, `region`)
- Renders: side-by-side columns with icon + name header, selected feature rows beneath, consistent height across columns.

**3. `GuideCtaBlock`**

- Fields: `guide` (relationship → guides, required), `variant` (select: `inline`, `prominent`)
- Renders: card showing sourceService → targetService arrow, difficulty badge, time required, "Read the full guide" link to `/guides/[category]/[slug]`.

**4. `CategoryGridBlock`**

- Fields: `category` (relationship → categories, required), `limit` (number, default 6), `region` (select: `eu`, `any`, default `eu`)
- Renders: responsive grid of service cards filtered by category + region, sorted by `featured` desc then `-createdAt`.

**5. `CalloutBlock`**

- Fields: `variant` (select: `info`, `warning`, `worth-knowing`, `quote`, `tldr`), `content` (richText, localized, required), `attribution` (text, optional, used by `quote` variant)
- Renders: styled callout with icon + coloured border/background per variant.

### Inline pill enrichment (link node behaviour, not a block)

Payload's Link feature supports internal document references. Frontend renderer (`LexicalBody` component) inspects each link's `doc` target:

- `services` → render `<ServicePill service={doc} />` (inline pill: icon + name + EU/non-EU flag dot, coloured by region).
- `guides` → render `<GuidePill guide={doc} />` (pill with guide marker + title).
- `categories` → render `<CategoryPill category={doc} />` (pill with category colour dot + title).
- Any other internal or external link → standard `<a>` with project link styling.

Writing ergonomics: author selects "Internal link", picks a service/guide/category from the autocomplete picker — rendering automatically swaps to pill form. No custom Lexical node needed.

---

## Routes and surfacing

All routes under `/[locale]/articles`.

| Route | Purpose |
|---|---|
| `/articles` | Listing page. All published articles, newest first by `publishedAt`. Filter chips: `type`, `category`, `tag`. Pagination 12 per page via `?page=`. |
| `/articles/[slug]` | Article detail. Follows existing route conventions: `generateStaticParams`, `generateMetadata`, `generateLanguageAlternates`, `opengraph-image.tsx`. |
| `/articles/authors/[authorSlug]` | Author page: bio, avatar, socials, articles by this author newest-first. |
| `/articles/tags/[tagSlug]` | Tag page: tag description + articles carrying that tag. |

No `/articles/types/[type]` or `/articles/categories/[cat]` routes — those are query-param filters on `/articles` (`?type=opinion&category=email`). Keeps route count down; SEO value of dedicated type/category pages is marginal when `/services/[category]` already does the heavy lifting.

### Global RSS feed (site-wide, not articles-specific)

A single `/feed.xml` route per locale (`/[locale]/feed.xml`) combining **articles and guides**. Articles and guides are both authored editorial output; services/categories/pages are directory/marketing content and do not belong in a feed.

- **Volume:** 20 most-recent published items across both collections, merged and sorted by `publishedAt` (articles) / `date` (guides), descending.
- **Content type:** RSS 2.0 with `application/rss+xml; charset=utf-8`.
- **Item differentiation:** each `<item>` includes a `<category>` element — `article/<type>` (e.g. `article/opinion`) or `guide` — so readers and aggregators can filter by type if desired.
- **Discovery:** `<link rel="alternate" type="application/rss+xml" href="/[locale]/feed.xml">` in the root layout head for both locales.
- **Per-locale:** `/en/feed.xml` and `/nl/feed.xml` contain only content published in that locale.
- **Implementation:** standalone feed-builder module queries both collections via the Payload client; reused across locales. Not part of the articles routes.

### Homepage integration

Replace the current placeholder `ArticlesSection` (3 "Coming Soon" cards) with a real data-driven version:

1. If any article has `featuredOnHomepage: true` → pin to position 1.
2. Fill remaining slots with most-recent published articles (`-publishedAt`) in the active locale.
3. Total: 3 cards.
4. If fewer than 3 published articles exist in the active locale, the `ArticlesSection` does not render.

### Cross-surfacing on existing detail pages

Add a small "Related articles" section (limit 3, newest first) to:

| Page | Query |
|---|---|
| Service detail (`/services/[cat]/[region]/[service]`) | Articles where `relatedServices` contains this service. |
| Category page (`/services/[category]`) | Articles where `category` equals this category. |
| Guide detail (`/guides/[cat]/[service]`) | Articles where `relatedServices` contains either the guide's `sourceService` or `targetService`. |

Hides the section entirely when the query returns zero results.

### Header / footer navigation

- Header: "Articles" link between "Guides" and "About".
- Footer: "Articles" under the "Explore" column.

---

## Editorial workflow and AI pipeline skills

### Draft / publish

Articles enter as `_status: "draft"`. AI skills update draft content only. Editor reviews in Payload admin and clicks Publish. Same convention as every other collection — nothing publishes automatically.

### New skills (mirroring existing Service/Guide/Category skills)

| Skill | Purpose |
|---|---|
| `/write-article "Title"` | Reads Brief + relatedServices, generates Lexical body with blocks + inline pills. Saves as draft. Sets `contentPipelineStatus: written`. |
| `/humanize-article "slug"` | Two-pass AI-pattern removal on body + excerpt. Status → `humanized`. Preserves block nodes and inline pills untouched. |
| `/seo-check-article "slug"` | 10-point SEO audit, stores `seoScore` and `seoNotes`. Article-specific checks: `heroImage` present, excerpt length 140–200 chars, at least one internal pill or block. Status → `seo-checked`. |
| `/translate-article "slug" nl` | Translates every localized field (title, excerpt, body, Brief fields, authors' bios stay untouched). Status → `translated`. |
| `/bulk-write article …` | Parallel `/write-article` via subagents. |
| `/bulk-humanize article …` | Parallel `/humanize-article`. |
| `/bulk-seo-check article …` | Parallel `/seo-check-article`. |
| `/bulk-translate article … nl` | Parallel `/translate-article`. |
| `/pipeline article "slug"` | Runs write → humanize → seo-check sequentially. Existing `/pipeline` skill extended to accept `article` as an item type. |

All skills follow the existing `.claude/skills/` convention, live alongside the Service/Guide/Category variants, and reuse the `informational-copy` tone skill as an auto-invoked dependency.

### Payload MCP

Payload MCP auto-generates schemas for each collection. No bespoke wiring. After adding the collections, regenerate and the following tools are available to skills:

- `mcp__Payload__findArticles`, `createArticles`, `updateArticles`, `deleteArticles`
- `mcp__Payload__findAuthors`, `createAuthors`, `updateAuthors`, `deleteAuthors`
- `mcp__Payload__findTags`, `createTags`, `updateTags`, `deleteTags`

### Tone-of-voice integration

The `informational-copy` skill already encodes the "knowledgeable friend, specific, acknowledge trade-offs" rules. Article skills auto-invoke it. `CalloutBlock` with `variant: worth-knowing` is the canonical UI surface for acknowledging trade-offs — the humanize pass encourages its use where claims need hedging.

---

## i18n

Locales: `en` (default), `nl` — same as the rest of the site.

### Localized Payload fields

- Articles: `title`, `excerpt`, `body`, all Brief fields except `sources` URLs, `heroImage.alt`.
- Authors: `bio`.
- Tags: `name`, `description`.

### Message keys (new) in `packages/i18n/messages/website/{en,nl}.json`

Under a new `articles.*` namespace:

- `articles.pageTitle`, `articles.pageDescription`, `articles.readingTime`, `articles.publishedOn`, `articles.writtenBy`, `articles.readMore`, `articles.relatedArticles`, `articles.filterByType`, `articles.filterByCategory`, `articles.filterByTag`, `articles.clearFilters`, `articles.empty`, `articles.loadMore`
- `articles.types.opinion`, `articles.types.roundup`, `articles.types.news`, `articles.types.deepDive`
- `articles.author.pageTitle`, `articles.author.articlesBy`, `articles.author.readAll`
- `articles.tag.pageTitle`, `articles.tag.taggedWith`


New `feed.*` namespace (global feed, not articles-specific):

- `feed.title`, `feed.description`

### Updated home keys

- `home.articlesSectionTitle` — keep, tighten copy.
- `home.articlesSectionIntro` — keep, tighten copy.
- `home.articlesComingSoon`, `home.articlesPlaceholderTitle`, `home.articlesPlaceholderBody` — remove (placeholders no longer render).

Slugs stay English-only across locales, consistent with Services/Guides.

---

## Testing

Extends `apps/website/e2e/smoke.spec.ts` with new entries in the `en` + `nl` loop:

- `/articles`
- `/articles/[seeded-slug]`
- `/articles/authors/[seeded-author-slug]`
- `/articles/tags/[seeded-tag-slug]`
- `/feed.xml` — asserts status 200, `content-type` starts with `application/rss+xml`, body contains at least one `<item>` referencing the seeded article and at least one referencing the seeded guide.

Seed file (`apps/website/seed/`) gets one article per locale that uses **every** block type and an inline service pill, an inline guide pill, and an inline category pill. This gives the smoke test meaningful coverage of the renderer.

No new Vitest tests — the website app doesn't run Vitest (per `CLAUDE.md`, only the tRPC apps do).

---

## Implementation phasing

Ordered for incremental review checkpoints. Each phase is independently reviewable.

1. **Collections and types.** Add `Articles`, `Authors`, `Tags` collections. Run Payload type generation. Verify MCP tool schemas surface.
2. **Blocks and inline-pill renderer.** Register 5 blocks on the Articles `body` field. Build renderer components. Build `ServicePill`, `GuidePill`, `CategoryPill`. Wire `LexicalBody` component that walks the serialized editor state, resolves link nodes, and delegates blocks.
3. **Routes.** Build `/articles`, `/articles/[slug]`, `/articles/authors/[authorSlug]`, `/articles/tags/[tagSlug]` with `generateStaticParams`, `generateMetadata`, `opengraph-image.tsx`, language alternates. Build global `/feed.xml` route (feed-builder module querying articles + guides) and add `rel="alternate"` discovery link in the root layout.
4. **Homepage and cross-surfacing.** Replace ArticlesSection with real-data version. Add "Related articles" sections to service/category/guide detail pages.
5. **Navigation and i18n keys.** Add header/footer links, add + translate message keys in `en.json` and `nl.json`.
6. **Pipeline skills.** Add `.claude/skills/write-article`, `humanize-article`, `seo-check-article`, `translate-article`. Add bulk variants. Extend `/pipeline` to accept `article`.
7. **Seed + smoke tests.** Seed one article per locale exercising every block + pill type. Extend smoke tests. Verify full build passes.
8. **Handoff to impeccable.** Scaffold pages ship with semantic HTML + minimal Tailwind. Impeccable skill pass applies brand typography, colour rotation, shapes, micro-interactions, and polish.

---

## Open questions (none blocking)

None — all design decisions closed during brainstorming. Any implementation-level choices (specific Tailwind classes, shape selections, animation timings) are deferred to the impeccable pass by design.
