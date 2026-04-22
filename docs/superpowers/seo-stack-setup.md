# SEO Stack Setup

The SEO skills (`seo-audit`, `opportunity-finder`, expanded `research`) depend on three MCPs plus Jina AI and Unlighthouse called directly. All three MCPs are wired in `.mcp.json`; each developer needs to provide secrets locally.

## External services in use

| Service | Purpose | Cost |
|---|---|---|
| Google Search Console (Suganthan MCP) | Per-URL performance data, query mining, quick-win analysis | Free |
| Jina AI (Reader + Search) | Scrape one URL → markdown (Reader); SERP + competitor content in one call (Search) | Free tier: 10M tokens/no expiry |
| Reddit MCP (anonymous) | User-sentiment research | Free |
| Payload MCP (local, `mcp-remote`) | Read/write the operational collections | Free (local) |
| Unlighthouse (local `npx`) | Lighthouse audit of live URLs | Free (local CPU) |

**Apify is no longer part of the stack.** The Creator plan restricts public actors to "Universal only", which excludes Google Search Scraper. Jina Search covers our SERP needs (and returns competitor content in the same call, which is actually better than SERP-only scrapers).

## Required local files

| File | Purpose | Where to get it |
|---|---|---|
| `./gsc-oath-secrets.json` (repo root) | Google OAuth client secrets for the Suganthan GSC MCP | Google Cloud Console → APIs & Services → Credentials → Create OAuth client ID → Desktop app → Download JSON |
| `./.env` (repo root) | `PAYLOAD_MCP_API_KEY`, `JINA_READER_API_KEY` | See below |

First GSC MCP call opens a browser for consent. Token caches per-user.

## Required environment variables (in `.env`)

| Variable | Purpose | Where to get it |
|---|---|---|
| `JINA_READER_API_KEY` | Bearer for `https://r.jina.ai/` (Reader) and `https://s.jina.ai/` (Search) | jina.ai signup — 10M tokens, no expiry, same key for both endpoints |
| `PAYLOAD_MCP_API_KEY` | API key for the local Payload MCP endpoint | `/admin/collections/payload-mcp-api-keys` → create key → copy the raw key |

The `.mcp.json` uses a shell wrapper (`sh -c '. ./.env && exec ...'`) to source `.env` at MCP-spawn time, so tokens never appear in the committed config.

## Payload MCP API key — permissions gotcha

The Payload MCP plugin silently skips tool registration for any collection the API key doesn't have permission for. When a new collection is added to `mcpPlugin.collections` in `payload.config.ts`:

1. Go to `/admin/collections/payload-mcp-api-keys`
2. Edit the key you're using
3. Tick the new collection's Create / Update / Find / Delete checkboxes
4. Save
5. Reload MCP in Claude Code (`/mcp`)

If you skip this, `mcp__Payload__<NewCollection>` tools simply won't appear — no error thrown, no log message, nothing — and you'll spend half an hour debugging.

## Google Search Console property

The GSC MCP is pinned to `sc-domain:switch-to.eu` (see `.mcp.json`). To switch properties, edit `GSC_SITE_URL` in the `gsc` entry.

## Verifying the stack is live

From Claude Code in this repo:
1. Ask: "call site_snapshot in GSC" → expect period-compared stats.
2. `curl -H "Authorization: Bearer $JINA_READER_API_KEY" "https://s.jina.ai/?q=proton+mail&num=3"` → expect 3 JSON results.
3. Ask: "search r/privacy for 'proton' last 90 days" → expect 3+ posts.
4. Ask: "call mcp__Payload__findServices with limit 1" → expect one service row.

If any step fails, restart Claude Code and re-check. Persistent failure on GSC usually means OAuth needs re-consent (delete the cache: `~/.config/suganthan-gsc-mcp/token.json` — path may vary).

## Unlighthouse

No setup required — invoked via `npx unlighthouse`. First run downloads Chromium (~2 min). The repo already has Playwright installed via `@playwright/test`, so Chromium may already be available.

## Shared skill helpers

Reference docs for each tool live in `.claude/skills/_shared/`:
- `gsc.md`, `jina.md`, `lighthouse.md`, `reddit.md`, `payload-operational.md`.
