# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Switch-to.eu is a platform helping users switch from non-EU digital services to EU alternatives. It provides migration guides, EU alternative listings, and a domain analyzer tool.

## Commands

```bash
pnpm install          # Install all dependencies
pnpm dev              # Dev server for all apps (Turborepo, persistent)
pnpm build            # Build all apps/packages (respects dependency graph)
pnpm lint             # Lint all apps/packages

# Per-app (run from app directory or use --filter)
pnpm --filter website dev
pnpm --filter website build
pnpm --filter keepfocus dev
pnpm --filter @switch-to-eu/plotty dev
```

```bash
# E2E smoke tests (website app)
pnpm --filter website test:e2e      # Run all Playwright smoke tests
pnpm --filter website test:e2e:ui   # Open Playwright UI for debugging
```

## Testing

Every app should have **two layers of tests**:

### 1. Playwright E2E Smoke Tests

Verify all pages render without errors in a production build. Each app has its own `playwright.config.ts` and `e2e/smoke.spec.ts`.

```bash
pnpm --filter website test:e2e           # website (port 3000)
pnpm --filter @switch-to-eu/plotty test:e2e   # plotty (port 3042)
pnpm --filter @switch-to-eu/listy test:e2e    # listy (port 5014)
pnpm --filter @switch-to-eu/privnote test:e2e # privnote (port 5016)
```

**Pattern** — every smoke test file follows this structure:
- Helper `expectPageOk(page, urlPath)` that checks status 200, no error overlay, body visible
- Loop over `locales = ["en", "nl"]` and test each page in both locales
- Config: `webServer.command` builds + serves the production app on the app's port

### 2. Vitest Unit Tests

```bash
pnpm --filter @switch-to-eu/keepfocus test    # keepfocus (component + timer tests)
pnpm --filter @switch-to-eu/plotty test       # plotty (tRPC router tests)
pnpm --filter @switch-to-eu/listy test        # listy (tRPC router tests)
pnpm --filter @switch-to-eu/privnote test    # privnote (tRPC router tests)
```

**tRPC router tests** (plotty, listy, privnote) use a shared in-memory Redis mock at `@switch-to-eu/db/mock-redis`. Pattern:

1. Import `MockRedis` from `@switch-to-eu/db/mock-redis`
2. Mock the redis module: `vi.mock("@switch-to-eu/db/redis", () => ({ getRedis: async () => mockRedis, getRedisSubscriber: async () => mockRedis }))`
3. Import the app's `createCaller` **after** mocks are set up (top-level await)
4. Create a caller with `createCaller({ redis: mockRedis as never, headers: new Headers() })`
5. Use `mockRedis._clear()` in `beforeEach` to reset state between tests
6. Seed data directly via `mockRedis.hSet()` / `mockRedis.sAdd()` for read/update/delete tests

Each app's vitest config lives at `apps/{app}/vitest.config.ts` with `environment: "node"` and path aliases matching `tsconfig.json`.

### 3. Testcontainers Integration Tests

For testing real Redis behavior (TTL, key deletion, hGetAll), use Testcontainers to spin up a real Redis container in Docker.

```bash
pnpm --filter @switch-to-eu/listy test:integration     # listy (requires Docker)
pnpm --filter @switch-to-eu/privnote test:integration  # privnote (requires Docker)
```

**Shared helper** at `@switch-to-eu/db/test-redis` provides `setupRedisContainer()`, `teardownRedisContainer()`, and `getTestRedisUrl()`. Pattern:

1. `beforeAll`: call `setupRedisContainer()` (sets `process.env.REDIS_URL`), then dynamically import the router module
2. Create a separate `redis` client via `createClient({ url: getTestRedisUrl() })` for direct assertions
3. `afterEach`: `redis.flushAll()` to reset between tests
4. `afterAll`: quit the client and call `teardownRedisContainer()`

Integration tests live in `__tests__/**/*.integration.test.ts` and are excluded from the default `vitest.config.ts`. A separate `vitest.integration.config.ts` includes only `*.integration.test.ts` with longer timeouts (`testTimeout: 30s`, `hookTimeout: 60s`).

**When to use each**: Use MockRedis for fast unit tests (CI, TDD). Use Testcontainers for verifying real Redis behavior (TTL, key expiration, concurrent access). Both should be maintained side by side.

## Monorepo Architecture

**Package manager:** pnpm with workspaces. **Build orchestration:** Turborepo.

```
apps/
  website/        # Main switch-to.eu site (Next.js 16, App Router)
  keepfocus/      # Pomodoro timer app (Next.js 16, App Router)
  plotty/         # Poll/voting app (Next.js 16, App Router, tRPC + Redis)
  listy/          # Shared lists app (Next.js 16, App Router, tRPC + Redis)
  privnote/       # Self-destructing notes app (Next.js 16, App Router, tRPC + Redis, E2E encryption)
packages/
  ui/             # Atomic UI components (shadcn/ui new-york style, Radix primitives)
  i18n/           # Shared i18n layer (next-intl v4)
  blocks/         # Page-level shared components (Header, Footer, LanguageSelector)
  knowledge/      # Knowledge graph index script (pnpm knowledge:index)
  db/             # Shared database utilities (Redis client, crypto, admin tokens, expiration, mock-redis for tests, test-redis for Testcontainers)
  trpc/           # Shared tRPC v11 infrastructure (used by plotty, listy, privnote — NOT by website or keepfocus)
  eslint-config/  # Shared ESLint 9 flat configs
  typescript-config/ # Shared tsconfig bases
```

All internal packages use the `@switch-to-eu/` scope. Shared dependency versions are pinned via pnpm catalog in `pnpm-workspace.yaml`.

**Dependency hierarchy:** `blocks` depends on `ui` + `i18n`. All apps depend on `ui`, `i18n`, and `blocks`. The website does NOT use tRPC — it uses direct API routes. Plotty, Listy, and Privnote use `@switch-to-eu/trpc` + `@switch-to-eu/db` with Redis as their data store.

## Key Non-Obvious Details

**Middleware file is `proxy.ts`**, not `middleware.ts`. The next-intl middleware entry point for both apps is named `proxy.ts`.

**Content lives in markdown files in `content/`** at the repo root (no CMS, no database). Layout: `content/<collection>/<slug>/en.md` (all fields in YAML frontmatter, body = main content) plus an optional `nl.md` holding only the localized fields that differ and the translated body. Collections: `services`, `guides`, `categories`, `landing-pages`, `pages`. Relations are slugs (`category: email`, `recommendedAlternative: proton-mail`). Guide bodies use `<!-- section:name -->` / `<!-- step-start -->` markers. Services have a `region` field: `"eu"`, `"non-eu"`, or `"eu-friendly"`. Full format reference: `.claude/skills/_shared/content-files.md`.

**Content loader** is `apps/website/lib/content/loader.ts` (types in `lib/content/types.ts`). It parses everything once per process (re-reads on every request in `next dev`) and resolves relations to objects. `lib/services.ts` wraps it with the query helpers pages use. Markdown is rendered by `components/rich-text.tsx` via `marked` (`lib/markdown.ts`). Service screenshots live in `apps/website/public/images/services/`. Guide videos are too big for git and stay on Vercel Blob (absolute URLs in step meta).

**Next.js plugin chain** in `apps/website/next.config.ts`: `withNextIntl(nextConfig)`. `outputFileTracingIncludes` ships `content/**/*.md` with the server bundle. Output mode is `standalone`. Workspace packages are in `transpilePackages`.

**`global.ts` at repo root** is a next-intl type declaration that augments the `Messages` type — it is not a general utilities file.

**CSS imports chain:** Apps import global styles from `@switch-to-eu/ui/styles/globals.css`. The website's `postcss.config.mjs` re-exports from the UI package.

## i18n

Locales: `en` (default), `nl`. Managed by `@switch-to-eu/i18n` package using next-intl v4.

- **Routing/navigation:** Import `Link`, `redirect`, `usePathname`, `useRouter` from `@switch-to-eu/i18n/navigation` (not from `next/link`)
- **Messages:** Located in `packages/i18n/messages/{appName}/{locale}.json` merged with `shared/{locale}.json`
- **Request config:** Apps use `createRequestConfig("website")`, `createRequestConfig("keepfocus")`, `createRequestConfig("plotty")`, `createRequestConfig("privnote")`, etc. from `@switch-to-eu/i18n/request`
- All routes are under `[locale]` dynamic segment

## Content Workflow (AI-Assisted)

The site uses custom Claude Code skills that read and write the markdown files in `content/` for a research-to-publish pipeline. New content enters with `draft: true` and requires human review (the git diff / PR) before publishing.

### Single-Item Pipeline

```
/research "ServiceName"     → Fills research fields in content/services/<slug>/en.md
/write service "ServiceName" → Writes listing from research data
/humanize service "ServiceName" → Strips AI writing patterns
/seo-check service "ServiceName" → 10-point audit, stores seoScore/seoNotes in frontmatter
→ Editor reviews the diff, removes draft: true, merges
/translate service "ServiceName" nl → Writes nl.md
→ Editor reviews Dutch version, merges
```

For guides:
```
/write guide "Gmail" to "ProtonMail" → Creates migration guide from research
/humanize guide "gmail-to-protonmail"
/seo-check guide "gmail-to-protonmail"
→ Review + publish
/translate guide "gmail-to-protonmail" nl
→ Review Dutch + publish
```

### Bulk Pipeline (Parallel Agents)

```
/bulk-research all                      → Research all unresearched services in parallel
/bulk-write service all                 → Write content for all researched services in parallel
/bulk-humanize service all              → Humanize all services with content in parallel
/bulk-seo-check service all             → SEO audit all services in parallel
/bulk-translate service all nl          → Translate all services to Dutch in parallel
/pipeline service all                   → Run write→humanize→seo-check per service (parallel across items)
```

Bulk skills accept: specific names (comma-separated), `all`, `unresearched`/`unwritten`/`unchecked`, `category <name>`. Each dispatches one subagent per item using the Agent tool with `run_in_background: true`. Max 10 parallel agents per batch.

### Content Pipeline Status

Services and Guides have a `contentPipelineStatus` frontmatter field tracking progress: `not-started` → `in-progress` → `written` → `humanized` → `seo-checked` → `translated` → `complete`. The `/pipeline` skill updates this automatically. Useful for filtering items that need the next step.

### Skills (`.claude/skills/`)

| Skill | Type | Purpose |
|-------|------|---------|
| `informational-copy` | Auto-invoked | Tone of voice: direct, honest, specific, no marketing fluff |
| `research` | `/research` | Vendor site + Reddit sentiment + recent news → research fields in the service's en.md |
| `write` | `/write` | Content generation from research data |
| `humanize` | `/humanize` | Strip AI writing patterns |
| `seo-check` | `/seo-check` | Pre-publish 12-point QA checklist (scored 0-100) |
| `seo-audit` | `/seo-audit` | Post-publish performance analysis — GSC + Jina SERP + live page → `docs/seo/audits/` |
| `opportunity-finder` | `/opportunity-finder` | Mine GSC + Reddit + Jina SERP for content backlog → `docs/seo/opportunities/` |
| `translate` | `/translate` | Localization to other EU languages |
| `bulk-research` | `/bulk-research` | Parallel research via subagents |
| `bulk-write` | `/bulk-write` | Parallel content writing via subagents |
| `bulk-humanize` | `/bulk-humanize` | Parallel humanization via subagents |
| `bulk-seo-check` | `/bulk-seo-check` | Parallel SEO audits via subagents |
| `bulk-translate` | `/bulk-translate` | Parallel translation via subagents |
| `pipeline` | `/pipeline` | Combined write→humanize→seo-check (sequential per item, parallel across items) |
| `content-link-edit` | `/content-link-edit` | Swap a URL across all content files (both locales) |

**`seo-check` vs `seo-audit`** — they coexist and address different points in the content lifecycle. `seo-check` is the pre-publish QA gate (12-point checklist, no live data). `seo-audit` is the post-publish performance analysis (GSC, live page, real rankings → rewrite plan in `docs/seo/audits/<collection>-<slug>.md`).

**`opportunity-finder`** is upstream of the authoring pipeline — it generates the backlog of what to write next. Entries are files in `docs/seo/opportunities/`; set `status: rejected` on false positives so dedup behaves on re-runs.

### News pipeline and knowledge base

One AI-researched news article per weekday, EU focus, researched and written in English. Articles live in `content/articles/<slug>/{en,nl,fr}.md` and are served at `/[locale]/news/<slug>` (index at `/[locale]/news`, RSS at `/[locale]/news/feed.xml`). Unlike other collections, **each locale file is a full translation with its own `draft` flag**: English is approved by the owner, then `/translate article <slug> nl` (owner re-reads), then `fr` (AI only, stored but not served until `fr` becomes a site locale). Format: `.claude/skills/_shared/content-files.md` → "Articles".

**Sample articles:** `sample: true` in an article's `en.md` marks layout placeholders. They render with a visible notice, are `noindex`, and are left out of the sitemap, RSS and the knowledge graph. Remove them with `grep -l '^sample: true' content/articles/*/en.md | xargs -n1 dirname | xargs rm -r` once real articles exist.

**Design:** the homepage is a news-led front page (`components/home/`, `components/news/FrontPage.tsx`). Articles carry an openly licensed header photo (`image`, `imageAlt`, `imageCredit`, `imageCreditUrl` in en.md, files in `apps/website/public/images/articles/`); the article page shows it full width with the title panel overlapping it and the credit underneath. The impeccable design skill (v4.8.0, Apache-2.0) is vendored in `.claude/skills/impeccable/`, including its launcher. `scripts/impeccable` downloads the pinned engine binary on first use, verifies it against `engine-checksums.txt` and caches it outside the repo. Run `.claude/skills/impeccable/scripts/impeccable detect --json <dirs>` after UI changes; it should report `[]`. The rendered checks in `apps/website/scripts/a11y-audit.cjs --sitemap --keyboard` complement it.

Research memory is a markdown knowledge graph in `knowledge/` (schema and rules: `knowledge/README.md`, design: `docs/superpowers/specs/2026-11-02-news-knowledge-base-design.md`): immutable `sources/` notes with numbered claims, `entities/` with dated, cited fact lines, and `stories/` (ongoing storylines with summary, timeline and "Our coverage"). Relations are frontmatter slugs and `[[wikilinks]]`. **Code does the bookkeeping:** `pnpm knowledge:index` (package `packages/knowledge`) rebuilds the generated `knowledge/index.md` and `knowledge/graph.json`, computes story heat and reports broken links, orphans and stale pages. `--check` exits non-zero on errors. Never hand-edit the generated files.

```
/news-daily       → scan → ingest → pick → write → check, ends with a briefing (weekdays)
/news-scan        → watchlist (knowledge/watchlist.md) → knowledge/inbox/<date>.md
/news-ingest      → source notes + entity/story updates + knowledge/flags.md
/news-pick        → pick a story + 2 backups
/news-write       → content/articles/<slug>/en.md (draft: true)
/news-check       → fact check against source claims, humanize, SEO
/knowledge-lint   → weekly health pass
/knowledge-prune  → monthly compaction
/research flagged → refresh service listings flagged by news
```

### Tone rules (from informational-copy)

- Write like a knowledgeable friend, not a marketing team
- Back every claim with specifics (numbers, features, prices)
- Always acknowledge trade-offs ("Worth knowing:" section is mandatory)
- No em dashes, no semicolons, no banned words (see skill for full list)
- Active voice, short sentences, varied paragraph length

### Draft/Publish workflow

`draft: true` in an item's `en.md` frontmatter hides it from production builds (it still shows in `pnpm dev`; `SHOW_DRAFTS=1` forces it on). New items from AI skills are written with `draft: true`. Edits to existing items go live when merged, so review happens in the PR. To publish a new item, delete the `draft` line.

## tRPC + Redis Apps (Plotty, Listy, Privnote)

All three apps follow the same architecture: tRPC v11 + Redis, E2E encryption (key in URL fragment, never sent to server), shared rate-limiting middleware.

**Plotty** (poll/voting): Routes `/create`, `/poll/[id]`, `/poll/[id]/admin`. Server code in `server/api/routers/poll.ts`. Admin tokens (SHA-256 hashed), real-time updates via Redis Pub/Sub → tRPC subscriptions (SSE).

**Listy** (shared lists): Routes `/create`, `/list/[id]`, `/list/[id]/admin`. Server code in `server/api/routers/list.ts`. Three presets: plain, shopping, potluck (with claim/unclaim). Admin tokens, real-time SSE subscriptions.

**Privnote** (self-destructing notes): Routes `/create`, `/note/[id]`, `/note/[id]/share`. Server code in `server/api/routers/note.ts`. Dev port 5016. Features: burn-after-reading (auto-delete on read), configurable TTL (5m–30d), optional password protection (server-side gate), E2E encryption. No admin tokens or real-time subscriptions.

**Shared `@switch-to-eu/db` package** exports: `redis` (client singleton), `crypto` (AES-GCM encrypt/decrypt), `admin` (token generate/hash/verify), `expiration` (TTL calculation), `mock-redis` (in-memory mock for tests), `test-redis` (Testcontainers helper for integration tests).

Rate limiting via Redis sliding window middleware in `@switch-to-eu/trpc/middleware` with per-app `prefix` parameter.

**Optimistic updates** — for instant-feeling UI on item-level mutations (toggle, add, remove, claim). Pattern:

1. Update local decrypted state via `setState` immediately
2. Fire the tRPC mutation in the background (encrypt → send)
3. SSE subscription naturally replaces local state with server truth on confirmation
4. On mutation error: rollback local state to previous value and re-throw for toast

This applies to frequent, lightweight interactions (checkboxes, add/remove items). Form-submit-style operations (create poll, vote, delete) should use a loading spinner instead — optimistic updates don't make sense there.

## Code Style

- **Brand & Design**: For any design-related work (colors, typography, layout, components), read `docs/brand.md` first. It documents the full brand system including color palette, tool color schemes, typography, shape system, and layout patterns. For the *why* behind design choices (audiences, tone, anti-references, accessibility bar), see the Design Context section below (full version in `PRODUCT.md`).
- TypeScript strict mode, functional React components
- Tailwind CSS for all styling
- **No dark mode.** The platform is light-only. Do not add `dark:` classes in app or blocks code.
- Custom fonts: Bonbance Bold Condensed (headings, `--font-bonbance`), HankenGrotesk (body, `--font-hanken-grotesk`), Anton (logo only, `--font-anton`)
- ESLint 9 flat config; unused vars prefixed with `_` are allowed
- shadcn/ui components live in `packages/ui/src/components/`

## Design Context

`docs/brand.md` is the mechanical source of truth (tokens, fonts, shapes, components). This section supplies the context brand.md leaves implicit: who we design for, how it should feel, what to avoid. Full version in `PRODUCT.md`.

### Users

Three overlapping audiences — every page must work for all three:

1. **Privacy-curious generalists** — everyday EU residents nudged here by news or a friend. Not technical. Want to be shown, not lectured.
2. **Motivated switchers** — already decided to leave a US service, here to find the right EU alternative. Want specifics: price, what's comparable, where it falls short, migration steps.
3. **Sovereignty-minded advocates** — often technical, already engaged. Value rigor, openness, and no-bullshit specificity.

Hierarchy and progressive disclosure let each group find their layer without condescending to the others.

### Brand Personality

**Direct, warm, specific.**

- **Direct** — no padding, no hedging, no selling. If an EU alternative is more expensive, say so on the same page you recommend it.
- **Warm** — a knowledgeable friend, not a regulator or an activist. Explain without patronising; disagree without sneering.
- **Specific** — every claim backed by a number, feature, or concrete trade-off. Vague reassurance is worse than honest weakness.

Emotional arc: *uncertain → informed → quietly capable.* Never: hyped, shamed, or overwhelmed. See `.claude/skills/informational-copy` for written tone rules.

### Aesthetic Direction

Trustworthy and editorial, with character. Light mode only. Settled on 2026-11-03 after three rounds of owner feedback: all-saturated cards were "a bit much", shapes everywhere felt "childish and gimmicky", and an all-white page was "ugly, barely any contrast". The balance: a warm page ground (`#f1eee8`) so white cards stand out, **deliberate brand-colour panels** (homepage: green intro, sky guides panel, green "How we work", the featured tool in its own surface colour, sage newsletter), white cards with a thin saturated colour strip, real photos on news. Think a good news site with a recognisable palette.

**Things switch-to.eu must NOT look like:**

- **SaaS marketing sites** (Linear / Vercel / Stripe): gradient heroes, testimonial carousels, "trusted by" logo strips, CTA-stacked scroll. Too slick, too anonymous.
- **EU institutional sites** (ec.europa.eu and kin): bureaucratic, serif-heavy, cluttered. We are FOR the EU, we do not look LIKE the EU.
- **Generic developer tools**: monospace everywhere, dark terminal aesthetic, cyan/purple neon. Some users are technical; none want another terminal.

**Signature moves — use them, don't abandon them:**

- Content first: no big homepage hero. A compact green intro panel (dateline, yellow Bonbance h1, search, quick-switch chips) and the news straight after it.
- Bonbance Bold Condensed in **sentence case** for headings, at modest sizes (section headings `text-3xl sm:text-4xl`). No uppercase headings, no Anton outside the logo.
- Real, openly licensed photos for news (credited under the image). Decorative shapes only tone-on-tone inside colour panels (about 8-12% opacity). No blob illustrations on cards.
- `rounded-3xl` panels: white with `border-black/10`, or a full brand colour for anchor sections (green, sky, sage, a tool's own surface colour), never two adjacent in the same colour.
- Bold brand colour as accents: card strips, article type pills (news = yellow, analysis = navy), small dots, the logo's `.eu`. No grid of saturated cards.
- `rounded-full` pill buttons only. No square or slightly-rounded buttons anywhere.
- No subtitle filler under headings. If a heading needs a sentence to explain it, fix the heading.
- Cards: white with hairline border and a thin saturated top strip (`apps/website/lib/quiet-palette.ts`); a visual area only when there is a real screenshot or photo. The tool apps keep the saturated `getCardColor` from `@switch-to-eu/ui/lib/brand-palette`.

### Accessibility

**Target: WCAG 2.2 AA, reduced-motion respected.**

- Verify contrast for every text + background pairing. The bold palette is easy to get wrong.
- `:focus-visible` on every interactive element. Pill buttons hide default focus rings — replace them, don't remove them.
- Any animation disabled or reduced under `@media (prefers-reduced-motion: reduce)`.
- Keyboard-complete navigation. No hover-only affordances.
- Photos have real alt text (`imageAlt`); purely decorative thumbnails use `alt=""`.
- Respect the text-on-colour contrast rule from `docs/brand.md`: dark brand colours take `#ffffff`; light brand colours take `#1a1a1a`. Don't tint text off-palette to "make it work."

### Design Principles

1. **Honesty over polish.** Trade-offs appear on the same surface as recommendations. No asterisks, no hide-behind-a-link.
2. **Personality in the details, restraint in the claims.** Bonbance headings, a few brand-colour panels, real photos and bold accents carry character. Gimmicks (floating shapes on white, candy-coloured card grids) read as unserious.
3. **Colour has a rhythm.** Neutral surfaces carry most of the page; a few full brand-colour panels anchor it; small accents (strips, pills, dots) tie the rest together. Too white is as wrong as too colourful.
4. **Show the real thing.** A photo of the actual institution or place, a real screenshot, a source link. Never illustration for its own sake.
5. **Three audiences, one page.** Hierarchy does the work, not separate sections addressed at each audience.

<!-- skilld -->
Before modifying code, evaluate each installed skill against the current task.
For each skill, determine YES/NO relevance and invoke all YES skills before proceeding.
<!-- /skilld -->
