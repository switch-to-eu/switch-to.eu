# SEO Stack Setup

The SEO skills (`seo-audit`, `opportunity-finder`, expanded `research`) depend on four MCPs and two direct-HTTP integrations. All four MCPs are wired in `.mcp.json`; each developer needs to provide secrets locally.

## Required local files

| File | Purpose | Where to get it |
|---|---|---|
| `./gsc-oath-secrets.json` (repo root) | Google OAuth client secrets for the Suganthan GSC MCP | Google Cloud Console → APIs & Services → Credentials → Create OAuth client ID → Desktop app → Download JSON |

First GSC MCP call opens a browser for consent. Token caches per-user.

## Required environment variables

Put these in `.env.local` at the repo root (not committed).

| Variable | Purpose |
|---|---|
| `JINA_READER_API_KEY` | Bearer token for `https://r.jina.ai/<url>` — used by expanded `research` and `seo-audit` competitor content fetches |

## MCP tokens embedded in `.mcp.json`

The Apify API token is inlined in `.mcp.json` under the `apify` server's `--header` argument. If this repo becomes public, rotate that token and move it to an env var (`APIFY_TOKEN` referenced via `${APIFY_TOKEN}` in the config).

## Google Search Console property

The GSC MCP is pinned to `sc-domain:switch-to.eu` (see `.mcp.json`). To switch properties, edit `GSC_SITE_URL` in the `gsc` entry.

## Verifying the stack is live

From Claude Code in this repo:
1. Ask: "call site_snapshot in GSC" → expect period-compared stats.
2. Ask: "list Apify actors" → expect `apify/google-search-scraper`, `apify/website-content-crawler`.
3. Ask: "search r/privacy for 'proton' last 90 days" → expect 3+ posts.
4. Ask: "call mcp__Payload__findServices with limit 1" → expect one service row.

If any step fails, restart Claude Code and re-check. Persistent failure on GSC usually means OAuth needs re-consent (delete the cache: `~/.config/suganthan-gsc-mcp/token.json` — path may vary).

## Unlighthouse

No setup required — invoked via `npx unlighthouse`. First run downloads Chromium (~2 min).

## Shared skill helpers

Reference docs for each tool live in `.claude/skills/_shared/`:
- `gsc.md`, `apify.md`, `lighthouse.md`, `reddit.md`, `jina.md`, `payload-operational.md`.
