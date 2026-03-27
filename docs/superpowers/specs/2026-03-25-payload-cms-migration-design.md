# Payload CMS Migration Design Spec

**Date:** 2026-03-25
**Status:** Draft
**Scope:** Migrate the website app from git submodule Markdown content to Payload CMS

## Goal

Replace the current file-based content system (git submodule + Markdown + Zod schemas + Fuse.js search) with Payload CMS embedded in the website app, so that non-technical editors can manage content through an admin UI.

## Scope

### In scope
- Categories (8 per locale)
- EU Services (27 per locale)
- Non-EU Services (18 per locale)
- Migration Guides (4 per locale)
- Landing Pages (1 per locale)
- Static Pages (2 per locale)
- Media uploads (service screenshots, guide images)
- Seed script to import existing Markdown content
- Search via Payload queries (interim, before Meilisearch)

### Out of scope
- Business categories and business services (not currently used)
- Other apps (keepfocus, plotty, listy, privnote, kanban, quiz, website-tool)
- Meilisearch integration (future work)
- Translation workflow tooling (side-by-side editor etc.)

## Current System

The `@switch-to-eu/content` package reads Markdown files from a git submodule at `packages/content/content/`. Content is organized by locale (`en/`, `nl/`) with frontmatter validated by Zod schemas. The package exports loader functions (`getServiceBySlug()`, `getAllGuides()`, etc.) consumed by website page components. Search uses Fuse.js with in-memory caching (5-min TTL per locale).

Guides use a custom HTML comment format for sections (`<!-- section:intro -->`, `<!-- step-start -->`, `<!-- step-meta title:"..." -->`) parsed by `extractContentSegments()` and `extractStepsWithMeta()`.

**Content volume:** ~90 consumer content files per locale, 150 total across both locales.

## Target System

Payload CMS 3.x embedded in the website Next.js app, using Postgres (Neon) via `@payloadcms/db-postgres`, with Lexical rich text editor and block-based guide editing.

### Key decisions
- **Payload embedded in website app** (not a separate app) — admin at `/admin`
- **Postgres via Neon** — database URL already configured
- **Local API** for data fetching — no HTTP overhead, type-safe
- **Block-based editor** for guides — steps and sections as visual building blocks
- **Payload's built-in localization** — field-level `localized: true`, locale tables in Postgres
- **next-intl unchanged** — continues to handle UI strings and routing
- **Content submodule kept** — used as seed source, archive for later
- **Server-rendered with caching** — pages use dynamic rendering with `unstable_cache` or Next.js `fetch` cache for performance (see Rendering Strategy below)

## Data Model

### Categories collection

| Field | Type | Localized | Notes |
|-------|------|-----------|-------|
| title | text | yes | |
| description | textarea | yes | |
| icon | text | no | Lucide icon name (e.g. `mail`, `folder`) |
| slug | text | no | Auto-generated from EN title, unique, used in URLs |
| content | richText | yes | Category body text (rendered in category page hero) |

### Services collection

| Field | Type | Localized | Notes |
|-------|------|-----------|-------|
| name | text | yes | |
| slug | text | no | URL-safe, unique |
| category | relationship -> Categories | no | |
| region | select: `eu`, `non-eu`, `eu-friendly` | no | |
| location | text | no | Country |
| freeOption | checkbox | no | |
| startingPrice | text | yes | |
| description | textarea | yes | Short description |
| url | text | no | Service website |
| screenshot | upload -> Media | no | |
| logo | upload -> Media | no | Optional service logo |
| featured | checkbox | no | |
| features | array of text | yes | |
| tags | array of text | no | |
| content | richText (Lexical, blocks) | yes | Main body with section blocks |
| issues | array of text | yes | Non-EU only, privacy concerns |
| recommendedAlternative | relationship -> Services | no | Non-EU only, points to EU service |

**Admin UI:** `issues` and `recommendedAlternative` fields are conditionally displayed when `region` equals `non-eu`, using Payload's `admin.condition` field option.

### Guides collection

| Field | Type | Localized | Notes |
|-------|------|-----------|-------|
| title | text | yes | |
| slug | text | no | |
| category | relationship -> Categories | no | |
| description | textarea | yes | |
| difficulty | select: `beginner`, `intermediate`, `advanced` | no | |
| timeRequired | text | no | e.g. "45 minutes" |
| sourceService | relationship -> Services | no | Non-EU service being migrated from |
| targetService | relationship -> Services | no | EU service being migrated to |
| date | date | no | |
| author | text | no | |
| missingFeatures | array of text | yes | Limitations of target service |
| intro | richText | yes | Introduction section |
| beforeYouStart | richText | yes | Prerequisites section |
| steps | array (Step block) | yes | Ordered migration steps |
| troubleshooting | richText | yes | Common issues and solutions |
| outro | richText | yes | Conclusion section |

**Step block (array item):**

| Field | Type | Localized | Notes |
|-------|------|-----------|-------|
| title | text | yes | Step heading |
| content | richText | yes | Step instructions |
| video | text | no | Optional video URL |
| videoOrientation | select: `landscape`, `portrait` | no | |
| complete | checkbox | no | Used in client-side guide progress tracking (interactive completion markers) |

### Landing Pages collection

| Field | Type | Localized | Notes |
|-------|------|-----------|-------|
| title | text | yes | |
| slug | text | no | |
| description | textarea | yes | |
| keywords | array of text | no | SEO keywords |
| ogTitle | text | yes | |
| ogDescription | text | yes | |
| category | relationship -> Categories | no | |
| recommendedServices | relationship -> Services (hasMany) | no | |
| relatedService | relationship -> Services | no | The non-EU service |
| content | richText | yes | |

### Pages collection (static)

| Field | Type | Localized | Notes |
|-------|------|-----------|-------|
| title | text | yes | |
| slug | text | no | e.g. `privacy`, `terms` |
| content | richText | yes | |

### Media collection (uploads)

| Field | Type | Notes |
|-------|------|-------|
| alt | text (localized) | Accessibility text |
| Standard upload fields | — | Filename, URL, dimensions, MIME type (managed by Payload) |

**Upload config:** Store in local filesystem during development, Vercel Blob (`@payloadcms/storage-vercel-blob`) in production. Requires `BLOB_READ_WRITE_TOKEN` environment variable.

## Architecture

### File Structure

```
apps/website/
  payload.config.ts              # Payload config (db, localization, collections)
  collections/
    Categories.ts
    Services.ts
    Guides.ts
    LandingPages.ts
    Pages.ts
    Media.ts
  seed/
    index.ts                     # Seed script entry point
    importCategories.ts
    importServices.ts
    importGuides.ts
    importLandingPages.ts
    importPages.ts
    importMedia.ts
    markdownToLexical.ts         # Markdown -> Lexical JSON converter
  app/
    (payload)/                   # Payload-managed routes
      admin/
        [[...segments]]/
          page.tsx               # Payload admin panel
        importMap.js             # Payload admin import map (auto-generated)
      api/
        [...slug]/
          route.ts               # Payload REST API
      custom.scss                # Optional admin styling overrides
    (frontend)/                  # Public site (next-intl localized)
      [locale]/
        page.tsx
        services/
          [category]/page.tsx
          eu/[service_name]/page.tsx
          non-eu/[service_name]/page.tsx
        guides/
          [category]/[service]/page.tsx
        pages/[slug]/page.tsx
        search/page.tsx
```

### Route Groups

The app directory splits into two route groups:

- **`(payload)/`** — Payload admin panel and API. Excluded from next-intl middleware. Not affected by `[locale]` routing.
- **`(frontend)/`** — Public-facing pages. Localized via next-intl as today. Content fetched via Payload Local API.

### Payload Configuration

```ts
// apps/website/payload.config.ts
import { buildConfig } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { en } from '@payloadcms/translations/languages/en'
import { nl } from '@payloadcms/translations/languages/nl'

export default buildConfig({
  db: postgresAdapter({
    pool: { connectionString: process.env.DATABASE_URL },
  }),
  editor: lexicalEditor(),
  localization: {
    locales: [
      { label: { en: 'English', nl: 'Engels' }, code: 'en' },
      { label: { en: 'Dutch', nl: 'Nederlands' }, code: 'nl' },
    ],
    defaultLocale: 'en',
    fallback: true,
  },
  i18n: {
    supportedLanguages: { en, nl },
    fallbackLanguage: 'en',
  },
  collections: [
    Categories,
    Services,
    Guides,
    LandingPages,
    Pages,
    Media,
  ],
})
```

### Rendering Strategy

Currently, pages use `generateStaticParams()` reading from the filesystem at build time (full SSG). With Payload as a database source, we switch to **dynamic server rendering with caching**:

- **`generateStaticParams()`** calls are updated to query Payload (async) — still generates static pages at build time
- **Revalidation** via `revalidateTag` or time-based ISR (`next: { revalidate: 3600 }`) so content updates from the admin panel appear without a full rebuild
- **Payload `afterChange` hooks** can call `revalidateTag('services')` etc. to invalidate cached pages on content edits
- Navigation categories (used in layout) are cached aggressively since they rarely change

This gives near-static performance with the ability for editors to see changes within seconds.

### Next.js Config Changes

The current `next.config.ts` plugin chain is `withMDX(withNextIntl(nextConfig))`. After migration:

- **Remove `withMDX`** — Payload uses Lexical, not MDX. MDX may still be needed if non-CMS pages use it; evaluate during implementation
- **Add `withPayload()`** from `@payloadcms/next` — wraps the Next.js config for Payload compatibility
- **Remove content rewrite rules** (`/content/:path*`) — no longer serving files from the submodule
- **Remove content CORS headers** — no longer relevant
- **Remove `output: "standalone"`** — not needed for Vercel deployment, and removing it avoids potential Payload compatibility issues

New plugin chain: `withPayload(withNextIntl(nextConfig))`

### Middleware Changes

The current `proxy.ts` (next-intl middleware) must exclude Payload routes. The existing matcher already excludes `api` and includes a special domain tool route. Amend (not replace) the matcher to also exclude `admin`:

```ts
export const config = {
  matcher: [
    // Existing matchers amended to also exclude /admin
    '/((?!admin|api|_next|_vercel|.*\\..*).*)`,
    // Keep existing domain tool matcher if present
  ],
}
```

Review the final matcher during implementation to ensure all existing routes are preserved.

### Data Flow

1. User visits `/nl/services/eu/proton-mail`
2. next-intl extracts `locale = "nl"` from the URL
3. Server component calls Payload Local API:
   ```ts
   const payload = await getPayload({ config })
   const { docs } = await payload.find({
     collection: 'services',
     where: { slug: { equals: 'proton-mail' }, region: { in: ['eu', 'eu-friendly'] } },
     locale: 'nl',
     depth: 1,
   })
   ```
4. Payload queries Postgres, resolves localized fields to Dutch (falls back to English if missing)
5. Returns typed `Service` object with resolved `category` relationship
6. Component renders rich text via `@payloadcms/richtext-lexical/react`

### Rich Text Rendering

Replace current `parseMarkdown()` + `dangerouslySetInnerHTML` with Payload's Lexical serializer:

```tsx
import { RichText } from '@payloadcms/richtext-lexical/react'

// In component:
<RichText data={service.content} />
```

This handles headings, lists, links, images, and custom blocks — no manual HTML sanitization needed.

## Search (Interim)

Replace Fuse.js with Payload queries. The search API route becomes:

```ts
const [services, guides, categories] = await Promise.all([
  payload.find({
    collection: 'services',
    where: {
      or: [
        { name: { contains: query } },
        { description: { contains: query } },
      ],
    },
    locale,
    limit: 10,
  }),
  payload.find({
    collection: 'guides',
    where: {
      or: [
        { title: { contains: query } },
        { description: { contains: query } },
      ],
    },
    locale,
    limit: 10,
  }),
  payload.find({
    collection: 'categories',
    where: {
      or: [
        { title: { contains: query } },
        { description: { contains: query } },
      ],
    },
    locale,
    limit: 5,
  }),
])
```

No fuzzy matching, but functional for 150 documents. Clean migration path to Meilisearch later via a Payload `afterChange` hook that syncs documents to a Meilisearch index.

The featured search route (`/api/search/featured`) is also replaced with a Payload query filtering on `featured: true`.

## Seed Script

Located at `apps/website/seed/`. Uses the existing `@switch-to-eu/content` package to read Markdown files and imports them into Payload.

### Process

1. Read all Markdown files from `packages/content/content/` using existing loaders
2. Parse frontmatter with existing Zod schemas
3. For guides: extract sections using `extractContentSegments()` and steps using `extractStepsWithMeta()`
4. Convert Markdown body content to Lexical rich text JSON format (via `markdownToLexical.ts` utility)
5. Upload screenshots to Media collection
6. Call `payload.create()` for each document, per locale
7. Resolve relationships (e.g. service -> category, guide -> sourceService/targetService) by slug lookup

### Execution

```bash
pnpm --filter website seed        # Run seed script
pnpm --filter website seed:reset  # Clear DB and re-seed
```

### Markdown to Lexical conversion

The `markdownToLexical.ts` utility converts Markdown strings to Payload's Lexical editor JSON format. This handles:
- Headings, paragraphs, lists, links, bold/italic
- Images (uploaded to Media collection, replaced with Lexical image nodes)
- Code blocks
- Blockquotes (used for notes/tips in guides)

Payload provides `@payloadcms/richtext-lexical` utilities for this, or we can use a markdown-to-lexical library.

## What Changes

### Removed from website app
- All `@switch-to-eu/content` imports in page components
- `parseMarkdown()` calls and `dangerouslySetInnerHTML` usage
- Fuse.js search implementation (`/api/search` and `/api/search/featured` routes rewritten)
- Content segment extraction logic in page components
- `withMDX` from next.config plugin chain (if no longer needed)
- Content file rewrite rules and CORS headers from next.config

### Kept
- `@switch-to-eu/content` package — stays in monorepo, used by seed script
- Content git submodule — stays as seed source and archive
- next-intl — unchanged for UI strings, routing, `Link`, `useTranslations`
- `packages/i18n/messages/` — UI translations unchanged
- All public URL structures — no URL changes for end users
- All other apps — completely unaffected
- `alternatives.ts` loader in content package — appears to be a legacy format now superseded by individual service files; not migrated, not removed

### Added
- `payload` + `@payloadcms/db-postgres` + `@payloadcms/richtext-lexical` dependencies
- `@payloadcms/next` — Next.js integration (`withPayload()` config wrapper, route handlers)
- `@payloadcms/storage-vercel-blob` — production media storage
- `payload.config.ts` and 6 collection definitions
- `(payload)/` route group with admin panel and API routes
- Seed script with Markdown-to-Lexical converter
- Payload database migrations (managed by `payload migrate`)
- `PAYLOAD_SECRET` and `BLOB_READ_WRITE_TOKEN` environment variables

### Files requiring migration (full surface area)

**Page routes** (content fetching + rendering):
- `app/[locale]/page.tsx` — homepage (categories)
- `app/[locale]/services/[category]/page.tsx` — category page
- `app/[locale]/services/eu/[service_name]/page.tsx` — EU service detail
- `app/[locale]/services/non-eu/[service_name]/page.tsx` — non-EU service detail (if exists, or shared)
- `app/[locale]/guides/[category]/[service]/page.tsx` — guide detail
- `app/[locale]/pages/[slug]/page.tsx` — landing pages
- `app/[locale]/privacy/page.tsx` — privacy page (dedicated route, fetches from Pages collection)
- `app/[locale]/terms/page.tsx` — terms page (dedicated route, fetches from Pages collection)
- `app/[locale]/search/page.tsx` — search page

**API routes:**
- `app/api/search/route.ts` — main search
- `app/api/search/featured/route.ts` — featured services

**Components:**
- `components/SearchInput.tsx` — uses `SearchResult` type from content package
- `components/InlineSearchInput.tsx` — same
- `components/ui/ServiceCard.tsx` — renders service data
- `components/ui/RecommendedAlternative.tsx` — renders alternative suggestion
- `components/guides/GuideStep.tsx` — renders guide steps with completion markers
- `components/navigation/nav-items.ts` — imports `getAllCategoriesMetadata` for nav menu

**Other:**
- `app/sitemap.ts` — imports from content package, must use Payload queries
- `next.config.ts` — plugin chain and rewrite rules
- `proxy.ts` — middleware matcher amendment

## Dependencies

### New packages for website app
- `payload` — core CMS
- `@payloadcms/next` — Next.js integration
- `@payloadcms/db-postgres` — Neon/Postgres adapter
- `@payloadcms/richtext-lexical` — Lexical editor + renderer
- `@payloadcms/translations` — admin panel translations (en, nl)

### Environment variables
- `DATABASE_URL` — Neon Postgres connection string (already configured)
- `PAYLOAD_SECRET` — secret key for Payload auth (new, required)

## Localization Strategy

### Two systems, clear separation

| Concern | Handled by | Where |
|---------|-----------|-------|
| CMS content (services, guides, etc.) | Payload localization | Postgres `_locales` tables |
| UI strings (buttons, navigation, labels) | next-intl | `packages/i18n/messages/` JSON files |
| URL routing (`/en/...`, `/nl/...`) | next-intl middleware | `proxy.ts` |
| Admin panel UI language | Payload i18n | Built-in translations |

### Field-level localization

Fields marked `localized: true`: title, name, description, content, features, issues, startingPrice, ogTitle, ogDescription, step titles, step content, missingFeatures, media alt text.

Fields shared across locales: slug, url, icon, region, location, freeOption, featured, tags, video URLs, difficulty, timeRequired, date, author, all relationships.

### Locale mapping

next-intl locale codes (`en`, `nl`) map directly to Payload locale codes — no translation needed. The `[locale]` URL parameter passes straight through to `payload.find({ locale })`.

### Fallback behavior

`fallback: true` in Payload config means if a Dutch field value is missing, the English value is returned. This allows editors to publish English content first and add Dutch translations incrementally.

## Migration Path to Meilisearch (future)

When ready to add Meilisearch:

1. Add a Payload `afterChange` hook on Services, Guides, Categories collections
2. Hook syncs document data to a Meilisearch index on every create/update/delete
3. Replace the Payload query-based search with Meilisearch client calls
4. Gains: fuzzy matching, typo tolerance, faceted filtering, sub-millisecond results
5. The search API route interface stays the same — only the implementation changes

## Testing Strategy

- **E2E smoke tests** — existing Playwright tests should pass after migration with minimal changes (URLs stay the same). Tests may need a seeded database instead of relying on filesystem content. Run the seed script as part of the `webServer.command` in Playwright config.
- **Seed script tests** — verify all 150 content files import correctly, spot-check key fields and relationships
- **Manual QA** — compare rendered pages before/after migration, especially guides with steps/videos and services with comparison sections
- **Payload admin** — manual verification that editors can create/edit/publish content in both locales

## Risks and Mitigations

| Risk | Mitigation |
|------|-----------|
| Markdown-to-Lexical conversion loses formatting | Test with all content types, manual review of converted content |
| Payload admin adds significant bundle size to website | `(payload)` route group is separate — admin JS only loaded on `/admin` routes |
| next-intl and Payload middleware conflict | Explicit matcher exclusion for `/admin` and `/api` routes |
| Database schema changes break production | Payload migration system manages schema changes safely |
| Editors accidentally break content | Payload has drafts and versions — enable `versions: { drafts: true }` on collections |
| Seed script doesn't fully reproduce content | Keep submodule as reference, manual QA after seeding |
| Removing `output: "standalone"` changes deploy behavior | Not needed for Vercel; simplifies Payload integration |
| Navigation becomes async DB call on every page | Cache category list aggressively with `unstable_cache` or ISR |
