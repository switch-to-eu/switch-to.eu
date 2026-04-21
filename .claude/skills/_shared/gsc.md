# Shared Helper: Google Search Console MCP

Patterns for calling the `gsc` MCP server (`suganthan-gsc-mcp`). Read this helper from any skill that touches GSC rather than duplicating.

Server exposes 20 tools; default site is `sc-domain:switch-to.eu` (set in `.mcp.json`). First call opens a browser for OAuth consent.

## Analysis tools (prefer these over raw SQL-style queries)

| Tool | When to use | Key inputs |
|---|---|---|
| `site_snapshot` | Overall site performance with period comparison | `dateRange` (default last 28 days, compare prev) |
| `quick_wins` | Keywords at positions 4–15 with high impressions | `minImpressions` (default 100) |
| `ctr_opportunities` | Pages with high impressions but CTR below expected | `minImpressions`, `ctrGap` threshold |
| `traffic_drops` | Pages that lost traffic — ranking / CTR / demand decomposition | `comparisonPeriodDays` (default 30) |
| `content_gaps` | Topics with search demand but no dedicated page | `minImpressions` |
| `cannibalization_check` | Keywords where multiple pages compete | — |
| `content_decay` | Pages declining across 3 consecutive 30-day periods | — |
| `topic_cluster_performance` | Aggregated performance for a URL path pattern | `urlPattern` (e.g. `/guides/`) |
| `ctr_vs_benchmark` | Your CTR per position vs industry benchmarks | — |
| `inspect_url` | Is this URL indexed? Canonical, robots issues | `url` (absolute) |
| `check_alerts` | Position drops, CTR collapses, click losses | `lookbackDays` |
| `content_recommendations` | Prioritised actions: update / create / consolidate | — |

## Raw escape hatch

- `advanced_search_analytics` — full GSC Query API access. Use `dimensions=[query, page]`, `filters` array with `page` filter for per-URL reports. Last resort when no analysis tool fits.

## Output patterns

Every tool returns structured JSON. Persist the raw payload when writing to Payload — truncate only for terminal display.

## Rate limits

GSC API: 1200 requests/min per user. Not a practical constraint for our workloads.

## Error patterns

- `"No property access"` — OAuth token expired or site not verified. Re-run OAuth.
- Empty array returned — the URL is too new, not indexed, or has zero impressions in the date range. Treat as valid "no data" signal, not an error.

## Default date range

When a tool accepts a date range and none is passed, use last 90 days. This matches the spec's per-page audit window.
