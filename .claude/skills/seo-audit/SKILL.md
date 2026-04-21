---
name: seo-audit
description: Post-publish SEO audit on a live page. Pulls GSC performance data, Apify SERP for competitors, current page content from Payload, and (optionally) Unlighthouse scores. Writes a prioritised rewrite plan to the pageAudits collection. Use when asked to "audit this page", "seo audit", "what's wrong with this page's SEO", "analyze ranking performance".
argument-hint: "target (e.g. 'service proton-vpn', 'guide gmail-to-protonmail', 'category cloud-storage', 'all'). Optional flags: --lighthouse, --dry-run"
---

# SEO Audit Skill

Post-publish performance audit on live pages. Distinct from `seo-check`, which is a pre-publish QA gate — this skill reads real search data and writes rewrite plans to Payload.

Read these helpers before calling tools:
- `../_shared/gsc.md` — GSC MCP tool catalogue
- `../_shared/apify.md` — SERP scraping patterns
- `../_shared/lighthouse.md` — Unlighthouse invocation
- `../_shared/payload-operational.md` — how to write to `pageAudits`
- `../_shared/lexical-json.md` — richText JSON format

## Inputs

Parse the argument string into:
- Target selector: `service <name>`, `guide <slug>`, `category <slug>`, `all`, a comma-separated list, or empty (default: top 20 pages by GSC clicks last 30 days).
- Flags: `--lighthouse` (run Unlighthouse), `--dry-run` (print what would be written, don't write).

## Flow per target

### Step 1: Resolve the list of target pages

- `service <name>`: call `mcp__Payload__findServices` with `{ where: { name: { contains: "<name>" } }, limit: 5 }`. Pick the best match; if ambiguous, ask the user.
- `guide <slug>`: call `mcp__Payload__findGuides` with `{ where: { slug: { equals: "<slug>" } } }`.
- `category <slug>`: call `mcp__Payload__findServices` with `{ where: { category.slug: { equals: "<slug>" } } }`.
- `all`: call `findServices` + `findGuides` with pagination until empty.
- Default (no arg): call GSC `advanced_search_analytics` with `dimensions=[page]`, sort by clicks desc, limit 20. Then map each URL back to a Payload document via slug matching.

### Step 2: Per-page audit flow

For each resolved page, run the following in order:

1. **Construct the page's canonical URL.**
   - Services with `region === "non-eu"`: `/en/services/non-eu/<slug>`.
   - Services with a category: `/en/services/<category.slug>/<slug>`.
   - Guides: `/en/guides/<category.slug>/<slug>`.
   - Prepend `https://switch-to.eu`.

2. **Fetch GSC data** (see `_shared/gsc.md`).
   - Call `advanced_search_analytics` with `{ filters: [{ dimension: "page", operator: "equals", expression: "<full-url>" }], dimensions: ["date"], dateRange: "last-90-days" }` → aggregate impressions, clicks, ctr, avgPosition → `currentMetrics`.
   - Call `advanced_search_analytics` with `{ filters: [page filter], dimensions: ["query"], rowLimit: 20 }` → sort by impressions → top 10 → `topQueries`. Filter by `position >= 11 && position <= 20 && impressions >= 50` → `almostRankingQueries`.

3. **Determine the target keyword.**
   - If `topQueries` non-empty: use the highest-impression query.
   - Else: fall back to the Payload `name` field for services, `title` for guides.

4. **Scrape the SERP** (see `_shared/apify.md`).
   - Call `apify/google-search-scraper` with `queries=[<target keyword>]`, `countryCode=NL`, `languageCode=en`, `resultsPerPage=10`.
   - Take top 10 organic results → `competitors[]`.

5. **Fetch current page content from Payload.**
   - `mcp__Payload__findServices` or `findGuides` by id (from step 1) — get `name`, `metaTitle`, `metaDescription`, `content`, `description`, etc.

6. **Optional: run Unlighthouse** (only when `--lighthouse`, see `_shared/lighthouse.md`).
   - Run against the page URL. Parse 4 scores. Populate `lighthouse` group.

7. **Synthesize proposed changes.**
   - Compare current title/metaDescription/h1 against competitor patterns from step 4.
   - Propose replacements that include the top GSC query and match the dominant competitor pattern (5–7 tokens for titles, 150–160 chars for meta descriptions).
   - Identify content gaps: topics covered by 3+ of the top 10 competitors that our page lacks. List as `contentGaps[]`.

8. **Determine priority.**
   - HIGH: `currentMetrics.impressions > 1000` AND CTR < position-benchmark (call `ctr_vs_benchmark` once per run to get benchmarks), OR `almostRankingQueries` with sum impressions > 500.
   - MEDIUM: `currentMetrics.impressions > 100` with identifiable fixes.
   - LOW: else.

9. **Build narrative richText** for `competitorAnalysis` (2–3 paragraphs: what the top 3 competitors have in common, what our page does differently) and `summary` (3–5 sentences opening with the priority rationale + top 3 specific fixes).

10. **Write to Payload** via `mcp__Payload__createPageAudits`.
    - Discriminator + single-target relation (the plugin doesn't support polymorphic relations):
      - For a service: `pageType: "service"`, `service: <service-id>`
      - For a guide: `pageType: "guide"`, `guide: <guide-id>`
    - `priority`, `status: "new"`, `auditedAt: <today>`, `summaryTitle: "<slug>-<today>"`
    - all fields populated from steps 2–9.
    - Skip the write entirely if `--dry-run`; print what would be written instead.

## Error handling — graceful degradation

| Failure | Behaviour |
|---|---|
| GSC returns no data for URL | Write `currentMetrics` zeros; set priority=low; note "no GSC data" in `summary`; continue with SERP + content analysis. |
| Apify rate-limit / error | Skip `competitors` + `competitorAnalysis`; note in `summary`; write remainder. |
| Lighthouse fails / times out | Skip `lighthouse` group; note in `summary`. |
| Payload read fails (page not found) | Abort this page only; continue batch. |
| Payload write fails | Abort with error; don't silently drop. |

## Multi-target batching

When the target resolves to >1 page:
- Default concurrency: 5 parallel subagents using the `Agent` tool pattern (as in `bulk-*` skills).
- Each subagent runs the same per-page flow above and reports back a one-line status.
- Main thread aggregates: `<N> audited • <N> HIGH • <N> MEDIUM • <N> LOW`.

## Output format

Per-page success:
```
✓ seo-audit: <slug>
  URL: <url>
  Priority: <HIGH|MEDIUM|LOW>
  Performance (90d): <impressions> imp, <clicks> clk, CTR <ctr>%, avg pos <pos>
  Top fix: <short description>
  Top fix: <short description>
  Top fix: <short description>
  → Written to pageAudits/<id>
```

Batch summary at end of multi-target run:
```
<N> audited in <M> minutes • <N> HIGH • <N> MEDIUM • <N> LOW
```

`--dry-run` output: print the full shape of the would-be `createPageAudits` payload as a JSON block, do not call the tool.

## Cost per run

- GSC: 2 calls/page (free)
- Apify SERP: ~$0.0025/page
- Unlighthouse: local CPU, ~15s/page
- Payload writes: 1/page

Top-20 run: ~$0.05 + ~5 min wall-clock (without Lighthouse). With Lighthouse: +~5 min.

## Important notes

- EN-only for phase 1. NL URL auditing is a follow-up.
- Every audit is a new row; history accumulates. Flip `status` to `applied` / `rejected` manually in admin after acting on a recommendation.
- This skill reads published live content. Draft-only pages have no GSC data and will all come back LOW priority — that's expected behaviour, not a bug.
