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
  db/             # Shared database utilities (Redis client, crypto, admin tokens, expiration, mock-redis for tests, test-redis for Testcontainers)
  trpc/           # Shared tRPC v11 infrastructure (used by plotty, listy, privnote — NOT by website or keepfocus)
  eslint-config/  # Shared ESLint 9 flat configs
  typescript-config/ # Shared tsconfig bases
```

All internal packages use the `@switch-to-eu/` scope. Shared dependency versions are pinned via pnpm catalog in `pnpm-workspace.yaml`.

**Dependency hierarchy:** `blocks` depends on `ui` + `i18n`. All apps depend on `ui`, `i18n`, and `blocks`. The website does NOT use tRPC — it uses direct API routes. Plotty, Listy, and Privnote use `@switch-to-eu/trpc` + `@switch-to-eu/db` with Redis as their data store.

## Key Non-Obvious Details

**Middleware file is `proxy.ts`**, not `middleware.ts`. The next-intl middleware entry point for both apps is named `proxy.ts`.

**Content lives in Payload CMS** (Postgres), managed via the `/admin` panel. Collections: Categories, Services, Guides, Landing Pages, Pages, Media. Services have a `region` field: `"eu"`, `"non-eu"`, or `"eu-friendly"`. All content collections have `versions: { drafts: true }` and require explicit publish.

**Next.js plugin chain** in `apps/website/next.config.ts`: `withMDX(withNextIntl(nextConfig))`. Output mode is `standalone`. Workspace packages are in `transpilePackages`.

**`global.ts` at repo root** is a next-intl type declaration that augments the `Messages` type — it is not a general utilities file.

**CSS imports chain:** Apps import global styles from `@switch-to-eu/ui/styles/globals.css`. The website's `postcss.config.mjs` re-exports from the UI package.

## i18n

Locales: `en` (default), `nl`. Managed by `@switch-to-eu/i18n` package using next-intl v4.

- **Routing/navigation:** Import `Link`, `redirect`, `usePathname`, `useRouter` from `@switch-to-eu/i18n/navigation` (not from `next/link`)
- **Messages:** Located in `packages/i18n/messages/{appName}/{locale}.json` merged with `shared/{locale}.json`
- **Request config:** Apps use `createRequestConfig("website")`, `createRequestConfig("keepfocus")`, `createRequestConfig("plotty")`, `createRequestConfig("privnote")`, etc. from `@switch-to-eu/i18n/request`
- All routes are under `[locale]` dynamic segment

## Content Workflow (AI-Assisted)

The site uses custom Claude Code skills wired to Payload CMS via MCP for a research-to-publish pipeline. All content enters as draft and requires human review before publishing.

### Single-Item Pipeline

```
/research "ServiceName"     → Fills Research tab on service via MCP
/write service "ServiceName" → Writes listing from research data, saves as draft
/humanize service "ServiceName" → Strips AI writing patterns
/seo-check service "ServiceName" → 10-point audit, stores score in SEO tab
→ Editor reviews in /admin, publishes
/translate service "ServiceName" nl → Translates to Dutch locale
→ Editor reviews Dutch version, publishes
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

Services and Guides have a `contentPipelineStatus` sidebar field tracking progress: `not-started` → `in-progress` → `written` → `humanized` → `seo-checked` → `translated` → `complete`. The `/pipeline` skill updates this automatically. Useful for filtering items that need the next step.

### Skills (`.claude/skills/`)

| Skill | Type | Purpose |
|-------|------|---------|
| `informational-copy` | Auto-invoked | Tone of voice: direct, honest, specific, no marketing fluff |
| `research` | `/research` | Vendor site + Reddit sentiment + recent news → Payload Research tab via MCP |
| `write` | `/write` | Content generation from research data |
| `humanize` | `/humanize` | Strip AI writing patterns |
| `seo-check` | `/seo-check` | Pre-publish 12-point QA checklist (scored 0-100) |
| `seo-audit` | `/seo-audit` | Post-publish performance analysis — GSC + Jina SERP + live page → `pageAudits` collection |
| `opportunity-finder` | `/opportunity-finder` | Mine GSC + Reddit + Jina SERP for content backlog → `contentOpportunities` collection |
| `translate` | `/translate` | Localization to other EU languages |
| `bulk-research` | `/bulk-research` | Parallel research via subagents |
| `bulk-write` | `/bulk-write` | Parallel content writing via subagents |
| `bulk-humanize` | `/bulk-humanize` | Parallel humanization via subagents |
| `bulk-seo-check` | `/bulk-seo-check` | Parallel SEO audits via subagents |
| `bulk-translate` | `/bulk-translate` | Parallel translation via subagents |
| `pipeline` | `/pipeline` | Combined write→humanize→seo-check (sequential per item, parallel across items) |

**`seo-check` vs `seo-audit`** — they coexist and address different points in the content lifecycle. `seo-check` is the pre-publish QA gate (12-point checklist, no live data). `seo-audit` is the post-publish performance analysis (GSC, live page, real rankings → rewrite plan in the `pageAudits` collection).

**`opportunity-finder`** is upstream of the authoring pipeline — it generates the backlog of what to write next. Review entries in admin at `/admin/collections/content-opportunities`; flag false positives as `rejected` so dedup behaves on re-runs.

### Tone rules (from informational-copy)

- Write like a knowledgeable friend, not a marketing team
- Back every claim with specifics (numbers, features, prices)
- Always acknowledge trade-offs ("Worth knowing:" section is mandatory)
- No em dashes, no semicolons, no banned words (see skill for full list)
- Active voice, short sentences, varied paragraph length

### Draft/Publish workflow

All content collections have `versions: { drafts: true }`. New content from AI skills enters as draft (`_status: "draft"`). Editors review in the Payload admin panel and click "Publish" to make content live. Nothing publishes automatically.

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

- **Brand & Design**: For any design-related work (colors, typography, layout, components), read `docs/brand.md` first. It documents the full brand system including color palette, tool color schemes, typography, shape system, and layout patterns. For the *why* behind design choices (audiences, tone, anti-references, accessibility bar), see the Design Context section below (also stored at `.impeccable.md`).
- TypeScript strict mode, functional React components
- Tailwind CSS for all styling
- **No dark mode.** The platform is light-only. Do not add `dark:` classes in app or blocks code.
- Custom fonts: Bonbance Bold Condensed (headings, `--font-bonbance`), HankenGrotesk (body, `--font-hanken-grotesk`), Anton (hero display, `--font-anton`)
- ESLint 9 flat config; unused vars prefixed with `_` are allowed
- shadcn/ui components live in `packages/ui/src/components/`

## Design Context

`docs/brand.md` is the mechanical source of truth (tokens, fonts, shapes, components). This section supplies the context brand.md leaves implicit: who we design for, how it should feel, what to avoid. Full version in `.impeccable.md`.

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

Bold, colourful, optimistic. Light mode only. Energy from `docs/brand.md` references: Pride Project posters, Flavour United palette, Vy brand, freeform shape library, Google Labs card grid.

**Things switch-to.eu must NOT look like:**

- **SaaS marketing sites** (Linear / Vercel / Stripe): gradient heroes, testimonial carousels, "trusted by" logo strips, CTA-stacked scroll. Too slick, too anonymous.
- **EU institutional sites** (ec.europa.eu and kin): bureaucratic, serif-heavy, cluttered. We are FOR the EU, we do not look LIKE the EU.
- **Generic developer tools**: monospace everywhere, dark terminal aesthetic, cyan/purple neon. Some users are technical; none want another terminal.

**Signature moves — use them, don't abandon them:**

- Anton display type at fluid `clamp(3.5rem, 12vw, 14rem)` for the home hero.
- Bonbance Bold Condensed, uppercase, weight 800 for every section heading.
- Organic SVG shapes floating around content, staggered animation, `aria-hidden` + `pointer-events-none`.
- Fully-saturated brand-colour blocks with `rounded-3xl` as section containers.
- `rounded-full` pill buttons only. No square or slightly-rounded buttons anywhere.
- Category / pillar / feature cards rotate through the 8-colour sequence from `getCardColor(index)` — don't break the rotation to be clever.

### Accessibility

**Target: WCAG 2.2 AA, reduced-motion respected.**

- Verify contrast for every text + background pairing. The bold palette is easy to get wrong.
- `:focus-visible` on every interactive element. Pill buttons hide default focus rings — replace them, don't remove them.
- Shape animations disabled or reduced under `@media (prefers-reduced-motion: reduce)`.
- Keyboard-complete navigation. No hover-only affordances.
- Decorative shapes always `aria-hidden="true"` and `pointer-events-none`.
- Respect the text-on-colour contrast rule from `docs/brand.md`: dark brand colours take `#ffffff`; light brand colours take `#1a1a1a`. Don't tint text off-palette to "make it work."

### Design Principles

1. **Honesty over polish.** Trade-offs appear on the same surface as recommendations. No asterisks, no hide-behind-a-link.
2. **Swagger in the visuals, restraint in the claims.** Loud visuals + loud copy reads as marketing. We are not marketing.
3. **Bold colour is structural, not decorative.** Full-saturation blocks mark section boundaries. Don't sprinkle brand colours as accents on otherwise-neutral cards.
4. **Organic shapes are mandatory, never arbitrary.** 2–3 per major section, staggered timing, sized to overflow. Scatter them — aligned shapes feel corporate.
5. **Three audiences, one page.** Hierarchy does the work, not separate sections addressed at each audience.

<!-- skilld -->
Before modifying code, evaluate each installed skill against the current task.
For each skill, determine YES/NO relevance and invoke all YES skills before proceeding.
<!-- /skilld -->
