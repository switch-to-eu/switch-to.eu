---
name: unlighthouse-skilld
description: "ALWAYS use when writing code importing \"unlighthouse\". Consult for debugging, best practices, or modifying unlighthouse."
metadata:
  version: 0.17.9
  generated_by: Anthropic · Opus 4.6
  generated_at: 2026-04-21
---

# harlan-zw/unlighthouse `unlighthouse@0.17.9`
**Tags:** latest: 0.17.9

**References:** [package.json](./.skilld/pkg/package.json) • [README](./.skilld/pkg/README.md) • [Docs](./.skilld/docs/_INDEX.md) • [Issues](./.skilld/issues/_INDEX.md) • [Discussions](./.skilld/discussions/_INDEX.md) • [Releases](./.skilld/releases/_INDEX.md)

## Search

Use `skilld search "query" -p unlighthouse` instead of grepping `.skilld/` directories. Run `skilld search --guide -p unlighthouse` for full syntax, filters, and operators.

<!-- skilld:api-changes -->
## API Changes

This section documents version-specific API changes across v0.14–v0.17 — LLMs trained on older unlighthouse may still use deprecated integration packages or older config patterns.

- NEW: `defineUnlighthouseConfig()` from `unlighthouse/config` — introduced in v0.16.0 as the typed wrapper for `unlighthouse.config.ts`. Replaces the older `defineConfig` pattern which had broken types. Supports a plain object, a sync function, or an async function returning a `UserConfig`. [source](./.skilld/releases/v0.16.0.md#features)

- BREAKING: `@unlighthouse/nuxt`, `@unlighthouse/vite`, `@unlighthouse/webpack` integrations are deprecated and will be removed in v1.0. LLMs will still suggest installing these packages — migrate to the CLI (`npx unlighthouse --site ...`) or CI integration instead. [source](./.skilld/docs/integration-deprecations.md:L20:L28)

- NEW: async functions supported inside `unlighthouse.config.ts` — v0.15.0 added support for `defineUnlighthouseConfig(async () => ({ ... }))`, letting you await dynamic values (env lookups, remote config) when building the config. [source](./.skilld/releases/v0.15.0.md#features)

- NEW: `userAgent` config option — root-level `userAgent: string` added in v0.14.0, applies to all Axios and Puppeteer requests. Previously you had to configure it per-request inside `puppeteerOptions`. [source](./.skilld/releases/v0.14.0.md#features)

- BREAKING: `defineConfig` types broke in pre-v0.16 releases — the fix in v0.16.0 effectively retired `defineConfig` in favour of `defineUnlighthouseConfig`. Older code using `import { defineConfig } from 'unlighthouse/config'` should be renamed; the broken type exports were further repaired in v0.16.1. [source](./.skilld/releases/v0.16.0.md#bug-fixes)

- NEW: CLI auto-disables Chrome sandbox when running as root — v0.17.5 added automatic `--no-sandbox` handling in root/container environments. Docker/CI configs that manually set `puppeteerOptions.args: ['--no-sandbox']` no longer need it just to work as root. [source](./.skilld/releases/v0.17.5.md:L10:L12)

- NEW: `--config-file` is always respected — v0.17.5 fixed a regression where the flag was sometimes ignored. Config files passed via `unlighthouse --config-file ./custom.config.ts` now load reliably. [source](./.skilld/releases/v0.17.5.md:L10:L12)

- NEW: modern CLI progress UI — v0.17.0 rewrote the terminal progress renderer (uses `@clack/prompts`). Older scripts parsing CLI stdout for progress may break; treat human-readable CLI output as non-stable. [source](./.skilld/releases/v0.17.0.md#features)

- NEW: `unlighthouse/config` subpath export — v0.17.2 repaired the subpath export after a bundling regression. Always import `defineUnlighthouseConfig` from `unlighthouse/config` (not `unlighthouse` root) for typed config. [source](./.skilld/releases/v0.17.2.md:L13)

- NEW: UI client migrated off HeadlessUI — v0.17.0's UI rewrite (completed through v0.17.9) removed HeadlessUI. Custom `client.*` patches that targeted HeadlessUI class names or DOM structure will no longer apply. [source](./.skilld/releases/v0.17.9.md:L11)

- BREAKING: `ignoreI18nPages` behaviour changed on cross-origin `/` — v0.17.0 auto-disables `ignoreI18nPages` when a cross-origin default is set for the root path, so scans that previously filtered some i18n routes now include them. [source](./.skilld/releases/v0.17.0.md#bug-fixes)

- NEW: `radix3` is an explicit dependency — v0.15.0 added `radix3` as a direct dep (previously hoisted/transitive). If your toolchain pinned the transitive version, bump to the declared range. [source](./.skilld/releases/v0.15.0.md#bug-fixes)

- NEW: worker no longer infinitely requeues failed paths — v0.17.0 ended the requeue loop on path failures. Hook handlers relying on repeated `task-complete` for the same failed path will only fire once. [source](./.skilld/releases/v0.17.0.md#bug-fixes)

- NEW: worker exits cleanly when all routes are ignored — v0.17.0 makes `worker-finished` fire correctly even with a fully filtered route list. Previously the CLI would hang. [source](./.skilld/releases/v0.17.0.md#bug-fixes)

- NEW: CPU core cap — v0.17.0 stops Unlighthouse from allocating workers above the detected core count. Configs that set `puppeteerClusterOptions.maxConcurrency` above `os.cpus().length` are clamped. [source](./.skilld/releases/v0.17.0.md#bug-fixes)

- NEW: `v0.14.1` surfaces Lighthouse runtime errors on requeue — failed routes now log the underlying Lighthouse error instead of a generic retry message. Log-parsers expecting the old format must update. [source](./.skilld/releases/v0.14.1.md:L13)

- NEW: windows report path normalisation — v0.17.2 fixed backslash paths in generated reports. Custom post-processors that handled Windows-specific escaping can drop that code. [source](./.skilld/releases/v0.17.2.md:L14)

- NEW: `generateClient({ static: true })` for static CI output — exported from `@unlighthouse/core`, bundles the UI for hosting (used by the CI buildStatic flow). LLMs often miss this helper and reimplement copy/paste scripts. [source](./.skilld/docs/3.api-doc/index.md:L68:L83)

- NEW: `setServerContext(arg: ServerContextArg)` on `UnlighthouseContext` — register an existing h3/listhen server before calling `start()`. Required when hosting the UI behind your own server. [source](./.skilld/docs/3.api-doc/index.md:L157:L161)

- NEW: `setCiContext()` on `UnlighthouseContext` — CI-only path that skips server/client bootstrap. Use this instead of `setServerContext()` + `start()` when running headless in CI. [source](./.skilld/docs/3.api-doc/index.md:L151:L155)

**Also changed:** HMR auto-rescan removed with integration deprecation — use the UI rescan button [source](./.skilld/docs/integration-deprecations.md:L60) · `TTI` metric removed from Lighthouse 10 — use `TBT`/`INP` instead [source](./.skilld/docs/glossary/tti.md:L23) · duda-site scanner fix v0.17.0 [source](./.skilld/releases/v0.17.0.md#bug-fixes) · invalid JSON CLI args now throw early v0.16.0 [source](./.skilld/releases/v0.16.0.md#bug-fixes) · safer path resolution v0.17.0 [source](./.skilld/releases/v0.17.0.md#bug-fixes) · corrupt cached reports auto-recover v0.15.0 [source](./.skilld/releases/v0.15.0.md#bug-fixes) · Chrome auto-download when no system Chrome found v0.15.0 [source](./.skilld/releases/v0.15.0.md#bug-fixes) · query strings respected in route keys v0.14.0 [source](./.skilld/releases/v0.14.0.md#bug-fixes) · false-positive trailing-slash redirect warning fixed v0.14.0 [source](./.skilld/releases/v0.14.0.md#bug-fixes) · full-width screenshot fallback for non-performance scans v0.14.0 [source](./.skilld/releases/v0.14.0.md#bug-fixes)
<!-- /skilld:api-changes -->

<!-- skilld:best-practices -->
## Best Practices

- Prefer the CLI or CI integration over build-tool integrations (`@unlighthouse/nuxt`, `@unlighthouse/vite`, `@unlighthouse/webpack`) — all three are deprecated and slated for removal in v1.0. Run `npx unlighthouse --site localhost:3000` against the dev server instead [source](./.skilld/docs/integration-deprecations.md:L20:L64).

- Create `unlighthouse.config.ts` in the project root and wrap config with `defineUnlighthouseConfig()` from `unlighthouse/config` — it resolves via c12 and gives proper typings; the import is optional if module resolution gives trouble and the config still works without it [source](./.skilld/docs/1.guide/guides/0.config.md:L24:L42).

- Do not disable `scanner.throttle` globally. Throttling auto-switches off for localhost and on for production sites already, so explicit overrides usually hurt accuracy on real sites [source](./.skilld/docs/1.guide/guides/device.md:L88:L101).

- For CI accuracy, combine `scanner.samples: 5` with `puppeteerClusterOptions.maxConcurrency: 1` — single-worker runs reduce CPU contention, which is the single biggest source of 5-10 point score drift [source](./.skilld/docs/1.guide/recipes/improving-accuracy.md:L52:L92).

- Leave the large-site defaults alone unless you truly need them changed: `maxRoutes: 200`, `skipJavascript: true`, `samples: 1`, `dynamicSampling: 5`, and `ignoreI18nPages: true` are tuned to keep enterprise-size scans finishing. Override only the single dimension you need [source](./.skilld/docs/1.guide/recipes/large-sites.md:L30:L46).

- For SPAs set `scanner.skipJavascript: false` AND bump `lighthouseOptions.maxWaitForLoad` to ~45000ms — leaving the default (skipJavascript=true) will miss client-side-rendered content entirely and crawler link-discovery will fail [source](./.skilld/docs/1.guide/recipes/spa.md:L26:L52).

- When a sitemap of 50+ URLs is found, Unlighthouse automatically disables the crawler. If you want both behaviours, explicitly set `scanner.crawler: true`; conversely on link-heavy sites disable it with `scanner.crawler: false` to avoid unbounded queue growth [source](./.skilld/docs/1.guide/guides/url-discovery.md:L52:L101).

- Use `customSampling` (regex → route definition) when URLs don't follow a clean path-segment pattern — without a route definition the sampler falls back to URL-fragment matching which groups weird URLs poorly [source](./.skilld/docs/1.guide/guides/route-definitions.md:L42:L61).

- For complex login flows use the `hooks.authenticate({ page })` hook which runs once before scanning and persists the session for every subsequent page — the simpler `cookies`/`auth`/`localStorage`/`extraHeaders` keys are preferred when they suffice (match the auth pattern to the simplest option that works) [source](./.skilld/docs/1.guide/guides/authentication.md:L26:L154).

- If auth state isn't persisting between page scans, set `puppeteerOptions.userDataDir` AND `lighthouseOptions.disableStorageReset: true` plus `skipAboutBlank: true` — Lighthouse clears storage between runs by default which logs you out [source](./.skilld/docs/1.guide/guides/authentication.md:L156:L170).

- In Docker always launch with `--no-sandbox --disable-setuid-sandbox --disable-dev-shm-usage` args and only use `@unlighthouse/ci` (client hosting isn't supported). When running the `unlighthouse` binary non-interactively, add `server.open: false` and a `worker-finished` hook that calls `process.exit(0)` or the process hangs [source](./.skilld/docs/1.guide/guides/docker.md:L30:L63).

- Customize dashboard columns through the `resolved-config` hook (mutate `config.client.columns.performance[...]`) rather than trying to pass columns directly — the hook runs after config resolution so the mutation actually takes effect [source](./.skilld/docs/1.guide/recipes/client.md:L24:L45).

- Prefer `scanner.device: 'desktop'` (or `--desktop` CLI flag) over manually tweaking `lighthouseOptions.formFactor` and `screenEmulation`. The alias also sets the correct `1350×950` viewport and Lighthouse's internal CPU/network presets; set `scanner.device: false` only if you really need to configure Lighthouse's formFactor directly [source](./.skilld/docs/3.api-doc/config.md:L349:L356).

- When Chrome fails to launch (ECONNREFUSED, WSL issues, firewall), disable system Chrome with `chrome: { useSystem: false }` to force the bundled Chromium download — this is the recommended fallback before debugging puppeteer args [source](./.skilld/docs/1.guide/guides/common-errors.md:L26:L58).
<!-- /skilld:best-practices -->
