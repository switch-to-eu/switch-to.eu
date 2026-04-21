# Shared Helper: Apify MCP

Patterns for calling the `apify` MCP server. The server is configured with `tools=actors,docs,runs,storage,apify/website-content-crawler,apify/web-scraper,apify/google-search-scraper` — these actors are directly callable as tools.

## Actor: `apify/google-search-scraper`

Structured SERP data. Use when comparing our ranking against organic competitors.

**Input shape:**

```json
{
  "queries": ["<one query per line>"],
  "resultsPerPage": 10,
  "countryCode": "NL",
  "languageCode": "en",
  "maxPagesPerQuery": 1
}
```

**Output shape (per query):**
Array of organic results with `url`, `title`, `description`, `position` fields. Ignore ads / shopping / featured snippets unless specifically needed.

**Cost:** ~$0.25 per 1000 results. Each query returning 10 results ≈ $0.0025. For our workloads budget 1 query per page being audited.

## Actor: `apify/website-content-crawler`

Converts a page (including JS-heavy) to clean markdown. Use as fallback when Jina Reader returns empty or when the page is known to require JS rendering.

**Input shape:**

```json
{
  "startUrls": [{ "url": "https://example.com/page" }],
  "crawlerType": "playwright:firefox",
  "maxRequestsPerCrawl": 1,
  "maxCrawlDepth": 0
}
```

**Output shape:**
Array with `url`, `text`, `markdown`, `metadata.title`, `metadata.description`, `metadata.ogImage`. Use `markdown` for downstream processing.

**Cost:** ~$1 per 1000 pages. Call only when Jina fails.

## Jina vs Apify website-content-crawler — decision rule

Default: try Jina Reader first (free within our 10M token allowance, ~1s/page).
Fall through to `apify/website-content-crawler` when:
- Jina response is empty or < 200 characters
- Target URL is on a known JS-heavy domain (e.g. vendor SPAs)
- Jina returned a 403 / 429

## Budget per skill run

- `seo-audit` top-20: ~20 × `google-search-scraper` calls = ~$0.05
- `opportunity-finder` full run: ~25 × `google-search-scraper` calls = ~$0.006
- `research` per service: 3 × `google-search-scraper` + occasional `website-content-crawler` = ~$0.002

## Error patterns

- `Actor run timed out` — rerun once with fewer queries. If second attempt also times out, report a gap and continue.
- `402 Payment required` — Apify account out of credits. Halt, report to operator.
- Empty `organicResults` for all queries — usually a transient SERP anomaly or query with no results. Log and proceed without competitor data.
