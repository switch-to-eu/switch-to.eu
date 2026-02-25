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

There is no test framework configured. No test scripts or test files exist.

## Monorepo Architecture

**Package manager:** pnpm with workspaces. **Build orchestration:** Turborepo.

```
apps/
  website/        # Main switch-to.eu site (Next.js 16, App Router)
  keepfocus/      # Pomodoro timer app (Next.js 16, App Router)
  plotty/         # Poll/voting app (Next.js 16, App Router, tRPC + Redis)
packages/
  ui/             # Atomic UI components (shadcn/ui new-york style, Radix primitives)
  i18n/           # Shared i18n layer (next-intl v4)
  blocks/         # Page-level shared components (Header, Footer, LanguageSelector)
  content/        # Shared content system (Markdown parsing, Zod schemas, Fuse.js search)
  trpc/           # Shared tRPC v11 infrastructure (used by plotty, NOT by website or keepfocus)
  eslint-config/  # Shared ESLint 9 flat configs
  typescript-config/ # Shared tsconfig bases
```

All internal packages use the `@switch-to-eu/` scope. Shared dependency versions are pinned via pnpm catalog in `pnpm-workspace.yaml`.

**Dependency hierarchy:** `blocks` depends on `ui` + `i18n`. All three apps depend on `ui`, `i18n`, and `blocks`. The website does NOT use tRPC — it uses direct API routes. Plotty uses `@switch-to-eu/trpc` with Redis as its data store.

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

## Plotty (Poll App)

Privacy-focused poll/voting app using tRPC v11 + Redis. Routes: `/create`, `/poll/[id]` (voting), `/poll/[id]/admin` (admin via HMAC token). Server code in `server/api/routers/poll.ts`. Data stored in Redis with `REDIS_URL` env var. Rate limiting via Redis sliding window middleware. Security headers configured in `vercel.json`.

## Code Style

- TypeScript strict mode, functional React components
- Tailwind CSS for all styling
- Custom fonts: BricolageGrotesque (headings, `--font-bricolage-grotesque`), HankenGrotesk (body, `--font-hanken-grotesk`)
- ESLint 9 flat config; unused vars prefixed with `_` are allowed
- shadcn/ui components live in `packages/ui/src/components/`