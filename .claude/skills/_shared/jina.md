# Shared Helper: Jina AI

Jina provides both Reader (`r.jina.ai`) and Search (`s.jina.ai`) under one API key. Used for SERP scraping and page content extraction across all SEO skills.

One key, two endpoints. Same bearer token; no separate MCP — call via `WebFetch` or `curl`.

## Auth

`Authorization: Bearer $JINA_READER_API_KEY` on every request. Key is in `.env` (referenced by this name for historical reasons; the same key works for Reader + Search).

## Reader — fetch one URL as Markdown

```
GET https://r.jina.ai/<full-target-URL>
Authorization: Bearer $JINA_READER_API_KEY
Accept: text/plain
```

Returns clean Markdown of the target page's main content. Strips navigation, ads, boilerplate.

Use from `WebFetch` with a short prompt that just asks for the returned markdown.

## Search — SERP + optional content

```
GET https://s.jina.ai/?q=<url-encoded-query>&num=10
Authorization: Bearer $JINA_READER_API_KEY
Accept: application/json
X-Respond-With: markdown      # include scraped content of each result
X-Locale: en-NL               # country/language
```

Or POST for richer options:
```
POST https://s.jina.ai/
Authorization: Bearer $JINA_READER_API_KEY
Content-Type: application/json

{ "q": "<query>", "num": 10, "gl": "nl", "hl": "en" }
```

Returns JSON with `data[]`: each entry has `url`, `title`, `description`, optional `content` when `X-Respond-With: markdown` is set.

**Key advantage over traditional SERP scrapers:** a single Jina Search call returns both the SERP rankings AND the content of each competitor page. The `seo-audit` competitor-analysis step gets organic rankings + competitor page bodies without a second round of Reader calls.

## When to use which

| Task | Call |
|---|---|
| Compare our page vs competitors for a query | Jina Search with `X-Respond-With: markdown` (one call, full analysis) |
| Fetch one specific URL (vendor pricing page, news article body) | Jina Reader |
| Scrape a JS-heavy SPA that Jina can't read | Fall through to local Playwright (we have it installed for Playwright tests) |

## Default parameters for our skills

- Country: `nl` (our primary market)
- Language: `en` (site default locale)
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

- `401 Unauthorized` → check `JINA_READER_API_KEY` in `.env`.
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
