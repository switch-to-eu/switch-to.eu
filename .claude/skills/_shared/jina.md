# Shared Helper: Jina AI

Jina provides both Reader (`r.jina.ai`) and Search (`s.jina.ai`) under one API key. Used for SERP scraping and page content extraction across the research and SEO skills.

Call Jina directly with `curl` from the Bash tool. Don't use `WebFetch`: it can't pass the `Authorization: Bearer` header Jina requires.

## Auth

Both endpoints read the key from `$JINA_API_KEY`. The same key powers Reader and Search.

```bash
[ -n "$JINA_API_KEY" ] || echo "JINA_API_KEY is not set"
```

If it's empty, check the root `.env` (older setups called it `JINA_READER_API_KEY`) and load it for the command: `export JINA_API_KEY=$(grep -E '^JINA(_READER)?_API_KEY=' .env | head -1 | cut -d= -f2-)`. Never print the key or write it into a file.

## Reader: fetch one URL as Markdown

```bash
curl -sS --fail-with-body "https://r.jina.ai/https://example.com/pricing" \
  -H "Authorization: Bearer $JINA_API_KEY" \
  -H "Accept: text/plain"
```

Returns clean Markdown of the target page's main content. Strips navigation, ads, boilerplate. Pass the target URL unencoded after `https://r.jina.ai/`.

## Search: SERP + optional content

```bash
curl -sS --fail-with-body -G "https://s.jina.ai/" \
  --data-urlencode "q=european alternative to chrome" \
  --data-urlencode "num=10" \
  --data-urlencode "gl=nl" \
  --data-urlencode "hl=en" \
  -H "Authorization: Bearer $JINA_API_KEY" \
  -H "Accept: application/json" \
  -H "X-Respond-With: markdown"    # only when you want each result's page body
```

Returns JSON with `data[]`: each entry has `url`, `title`, `description`, plus `content` (scraped Markdown body) when `X-Respond-With: markdown` is set.

Parameters:
- `q`: the query (always `--data-urlencode`)
- `num`: results, 1-20, default 10
- `gl`: country code, default `nl`
- `hl`: language code, default `en`
- `X-Respond-With: markdown` header: include each result's page body. Costs more tokens. Leave it off unless you need content.

Pipe through `jq` to trim the payload, e.g. `| jq '[.data[] | {url, title, description}]'`. With content, save to a scratch file and read the parts you need instead of dumping 30k tokens into context.

**Key advantage:** a single search call with content returns both SERP rankings and the content of each competitor page. The `seo-audit` competitor-analysis step gets organic rankings + competitor page bodies in one call.

## When to use which

| Task | Call |
|---|---|
| Compare our page vs competitors for a query | Search with `X-Respond-With: markdown` (one call, full analysis) |
| Fetch one specific URL (vendor pricing, news article body) | Reader |
| Scrape a JS-heavy SPA that Jina can't read | Fall through to local Playwright (installed for the Playwright tests) |

## Default parameters for our skills

- Country: `gl=nl` (our primary market)
- Language: `hl=en` (site default locale)
- Results per query: `num=10` (top organic; Google's 2026 cap is 10/page anyway)
- Content mode: on for `seo-audit` competitor analysis and `research` news; off for `opportunity-finder` (just need ranks + titles)

## Cost / budget

Free tier: 10M tokens, no expiry. Rough per-call token cost:
- Reader call: 500-3000 tokens depending on page size
- Search without content: ~200 tokens per result
- Search with content: 1000-3000 tokens per result

Our workloads:
- `seo-audit` top-20 run: 20 search calls x ~15k tokens = 300k tokens (3% of budget)
- `opportunity-finder` monthly: ~25 search calls x ~2k tokens = 50k tokens (negligible)
- `research` per service: ~5 Reader calls + 3 searches = ~30k tokens (negligible)

At current volume the free tier lasts ~30 months.

## Error patterns

`--fail-with-body` makes curl exit non-zero on HTTP errors and still print the body.

- `JINA_API_KEY` empty → see Auth above. Search needs the key: don't call it without one. Reader also works without the key at a low rate limit: drop the `Authorization` header and wait about 3 seconds between calls. Use that only when the key isn't available.
- Pages render from Jina's location, so prices can come back in USD and `?currency=EUR` is often ignored. Find the EUR price on the vendor's help or plan pages. Never convert a currency yourself.
- `401 Unauthorized` → bad or expired key. Check the root `.env`.
- `429 Too Many Requests` → back off 60s, retry once. If it still fails, skip and note it in the output.
- Empty `data[]` from Search → treat as a valid "no results" signal. Unusual for well-formed queries.
- Reader returns <200 characters → page is likely JS-rendered. Fall through to local Playwright.
- Proxy or TLS errors in a cloud session → see the environment's proxy notes. Never disable TLS verification.

## Playwright fallback

For the rare JS-heavy page Jina can't read:

```bash
npx playwright install chromium  # first run only (already installed)
# Then use the Playwright MCP if available,
# or run a tiny one-off node script that launches chromium and extracts textContent.
```

Keep this for exceptions, not the default. If you see Playwright being called more than once per week, something is wrong with the upstream Jina request. Debug that instead.
