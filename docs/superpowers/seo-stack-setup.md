# SEO Stack Setup

The SEO skills (`seo-audit`, `opportunity-finder`, expanded `research`) depend on the MCPs in `.mcp.json` (GSC, Reddit, Exa) plus Jina AI (called with `curl`) and Unlighthouse. Each developer needs to provide secrets locally.

## External services in use

| Service | Purpose | Cost |
|---|---|---|
| Google Search Console (Suganthan MCP) | Per-URL performance data, query mining, quick-win analysis | Free |
| Jina AI (Reader + Search) | Scrape one URL → markdown (Reader); SERP + competitor content in one call (Search) | Free tier: 10M tokens/no expiry |
| Reddit MCP (`reddit`, anonymous) | User-sentiment research. Search works without credentials through the Arctic Shift archive. | Free |
| Reddit MCP Buddy (`reddit-mcp-buddy`) | Second Reddit server, the same setup as commons-radio-mono. Without credentials, only `browse_subreddit` works. Search needs `REDDIT_CLIENT_ID` and `REDDIT_CLIENT_SECRET`. | Free |
| Exa MCP (hosted, `https://mcp.exa.ai/mcp`) | Web search (`web_search_exa`, `web_search_advanced_exa`) and page fetch (`web_fetch_exa`) | Free without a key, with a lower rate limit. Sign in with OAuth for higher limits. |
| Unlighthouse (local `npx`) | Lighthouse audit of live URLs | Free (local CPU) |

**Apify is no longer part of the stack.** The Creator plan restricts public actors to "Universal only", which excludes Google Search Scraper. Jina Search covers our SERP needs (and returns competitor content in the same call, which is actually better than SERP-only scrapers).

## Required local files

| File | Purpose | Where to get it |
|---|---|---|
| `./gsc-oath-secrets.json` (repo root) | Google OAuth client secrets for the Suganthan GSC MCP | Google Cloud Console → APIs & Services → Credentials → Create OAuth client ID → Desktop app → Download JSON |
| `./.env` (repo root) | `JINA_API_KEY`, optional Reddit credentials | See below |

First GSC MCP call opens a browser for consent. Token caches per-user.

## Required environment variables (in `.env`)

| Variable | Purpose | Where to get it |
|---|---|---|
| `JINA_API_KEY` | Bearer for `https://r.jina.ai/` (Reader) and `https://s.jina.ai/` (Search). The skills call Jina with `curl` (see `_shared/jina.md`). The old name `JINA_READER_API_KEY` also works. | jina.ai signup — 10M tokens, no expiry, same key for both endpoints |
| `REDDIT_CLIENT_ID`, `REDDIT_CLIENT_SECRET` | Optional. `reddit-mcp-buddy` reads them from the root `.env`. They enable search and live scores (60 req/min). | reddit.com/prefs/apps. Reddit requires API approval under its Responsible Builder Policy. |
| `REDDIT_USERNAME`, `REDDIT_PASSWORD` | Optional. With the client ID and secret, they raise the `reddit-mcp-buddy` limit to 100 req/min. | A Reddit account with a "script" app |

The `reddit-mcp-buddy` entry in `.mcp.json` uses a shell wrapper to source the root `.env` at MCP-spawn time, so tokens never appear in the committed config. The wrapper also starts the server when there is no `.env`.

`.gitignore` excludes `.env*` and `gsc-oath-secrets.json`. A new git worktree does not get these files. Copy them into each worktree that runs the research or SEO skills.

## Google Search Console property

The GSC MCP is pinned to `sc-domain:switch-to.eu` (see `.mcp.json`). To switch properties, edit `GSC_SITE_URL` in the `gsc` entry.

## Verifying the stack is live

From Claude Code in this repo:
1. Ask: "call site_snapshot in GSC" → expect period-compared stats.
2. `curl -H "Authorization: Bearer $JINA_API_KEY" "https://s.jina.ai/?q=proton+mail&num=3"` → expect 3 JSON results.
3. Ask: "search r/privacy for 'proton' last 90 days" → expect 3+ posts.
4. Ask: "call web_search_exa for 'european alternative to dropbox'" → expect search results.

If any step fails, restart Claude Code and re-check. Persistent failure on GSC usually means OAuth needs re-consent (delete the cache: `~/.config/suganthan-gsc-mcp/token.json` — path may vary).

## Unlighthouse

No setup required — invoked via `npx unlighthouse`. First run downloads Chromium (~2 min). The repo already has Playwright installed via `@playwright/test`, so Chromium may already be available.

## Shared skill helpers

Reference docs for each tool live in `.claude/skills/_shared/`:
- `gsc.md`, `jina.md`, `lighthouse.md`, `reddit.md`, `content-files.md`.
