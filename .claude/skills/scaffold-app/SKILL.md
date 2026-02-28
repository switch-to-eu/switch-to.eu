---
name: scaffold-app
description: Scaffold a new tool app in the switch-to.eu monorepo with all boilerplate, configs, i18n, and tests
argument-hint: <app-name> [--with-trpc]
allowed-tools: Read, Write, Edit, Bash, Glob, Grep, Agent
---

# Scaffold a new app in the switch-to.eu monorepo

You are scaffolding a new tool app called **$ARGUMENTS** in this monorepo.

Parse the arguments:
- First positional arg = **app slug** (lowercase, e.g. `flashy`). This is `{appname}`.
- If `--with-trpc` flag is present, scaffold a **tRPC + Redis** app. Otherwise scaffold a **client-only** app.
- If neither is clear, ask the user whether they need a backend (tRPC + Redis) or a client-only app.

Also ask the user for:
1. **Display name** — e.g. "Flashy" (used in branding, layout). This is `{AppName}`.
2. **One-line tagline** — e.g. "Create flashcards privately" (used in footer tools, meta description).
3. **Primary Tailwind color** — e.g. `indigo-600` (used in theme CSS). This is `{color}`.
4. **Lucide icon name** — e.g. `Layers` (used in header logo). This is `{Icon}`.
5. **Entity name** (tRPC apps only) — e.g. `card` (used in router filename, Redis keys). This is `{entity}`.

## Port Assignment

Check existing ports by reading the `dev` scripts in all `apps/*/package.json` files. Current assignments:

!`grep -h '"dev"' apps/*/package.json | grep -oP '\d{4}' | sort -n | tail -1`

Pick the next available port after the highest one. This is `{PORT}`.

## Files to Create

All files go in `apps/{appname}/`. Use the patterns from existing apps (listy for tRPC, keepfocus for client-only).

### Root config files (ALL apps)

1. **`package.json`** — Use `@switch-to-eu/{appname}` as the name. Use `catalog:` for all shared dependencies. Include these scripts:
   - `build`, `dev` (with `PORT={PORT} next dev --turbo --port {PORT}` for tRPC apps, `next dev --turbo --port {PORT}` for client-only), `start`, `lint`, `lint:fix`, `type-check`, `test`, `test:watch`, `test:e2e`, `test:e2e:ui`
   - tRPC apps also get: `test:integration`
   - Base dependencies: `@switch-to-eu/blocks`, `@switch-to-eu/i18n`, `@switch-to-eu/ui`, `class-variance-authority`, `clsx`, `lucide-react`, `next`, `next-intl`, `react`, `react-dom`, `sonner`, `tailwind-merge`, `zod` (all `catalog:`)
   - tRPC apps add: `@switch-to-eu/db`, `@switch-to-eu/trpc`, `@trpc/client`, `@trpc/react-query`, `@trpc/server`, `@tanstack/react-query`, `superjson`, `nanoid`, `server-only`, `@hookform/resolvers`, `react-hook-form`, `sharp` — plus `redis` and `vitest` in devDeps
   - devDependencies: `@switch-to-eu/eslint-config`, `@switch-to-eu/typescript-config`, `@tailwindcss/postcss`, `@types/node`, `@types/react`, `@types/react-dom`, `eslint`, `postcss`, `tailwindcss`, `tw-animate-css`, `typescript`, `typescript-eslint`, `@playwright/test`, `vitest`

2. **`next.config.mjs`**:
   ```js
   import createNextIntlPlugin from 'next-intl/plugin';
   const withNextIntl = createNextIntlPlugin();
   /** @type {import('next').NextConfig} */
   const nextConfig = {
     output: 'standalone',
     transpilePackages: ['@switch-to-eu/ui', '@switch-to-eu/i18n', '@switch-to-eu/blocks'],
     // tRPC apps add: '@switch-to-eu/trpc', '@switch-to-eu/db'
   };
   export default withNextIntl(nextConfig);
   ```

3. **`proxy.ts`**:
   ```ts
   import { createI18nMiddleware } from "@switch-to-eu/i18n/proxy";
   export default createI18nMiddleware();
   export const config = {
     matcher: ["/((?!api|trpc|_next|_vercel|.*\\..*).*)",],
   };
   ```

4. **`tsconfig.json`** — Extend `@switch-to-eu/typescript-config/nextjs.json`. Paths: `@components/*`, `@hooks/*`, `@i18n/*`. tRPC apps also add `@/lib/*` and `@/server/*`. Include `next-env.d.ts`, `next.config.mjs`, `**/*.ts`, `**/*.tsx`, `.next/types/**/*.ts`.

5. **`postcss.config.mjs`**: `export { default } from "@switch-to-eu/ui/postcss.config";`

6. **`eslint.config.js`**:
   ```js
   import { nextJsConfig } from "@switch-to-eu/eslint-config/next-js"
   /** @type {import("eslint").Linter.Config} */
   export default nextJsConfig
   ```

7. **`global.ts`** — next-intl type augmentation + color scheme constants:
   ```ts
   import { routing } from "@switch-to-eu/i18n/routing";
   import messages from "@switch-to-eu/i18n/messages/{appname}/en.json";
   import sharedMessages from "@switch-to-eu/i18n/messages/shared/en.json";
   declare module "next-intl" {
     interface AppConfig {
       Locale: (typeof routing.locales)[number];
       Messages: typeof messages & typeof sharedMessages;
     }
   }
   ```

8. **`components.json`** (shadcn config):
   ```json
   {
     "$schema": "https://ui.shadcn.com/schema.json",
     "style": "new-york",
     "rsc": true,
     "tsx": true,
     "tailwind": { "config": "", "css": "app/[locale]/styles/globals.css", "baseColor": "neutral", "cssVariables": true },
     "iconLibrary": "lucide",
     "aliases": { "components": "@/components", "hooks": "@/hooks", "lib": "@/lib", "utils": "@switch-to-eu/ui/lib/utils", "ui": "@switch-to-eu/ui/components" }
   }
   ```

9. **`.gitignore`**: `.next`, `*.env`, `node_modules`

10. **`vercel.json`** — Security headers (copy exactly from listy's `vercel.json`).

11. **`playwright.config.ts`**:
    ```ts
    import { defineConfig } from "@playwright/test";
    export default defineConfig({
      testDir: "./e2e",
      timeout: 30_000,
      retries: 1,
      use: { baseURL: "http://localhost:{PORT}", trace: "on-first-retry" },
      projects: [{ name: "chromium", use: { browserName: "chromium" } }],
      webServer: {
        command: "pnpm build && pnpm start -p {PORT}",
        url: "http://localhost:{PORT}",
        reuseExistingServer: true,
        timeout: 120_000,
      },
    });
    ```

12. **`vitest.config.ts`**:
    - tRPC apps: `environment: "node"`, path aliases for `@/lib`, `@/server`, `@components`, `@hooks`, `@i18n`. Exclude `*.integration.test.ts`.
    - Client-only: `environment: "jsdom"`, `plugins: [react(), tsconfigPaths()]`, `setupFiles`, `css: false`.

13. **`vitest.integration.config.ts`** (tRPC apps only): Same aliases, `include: ["__tests__/**/*.integration.test.ts"]`, `testTimeout: 30_000`, `hookTimeout: 60_000`.

### i18n files

14. **`i18n/request.ts`**:
    ```ts
    import { createRequestConfig } from "@switch-to-eu/i18n/request";
    export default createRequestConfig("{appname}");
    ```

15. **`packages/i18n/messages/{appname}/en.json`** — Create with the minimum required keys:
    ```json
    {
      "layout": {
        "metadata": { "title": "{AppName}", "description": "{tagline}" },
        "header": { "about": "About" },
        "footer": { "about": "About", "privacy": "Privacy Policy", "copyright": "{year} <link>switch-to.eu</link> — a project by" }
      },
      "HomePage": {
        "hero": { "title": "{AppName}", "subtitle": "your privacy", "description": "{tagline}", "cta": "Get Started", "disclaimer": "No signup required" },
        "trust": { "badges": { "noAccount": "No account needed", "encrypted": "End-to-end encrypted", "openSource": "Open source" } },
        "cta": { "title": "Try it now", "description": "No signup, no spam, no tracking.", "button": "Get Started" }
      },
      "AboutPage": { "title": "About {AppName}", "placeholder": "About page coming soon..." },
      "PrivacyPage": { "title": "Privacy Policy", "placeholder": "Privacy policy coming soon..." },
      "tools": {}
    }
    ```
    Add a `"CreatePage"` section if tRPC app.

16. **`packages/i18n/messages/{appname}/nl.json`** — Same structure, translate to Dutch. Use placeholder Dutch translations where unsure.

17. **Update `packages/i18n/messages/shared/en.json`** and **`shared/nl.json`** — Add a `"{appname}"` key under `footerTools` with the tagline.

### App directory structure

18. **`app/[locale]/styles/globals.css`**:
    ```css
    @import "tailwindcss";
    @import "@switch-to-eu/ui/styles/globals.css";
    @source '../../../node_modules/@switch-to-eu/ui/src';
    @source '../../../node_modules/@switch-to-eu/blocks/src';

    .gradient-primary { @apply bg-gradient-to-r from-{color} to-{color2}; }
    .header-bg { @apply bg-gradient-to-br from-{color}/10 via-{color2}/5 to-transparent; }
    .text-primary-color { @apply text-{color}; }
    .focus-ring-accent { @apply focus-visible:ring-{color}/30 focus-visible:ring-[2px]; }
    .focus-ring-accent-strong { @apply focus-visible:ring-{color}/50 focus-visible:ring-[3px]; }
    ```

19. **`app/[locale]/layout.tsx`** — Follow the listy layout pattern exactly:
    - Import globals.css, fontVariables, Header, Footer, BrandIndicator, LanguageSelector, Link, NextIntlClientProvider
    - `generateMetadata` with locale validation
    - `LocaleLayout` wrapping children in `<html>` → `<body>` → `NextIntlClientProvider` → (tRPC: `TRPCReactProvider` →) `Header` + `{children}` + `Footer`
    - Header logo uses `{Icon}` from lucide-react, displays `{AppName}` in uppercase
    - Footer has `currentToolId="{appname}"`, about + privacy links, copyright with Studio Vinnie & MVPeters links
    - Use the `{color}` for link hover colors in the copyright section

20. **`app/[locale]/page.tsx`** — Landing page with hero, trust badges, and CTA sections. Use `useTranslations('HomePage')`. Style with the app's color theme.

21. **`app/[locale]/about/page.tsx`** — Stub page using `useTranslations('AboutPage')`.

22. **`app/[locale]/privacy/page.tsx`** — Stub page using `useTranslations('PrivacyPage')`.

### tRPC-specific files (only if `--with-trpc`)

23. **`app/[locale]/create/page.tsx`** — Create form page stub.

24. **`app/api/trpc/[trpc]/route.ts`** — tRPC HTTP handler (copy pattern from listy).

25. **`lib/trpc-client.tsx`** — TRPCReactProvider with `createTRPCReact<AppRouter>()`, `splitLink` for subscriptions + batch stream. Copy from listy exactly, only the import path to `AppRouter` stays the same (`@/server/api/root`).

26. **`server/api/trpc.ts`** — Context creation with Redis, rate-limiting with `prefix: "{appname}"`.

27. **`server/api/root.ts`** — App router with `{entity}Router` mounted as `{entity}`.

28. **`server/api/trpc-server.ts`** — RSC hydration helpers (copy from listy).

29. **`server/api/routers/{entity}.ts`** — Starter router with a `create` and `getById` procedure (both stubs using `publicProcedure`).

### Test files

30. **`e2e/smoke.spec.ts`** — Smoke tests for all pages (`/`, `/about`, `/privacy`, and `/create` for tRPC apps) in both locales. Use the `expectPageOk` helper pattern.

31. **`__tests__/server/{entity}-router.test.ts`** (tRPC only) — Unit test stub using `MockRedis` from `@switch-to-eu/db/mock-redis` with `vi.mock("@switch-to-eu/db/redis", ...)` and `createCaller` pattern.

### Empty directories

32. Create `components/.gitkeep` and `hooks/.gitkeep` if no files exist yet.

## After scaffolding

1. Run `pnpm install` from the repo root to link the new app.
2. Verify the app builds: `pnpm --filter @switch-to-eu/{appname} build`
3. Report the results to the user and list any manual follow-ups:
   - Remind them the app will need a Vercel project for deployment
   - Suggest running `pnpm --filter @switch-to-eu/{appname} dev` to test locally
   - For tRPC apps, remind them to set `REDIS_URL` in `.env`

## Important conventions

- All imports from `next/link` must use `@switch-to-eu/i18n/navigation` instead.
- The middleware file is `proxy.ts`, NOT `middleware.ts`.
- Shared dependency versions use `catalog:` in package.json, not pinned versions.
- The `transpilePackages` array in next.config must include all `@switch-to-eu/*` packages the app imports.
- Refer to CLAUDE.md for the full architecture guide.
