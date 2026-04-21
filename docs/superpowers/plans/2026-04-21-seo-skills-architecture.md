# SEO Skills Architecture Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship three data-driven SEO skills (`seo-audit`, `opportunity-finder`, expanded `research`) with the Payload collections and shared helpers they depend on, in one PR on branch `rework`.

**Architecture:** Three phases land sequentially in a single PR. Phase 1 builds the Payload `pageAudits` collection, shared MCP helper docs, and the `seo-audit` skill. Phase 2 adds the `contentOpportunities` collection and the `opportunity-finder` skill. Phase 3 extends the `services` collection with Reddit / news / sentiment fields and rewrites the existing `research` skill body. Each phase ends with a smoke test so the PR can be inspected at three natural checkpoints.

**Tech Stack:** Next.js 16 App Router, Payload CMS 3.80 (Postgres adapter), TypeScript strict, `.claude/skills/` Markdown-driven skills, MCPs: Suganthan GSC (OAuth), Apify (remote via `mcp-remote`), Reddit (anonymous), Payload local (port 5010), plus Jina Reader (HTTPS + bearer) and Unlighthouse (`npx`) called directly, not via MCP.

**Spec:** `docs/superpowers/specs/2026-04-21-seo-skills-architecture-design.md`

**Conventions:**
- Each task ends with a commit. No merging.
- Branch is `rework`. No new branch.
- All Payload collection work uses `push`-style schema sync via the Postgres adapter (no migrations folder). Regenerate types after every collection change: `pnpm --filter website generate:types`.
- Before running any MCP-backed verification step, the website dev server must be up: `pnpm --filter website dev` (port 5010; the Payload MCP routes through it).
- First GSC MCP call opens a browser for OAuth; token caches thereafter. Run any GSC-touching task at a terminal where a browser can be opened.
- After any change to `.mcp.json` or skill files, restart Claude Code to reload MCPs and skill definitions.

---

## Pre-flight (run once before Phase 1)

### Task 0: Verify environment and MCP connectivity

**Files:** none (verification only)

- [ ] **Step 1: Verify dev server boots**

```bash
pnpm --filter website dev
```

Expected: server listening at `http://localhost:5010` and admin accessible at `http://localhost:5010/admin`. Leave running in a background terminal for the rest of the plan.

- [ ] **Step 2: Verify `gsc-oath-secrets.json` exists at repo root**

```bash
ls -la "./gsc-oath-secrets.json"
```

Expected: file exists and is non-empty. If missing, follow Google Cloud Console → OAuth client ID → Desktop app, download JSON, save to repo root as `gsc-oath-secrets.json`. (Path referenced by `.mcp.json`.)

- [ ] **Step 3: Confirm four MCPs are configured in `.mcp.json`**

```bash
jq 'keys' .mcp.json | head -1
jq '.mcpServers | keys' .mcp.json
```

Expected output: `["gsc", "reddit", "Payload", "apify"]`. No action if already present.

- [ ] **Step 4: Test each MCP via Claude Code**

From Claude Code in this repo, ask for each of the following and verify a response comes back (no call-setup error):
- GSC: "call `site_snapshot` for `sc-domain:switch-to.eu` with default dates" — first call opens browser for OAuth consent; approve.
- Apify: "list the Apify actors currently exposed" — expect at least `apify/google-search-scraper`, `apify/website-content-crawler`.
- Reddit: "search r/privacy for 'proton' in last 90 days, return top 3" — expect 3 results.
- Payload: "call `mcp__Payload__findServices` with limit 1" — expect one service row.

- [ ] **Step 5: No-op commit for the checkpoint**

No commit needed — this task verifies existing state only. If GSC OAuth produced a token cache file, do not commit it (it should already be covered by `.gitignore`).

---

# PHASE 1 — `seo-audit`

## Task 1: Create the `PageAudits` Payload collection

**Files:**
- Create: `apps/website/collections/PageAudits.ts`

- [ ] **Step 1: Write the collection file**

Create `apps/website/collections/PageAudits.ts`:

```typescript
import type { CollectionConfig } from "payload";

export const PageAudits: CollectionConfig = {
  slug: "pageAudits",
  admin: {
    useAsTitle: "summaryTitle",
    defaultColumns: ["page", "priority", "status", "currentMetrics_clicks", "auditedAt"],
    description:
      "Post-publish SEO audits. One row per audit run; multiple rows per page over time form history. Operational data — no drafts.",
  },
  access: {
    read: () => true,
  },
  fields: [
    // Sidebar
    {
      name: "page",
      type: "relationship",
      relationTo: ["services", "guides"],
      required: true,
      admin: { position: "sidebar" },
    },
    {
      name: "priority",
      type: "select",
      required: true,
      options: [
        { label: "High", value: "high" },
        { label: "Medium", value: "medium" },
        { label: "Low", value: "low" },
      ],
      defaultValue: "medium",
      admin: { position: "sidebar" },
    },
    {
      name: "status",
      type: "select",
      required: true,
      options: [
        { label: "New", value: "new" },
        { label: "Reviewed", value: "reviewed" },
        { label: "Applied", value: "applied" },
        { label: "Rejected", value: "rejected" },
      ],
      defaultValue: "new",
      admin: { position: "sidebar" },
    },
    {
      name: "auditedAt",
      type: "date",
      required: true,
      admin: { position: "sidebar" },
    },
    {
      name: "summaryTitle",
      type: "text",
      admin: {
        position: "sidebar",
        description: "Auto-filled from page slug + auditedAt — used as admin list title.",
      },
    },

    // Current metrics (GSC, last 90 days)
    {
      name: "currentMetrics",
      type: "group",
      fields: [
        { name: "impressions", type: "number" },
        { name: "clicks", type: "number" },
        { name: "ctr", type: "number", admin: { description: "Decimal 0–1" } },
        { name: "avgPosition", type: "number" },
        {
          name: "dateRange",
          type: "group",
          fields: [
            { name: "from", type: "date" },
            { name: "to", type: "date" },
          ],
        },
      ],
    },

    // GSC queries
    {
      name: "topQueries",
      type: "array",
      fields: [
        { name: "query", type: "text", required: true },
        { name: "impressions", type: "number" },
        { name: "clicks", type: "number" },
        { name: "position", type: "number" },
      ],
    },
    {
      name: "almostRankingQueries",
      type: "array",
      admin: { description: "Queries at positions 11–20 with meaningful impressions." },
      fields: [
        { name: "query", type: "text", required: true },
        { name: "impressions", type: "number" },
        { name: "position", type: "number" },
      ],
    },

    // Competitor SERP
    {
      name: "competitors",
      type: "array",
      fields: [
        { name: "rank", type: "number", required: true },
        { name: "url", type: "text", required: true },
        { name: "title", type: "text" },
        { name: "metaDescription", type: "textarea" },
      ],
    },
    {
      name: "competitorAnalysis",
      type: "richText",
    },

    // Proposed rewrites
    {
      name: "proposedChanges",
      type: "group",
      fields: [
        { name: "title", type: "text" },
        { name: "metaDescription", type: "textarea" },
        { name: "h1", type: "text" },
        {
          name: "contentGaps",
          type: "array",
          fields: [
            { name: "gap", type: "text", required: true },
            { name: "rationale", type: "textarea" },
          ],
        },
      ],
    },

    // Optional Lighthouse
    {
      name: "lighthouse",
      type: "group",
      admin: {
        description: "Populated only when the skill runs with --lighthouse.",
      },
      fields: [
        { name: "performance", type: "number" },
        { name: "accessibility", type: "number" },
        { name: "bestPractices", type: "number" },
        { name: "seo", type: "number" },
        { name: "runAt", type: "date" },
      ],
    },

    // Narrative
    {
      name: "summary",
      type: "richText",
    },
  ],
};
```

- [ ] **Step 2: Verify TypeScript compile**

```bash
pnpm --filter website lint
```

Expected: no errors referencing `PageAudits.ts`.

- [ ] **Step 3: Commit**

```bash
git add apps/website/collections/PageAudits.ts
git commit -m "feat(payload): add PageAudits collection for post-publish SEO audits"
```

---

## Task 2: Register `PageAudits` in Payload

**Files:**
- Modify: `apps/website/collections/index.ts`
- Modify: `apps/website/payload.config.ts`

- [ ] **Step 1: Export from collections index**

Edit `apps/website/collections/index.ts` — add the new export alphabetically where appropriate. Exact new state:

```typescript
export { Categories } from "./Categories";
export { Guides } from "./Guides";
export { LandingPages } from "./LandingPages";
export { Media } from "./Media";
export { PageAudits } from "./PageAudits";
export { Pages } from "./Pages";
export { Services } from "./Services";
export { Users } from "./Users";
```

- [ ] **Step 2: Register in `payload.config.ts`**

Edit the import block and `collections` array and `mcpPlugin.collections` map.

Update the import:
```typescript
import {
  Categories,
  Guides,
  LandingPages,
  Media,
  PageAudits,
  Pages,
  Services,
  Users,
} from "./collections";
```

Update the `collections:` line:
```typescript
collections: [Categories, Guides, LandingPages, Media, PageAudits, Pages, Services, Users],
```

Update the `mcpPlugin` config to expose the new collection:
```typescript
mcpPlugin({
  collections: {
    services: { enabled: true },
    categories: { enabled: true },
    guides: { enabled: true },
    "landing-pages": { enabled: true },
    pages: { enabled: true },
    "page-audits": { enabled: true },
    media: {
      enabled: {
        find: true,
        create: false,
        update: false,
        delete: false,
      },
    },
  },
  mcp: {
    tools: [wipeContentTool],
  },
}),
```

Note: the Payload collection `slug` is `pageAudits` (camelCase in the file), but the MCP plugin keys use the auto-generated kebab-case slug `page-audits`. Follow the precedent from `landing-pages` above.

- [ ] **Step 3: Regenerate Payload types**

```bash
pnpm --filter website generate:types
```

Expected: `apps/website/payload-types.ts` updated with `PageAudit` type.

- [ ] **Step 4: Verify types file compiles**

```bash
pnpm --filter website lint
```

Expected: no errors.

- [ ] **Step 5: Restart dev server, confirm collection appears in admin**

Stop and restart `pnpm --filter website dev`. Open `http://localhost:5010/admin`. Sidebar should list "Page Audits" collection.

- [ ] **Step 6: Commit**

```bash
git add apps/website/collections/index.ts apps/website/payload.config.ts apps/website/payload-types.ts
git commit -m "feat(payload): register PageAudits collection and expose via MCP"
```

---

## Task 3: Smoke-test MCP exposure of `PageAudits`

**Files:** none (verification)

- [ ] **Step 1: Restart Claude Code to reload MCPs**

Quit and relaunch Claude Code in this repo. (Required because Payload MCP tool list is discovered on startup.)

- [ ] **Step 2: Create a sample audit via MCP**

Ask Claude Code to call `mcp__Payload__createPageAudits` with a minimal valid payload:
```
{
  "page": { "relationTo": "services", "value": "<use one real service id from findServices>" },
  "priority": "low",
  "status": "new",
  "auditedAt": "2026-04-21",
  "summaryTitle": "smoke test"
}
```

Expected: the tool returns a created document with an `id` field. Verify it's visible in the admin at `http://localhost:5010/admin/collections/page-audits`.

- [ ] **Step 3: Delete the test record**

Ask Claude Code to call `mcp__Payload__deletePageAudits` with the id from step 2.

Expected: record removed; admin list returns to empty.

- [ ] **Step 4: No commit — verification only**

---

## Task 4: Author shared helper — `_shared/gsc.md`

**Files:**
- Create: `.claude/skills/_shared/gsc.md`

- [ ] **Step 1: Write the helper**

Create `.claude/skills/_shared/gsc.md` with the exact content below.

```markdown
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
```

- [ ] **Step 2: Commit**

```bash
git add .claude/skills/_shared/gsc.md
git commit -m "docs(skills): add _shared/gsc.md helper for GSC MCP"
```

---

## Task 5: Author shared helper — `_shared/apify.md`

**Files:**
- Create: `.claude/skills/_shared/apify.md`

- [ ] **Step 1: Write the helper**

Create `.claude/skills/_shared/apify.md`:

```markdown
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
```

- [ ] **Step 2: Commit**

```bash
git add .claude/skills/_shared/apify.md
git commit -m "docs(skills): add _shared/apify.md helper for Apify MCP"
```

---

## Task 6: Author shared helper — `_shared/lighthouse.md`

**Files:**
- Create: `.claude/skills/_shared/lighthouse.md`

- [ ] **Step 1: Write the helper**

Create `.claude/skills/_shared/lighthouse.md`:

```markdown
# Shared Helper: Unlighthouse

Local Lighthouse runner. Installed as a dependency; invoke via `npx unlighthouse`.

## Single-URL audit

```bash
npx unlighthouse --site <absolute-url> --throttle --output-dir /tmp/unlighthouse-<slug> --no-open
```

- `<slug>` should be derived from the URL (replace non-alphanum with `-`) so runs don't collide.
- `--no-open` disables browser auto-launch; required for non-interactive runs.
- `--throttle` enables simulated 3G + CPU throttling; matches the Lighthouse web UI defaults.

## Reading output

Unlighthouse writes HTML + JSON reports to the output dir. Parse:

```
/tmp/unlighthouse-<slug>/reports/<report-id>.json
```

Extract top-level scores (0–100):
- `categories.performance.score * 100`
- `categories.accessibility.score * 100`
- `categories['best-practices'].score * 100`
- `categories.seo.score * 100`

## Timing

Allow ~15–30s per URL (includes cold-start Chromium). Multi-URL runs that exceed 5 minutes should be batched across invocations rather than one massive run.

## Cleanup

Delete `/tmp/unlighthouse-<slug>` after extracting scores to avoid disk bloat over many audits.

## Error patterns

- `Error: Cannot find Chrome` — install chromium via `npx playwright install chromium` (already installed for this repo's Playwright tests).
- Timeout on a single URL — the target is unreachable or extremely slow. Skip that URL, report a gap, continue.
```

- [ ] **Step 2: Commit**

```bash
git add .claude/skills/_shared/lighthouse.md
git commit -m "docs(skills): add _shared/lighthouse.md helper for Unlighthouse"
```

---

## Task 7: Author shared helper — `_shared/payload-operational.md`

**Files:**
- Create: `.claude/skills/_shared/payload-operational.md`

- [ ] **Step 1: Write the helper**

Create `.claude/skills/_shared/payload-operational.md`:

```markdown
# Shared Helper: Payload Operational Collections

Patterns for writing to the operational collections (`pageAudits`, `contentOpportunities`) and for the new structured fields on `services`. These collections are populated by SEO skills — not by authors — and are reviewed in-admin rather than published.

## Creating a page audit

Tool: `mcp__Payload__createPageAudits`

Minimal required fields:

```json
{
  "page": { "relationTo": "services", "value": "<service-id>" },
  "priority": "high" | "medium" | "low",
  "status": "new",
  "auditedAt": "YYYY-MM-DD",
  "summaryTitle": "<slug>-<YYYY-MM-DD>"
}
```

`page` is a polymorphic relationship. The `relationTo` must be `"services"` or `"guides"`. Always pass the real collection slug (kebab-case), not the camelCase name.

Optional groups and arrays can be added progressively; nothing else is required.

## Creating a content opportunity

Tool: `mcp__Payload__createContentOpportunities`

Minimal required fields:

```json
{
  "type": "missing-guide" | "missing-service" | "almost-ranking" | "new-category",
  "priority": "high" | "medium" | "low",
  "status": "new",
  "discoveredAt": "YYYY-MM-DD",
  "title": "<human readable>",
  "targetKeyword": "<lowercase query>",
  "reasoning": "<Lexical richText — see _shared/lexical-json.md>"
}
```

## Updating structured research fields on a service

Tool: `mcp__Payload__updateServices`

Partial update is supported — only pass fields you want to change. For the new phase-3 fields:

```json
{
  "id": "<service-id>",
  "userSentiment": {
    "positive": 0,
    "negative": 0,
    "mixed": 0,
    "summary": "2-3 sentence consumer-facing summary",
    "lastUpdated": "YYYY-MM-DD"
  },
  "redditMentions": [
    {
      "subreddit": "r/privacy",
      "postUrl": "https://reddit.com/...",
      "postTitle": "...",
      "sentiment": "positive" | "negative" | "mixed" | "neutral",
      "snippet": "...",
      "date": "YYYY-MM-DD"
    }
  ],
  "recentNews": [
    {
      "source": "TechCrunch",
      "url": "https://...",
      "title": "...",
      "date": "YYYY-MM-DD",
      "summary": "1-sentence consumer-facing summary"
    }
  ]
}
```

## Merge semantics for research fields

When the expanded `research` skill re-runs on a service that already has data:
- Scalar fields: overwrite only if new value is non-empty.
- Array fields on `researchFields` (e.g. `certifications`): replace wholesale if new array is non-empty.
- `userSentiment`, `redditMentions`, `recentNews`: always replace with fresh data (time-sensitive).
- `researchNotes`: always regenerate.

## Polymorphic relation query shape

When querying Payload for documents linked to a specific page:

```json
{
  "where": {
    "and": [
      { "page.relationTo": { "equals": "services" } },
      { "page.value": { "equals": "<service-id>" } }
    ]
  }
}
```

## Rate limits

No practical limit — Payload runs locally. Batch writes in loops are fine.
```

- [ ] **Step 2: Commit**

```bash
git add .claude/skills/_shared/payload-operational.md
git commit -m "docs(skills): add _shared/payload-operational.md helper"
```

---

## Task 8: Author the `seo-audit` skill

**Files:**
- Create: `.claude/skills/seo-audit/SKILL.md`

- [ ] **Step 1: Write the skill**

Create `.claude/skills/seo-audit/SKILL.md`:

```markdown
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
    - `page: { relationTo: "services"|"guides", value: <id> }`
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
```

- [ ] **Step 2: Commit**

```bash
git add .claude/skills/seo-audit/SKILL.md
git commit -m "feat(skills): add seo-audit skill for post-publish performance analysis"
```

---

## Task 9: Dry-run smoke test of `seo-audit`

**Files:** none (verification)

- [ ] **Step 1: Restart Claude Code to pick up the new skill**

Quit + relaunch Claude Code so the skill list refreshes.

- [ ] **Step 2: Run dry-run against a known service**

Pick a published service you know has GSC data (e.g. the top-traffic service from your last GSC check). Run:

```
/seo-audit service <name> --dry-run
```

Expected output includes:
- A JSON block showing the proposed `createPageAudits` payload.
- Non-empty `currentMetrics`, `topQueries`, `competitors` arrays.
- A priority assignment (HIGH/MEDIUM/LOW).
- No actual Payload mutation — verify by checking `http://localhost:5010/admin/collections/page-audits` still has 0 rows.

If the output is empty or malformed, debug the skill body before moving on.

- [ ] **Step 3: No commit — verification only.**

---

## Task 10: Live smoke test — 3 pilot pages

**Files:** none (verification + content)

- [ ] **Step 1: Live run on 3 pages**

Pick 3 services with known GSC traffic. For each:

```
/seo-audit service <name>
```

Expected: each run creates a row in `pageAudits`. Open each row in admin; verify:
- `currentMetrics` matches what you'd expect from GSC console
- `competitors[]` has real URLs (not our own domain)
- `proposedChanges.title` makes sense against the current title
- `contentGaps[]` lists plausible gaps, not generic filler
- `summary` has a clear top-3 priorities

If any row has missing or clearly wrong data, note which step in the flow produced the problem and fix the skill before moving on.

- [ ] **Step 2: Delete the 3 pilot audits after review**

Use admin or `mcp__Payload__deletePageAudits` to remove the test rows. (You'll re-run the audit against these pages later, for real.)

- [ ] **Step 3: No commit — verification only.**

---

## Task 11: Forced-failure test

**Files:** none (verification)

- [ ] **Step 1: Simulate Apify outage**

Temporarily edit `.mcp.json` — rename the `apify` key to `apify_disabled` so the MCP won't load. Restart Claude Code.

Run:
```
/seo-audit service <name> --dry-run
```

Expected: the skill completes. The `--dry-run` JSON shows `competitors: []` and a note in `summary` that competitor SERP data was unavailable.

- [ ] **Step 2: Restore `.mcp.json`**

Rename `apify_disabled` back to `apify`. Restart Claude Code.

- [ ] **Step 3: Simulate GSC "no data" for a draft-only page**

Create a new test service (draft, not published) via admin, or pick a known draft. Run:
```
/seo-audit service <name-of-draft>
```

Expected: audit writes a LOW priority row with zero metrics and a note "no GSC data" in `summary`. Competitor data may still be present (SERP scrape works regardless of indexing).

- [ ] **Step 4: Clean up test rows**

Delete the forced-failure audits from `pageAudits`.

- [ ] **Step 5: No commit — verification only.**

---

## Task 12: Author `docs/superpowers/seo-stack-setup.md`

**Files:**
- Create: `docs/superpowers/seo-stack-setup.md`

- [ ] **Step 1: Write the setup doc**

Create `docs/superpowers/seo-stack-setup.md`:

```markdown
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
```

- [ ] **Step 2: Commit**

```bash
git add docs/superpowers/seo-stack-setup.md
git commit -m "docs: add seo-stack-setup.md for developer MCP/env setup"
```

---

# PHASE 2 — `opportunity-finder`

## Task 13: Create the `ContentOpportunities` Payload collection

**Files:**
- Create: `apps/website/collections/ContentOpportunities.ts`

- [ ] **Step 1: Write the collection file**

Create `apps/website/collections/ContentOpportunities.ts`:

```typescript
import type { CollectionConfig } from "payload";

export const ContentOpportunities: CollectionConfig = {
  slug: "contentOpportunities",
  admin: {
    useAsTitle: "title",
    defaultColumns: ["type", "priority", "status", "title", "estimatedMonthlyImpressions", "discoveredAt"],
    description:
      "Content backlog discovered by opportunity-finder. Type discriminator distinguishes demand-driven (GSC) vs supply-driven (Reddit/SERP) finds.",
  },
  access: {
    read: () => true,
  },
  fields: [
    // Sidebar
    {
      name: "type",
      type: "select",
      required: true,
      options: [
        { label: "Missing Guide", value: "missing-guide" },
        { label: "Missing Service", value: "missing-service" },
        { label: "Almost Ranking", value: "almost-ranking" },
        { label: "New Category", value: "new-category" },
      ],
      admin: { position: "sidebar" },
    },
    {
      name: "priority",
      type: "select",
      required: true,
      options: [
        { label: "High", value: "high" },
        { label: "Medium", value: "medium" },
        { label: "Low", value: "low" },
      ],
      defaultValue: "medium",
      admin: { position: "sidebar" },
    },
    {
      name: "status",
      type: "select",
      required: true,
      options: [
        { label: "New", value: "new" },
        { label: "Reviewed", value: "reviewed" },
        { label: "Queued", value: "queued" },
        { label: "Written", value: "written" },
        { label: "Rejected", value: "rejected" },
      ],
      defaultValue: "new",
      admin: { position: "sidebar" },
    },
    {
      name: "discoveredAt",
      type: "date",
      required: true,
      admin: { position: "sidebar" },
    },

    // What & why
    {
      name: "title",
      type: "text",
      required: true,
    },
    {
      name: "targetKeyword",
      type: "text",
      required: true,
      admin: { description: "Lowercase canonical query this opportunity targets." },
    },
    {
      name: "locale",
      type: "select",
      options: [
        { label: "English", value: "en" },
        { label: "Dutch", value: "nl" },
        { label: "Both", value: "both" },
      ],
      defaultValue: "en",
    },
    {
      name: "estimatedMonthlyImpressions",
      type: "number",
    },

    // Evidence
    {
      name: "reasoning",
      type: "richText",
      required: true,
    },
    {
      name: "competitorUrls",
      type: "array",
      fields: [
        { name: "url", type: "text", required: true },
        { name: "title", type: "text" },
        { name: "rank", type: "number" },
      ],
    },
    {
      name: "sourceQueries",
      type: "array",
      admin: { description: "GSC rows that triggered this opportunity (Mode A)." },
      fields: [
        { name: "query", type: "text", required: true },
        { name: "impressions", type: "number" },
        { name: "position", type: "number" },
      ],
    },
    {
      name: "redditSignals",
      type: "array",
      admin: { description: "Reddit posts that triggered this opportunity (Mode B)." },
      fields: [
        { name: "subreddit", type: "text", required: true },
        { name: "postUrl", type: "text", required: true },
        { name: "snippet", type: "textarea" },
        { name: "date", type: "date" },
      ],
    },

    // Output linkage
    {
      name: "resultingContent",
      type: "relationship",
      relationTo: ["services", "guides"],
      admin: { description: "Set once the opportunity has been written into content." },
    },
  ],
};
```

- [ ] **Step 2: Lint**

```bash
pnpm --filter website lint
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add apps/website/collections/ContentOpportunities.ts
git commit -m "feat(payload): add ContentOpportunities collection for SEO backlog"
```

---

## Task 14: Register `ContentOpportunities` in Payload

**Files:**
- Modify: `apps/website/collections/index.ts`
- Modify: `apps/website/payload.config.ts`

- [ ] **Step 1: Export from collections index**

Edit `apps/website/collections/index.ts` — add the new export alphabetically. New state:

```typescript
export { Categories } from "./Categories";
export { ContentOpportunities } from "./ContentOpportunities";
export { Guides } from "./Guides";
export { LandingPages } from "./LandingPages";
export { Media } from "./Media";
export { PageAudits } from "./PageAudits";
export { Pages } from "./Pages";
export { Services } from "./Services";
export { Users } from "./Users";
```

- [ ] **Step 2: Register in `payload.config.ts`**

Update the import:
```typescript
import {
  Categories,
  ContentOpportunities,
  Guides,
  LandingPages,
  Media,
  PageAudits,
  Pages,
  Services,
  Users,
} from "./collections";
```

Update the `collections:` array:
```typescript
collections: [Categories, ContentOpportunities, Guides, LandingPages, Media, PageAudits, Pages, Services, Users],
```

Update `mcpPlugin.collections`:
```typescript
mcpPlugin({
  collections: {
    services: { enabled: true },
    categories: { enabled: true },
    guides: { enabled: true },
    "landing-pages": { enabled: true },
    pages: { enabled: true },
    "page-audits": { enabled: true },
    "content-opportunities": { enabled: true },
    media: {
      enabled: {
        find: true,
        create: false,
        update: false,
        delete: false,
      },
    },
  },
  mcp: {
    tools: [wipeContentTool],
  },
}),
```

- [ ] **Step 3: Regenerate types and lint**

```bash
pnpm --filter website generate:types
pnpm --filter website lint
```

Expected: `payload-types.ts` contains `ContentOpportunity` type; no lint errors.

- [ ] **Step 4: Restart dev server, confirm collection appears**

Restart `pnpm --filter website dev`. Open admin. "Content Opportunities" collection should be in the sidebar.

- [ ] **Step 5: Commit**

```bash
git add apps/website/collections/index.ts apps/website/payload.config.ts apps/website/payload-types.ts
git commit -m "feat(payload): register ContentOpportunities collection and expose via MCP"
```

---

## Task 15: Smoke-test MCP exposure of `ContentOpportunities`

**Files:** none (verification)

- [ ] **Step 1: Restart Claude Code**

Quit + relaunch so the Payload MCP re-lists tools.

- [ ] **Step 2: Create a sample opportunity**

Ask Claude Code to call `mcp__Payload__createContentOpportunities` with:
```json
{
  "type": "missing-guide",
  "priority": "medium",
  "status": "new",
  "discoveredAt": "2026-04-21",
  "title": "smoke test",
  "targetKeyword": "smoke test",
  "reasoning": { "root": { "type": "root", "direction": "ltr", "format": "", "indent": 0, "version": 1, "children": [{ "type": "paragraph", "version": 1, "direction": "ltr", "format": "", "indent": 0, "children": [{ "type": "text", "text": "smoke", "version": 1, "mode": "normal", "style": "", "detail": 0, "format": 0 }] }] } }
}
```

Expected: returns an `id`. Visible in admin at `/admin/collections/content-opportunities`.

- [ ] **Step 3: Delete the test record**

`mcp__Payload__deleteContentOpportunities` with the id.

- [ ] **Step 4: No commit — verification only.**

---

## Task 16: Author shared helper — `_shared/reddit.md`

**Files:**
- Create: `.claude/skills/_shared/reddit.md`

- [ ] **Step 1: Write the helper**

Create `.claude/skills/_shared/reddit.md`:

```markdown
# Shared Helper: Reddit MCP

Patterns for calling the `reddit` MCP server (`reddit-mcp-server`, anonymous mode).

## Available tools

Tools exposed depend on the MCP build; the common surface is:
- `search_posts(subreddit, query, time_filter, limit)` — posts within a subreddit
- `search_all(query, time_filter, limit)` — Reddit-wide
- `get_comments(post_url, limit, sort)` — top comments on a post

## Default subreddit set

For SEO / switch-to.eu use cases, always include these unless overridden:
- `r/privacy`
- `r/europe`
- `r/selfhosted`
- `r/degoogle`

Optional seconds for specific topics: `r/ProtonMail`, `r/VPN`, `r/opensource`.

## Query patterns

- For `research` — `"<service name>"` alone; let sentiment come from the posts returned.
- For `opportunity-finder` Mode B — `"european alternative"`, `"privacy-friendly"`, `"swiss hosted"`, `"gdpr compliant"`, plus each non-EU product name we don't yet have a page for.

## Sentiment classification

For each post or top-comment, score sentiment as `positive | negative | mixed | neutral`:

- Positive signals: words like "love", "great", "switched to", "worth it", "recommend", upvote ratio >0.9.
- Negative signals: "broken", "disappointed", "lost data", "overpriced", "avoid", upvote ratio <0.6.
- Mixed: contains both within the same post.
- Neutral: factual mentions without clear affect.

This is a heuristic — don't over-engineer. Confidence tier for summaries: if the sample is <5 posts, say so in the generated summary.

## Rate limiting

Anonymous mode: ~10 req/min informal limit. Batch subreddit searches; don't fan out more than ~5 queries in parallel.

## Error patterns

- `429` — wait 60s and retry once. If still failing, skip this subreddit and note in the downstream output.
- Empty results — not an error. Record as "no Reddit discussion found in this window."

## Time window

Default `time_filter=year` for research (trends over ~12 months); `time_filter=quarter` (3 months) for opportunity-finder (current conversation).
```

- [ ] **Step 2: Commit**

```bash
git add .claude/skills/_shared/reddit.md
git commit -m "docs(skills): add _shared/reddit.md helper for Reddit MCP"
```

---

## Task 17: Author the `opportunity-finder` skill

**Files:**
- Create: `.claude/skills/opportunity-finder/SKILL.md`

- [ ] **Step 1: Write the skill**

Create `.claude/skills/opportunity-finder/SKILL.md`:

```markdown
---
name: opportunity-finder
description: Produce a ranked backlog of content ideas grounded in real signals. Mode A mines GSC for queries we don't rank for; Mode B mines Reddit / SERP / news for services and categories we don't cover. Writes ranked findings to the contentOpportunities collection. Use when asked to "find opportunities", "what should we write next", "seo backlog", "content gaps".
argument-hint: "Optional flags: --mode=demand|supply, --locale=en|nl|both, --top=N, --dry-run"
---

# Opportunity Finder Skill

Mine GSC + Reddit + SERP for content opportunities and persist them to `contentOpportunities`. One entry point, unified output via the `type` discriminator. Run monthly.

Read these helpers first:
- `../_shared/gsc.md` — GSC MCP tool catalogue
- `../_shared/apify.md` — SERP scraping
- `../_shared/reddit.md` — Reddit search patterns
- `../_shared/payload-operational.md` — writing to `contentOpportunities`
- `../_shared/lexical-json.md` — richText JSON

## Inputs

- `--mode=demand` → run only Mode A (GSC).
- `--mode=supply` → run only Mode B (Reddit + SERP + news).
- Default: run both.
- `--locale=en|nl|both` (default: `both`) — restrict signal to one locale.
- `--top=N` — keep only the top N opportunities by priority (after dedup).
- `--dry-run` — print would-be writes, don't call Payload create.

## Mode A — demand-driven (GSC)

Lean on the Suganthan MCP's pre-built analysis tools; the skill's job is translating their output into Payload rows.

1. **Pull signals in parallel** (see `_shared/gsc.md`):
   - `content_gaps` with `minImpressions: 50`
   - `quick_wins` with `minImpressions: 100`
   - `content_recommendations` (no args)
   - If locale includes `nl`: `advanced_search_analytics` with `{ filters: [{ dimension: "country", operator: "equals", expression: "NLD" }], dimensions: ["query"], rowLimit: 50 }` and treat the top 20 as NL-specific candidates.

2. **Cross-reference against Payload** to split into existing vs missing:
   - For each candidate query/topic, call `mcp__Payload__findServices` and `findGuides` with a `contains` filter on `name`, `slug`, `metaTitle`. Also query `pages` and `landingPages`.
   - If any match → opportunity `type = almost-ranking`; store the existing page ID in mind for future reference (reasoning mentions it, not persisted here).
   - If no match → classify:
     - Query pattern `<brand> alternative(s)?` → `missing-service` (if the brand exists as a category, else `new-category`)
     - Query pattern `switch|overstappen|migrate|move from X to Y` → `missing-guide`
     - Default → `missing-service`.

3. **Score priority.**
   - HIGH: `estimatedMonthlyImpressions > 1000` OR `quick_wins` with clear fix (position <15 and CTR below benchmark).
   - MEDIUM: 100–1000 impressions.
   - LOW: under 100.

4. **Populate the opportunity record.**
   - `title`: human-readable summary, e.g. `"Migration guide: Gmail → ProtonMail (NL)"`.
   - `targetKeyword`: the canonical GSC query (lowercased, trimmed).
   - `locale`: `nl` if NL-specific, else `en`.
   - `estimatedMonthlyImpressions`: GSC value.
   - `sourceQueries[]`: the GSC rows that produced this finding.
   - `reasoning` richText: 2 paragraphs — (1) what GSC showed, (2) what we should do (create X, or update existing Y).

## Mode B — supply-driven (Reddit + SERP + news)

1. **Reddit sweep** (see `_shared/reddit.md`).
   - For each default subreddit, run `search_posts` with `time_filter=quarter`, `limit=25`, and the query patterns from `_shared/reddit.md`.
   - Also search for each big-tech product name we don't yet cover. Static list (update in the skill body when the catalog grows):
     - Chrome, Gmail, Dropbox, Google Drive, Slack, Notion, ChatGPT, Google Maps, Google Search, WhatsApp.

2. **SERP sweep** (see `_shared/apify.md`).
   - `apify/google-search-scraper` with one query per non-EU product: `"European alternative to <product>"`.
   - `countryCode=NL`, `languageCode=en`, `resultsPerPage=10`.

3. **News sweep.**
   - Same scraper, same queries plus `"<product>" news`, `"<product>" alternative 2026`.
   - Post-filter results client-side to the last 12 months (news sources commonly include publication date in snippet).

4. **Cluster and classify.**
   - Group signals by the specific service or category each points at.
   - If we already have that service/category in Payload (by name contains match) → drop.
   - Else:
     - Specific service named in 5+ posts → `missing-service`.
     - Category frequently mentioned with no dominant service → `new-category`.

5. **Score priority.**
   - HIGH: 10+ Reddit mentions OR 3+ news articles in last 12 months.
   - MEDIUM: 3–10 Reddit mentions OR 1–2 news articles.
   - LOW: below that.

6. **Populate the opportunity record.**
   - `title`, `targetKeyword` as with Mode A.
   - `redditSignals[]`: top 10 posts by upvotes + relevance.
   - `competitorUrls[]`: top 5 SERP results for the relevant query.
   - `reasoning` richText: (1) what the signal looks like (N Reddit mentions, K news articles), (2) suggested action (add service X to category Y).

## Dedup against existing rows

Before any `createContentOpportunities` call, query existing rows with `status IN ("new", "reviewed", "queued")`. Skip writes for:
- Exact `targetKeyword` match
- Fuzzy title match (Jaccard similarity on token sets > 0.7)

Rejected / written-status rows do not block re-discovery — if an opportunity disappeared and comes back, we want to know.

## Error handling

| Failure | Behaviour |
|---|---|
| GSC MCP unavailable | Skip Mode A; Mode B runs if allowed. Note in final report. |
| Reddit rate-limit | Skip remaining subreddits; rely on SERP+news for Mode B. Note gap in each affected opportunity's `reasoning`. |
| Apify error | Skip SERP+news sweeps. Mode A unaffected. |
| Payload dedup query fails | Abort write (don't risk duplicates). Report error. |
| No opportunities found | Normal exit with `"no new opportunities"` summary. Not an error. |

## Output format

```
opportunity-finder: found <N> new, <M> dupes skipped
────────────────────────────────────────────────
HIGH   missing-guide     overstappen van gmail naar proton    ~850 imp/mo (NL)
HIGH   almost-ranking    european cloud storage               pos 12, 1420 imp/mo
MED    missing-service   Qwant Maps                           6 Reddit mentions
...
→ Written to contentOpportunities (<N> rows)
```

`--dry-run`: print the full JSON shape of each would-be write instead of a summary.

## Cost per run

- GSC: ~6 calls (free)
- Apify SERP: ~20–25 queries × $0.00025 = ~$0.006
- Reddit: ~16 searches (free)
- Payload writes: 10–50

Full run: ~$0.01, ~5–10 min.
```

- [ ] **Step 2: Commit**

```bash
git add .claude/skills/opportunity-finder/SKILL.md
git commit -m "feat(skills): add opportunity-finder skill for SEO backlog generation"
```

---

## Task 18: Smoke test `opportunity-finder`

**Files:** none (verification + some content)

- [ ] **Step 1: Restart Claude Code**

Reload skill list.

- [ ] **Step 2: Dry-run**

```
/opportunity-finder --dry-run
```

Expected: prints a set of would-be opportunity JSON blocks. Both modes should contribute at least one entry each (unless GSC or Reddit is genuinely empty).

If the skill crashes on any specific step, debug by reducing scope: try `--mode=demand --dry-run` first, then `--mode=supply --dry-run`.

- [ ] **Step 3: First live run**

```
/opportunity-finder
```

Expected: creates some number of rows in `contentOpportunities`. Open admin, review the first 10 rows. Flag obvious false positives by setting `status=rejected`.

- [ ] **Step 4: Verify dedup**

Re-run immediately:
```
/opportunity-finder
```

Expected: most or all new writes are skipped as duplicates. Terminal output should show `"N found, M dupes skipped"` with M roughly equal to the row count from step 3.

- [ ] **Step 5: No commit — verification only.**

---

# PHASE 3 — Expanded `research`

## Task 19: Extend `researchFields` with new structured fields

**Files:**
- Modify: `apps/website/fields/research.ts`

- [ ] **Step 1: Add the new fields at the bottom of the array**

Edit `apps/website/fields/research.ts`. Append these three field entries to the existing `researchFields` array, after the current final field (`sourceUrls`):

```typescript
  // User sentiment (AI-aggregated from Reddit)
  {
    name: "userSentiment",
    type: "group",
    admin: {
      description:
        "Aggregated Reddit sentiment. Populated by the research skill — don't edit by hand.",
    },
    fields: [
      { name: "positive", type: "number" },
      { name: "negative", type: "number" },
      { name: "mixed", type: "number" },
      {
        name: "summary",
        type: "textarea",
        localized: true,
        admin: {
          description:
            "Consumer-facing 2-3 sentence summary of what users say on Reddit.",
        },
      },
      { name: "lastUpdated", type: "date" },
    ],
  },
  {
    name: "redditMentions",
    type: "array",
    admin: {
      description: "Raw Reddit posts that fed userSentiment. Source data, not localized.",
    },
    fields: [
      { name: "subreddit", type: "text", required: true },
      { name: "postUrl", type: "text", required: true },
      { name: "postTitle", type: "text" },
      {
        name: "sentiment",
        type: "select",
        options: [
          { label: "Positive", value: "positive" },
          { label: "Negative", value: "negative" },
          { label: "Mixed", value: "mixed" },
          { label: "Neutral", value: "neutral" },
        ],
      },
      { name: "snippet", type: "textarea" },
      { name: "date", type: "date" },
    ],
  },
  {
    name: "recentNews",
    type: "array",
    admin: {
      description: "News coverage in the last 12 months. Populated by the research skill.",
    },
    fields: [
      { name: "source", type: "text", required: true },
      { name: "url", type: "text", required: true },
      { name: "title", type: "text" },
      { name: "date", type: "date" },
      {
        name: "summary",
        type: "textarea",
        localized: true,
        admin: { description: "1-sentence consumer-facing summary of the article." },
      },
    ],
  },
```

- [ ] **Step 2: Regenerate types**

```bash
pnpm --filter website generate:types
```

Expected: `payload-types.ts` updated; `Service` type now includes `userSentiment`, `redditMentions`, `recentNews`.

- [ ] **Step 3: Lint**

```bash
pnpm --filter website lint
```

Expected: no errors.

- [ ] **Step 4: Restart dev server; verify in admin**

Restart `pnpm --filter website dev`. Open any service in admin → Research tab → scroll down. The three new field blocks should render.

- [ ] **Step 5: Commit**

```bash
git add apps/website/fields/research.ts apps/website/payload-types.ts
git commit -m "feat(payload): extend services.research with userSentiment / redditMentions / recentNews"
```

---

## Task 20: Author shared helper — `_shared/jina.md`

**Files:**
- Create: `.claude/skills/_shared/jina.md`

- [ ] **Step 1: Write the helper**

Create `.claude/skills/_shared/jina.md`:

```markdown
# Shared Helper: Jina Reader

Jina Reader converts any public URL to clean Markdown. Primary scraper for our SEO skills (cheaper and faster than Apify for static / JS-light pages).

## Calling Jina

Prepend `https://r.jina.ai/` to the target URL. Send `Authorization: Bearer <JINA_READER_API_KEY>`.

```
GET https://r.jina.ai/https://example.com/path
Authorization: Bearer <JINA_READER_API_KEY>
Accept: text/plain
```

Invoke via `WebFetch` tool with a prompt that asks for the markdown body. Example prompt:
> Read the article at {url} and return the main content as markdown. Preserve headings.

## Budget

Jina Reader free tier: 10M tokens, no expiry. At ~1-2k tokens per page scraped, we have comfortably more headroom than any monthly skill workload needs.

## When to use Jina vs alternatives

- **Jina first**: static pages, blog posts, vendor about/pricing/privacy pages, news article bodies.
- **Apify `website-content-crawler` fallback**: SPAs, JS-heavy vendor dashboards, pages with aggressive anti-bot. Use when Jina returns <200 characters.
- **WebFetch last resort**: when both above fail.

## Error patterns

- Empty response → fall through to Apify (see `_shared/apify.md`).
- `403 / 429` → fall through.
- Markdown that's clearly a login/paywall → log, note in downstream output.

## Env

`JINA_READER_API_KEY` required in `.env.local`. Document in `docs/superpowers/seo-stack-setup.md`.
```

- [ ] **Step 2: Commit**

```bash
git add .claude/skills/_shared/jina.md
git commit -m "docs(skills): add _shared/jina.md helper for Jina Reader"
```

---

## Task 21: Rewrite the `research` skill body

**Files:**
- Modify: `.claude/skills/research/SKILL.md`

- [ ] **Step 1: Replace the existing skill body**

Overwrite `.claude/skills/research/SKILL.md` with the following. The frontmatter's `argument-hint` is expanded to mention the new `--dry-run` flag; the description is unchanged in intent but updated to mention Reddit / news / sentiment.

```markdown
---
name: research
description: Research a digital service and store structured findings in Payload CMS. Gathers company basics, pricing, privacy posture, Reddit sentiment, and recent news via Jina Reader, Apify SERP, and the Reddit MCP. Use when asked to research a service, investigate a company, gather pricing/privacy/compliance data, or populate the Research tab on a service. Trigger phrases include "research this service", "investigate", "gather data on", "fill in research for".
argument-hint: "service name (e.g. 'ProtonMail'); comma-separate for multiple; add --dry-run to analyse without writing"
---

# Service Research Skill

Research a digital service and store structured findings in Payload via MCP. Populates both the pre-existing research fields (GDPR, pricing, headquarters, certifications) AND the newer structured fields (`userSentiment`, `redditMentions`, `recentNews`).

Read these helpers first:
- `../_shared/gsc.md` — only for confirming the service has an existing GSC footprint
- `../_shared/apify.md` — SERP scraping for news
- `../_shared/reddit.md` — sentiment gathering
- `../_shared/jina.md` — page content fetching
- `../_shared/payload-operational.md` — writing structured research fields
- `../_shared/lexical-json.md` — richText JSON for `researchNotes`

## Inputs

- Argument: service name, or comma-separated list of service names.
- Flags: `--dry-run` — gather and print, don't call Payload update.

## Per-service flow

### Step 1: Resolve the service

`mcp__Payload__findServices` with `{ where: { name: { contains: "<name>" } }, limit: 5 }`. If none found, ask the user whether to create a new service row or correct the name.

If found, set `researchStatus=in-progress` and `lastResearchedAt=today` via `updateServices`.

### Step 2: Gather in parallel

Run the following data collections concurrently (dispatch as independent tool calls; don't serialize):

**(a) Vendor site pages** — via Jina Reader (see `_shared/jina.md`):
- `<url>` — homepage / about
- `<url>/pricing` — pricing
- `<url>/privacy` — privacy policy
- `<url>/security` — security page (404 is fine, just skip)

If Jina returns empty for any URL, fall through to `apify/website-content-crawler`. If that also fails, fall to WebFetch. Log which fetcher succeeded for each URL.

**(b) Reddit sentiment** — via Reddit MCP (see `_shared/reddit.md`):
- For each default subreddit (`r/privacy`, `r/europe`, `r/selfhosted`, `r/degoogle`), `search_posts` with `query="<service name>"`, `time_filter="year"`, `limit=25`.
- For each top-upvoted post, optionally `get_comments(limit=5, sort="top")` to pull snippets.

**(c) Recent news** — via `apify/google-search-scraper` (see `_shared/apify.md`):
- Queries: `"<service name>" review`, `"<service name>" news`, `"<service name>" privacy`.
- `resultsPerPage=10`, `countryCode=US`, `languageCode=en`.
- Post-filter to results from the last 12 months (use snippet publication dates where available).

**(d) Security / breach scan** — via Jina on SERP results:
- Apify SERP for `"<service name>" data breach`, `"<service name>" security audit` — first 5 results each.
- Jina-read each result's body. Extract any specific incident mentions with dates.

### Step 3: Process Reddit data into structured form

For each collected Reddit post / top comment:

- Classify sentiment: `positive | negative | mixed | neutral` per `_shared/reddit.md` heuristics.
- Extract a 150–250 char snippet from the most relevant sentence.
- Populate `redditMentions[]` with `{ subreddit, postUrl, postTitle, sentiment, snippet, date }`.

Aggregate counts into `userSentiment`:
- `positive`, `negative`, `mixed` = counts of each bucket.
- `summary` = 2–3 sentence consumer-facing description (EN only in this phase; `translate` skill later handles NL).
- `lastUpdated` = today.

If no Reddit data found, set `summary = "No recent Reddit discussion found in the last 12 months."` and all counts to 0.

### Step 4: Process news data into structured form

Keep the top 10 unique news results (dedup by URL). For each:
- `source` (publication name, parsed from URL or snippet)
- `url`, `title`, `date`
- `summary`: 1-sentence consumer-facing summary generated from the Jina-read body (EN only).

Populate `recentNews[]`. If empty, leave it as `[]`.

### Step 5: Populate existing research fields

Same as the previous version of this skill. Key mappings:

| Finding | Field |
|---|---|
| GDPR posture | `gdprCompliance` (compliant / partial / non-compliant / unknown) |
| GDPR summary | `gdprNotes` (localized, EN only here) |
| Privacy policy URL | `privacyPolicyUrl` |
| Pricing narrative | `pricingDetails` |
| Pricing page URL | `pricingUrl` |
| HQ city+country | `headquarters` |
| Parent company | `parentCompany` |
| Founded year | `foundedYear` |
| Employees | `employeeCount` |
| Data storage locations | `dataStorageLocations[]` |
| Certifications | `certifications[]` |
| Open source | `openSource`, `sourceCodeUrl` |
| All source URLs | `sourceUrls[]` |

Also update General tab fields if empty or clearly outdated: `location`, `url`, `freeOption`, `startingPrice`.

### Step 6: Generate `researchNotes` richText narrative

Build a Lexical richText document (see `_shared/lexical-json.md`) with these sections as H2 headings:

1. **Company** — founded, HQ, parent, size, open-source status.
2. **Pricing** — free tier presence, paid tier summary, enterprise.
3. **Privacy & GDPR** — compliance posture, data locations, notable concerns.
4. **Security** — certifications, audits, known incidents (with dates).
5. **User sentiment** — derived from `userSentiment.summary` + one concrete quote from `redditMentions[]`.
6. **Recent news** — up to 3 most recent items from `recentNews[]` as a bulleted list.
7. **Sources** — cite each URL used.

### Step 7: Merge semantics — don't clobber good data

Before calling `updateServices`:

- **Scalar fields** (`headquarters`, `foundedYear`, `gdprCompliance`, etc.): include in payload only if the new value is non-empty.
- **Array fields** in the pre-existing research set (`certifications`, `dataStorageLocations`): replace wholesale only if the new array is non-empty.
- **New structured fields** (`userSentiment`, `redditMentions`, `recentNews`): always replace with the fresh data, even if empty — they're time-sensitive.
- **`researchNotes`**: always regenerate.

### Step 8: Write to Payload

`mcp__Payload__updateServices` with the merged payload, including `researchStatus: "complete"` and `lastResearchedAt: <today>`. Skip if `--dry-run`; print the payload as JSON instead.

## Error handling

| Failure | Behaviour |
|---|---|
| Vendor site unreachable | Note in `researchNotes`; preserve existing Payload data for that field. |
| Jina empty | Fall through to Apify website-content-crawler → WebFetch. |
| All fetchers fail for a URL | Skip; note gap in `researchNotes`. |
| Reddit empty | `redditMentions: []`, `userSentiment.summary = "No recent Reddit discussion found"`, counts 0. |
| Apify news fails | `recentNews: []`, note in `researchNotes`. |
| Payload update fails | Abort this service; continue batch. |

## Output format

Per service:
```
✓ research: <service name>
  Reddit: <N> mentions (<P>/<N>/<M> positive/negative/mixed)
  News: <N> items in last 12 months
  Updated: <list of fields written>
  → Updated services/<id>
```

Batch: `N researched • M errors`.

`--dry-run`: print the JSON payload instead of the summary.

## Cost per service

- Reddit MCP: ~4 searches (free)
- Apify SERP: ~5 queries = ~$0.00125
- Jina Reader: ~10–20 page reads (free tier)
- Apify website-content-crawler: ~$0.001 if fallback hit
- Payload writes: 1

Per service: ~$0.002, 2–3 min. Backfilling 50 services at 5-parallel: ~$0.10, ~1h.

## Important notes

- EN-only consumer-facing text in this phase. `translate` skill picks up `userSentiment.summary` and `recentNews[].summary` later.
- Do NOT write anything when `--dry-run` — print the JSON payload as a fenced block.
- Cite sources: every non-obvious claim in `researchNotes` must reference a `sourceUrls[]` entry.
```

- [ ] **Step 2: Commit**

```bash
git add .claude/skills/research/SKILL.md
git commit -m "feat(skills): expand research skill with Reddit / news / structured sentiment"
```

---

## Task 22: Update `bulk-research` description

**Files:**
- Modify: `.claude/skills/bulk-research/SKILL.md`

- [ ] **Step 1: Update the frontmatter description and the top of the body**

Open `.claude/skills/bulk-research/SKILL.md`. Update the frontmatter `description` line to reflect the new capabilities. Leave the body unchanged structurally — only update the description prose at the top to mention Reddit / news / sentiment where it lists what the skill does.

Read the existing file first to know what to preserve. Then edit only the description line and any prose in the body that describes "what research gathers" — add mentions of Reddit sentiment, recent news, and structured fields.

Example wording for the frontmatter description (adapt to match existing tone):
```
description: Research multiple services in parallel using subagents. Each service gets the full research pass — vendor site, pricing, privacy/GDPR posture, Reddit sentiment, and recent news — written to both existing and newer structured fields on the service. Use when asked to "research all services", "bulk research", "research these services", or need to populate Research tabs for many services at once.
```

Do NOT rewrite the dispatch logic or argument parsing — those still work against the expanded `research` skill automatically.

- [ ] **Step 2: Commit**

```bash
git add .claude/skills/bulk-research/SKILL.md
git commit -m "docs(skills): update bulk-research description for expanded research capabilities"
```

---

## Task 23: Dry-run smoke test of expanded `research`

**Files:** none (verification)

- [ ] **Step 1: Restart Claude Code**

Reload the skill list.

- [ ] **Step 2: Dry-run on a known service**

Pick a service you already know well (e.g. ProtonMail). Run:

```
/research ProtonMail --dry-run
```

Expected: prints a JSON block containing:
- All existing research fields (pricing, GDPR, headquarters, etc.)
- `userSentiment` with non-zero counts from Reddit
- `redditMentions[]` with at least 5 entries
- `recentNews[]` with at least 3 entries
- `researchNotes` richText that mentions user sentiment and recent news in the narrative

If any of the three new field groups is empty for a well-known service like ProtonMail, the skill body has a bug — fix before moving on.

- [ ] **Step 3: No commit — verification only.**

---

## Task 24: Merge-safety spot check

**Files:** none (verification)

- [ ] **Step 1: Pick a fully-populated service**

Use admin to find a service with every research field already populated (including a non-empty `researchNotes`). Note its current field values in a scratch doc.

- [ ] **Step 2: Run live (not dry-run)**

```
/research "<that service name>"
```

- [ ] **Step 3: Verify merge semantics**

Open the service in admin after the run. Compare each field against your scratch doc:

- Pre-existing scalars should still have their old values if the fresh gather returned empty (e.g. if the vendor removed their about page and Jina gets nothing, `headquarters` should NOT be blanked out).
- Arrays like `certifications` should either be replaced by a non-empty new array, or preserved from the old state.
- `userSentiment`, `redditMentions`, `recentNews` should reflect fresh data even if that means the old data was replaced.
- `researchNotes` should be fully regenerated.

If any scalar field was overwritten with empty, fix the merge logic in the skill body before proceeding.

- [ ] **Step 4: No commit — verification only.**

---

## Task 25: Pilot on 3 services + failure-mode test

**Files:** none (verification)

- [ ] **Step 1: Pilot live on 3 varied services**

Pick three services of different types (e.g. ProtonMail — email, Mullvad — VPN, Kdrive — cloud storage). Run live for each:

```
/research ProtonMail
/research "Mullvad VPN"
/research Kdrive
```

Open each in admin. Spot-check:
- Sentiment classification matches your intuition
- Reddit snippets are non-trivial (not just post titles truncated)
- News summaries are single sentences, not paragraphs
- `researchNotes` narrative reads naturally — no repetitive AI phrasing

If issues are systemic across all three, iterate on the skill body.

- [ ] **Step 2: Failure-mode test — disable Reddit**

Temporarily rename the `reddit` entry in `.mcp.json` to `reddit_disabled`. Restart Claude Code.

Run:
```
/research "<any service>" --dry-run
```

Expected: `redditMentions: []`, `userSentiment.summary: "No recent Reddit discussion found in the last 12 months."`, counts 0. `researchNotes` narrative notes the gap rather than fabricating Reddit quotes.

- [ ] **Step 3: Restore `.mcp.json`**

Rename back to `reddit`. Restart Claude Code.

- [ ] **Step 4: No commit — verification only.**

---

# FINALIZATION

## Task 26: Update `CLAUDE.md` with the new skills

**Files:**
- Modify: `CLAUDE.md`

- [ ] **Step 1: Read the existing Content Workflow section**

Skim `CLAUDE.md` to find the "Content Workflow (AI-Assisted)" section and the skill table within.

- [ ] **Step 2: Add rows for the new skills**

Append to the skills table (under "Content Workflow") so it lists the new additions. New rows:

```markdown
| `seo-audit` | `/seo-audit` | Post-publish GSC + SERP performance audit → `pageAudits` collection |
| `opportunity-finder` | `/opportunity-finder` | Mine GSC + Reddit + SERP for content backlog → `contentOpportunities` collection |
```

Also update the existing `research` row to mention Reddit + news + sentiment in its description, matching the new frontmatter.

Add a short note under the table distinguishing `seo-audit` from `seo-check`:
> `seo-check` is the pre-publish QA gate (12-step checklist). `seo-audit` is the post-publish performance analysis (GSC + SERP + live page). They co-exist and address different points in the content lifecycle.

- [ ] **Step 3: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: document seo-audit and opportunity-finder skills in CLAUDE.md"
```

---

## Task 27: Final verification pass

**Files:** none (verification)

- [ ] **Step 1: Lint, typecheck, build**

```bash
pnpm lint
pnpm --filter website generate:types
pnpm build
```

Expected: all pass. If build fails, fix before PR.

- [ ] **Step 2: Playwright smoke test**

```bash
pnpm --filter website test:e2e
```

Expected: existing smoke tests still pass (the new Payload collections don't break page rendering).

- [ ] **Step 3: Review diff**

```bash
git log --oneline main..HEAD
git diff --stat main
```

Expected output includes roughly 27 commits, touching:
- `apps/website/collections/{PageAudits,ContentOpportunities}.ts` (new)
- `apps/website/collections/index.ts` (modified)
- `apps/website/payload.config.ts` (modified)
- `apps/website/payload-types.ts` (regenerated)
- `apps/website/fields/research.ts` (modified)
- `.claude/skills/seo-audit/SKILL.md` (new)
- `.claude/skills/opportunity-finder/SKILL.md` (new)
- `.claude/skills/research/SKILL.md` (modified)
- `.claude/skills/bulk-research/SKILL.md` (modified)
- `.claude/skills/_shared/{gsc,apify,reddit,jina,lighthouse,payload-operational}.md` (new)
- `docs/superpowers/seo-stack-setup.md` (new)
- `CLAUDE.md` (modified)

- [ ] **Step 4: Confirm nothing was accidentally committed**

```bash
git diff HEAD~30 --stat | grep -E "\.env|gsc-oath-secrets|token"
```

Expected: no output. If anything matches, amend commits to remove secrets.

- [ ] **Step 5: No commit — verification only.**

---

## Task 28: Open the PR

**Files:** none (publish)

- [ ] **Step 1: Push the branch**

```bash
git push -u origin rework
```

- [ ] **Step 2: Open the PR**

```bash
gh pr create --title "feat: SEO skills architecture (seo-audit, opportunity-finder, expanded research)" --body "$(cat <<'EOF'
## Summary

- New skill `seo-audit`: post-publish performance analysis (GSC + Apify SERP + optional Unlighthouse) writing rewrite plans to new `pageAudits` collection
- New skill `opportunity-finder`: mines GSC + Reddit + SERP for content backlog in new `contentOpportunities` collection
- Expanded skill `research`: adds Reddit sentiment / recent news / structured fields; merge-safe against existing service data
- Schema: `pageAudits`, `contentOpportunities` (both operational, no drafts); three new structured fields on services (`userSentiment`, `redditMentions`, `recentNews`)
- Shared helpers: `.claude/skills/_shared/{gsc,apify,reddit,jina,lighthouse,payload-operational}.md`
- Developer setup doc: `docs/superpowers/seo-stack-setup.md`

Spec: `docs/superpowers/specs/2026-04-21-seo-skills-architecture-design.md`

## Test plan

- [ ] Dry-run `seo-audit` against 1 known service — inspect JSON payload
- [ ] Live `seo-audit` against 3 known services — spot-check rows in `pageAudits` admin
- [ ] Forced-failure test: Apify disabled → skill degrades gracefully
- [ ] Dry-run `opportunity-finder` — inspect both modes contribute rows
- [ ] Live `opportunity-finder` — review first 10 rows in `contentOpportunities` admin
- [ ] Dedup check: re-run `opportunity-finder`, verify duplicates skipped
- [ ] Dry-run expanded `research` against ProtonMail — verify structured fields populated
- [ ] Merge-safety check on one fully-populated service
- [ ] Pilot `research` live on 3 services; spot-check sentiment classification
- [ ] Failure-mode: Reddit disabled → `research` completes with noted gap

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

- [ ] **Step 3: Commit**

No commit — PR is opened.

---

## Self-review notes

After completing the plan write-up:

- Spec coverage — every section of the spec has a task:
  - Section 2a `pageAudits` → Tasks 1–3
  - Section 2b `contentOpportunities` → Tasks 13–15
  - Section 2c `services` extensions → Task 19
  - Section 3a `.mcp.json` → pre-existing (verified in Task 0)
  - Section 3b env setup → Task 12
  - Section 3c shared helpers → Tasks 4–7, 16, 20
  - Section 4 `seo-audit` → Tasks 8–11
  - Section 5 `opportunity-finder` → Tasks 17–18
  - Section 6 expanded `research` → Tasks 21–25
  - Section 7 testing approach → embedded per-phase
  - Section 8 out-of-scope → not in plan (correctly excluded)
  - Section 9 implementation notes → followed

- No placeholders: every task has explicit content, exact file paths, and commit commands.

- Type consistency: collection slug (`pageAudits`) vs MCP kebab key (`page-audits`) documented; polymorphic relation shape (`{ relationTo, value }`) consistent across all tasks.

- Scope: one PR, three phases with natural checkpoints between them for review. Each phase is independently shippable if the PR needs to be split later.
