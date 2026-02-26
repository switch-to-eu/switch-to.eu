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
```

**tRPC router tests** (plotty, listy) use a shared in-memory Redis mock at `@switch-to-eu/db/mock-redis`. Pattern:

1. Import `MockRedis` from `@switch-to-eu/db/mock-redis`
2. Mock the redis module: `vi.mock("@switch-to-eu/db/redis", () => ({ getRedis: async () => mockRedis, getRedisSubscriber: async () => mockRedis }))`
3. Import the app's `createCaller` **after** mocks are set up (top-level await)
4. Create a caller with `createCaller({ redis: mockRedis as never, headers: new Headers() })`
5. Use `mockRedis._clear()` in `beforeEach` to reset state between tests
6. Seed data directly via `mockRedis.hSet()` / `mockRedis.sAdd()` for read/update/delete tests

Each app's vitest config lives at `apps/{app}/vitest.config.ts` with `environment: "node"` and path aliases matching `tsconfig.json`.

## Monorepo Architecture

**Package manager:** pnpm with workspaces. **Build orchestration:** Turborepo.

```
apps/
  website/        # Main switch-to.eu site (Next.js 16, App Router)
  keepfocus/      # Pomodoro timer app (Next.js 16, App Router)
  plotty/         # Poll/voting app (Next.js 16, App Router, tRPC + Redis)
  listy/          # Shared lists app (Next.js 16, App Router, tRPC + Redis)
packages/
  ui/             # Atomic UI components (shadcn/ui new-york style, Radix primitives)
  i18n/           # Shared i18n layer (next-intl v4)
  blocks/         # Page-level shared components (Header, Footer, LanguageSelector)
  content/        # Shared content system (Markdown parsing, Zod schemas, Fuse.js search)
  db/             # Shared database utilities (Redis client, crypto, admin tokens, expiration, mock-redis for tests)
  trpc/           # Shared tRPC v11 infrastructure (used by plotty + listy, NOT by website or keepfocus)
  eslint-config/  # Shared ESLint 9 flat configs
  typescript-config/ # Shared tsconfig bases
```

All internal packages use the `@switch-to-eu/` scope. Shared dependency versions are pinned via pnpm catalog in `pnpm-workspace.yaml`.

**Dependency hierarchy:** `blocks` depends on `ui` + `i18n`. All apps depend on `ui`, `i18n`, and `blocks`. The website does NOT use tRPC — it uses direct API routes. Plotty and Listy use `@switch-to-eu/trpc` + `@switch-to-eu/db` with Redis as their data store.

## Key Non-Obvious Details

**Middleware file is `proxy.ts`**, not `middleware.ts`. The next-intl middleware entry point for both apps is named `proxy.ts`.

**Content is a git submodule** at `packages/content/content/` (repo: `switch-to-eu/content`). After cloning, run `git submodule update --init`. Content is organized by locale (`en/`, `nl/`) with categories, services (eu/non-eu), and guides in Markdown with frontmatter.

**Next.js plugin chain** in `apps/website/next.config.ts`: `withMDX(withNextIntl(nextConfig))`. Output mode is `standalone`. Workspace packages are in `transpilePackages`.

**`global.ts` at repo root** is a next-intl type declaration that augments the `Messages` type — it is not a general utilities file.

**CSS imports chain:** Apps import global styles from `@switch-to-eu/ui/styles/globals.css`. The website's `postcss.config.mjs` re-exports from the UI package.

## i18n

Locales: `en` (default), `nl`. Managed by `@switch-to-eu/i18n` package using next-intl v4.

- **Routing/navigation:** Import `Link`, `redirect`, `usePathname`, `useRouter` from `@switch-to-eu/i18n/navigation` (not from `next/link`)
- **Messages:** Located in `packages/i18n/messages/{appName}/{locale}.json` merged with `shared/{locale}.json`
- **Request config:** Apps use `createRequestConfig("website")`, `createRequestConfig("keepfocus")`, or `createRequestConfig("plotty")` from `@switch-to-eu/i18n/request`
- All routes are under `[locale]` dynamic segment

## Content System (Website)

Content logic lives in `@switch-to-eu/content` package. Content files are a git submodule at `packages/content/content/`. Markdown with frontmatter validated by Zod schemas. Guides use a custom section format with HTML comments (`<!-- section:intro -->`, `<!-- step-start -->`, `<!-- step-meta title:"..." -->`).

Services have a `region` field: `"eu"`, `"non-eu"`, or `"eu-friendly"`.

Search uses Fuse.js with in-memory caching (5-min TTL, keyed by locale).

## tRPC + Redis Apps (Plotty, Listy)

Both apps follow the same architecture: tRPC v11 + Redis, E2E encryption (key in URL fragment, never sent to server), admin tokens (SHA-256 hashed), real-time updates via Redis Pub/Sub → tRPC subscriptions (SSE).

**Plotty** (poll/voting): Routes `/create`, `/poll/[id]`, `/poll/[id]/admin`. Server code in `server/api/routers/poll.ts`.

**Listy** (shared lists): Routes `/create`, `/list/[id]`, `/list/[id]/admin`. Server code in `server/api/routers/list.ts`. Three presets: plain, shopping, potluck (with claim/unclaim).

**Shared `@switch-to-eu/db` package** exports: `redis` (client singleton), `crypto` (AES-GCM encrypt/decrypt), `admin` (token generate/hash/verify), `expiration` (TTL calculation), `mock-redis` (in-memory mock for tests).

Rate limiting via Redis sliding window middleware in `@switch-to-eu/trpc/middleware` with per-app `prefix` parameter.

## Code Style

- TypeScript strict mode, functional React components
- Tailwind CSS for all styling
- Custom fonts: BricolageGrotesque (headings, `--font-bricolage-grotesque`), HankenGrotesk (body, `--font-hanken-grotesk`)
- ESLint 9 flat config; unused vars prefixed with `_` are allowed
- shadcn/ui components live in `packages/ui/src/components/`