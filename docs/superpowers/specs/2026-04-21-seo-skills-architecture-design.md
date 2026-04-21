# SEO Skills Architecture — Design Spec

**Date:** 2026-04-21
**Status:** Approved, ready for implementation plan
**Source:** Notion doc "switch-to.eu — SEO Skills Architecture Plan" + brainstorming session 2026-04-21
**Next step:** Hand off to `superpowers:writing-plans` to break phases 1–3 into tasks

---

## 1. Program overview

### What we're building

Three data-driven SEO skills that write operational intelligence back to Payload, plus the schema and shared infrastructure that support them.

| Skill | Status | Cadence | Reads | Writes to Payload |
|---|---|---|---|---|
| `seo-audit` | new | weekly, per-page or batch | GSC, Apify SERP, live page, Unlighthouse (opt-in) | `pageAudits` (new collection) |
| `opportunity-finder` | new | monthly, unified run | GSC analysis tools, Apify SERP, Reddit MCP | `contentOpportunities` (new collection, `type` discriminator) |
| `research` | expanded | on-demand, per service | existing + Jina Reader, Reddit MCP, Apify SERP (news) | `services` (existing fields + new `userSentiment` / `redditMentions` / `recentNews`) |

### Relationship to existing skills

**No deprecations.** Authoring (`write*`, `humanize*`, `translate*`, `pipeline`) and the pre-publish `seo-check` gate stay exactly as they are.

- `seo-check` is a pre-publish QA gate (12-step checklist, no live data). Different purpose from `seo-audit`, which is post-publish performance analysis on live URLs.
- `research` keeps its name; its body is expanded with new data sources and writes to new structured fields in addition to existing ones.
- `bulk-research` continues to work — it dispatches subagents against the expanded `research`, so it inherits the new capabilities automatically. Its description needs a small update to mention Reddit / news / sentiment.

### Phasing (Approach B — vertical slices)

- **Phase 1 — `seo-audit`.** Add `pageAudits` collection, wire GSC MCP + Apify actors MCP, write the skill. Ships actionable rewrite plans for top 20 pages.
- **Phase 2 — `opportunity-finder`.** Add `contentOpportunities` collection, wire Reddit MCP if not already from phase 1, write the skill. Ships the first editorial backlog.
- **Phase 3 — Expand `research`.** Add `userSentiment` / `redditMentions` / `recentNews` fields to `services`, expand the skill body with Jina + news scraping, backfill services.

Each phase lands as its own PR, is independently usable, and the next phase builds on infrastructure the previous one stood up.

### Skills folder location

All three live in-repo at `.claude/skills/` alongside existing skills. Ignoring the Notion doc's `/mnt/skills/user/` path — it doesn't match the established pattern.

---

## 2. Payload schema changes

Three changes: two new collections, one set of field additions to `Services`. All follow existing Payload patterns (sidebar fields for status/meta, `admin.description` for help text, `type: "tabs"` for content organisation). No drafts on the new collections — they're operational data, not publishable content.

### 2a. New collection: `pageAudits`

One row per audit. Multiple rows per page accumulate over time = audit history. Not localized.

```
pageAudits {
  // sidebar
  page: relationship, polymorphic relationTo: ["services", "guides"], required
  priority: select (high|medium|low), required
  status: select (new|reviewed|applied|rejected), default "new"
  auditedAt: date, required, defaults to today

  // current performance (GSC, last 90 days)
  currentMetrics: group {
    impressions: number
    clicks: number
    ctr: number                 // decimal 0-1
    avgPosition: number
    dateRange: { from: date, to: date }
  }

  // GSC insights
  topQueries: array of { query, impressions, clicks, position }
  almostRankingQueries: array of { query, impressions, position }  // pos 11-20

  // competitor SERP (Apify google-search-scraper)
  competitors: array of { rank, url, title, metaDescription }
  competitorAnalysis: richText

  // proposed rewrites
  proposedChanges: group {
    title: text
    metaDescription: text
    h1: text
    contentGaps: array of { gap, rationale }
  }

  // optional Lighthouse
  lighthouse: group (optional) {
    performance: number
    accessibility: number
    bestPractices: number
    seo: number
    runAt: date
  }

  // audit narrative
  summary: richText
}
```

Admin columns: `page`, `priority`, `status`, `currentMetrics.clicks`, `auditedAt`.

### 2b. New collection: `contentOpportunities`

One row per opportunity. Unified across both modes via `type` discriminator. Not localized.

```
contentOpportunities {
  // sidebar
  type: select (missing-guide | missing-service | almost-ranking | new-category), required
  priority: select (high|medium|low), required
  status: select (new|reviewed|queued|written|rejected), default "new"
  discoveredAt: date, required, defaults to today

  // what & why
  title: text, required
  targetKeyword: text, required
  locale: select (en|nl|both)
  estimatedMonthlyImpressions: number

  // evidence
  reasoning: richText, required
  competitorUrls: array of { url, title, rank }
  sourceQueries: array of { query, impressions, position }  // Mode A
  redditSignals: array of { subreddit, postUrl, snippet, date }  // Mode B

  // output linkage (once acted on)
  resultingContent: relationship, polymorphic relationTo: ["services", "guides"] (optional)
}
```

Admin columns: `type`, `priority`, `status`, `title`, `estimatedMonthlyImpressions`, `discoveredAt`.

### 2c. Extensions to `Services` → `researchFields`

Appended to the existing `researchFields` array so they live in the Research tab. Follows the precedent of `gdprNotes` (localized consumer-facing summary) + structured unlocalized source data.

```
userSentiment: group (in Research tab)
  positive: number
  negative: number
  mixed: number
  summary: textarea, localized
  lastUpdated: date

redditMentions: array (in Research tab, unlocalized)
  subreddit: text
  postUrl: text
  postTitle: text
  sentiment: select (positive|negative|mixed|neutral)
  snippet: textarea
  date: date

recentNews: array (in Research tab, unlocalized)
  source: text
  url: text
  title: text
  date: date
  summary: textarea, localized

// (lastResearchedAt already exists — reused)
```

### 2d. Schema notes

- **Polymorphic relationships:** `pageAudits.page` and `contentOpportunities.resultingContent` use `relationTo: ["services", "guides"]`. Payload supports this natively; query shape is `{ relationTo: "services", value: "<id>" }`.
- **Status fields are admin-editable.** Skills write `new`; operators flip to `reviewed` / `applied` / `rejected` as they work through the backlog.
- **No unique constraints on `pageAudits`.** Multiple audits per page = history; filter by latest in admin.
- **`contentPipelineStatus` not affected.** That's authoring-pipeline tracking; these skills operate on already-published content or pre-authoring ideation.
- **Deleting historical rows:** out of scope for this spec.

---

## 3. Shared foundation

### 3a. MCP configuration (`.mcp.json` at repo root)

Committed to git; points at the MCPs the skills need. Secret file paths and API keys come from env, not this file.

```jsonc
{
  "mcpServers": {
    "payload": { /* unchanged */ },

    "gsc": {
      "command": "node",
      "args": ["${GSC_MCP_PATH}/dist/index.js"],
      "env": {
        "GSC_AUTH_MODE": "oauth",
        "GSC_OAUTH_SECRETS_FILE": "${GSC_OAUTH_SECRETS_FILE}",
        "GSC_SITE_URL": "sc-domain:switch-to.eu"
      }
    },
    "apify": {
      "command": "npx",
      "args": ["-y", "@apify/actors-mcp-server@latest"],
      "env": { "APIFY_TOKEN": "${APIFY_TOKEN}" }
    },
    "reddit": { /* already present */ }
  }
}
```

### 3b. Per-developer environment (not committed)

Documented in a new `docs/superpowers/seo-stack-setup.md` so any developer can reproduce the setup.

| Variable | Purpose | How to get |
|---|---|---|
| `GSC_MCP_PATH` | Local clone of Suganthan GSC MCP | `git clone https://github.com/Suganthan-Mohanadasan/Suganthans-GSC-MCP && pnpm install && pnpm build` |
| `GSC_OAUTH_SECRETS_FILE` | Path to `client_secrets.json` | Google Cloud Console → OAuth client ID → Desktop app |
| `APIFY_TOKEN` | Apify API token | Apify console → Integrations |
| `JINA_READER_API_KEY` | Already set | jina.ai signup (10M tokens) |

Reddit MCP uses anonymous mode — no credentials.

On first GSC MCP invocation, a browser opens for OAuth; token caches after.

### 3c. `.claude/skills/_shared/` helper docs

Reference material each skill links to instead of repeating. Keeps skill bodies short and lets us update tool patterns in one place.

**Existing, untouched:** `humanize-patterns.md`, `lexical-json.md`, `seo-checklist.md`, `voice.md`

**New:**

- **`gsc.md`** — the Suganthan MCP's 20 tools at a glance; pattern for each (when to call, what inputs, how to read output). Emphasises the analysis tools (`quick_wins`, `content_gaps`, `ctr_opportunities`, `content_decay`, `traffic_drops`, `content_recommendations`) over `advanced_search_analytics` (raw escape hatch).
- **`apify.md`** — calling `apify/google-search-scraper` (input: `queries[]`, `resultsPerPage`, `countryCode`, `languageCode`; output: organic results with title/url/description) and `apify/website-content-crawler` (input: `startUrls`, `crawlerType`, `maxRequestsPerCrawl`; output: cleaned markdown). Cost per 1k calls. When to prefer Jina (JS-light, faster) vs Apify (JS-heavy / anti-bot).
- **`jina.md`** — `https://r.jina.ai/<target-url>` with `Authorization: Bearer $JINA_READER_API_KEY`. Output: markdown. Fallback behaviour if Jina fails.
- **`reddit.md`** — Reddit MCP tool names and args; default subreddit set (`r/privacy`, `r/europe`, `r/selfhosted`, `r/degoogle`) with note that skills can override; sentiment-scoring pattern (positive / negative / mixed / neutral from keywords + upvote ratio).
- **`lighthouse.md`** — `npx unlighthouse --site <url> --throttle --output-dir /tmp/unlighthouse-<slug>`; JSON output location; fields to extract (`performance`, `accessibility`, `best-practices`, `seo`).
- **`payload-operational.md`** — patterns for `mcp__Payload__createPageAudits`, `mcp__Payload__createContentOpportunities`, `mcp__Payload__updateServices` (for new structured fields). Documents polymorphic relation shape (`{ relationTo: "services", value: "<id>" }`).

### 3d. No shared runtime code

Skills stay as Markdown instructions driving tool calls. No new npm packages, no shared TypeScript helpers, no CLI wrappers. Following existing pattern.

### 3e. Rate-limit & cost considerations

- **GSC:** free, 1200 req/min. Not a constraint.
- **Apify `google-search-scraper`:** ~$0.25 per 1000 results; budgets per skill run noted in `apify.md`.
- **Apify `website-content-crawler`:** ~$1 per 1000 pages; same.
- **Jina:** 10M tokens free; well over monthly need.
- **Reddit MCP:** anonymous, ~10 req/min informal limit; skills batch and avoid aggressive fan-out.
- **Unlighthouse:** local CPU; ~15s/page.

Each skill notes its rough cost-per-run in its own SKILL.md.

---

## 4. Phase 1 — `seo-audit` skill

**Purpose.** Given a live page, produce a prioritised rewrite plan grounded in GSC performance data + competitor SERP analysis. Writes one row to `pageAudits` per page.

### 4a. Trigger shape

```
/seo-audit                              # default: top 20 by GSC clicks (last 30d)
/seo-audit service <name>               # one service by name
/seo-audit guide <slug>                 # one guide by slug
/seo-audit category <slug>              # all services in a category
/seo-audit all                          # every published service + guide
/seo-audit <name1>, <name2>             # comma-separated targets
/seo-audit <target> --lighthouse        # add Unlighthouse to the run
/seo-audit <target> --dry-run           # log the plan, don't write
```

Single entry point; no `bulk-seo-audit`. Multi-target runs fan out via subagents internally (existing bulk-* pattern; default 5 concurrent).

### 4b. Per-page flow

1. **Resolve URL.** From Payload get slug + region + category. Construct canonical URL using existing `servicePaths()` logic (services: `/en/services/non-eu/<slug>` or `/en/services/<categorySlug>/<slug>`; guides: `/en/guides/<slug>`). EN only for phase 1.
2. **Pull GSC data via Suganthan MCP.**
   - `advanced_search_analytics` with `page=<url>` filter, last 90 days → `currentMetrics`.
   - Same call with `dimensions=[query, page]` → `topQueries` (top 10) + `almostRankingQueries` (positions 11–20).
3. **Determine target keyword.** Top impression query from GSC. Fallback: the `name` field from Payload if GSC returns no data for this URL.
4. **Scrape SERP via Apify.** `apify/google-search-scraper` with `queries=[<target keyword>]`, `countryCode=NL`, `languageCode=en`, `resultsPerPage=10` → top 10 organic results → `competitors[]`.
5. **Fetch current page content from Payload.** Title / metaTitle / metaDescription / content / h1 — needed to compare against competitor patterns.
6. **Optionally run Lighthouse.** If `--lighthouse`: `npx unlighthouse --site <url> --no-open`, parse JSON, extract 4 scores → `lighthouse` group.
7. **Synthesize proposed rewrites.**
   - `title` / `metaDescription` / `h1`: rewrite to include top GSC query + match dominant pattern of top-3 competitors.
   - `contentGaps[]`: topics/sections 3+ competitors cover but our page doesn't.
   - `competitorAnalysis`: 2–3 paragraph richText synthesis.
   - `summary`: 3–5 sentence richText overview with top 3 priority fixes.
8. **Determine priority.**
   - HIGH: >1000 impressions/mo AND CTR below position benchmark (use Suganthan MCP's `ctr_vs_benchmark` tool), OR almost-ranking queries with >500 impressions.
   - MEDIUM: >100 impressions/mo with fixable gaps.
   - LOW: <100 impressions/mo OR no GSC data yet.
9. **Write to Payload.** `mcp__Payload__createPageAudits` with `page: { relationTo: "services"|"guides", value: <id> }`, `status: "new"`, `auditedAt: today`, all fields from steps 2–8. Unless `--dry-run`.

### 4c. Error handling

| Failure | Behaviour |
|---|---|
| GSC returns no data | Write `currentMetrics` zeros, note "no GSC data — page may be too new or not indexed", priority LOW, still run SERP + content-gap analysis |
| Apify rate-limit / error | Skip `competitors` + `competitorAnalysis`, note in `summary`, still write audit |
| Lighthouse fails / times out | Skip `lighthouse` group, note in `summary` |
| Page content fetch fails (Payload) | Abort this page only; continue batch |
| Payload write fails | Abort with error (don't silently drop) |

### 4d. Output

```
✓ seo-audit: proton-vpn
  URL: /en/services/vpn/proton-vpn
  Priority: HIGH
  Performance (90d): 3,247 impressions, 112 clicks, CTR 3.4%, avg pos 7.2
  Top fix: meta title doesn't match dominant competitor pattern
  Top fix: "free vpn eu" (pos 14, 812 impressions) not in page content
  Top fix: missing pricing comparison section (4/5 top competitors have one)
  → Written to pageAudits/<id>
```

Multi-target: summary table at end (`15 audited • 4 HIGH • 8 MED • 3 LOW`).

### 4e. Cost per run

- GSC: 2 calls/page (free)
- Apify SERP: ~$0.0025/page
- Unlighthouse: local, ~15s/page
- Payload writes: 1/page

Top-20 run: ~$0.05 + ~5 min wall-clock (without Lighthouse).

### 4f. Files produced

- `.claude/skills/seo-audit/SKILL.md`
- New `_shared/gsc.md`, `_shared/apify.md`, `_shared/lighthouse.md`

### 4g. Testing

- Dry-run as primary sanity check.
- One-page smoke test against a known URL with known GSC data; inspect resulting record by hand.
- Forced-failure tests: temporarily revoke Apify token; run with `--dry-run`; verify skill reports degradation rather than crashing.

---

## 5. Phase 2 — `opportunity-finder` skill

**Purpose.** Produce a ranked backlog of content ideas grounded in real signals (GSC impressions on queries we don't rank for; Reddit/SERP chatter about services we don't cover). Writes to `contentOpportunities` with `type` discriminator.

### 5a. Trigger shape

```
/opportunity-finder                         # default: both modes, both locales
/opportunity-finder --mode=demand           # Mode A only (GSC)
/opportunity-finder --mode=supply           # Mode B only (Reddit + SERP)
/opportunity-finder --locale=nl             # restrict to NL signal only
/opportunity-finder --top=10                # limit to top 10 by priority
/opportunity-finder --dry-run               # analyse + print, don't write
```

Default is "run everything" — matches monthly-cadence ops use. No per-type bulk variant.

### 5b. Mode A flow — demand-driven (GSC)

Leans on the Suganthan MCP's pre-built analysis tools. Minimal custom computation.

1. **Pull signals in parallel:**
   - `content_gaps` → topics with search demand and no targeting page.
   - `quick_wins` → queries at positions 4–15.
   - `content_recommendations` → the MCP's own prioritised action list.
   - `advanced_search_analytics` with `country` filter for NL → locale-specific opportunities.
2. **Cross-reference against Payload.** For each candidate query/topic, check if we have a page targeting it:
   - Case-insensitive substring match (Payload `contains` filter) on `name`, `slug`, `keywords.keyword`, `metaTitle` across `services` + `guides` + `pages` + `landingPages`.
   - If page exists → `almost-ranking` opportunity (not `missing-*`).
   - If not → classify:
     - Pattern `<big-tech> alternative|alternatives` → `missing-service` (or `new-category` if category absent)
     - Pattern `switch|overstappen|migrate|move from X to Y` → `missing-guide`
     - Otherwise → `missing-service`
3. **Score priority.**
   - HIGH: `estimatedMonthlyImpressions > 1000` OR `quick_wins` with clear fix.
   - MEDIUM: 100–1000 impressions.
   - LOW: under 100.
4. **Build `reasoning` richText.** Why this is an opportunity (GSC numbers), what pattern matches, what to do next. Cite queries in `sourceQueries[]`.

### 5c. Mode B flow — supply-driven (Reddit + SERP + news)

1. **Reddit sweep.** For each default subreddit, search posts (last 90 days) for: `european alternative`, `privacy-friendly`, `swiss hosted`, `gdpr compliant`, plus each big-tech product name we don't yet cover. Collect post titles + top-comment snippets.
2. **SERP sweep.** Apify `google-search-scraper` on `"European alternative to <product>"` for each big-tech product we don't cover (Chrome, Gmail, Dropbox, Slack, Notion, ChatGPT, Maps, Search — static list in the skill, updatable).
3. **News sweep.** Apify `google-search-scraper` with `time_range=year` on the same query patterns → emerging-service signals.
4. **Cluster and classify.** Group by the service or category each signal points at. If we already cover it → drop. Otherwise:
   - Named service mentioned 5+ times → `missing-service`.
   - Category mentioned but no specific service dominates → `new-category`.
5. **Score priority.** HIGH = 10+ Reddit mentions OR 3+ news articles. MEDIUM = 3–10. LOW = below that.
6. **Build `reasoning` richText** with cited Reddit posts + news URLs. Populate `redditSignals[]` with raw data so `research` can reuse it.

### 5d. Dedup against existing `contentOpportunities`

Before writing, check existing rows with `status IN ("new", "reviewed", "queued")`. Skip if:
- Exact `targetKeyword` match
- Fuzzy title match (Jaccard > 0.7)

Rejected / already-written opportunities don't block re-discovery.

### 5e. Error handling

| Failure | Behaviour |
|---|---|
| GSC MCP unavailable | Mode A skipped; Mode B still runs if allowed |
| Reddit MCP rate-limit | Fall back to SERP signals for Mode B; note gap in `reasoning` |
| Apify error | Skip SERP/news sweeps for Mode B; Mode A unaffected |
| Payload dedup check fails | Abort write (don't create duplicates under error) |
| No opportunities found | Normal exit; not an error |

### 5f. Output

```
opportunity-finder: found 23 new, 0 dupes skipped
────────────────────────────────────────────────
HIGH   missing-guide     overstappen van gmail naar proton     ~850 imp/mo (NL)
HIGH   almost-ranking    european cloud storage                pos 12, 1420 imp/mo
MED    missing-service   Qwant Maps                            6 Reddit mentions
...
→ Written to contentOpportunities (23 rows)
```

### 5g. Cost per run

- GSC: ~6 MCP calls (free)
- Apify SERP (Mode B): ~20 queries × $0.00025 = ~$0.005
- Reddit MCP: ~16 searches (free)
- Payload writes: 10–50 per run

Default full run: ~$0.01, ~5–10 min.

### 5h. Files produced

- `.claude/skills/opportunity-finder/SKILL.md`
- New `_shared/reddit.md` (if phase 2 ships before phase 3)
- Reuses `_shared/gsc.md`, `_shared/apify.md` from phase 1

### 5i. Testing

- Dry-run mode until trusted.
- First live run: manually review the first 5–10 created rows in admin before re-running.
- Validate dedup: run twice, verify the second run skips everything.

---

## 6. Phase 3 — Expanded `research` skill

**Purpose.** Expand existing `research` to pull Reddit sentiment, recent news, and deeper article content, and write them to new structured fields on `services`. Existing `researchFields` (GDPR, pricing, headquarters, certifications, etc.) keep being populated the same way.

### 6a. Trigger shape (unchanged surface)

```
/research <service-name>                # existing
/research <name1>, <name2>              # comma-separated
/research --dry-run                     # new — gather and print, don't write
/bulk-research all                      # existing — dispatches subagents
/bulk-research unresearched             # existing
```

No new top-level skill. This is a rewrite of the existing `research` body + description update on `bulk-research`.

### 6b. Expanded flow

1. **Find service in Payload** (unchanged). Set `researchStatus=in-progress`, `lastResearchedAt=today`.
2. **Gather in parallel:**
   - **Company / pricing / privacy / security** — Jina Reader on vendor's URLs (about / pricing / privacy / security); fallback to Apify `website-content-crawler` for JS-heavy sites; WebFetch as last resort.
   - **Reddit sentiment** — Reddit MCP search across default subreddits for `"<service name>"` + variants, last 90 days. Collect posts + top-upvoted comments.
   - **News** — Apify `google-search-scraper` with `time_range=year` on `"<service name>" review`, `"<service name>" news`, `"<service name>" privacy`. Top 10 results; Jina-read article bodies for summary generation.
3. **Process Reddit data.**
   - Classify each post/top-comment: positive / negative / mixed / neutral.
   - Extract snippet (~200 chars from most relevant sentence), post URL, subreddit, date.
   - Aggregate counts into `userSentiment`.
   - Generate localized EN `userSentiment.summary` (2–3 sentences, consumer-facing).
4. **Process news data.**
   - Keep top 10 by date.
   - For each: source, url, title, date + 1-sentence localized EN `summary` from Jina-read body.
5. **Generate `researchNotes` narrative.** Build Lexical richText synthesising all gathered data, including "What users say on Reddit" and "Recent news" paragraphs derived from structured fields. Sections: Company → Pricing → Privacy/GDPR → Security → User sentiment → Recent news → Sources.
6. **Write to Payload** via `mcp__Payload__updateServices`:
   - Existing `researchFields` (unchanged mapping from current skill)
   - New: `userSentiment` group, `redditMentions[]`, `recentNews[]`
   - `researchNotes` regenerated
   - `sourceUrls[]` (all URLs used)
   - `researchStatus=complete`, `lastResearchedAt=today`

### 6c. Merge semantics (don't clobber good data)

Services already have populated research. Rules:

- **Scalar fields** (`gdprCompliance`, `headquarters`, `foundedYear`, etc.): overwrite only if new value is non-empty.
- **Array fields** (`certifications`, `dataStorageLocations`): replace wholesale if new array is non-empty; else preserve.
- **New structured fields** (`userSentiment`, `redditMentions`, `recentNews`): always replace with fresh data — time-sensitive.
- **`researchNotes`:** always regenerate (derived).

### 6d. Reuse by other skills (consumers, not phase 3)

Once services have populated structured fields:

- **`write-service`** renders "What users on Reddit say" and "Recent news" sections from structured data.
- **Compare-page template** (Notion doc todo #3) pulls from the same fields.
- **`opportunity-finder` Mode B** can seed new services with pre-populated research by copying from its own `redditSignals[]` / `competitorUrls[]`.

### 6e. Error handling

| Failure | Behaviour |
|---|---|
| Vendor site unreachable | Note in `researchNotes`; existing Payload data preserved |
| Jina returns empty | Fall through to Apify `website-content-crawler`, then WebFetch |
| All fetchers fail for a URL | Skip URL; note gap in `researchNotes` |
| Reddit MCP returns nothing | `redditMentions: []`, `userSentiment.summary: "No recent Reddit discussion found"`, counts 0 |
| Apify news fails | `recentNews: []`, note in `researchNotes` |
| Payload update fails | Abort this service; continue batch |

### 6f. Localization

Phase 3 writes EN-only for `userSentiment.summary` and `recentNews[].summary`. Existing `translate` skill already handles localized fields on services — separate run of `/translate service <name> nl` picks them up. No change to `translate` needed.

### 6g. Cost per service

- Reddit MCP: ~3 searches (free)
- Apify SERP (news): 3 queries = ~$0.00075
- Jina Reader: ~10–20 pages (free tier)
- Apify `website-content-crawler`: rarely used (~$0.001 when needed)
- Payload writes: 1

Per service: ~$0.002, ~2–3 min. Backfilling ~50 services: ~$0.10, ~1h wall-clock at 5-parallel.

### 6h. Files produced

- Rewrite of `.claude/skills/research/SKILL.md`
- Description update on `.claude/skills/bulk-research/SKILL.md`
- New `_shared/jina.md`, `_shared/reddit.md` (if not created in earlier phases)

### 6i. Testing

- Dry-run mode for default safety.
- Pilot on 3 services you know well (ProtonMail, Mullvad VPN, Kdrive). Compare summaries to intuition.
- Merge-safety check: run on fully-populated service; confirm no existing non-empty field gets overwritten with empty.
- Failure mode: disable Reddit MCP; confirm skill completes with noted gap rather than crashing.

---

## 7. Testing approach

These are AI-driven skills that call external APIs and write to Payload. Unit tests aren't practical — behaviour *is* integration. Strategy:

1. **Dry-run as primary safety net.** Every new skill has `--dry-run` that runs the full analysis and prints what it would write, without calling Payload create/update tools. Always run dry-run before first live run in a new environment.
2. **Manual review of first N live outputs per phase.**
   - `seo-audit`: run live on 3 known pages; open resulting `pageAudits` in admin; verify.
   - `opportunity-finder`: run live once; review first 10 created rows; flag false positives as `rejected` so dedup behaves on re-runs.
   - `research`: run on 3 pilot services; compare against knowledge; spot-check sentiment classification.
3. **Forced-failure smoke tests per phase.** For each row in each skill's error-handling table, temporarily break the dependency (revoke token, block network), run the skill, verify it reports the gap rather than crashing.
4. **Merge-safety spot check for `research`.** Before batch-backfilling: run on one fully-populated service; diff before/after to confirm no field overwritten with empty.
5. **No automated test suite added.** Aligns with existing skill pattern.

---

## 8. Out of scope

Explicitly not included, so `writing-plans` doesn't pull them in and phases stay shippable:

- **Automated / scheduled runs.** Operator-triggered only. If we want weekly `seo-audit` or monthly `opportunity-finder` automation later, that's a follow-up spec using the `schedule` skill.
- **Payload admin UI customisation.** Custom list views, saved filters, dashboards for the new collections. Default admin UI is fine to start.
- **Site rendering of new service fields.** The compare-page template upgrade (Notion todo #3) that consumes `userSentiment` / `redditMentions` / `recentNews` is a separate product work track.
- **Other Notion-doc todos.** Homepage redesign (#1), listicle repositioning (#2), AI citation quick wins (#4), Schema.org work, image optimisation — separate specs.
- **NL support in `seo-audit`.** Phase 1 audits EN URLs only; NL is a phase-1.5 extension.
- **Historical audit pruning.** `pageAudits` and `contentOpportunities` rows accumulate indefinitely; retention is a later concern.
- **Separate `bulk-seo-audit` / `bulk-opportunity-finder` skills.** Multi-target is built into each skill via subagent fan-out.
- **Reports / analytics on the backlog.** "How much got written? What was the click delta?" — interesting, not phases 1–3.
- **Extending `seo-audit` to landing pages / category pages / pages collection.** Services + guides only for phase 1.

---

## 9. Implementation notes for writing-plans

- Each phase is an independently shippable PR.
- Phase 1 must land schema + MCP wiring + `seo-audit` skill + `_shared` helpers for gsc/apify/lighthouse/payload-operational in one PR — the schema and the skill need to land together or there's nothing to write to.
- Phase 2 reuses phase 1's GSC + Apify wiring; adds Reddit MCP wiring if not already done, plus `_shared/reddit.md`. New `contentOpportunities` collection lands with the skill.
- Phase 3 adds `services` field extensions (`userSentiment` / `redditMentions` / `recentNews`), rewrites the `research` skill body, updates `bulk-research` description. New `_shared/jina.md` (plus `_shared/reddit.md` if not yet present).
- MCP servers (`.mcp.json`) and env documentation (`docs/superpowers/seo-stack-setup.md`) should land with phase 1 since GSC + Apify are needed from day 1.
- Error-handling tables in sections 4c / 5e / 6e are implementation requirements, not suggestions — every row should be exercised in forced-failure testing.
