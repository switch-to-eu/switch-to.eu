# Shared Helper: Jina AI

Jina provides both Reader (`r.jina.ai`) and Search (`s.jina.ai`) under one API key. Used for SERP scraping and page content extraction across all SEO skills.

Exposed through the **Payload MCP** as two tools — call them directly. Do not use `WebFetch` or raw `curl`: `WebFetch` cannot pass `Authorization: Bearer` headers and curl from skills is brittle.

## Tools

| Tool | Wraps | Use for |
|---|---|---|
| `mcp__Payload__jina_read` | `r.jina.ai/<url>` | One specific URL → clean Markdown body |
| `mcp__Payload__jina_search` | `s.jina.ai/?q=...` | SERP results (+ optional scraped content) |

Both read `JINA_READER_API_KEY` from the website server's env. The same key powers both endpoints.

## Reader — fetch one URL as Markdown

```
mcp__Payload__jina_read({ url: "https://example.com/pricing" })
```

Returns clean Markdown of the target page's main content. Strips navigation, ads, boilerplate.

## Search — SERP + optional content

```
mcp__Payload__jina_search({
  q: "european alternative to chrome",
  num: 10,
  gl: "nl",
  hl: "en",
  withContent: true   // include scraped Markdown body of each result
})
```

Returns JSON with `data[]`: each entry has `url`, `title`, `description`, optional `content` when `withContent: true`.

**Key advantage:** a single search call returns both SERP rankings AND the content of each competitor page. The `seo-audit` competitor-analysis step gets organic rankings + competitor page bodies in one call.

## When to use which

| Task | Call |
|---|---|
| Compare our page vs competitors for a query | `jina_search` with `withContent: true` (one call, full analysis) |
| Fetch one specific URL (vendor pricing, news article body) | `jina_read` |
| Scrape a JS-heavy SPA that Jina can't read | Fall through to local Playwright (we have it installed for Playwright tests) |

## Default parameters for our skills

- Country: `nl` (our primary market) — already the tool default
- Language: `en` (site default locale) — already the tool default
- Results per query: 10 (top organic; Google's 2026 cap is 10/page anyway)
- Content mode: on for `seo-audit` competitor analysis; off for `opportunity-finder` (just need ranks + titles)

## Cost / budget

Free tier: 10M tokens, no expiry. Rough per-call token cost:
- Reader call: 500–3000 tokens depending on page size
- Search w/o content: ~200 tokens per result
- Search w/ content: 1000–3000 tokens per result

Our workloads:
- `seo-audit` top-20 run: 20 search calls × ~15k tokens = 300k tokens (3% of budget)
- `opportunity-finder` monthly: ~25 search calls × ~2k tokens = 50k tokens (negligible)
- `research` per service: ~5 Reader calls + 3 searches = ~30k tokens (negligible)

At current volume the free tier lasts ~30 months.

## Error patterns

The MCP tools return `isError: true` with a text payload on failure.

- `JINA_READER_API_KEY is not set` → key missing from `apps/website/.env`. Restart the website server after adding it.
- `401 Unauthorized` → bad / expired key. Check root `.env` and `apps/website/.env`.
- `429 Too Many Requests` → back off 60s, retry once; if still failing, skip and note in the output.
- Empty `data[]` from Search → treat as valid "no results" signal. Unusual for well-formed queries.
- Reader returns <200 characters → page likely JS-rendered; fall through to local Playwright.

## Playwright fallback (no MCP, just local)

For the rare JS-heavy page Jina can't read:

```bash
npx playwright install chromium  # first run only (already installed)
# Then ask the skill to use the Playwright MCP if available,
# or run a tiny one-off node script that launches chromium and extracts textContent.
```

Keep this for exceptions, not the default. If you see Playwright being called more than once per week, something is wrong with the upstream Jina request — debug that instead.
