---
name: seo-audit
description: Post-publish SEO audit on a live page. Pulls GSC performance data, Jina Search for competitor SERP + content, current page content from content/, and (optionally) Unlighthouse scores. Writes a prioritised rewrite plan to docs/seo/audits/<collection>-<slug>.md. Use when asked to "audit this page", "seo audit", "what's wrong with this page's SEO", "analyze ranking performance".
argument-hint: "target (e.g. 'service proton-vpn', 'guide gmail-to-protonmail', 'category cloud-storage', 'all'). Optional flags: --lighthouse, --dry-run"
---

# SEO Audit Skill

Post-publish performance audit on live pages. Distinct from `seo-check`, which is a pre-publish QA gate — this skill reads real search data and writes rewrite plans to `docs/seo/audits/`.

Read these helpers before calling tools:
- `../_shared/gsc.md` — GSC MCP tool catalogue
- `../_shared/jina.md` — Jina Reader + Search (SERP + competitor content)
- `../_shared/lighthouse.md` — Unlighthouse invocation
- `../_shared/content-files.md` — where page content lives and how to find it

## Inputs

Parse the argument string into:
- Target selector: `service <name>`, `guide <slug>`, `category <slug>`, `all`, a comma-separated list, or empty (default: top 20 pages by GSC clicks last 30 days).
- Flags: `--lighthouse` (run Unlighthouse), `--dry-run` (print what would be written, don't write).

## Flow per target

### Step 1: Resolve the list of target pages

- `service <name>`: `grep -il '^name: .*<name>' content/services/*/en.md`. Pick the best match; if ambiguous, ask the user.
- `guide <slug>`: `content/guides/<slug>/en.md`.
- `category <slug>`: every service in that category: `grep -l '^category: <slug>$' content/services/*/en.md`.
- `all`: every `content/services/*/en.md` + `content/guides/*/en.md`. Skip files with `draft: true` (not live).
- Default (no arg): call GSC `advanced_search_analytics` with `dimensions=[page]`, sort by clicks desc, limit 20. Then map each URL back to a content file via its slug (last path segment = directory name).

### Step 2: Per-page audit flow

For each resolved page, run the following in order:

1. **Construct the page's canonical URL.**
   - Services with `region === "non-eu"`: `/en/services/non-eu/<slug>`.
   - All other services (`region` = `eu` or `eu-friendly`): `/en/services/eu/<slug>`.
   - Guides: `/en/guides/<category>/<slug>` (`category` from the guide's frontmatter).
   - Prepend `https://www.switch-to.eu` (site is www-canonical).

2. **Fetch GSC data** (see `_shared/gsc.md`).
   - Use `operator: "contains"` on the URL path (e.g. `/services/eu/proton-drive`), NOT `equals` on the full URL. Post-migration, GSC has impressions split across `switch-to.eu/en/<path>`, `www.switch-to.eu/<path>` (no `/en/`), and `www.switch-to.eu/en/<path>` — `contains` aggregates them; `equals` misses most history.
   - Call `advanced_search_analytics` with `{ filters: [{ dimension: "page", operator: "contains", expression: "<path>" }], dimensions: ["date"], days: 90 }` → sum impressions, clicks across dates; compute avg ctr / position → `currentMetrics`.
   - Call `advanced_search_analytics` with `{ filters: [path-contains filter], dimensions: ["query"], row_limit: 30, order_by: "impressions" }` → top 10 by impressions → `topQueries`. Filter the same rows by `position >= 11 && position <= 20 && impressions >= 5` → `almostRankingQueries`.
   - If zero rows returned, try broader path variants before giving up (e.g. strip category segment). Slug drift is real — some pages have old slugs still accumulating impressions.

3. **Determine the target keyword.**
   - If `topQueries` non-empty: use the highest-impression query.
   - Else: fall back to the `name` field for services, `title` for guides.

4. **Scrape the SERP + competitor content** (see `_shared/jina.md`).
   - Call Jina Search with `q=<target keyword>`, `num=10`, `gl=nl`, `hl=en` and the `X-Respond-With: markdown` header (curl recipe in `_shared/jina.md`). Save the JSON to a scratch file.
   - Single call returns top 10 organic results (rank, URL, title, description) PLUS the markdown body of each competitor page. Populate `competitors[]` from the rank/URL/title/description fields; keep competitor `content` in memory for step 7's content-gap analysis — no need for a second round of Reader calls.

5. **Read the current page content.**
   - Read the `en.md` from step 1 — `name` / `title`, `metaTitle`, `metaDescription`, `description`, and the markdown body (for guides, all sections and steps).

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

9. **Write the narrative** in markdown: `## Summary` (3–5 sentences opening with the priority rationale + top 3 specific fixes), `## Competitor analysis` (2–3 paragraphs: what the top 3 competitors have in common, what our page does differently) and `## Rewrite plan` (the concrete edits, in priority order, naming the file and field to change).

10. **Write the audit file** `docs/seo/audits/<collection>-<slug>.md`, where `<collection>` is `services` or `guides` (e.g. `docs/seo/audits/services-proton-mail.md`). Create `docs/seo/audits/` if it doesn't exist.
    - One file per page. A re-audit overwrites the file. History lives in git (`git log -p docs/seo/audits/<file>`).
    - If the file already exists with `status: applied` or `rejected`, mention the previous status in the new `## Summary` before overwriting.
    - Skip the write entirely if `--dry-run`; print the would-be file instead.

    Format (frontmatter = the structured fields, body = the narrative from step 9). Omit groups you have no data for. Quote dates and strings containing `: `.

    ```markdown
    ---
    pageType: service            # service | guide
    slug: proton-mail
    file: content/services/proton-mail/en.md
    url: https://www.switch-to.eu/en/services/eu/proton-mail
    priority: high               # high | medium | low
    status: new                  # new | reviewed | applied | rejected
    auditedAt: '2026-11-02'
    targetKeyword: proton mail review
    currentMetrics:
      impressions: 4210
      clicks: 96
      ctr: 0.0228                # decimal 0-1
      avgPosition: 8.4
      dateRange:
        from: '2026-08-04'
        to: '2026-11-02'
    topQueries:
    - query: proton mail
      impressions: 1800
      clicks: 40
      position: 9.1
    almostRankingQueries:        # positions 11-20 with meaningful impressions
    - query: proton mail pricing
      impressions: 320
      position: 13.2
    competitors:
    - rank: 1
      url: https://...
      title: ...
      metaDescription: ...
    proposedChanges:
      title: ...
      metaDescription: ...
      h1: ...
      contentGaps:
      - gap: Comparison with Tuta
        rationale: Covered by 6 of the top 10 results.
    lighthouse:                  # only with --lighthouse
      performance: 92
      accessibility: 100
      bestPractices: 96
      seo: 100
      runAt: '2026-11-02'
    ---

    ## Summary
    ...

    ## Competitor analysis
    ...

    ## Rewrite plan
    ...
    ```

    Validate the frontmatter with the snippet from `_shared/content-files.md`.

## Error handling — graceful degradation

| Failure | Behaviour |
|---|---|
| GSC returns no data for URL | Write `currentMetrics` zeros; set priority=low; note "no GSC data" in `## Summary`; continue with SERP + content analysis. |
| Jina Search rate-limit / 429 | Back off 60s, retry once. If still failing, skip `competitors` + `## Competitor analysis`; note in `## Summary`; write remainder. |
| Jina Search empty `data[]` | Skip `competitors`; note "no SERP data for target keyword" in `## Summary`; continue with GSC + content analysis. |
| Lighthouse fails / times out | Skip `lighthouse` group; note in `## Summary`. |
| Content file not found | Abort this page only; continue batch. |
| Audit file write or validation fails | Abort with error; don't silently drop. |

## Multi-target batching

When the target resolves to >1 page:
- Default concurrency: 5 parallel subagents using the `Agent` tool pattern (as in `bulk-*` skills).
- Each subagent runs the same per-page flow above, writes only its own audit file, and reports back a one-line status.
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
  → Written to docs/seo/audits/<collection>-<slug>.md
```

Batch summary at end of multi-target run:
```
<N> audited in <M> minutes • <N> HIGH • <N> MEDIUM • <N> LOW
```

`--dry-run` output: print the full would-be audit file, don't write it.

## Cost per run

- GSC: 2 calls/page (free)
- Jina Search: 1 call/page × ~15k tokens = ~0.15% of the 10M free-tier budget per audit
- Unlighthouse: local CPU, ~15s/page
- File writes: 1/page

Top-20 run: $0 out-of-pocket + ~5 min wall-clock (without Lighthouse). With Lighthouse: +~5 min.

## Important notes

- EN-only for phase 1. NL URL auditing is a follow-up.
- One file per page; re-audits overwrite it and git keeps the history. Flip `status` to `reviewed` / `applied` / `rejected` by editing the file after acting on a recommendation.
- This skill audits live pages. Items with `draft: true` aren't in production, have no GSC data and would all come back LOW priority — skip them.
- The audit only writes the plan. Apply the edits to `content/` separately (e.g. with `/write-service`), then flip the audit's `status`.
