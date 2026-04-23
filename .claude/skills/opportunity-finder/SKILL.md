---
name: opportunity-finder
description: Produce a ranked backlog of content ideas grounded in real signals. Mode A mines GSC for queries we don't rank for; Mode B mines Reddit and Jina SERP for services and categories we don't cover. Writes ranked findings to the contentOpportunities collection. Use when asked to "find opportunities", "what should we write next", "seo backlog", "content gaps".
argument-hint: "Optional flags: --mode=demand|supply, --locale=en|nl|both, --top=N, --dry-run"
---

# Opportunity Finder Skill

Mine GSC + Reddit + Jina SERP for content opportunities and persist them to `contentOpportunities`. One entry point, unified output via the `type` discriminator. Run monthly.

Read these helpers first:
- `../_shared/gsc.md` — GSC MCP tool catalogue (lean on pre-built analysis tools)
- `../_shared/jina.md` — Jina Search for SERP + content
- `../_shared/reddit.md` — Reddit search patterns
- `../_shared/payload-operational.md` — writing to `contentOpportunities`
- `../_shared/lexical-json.md` — richText JSON format

## Inputs

- `--mode=demand` → run only Mode A (GSC).
- `--mode=supply` → run only Mode B (Reddit + SERP + news).
- Default: run both.
- `--locale=en|nl|both` (default: `both`) — restrict signal to one locale.
- `--top=N` — keep only the top N opportunities by priority (after dedup).
- `--dry-run` — print would-be writes as JSON blocks, don't call Payload create.

## Mode A — demand-driven (GSC)

Lean on the Suganthan MCP's pre-built analysis tools; the skill's job is translating their output into Payload rows.

### Step 1: Pull signals in parallel

- `mcp__gsc__content_gaps` with `min_impressions: 50` → topics with demand and no page.
- `mcp__gsc__quick_wins` with `min_impressions: 100` → queries at positions 4–15 where an existing page could move up.
- `mcp__gsc__content_recommendations` → the MCP's own prioritised action list.
- If locale includes `nl`: `mcp__gsc__advanced_search_analytics` with `{ filters: [{ dimension: "country", operator: "equals", expression: "NLD" }], dimensions: ["query"], row_limit: 50, order_by: "impressions" }` → NL-specific candidates.

### Step 2: Cross-reference against Payload

For each candidate query/topic, check whether we already have a page targeting it:

- Call `mcp__Payload__findServices` with `{ where: { or: [{ name: { contains: "<query>" } }, { slug: { contains: "<normalized slug stem>" } }] }, limit: 5 }`.
- Same for `findGuides`, `findPages`, `findLandingPages`.
- If any match found → opportunity `type = almost-ranking`; include the matched page ID in `reasoning` prose.
- If no match → classify:
  - Query pattern `<brand> alternative(s)?` → `missing-service` (or `new-category` if the parent category doesn't exist yet)
  - Query pattern `switch|overstappen|migrate|move from X to Y` → `missing-guide`
  - Default → `missing-service`

### Step 3: Score priority

- **HIGH**: `estimatedMonthlyImpressions > 1000` OR `quick_wins` with a clear fix (position <15 and CTR below benchmark).
- **MEDIUM**: 100–1000 impressions.
- **LOW**: under 100.

### Step 4: Build the opportunity record

- `title`: human-readable summary, e.g. `"Migration guide: Gmail → ProtonMail (NL)"`.
- `targetKeyword`: the canonical GSC query (lowercased, trimmed).
- `locale`: `nl` if NL-specific, else `en`.
- `estimatedMonthlyImpressions`: GSC value.
- `sourceQueries[]`: the GSC rows that produced this finding.
- `reasoning` richText: 2 paragraphs — (1) what GSC showed (impressions, position, CTR gap); (2) what to do (create X, or update existing Y), with the specific ID cited.

## Mode B — supply-driven (Reddit + SERP + news)

### Step 1: Reddit sweep (see `_shared/reddit.md`)

For each default subreddit, search posts from the last 90 days for the query patterns listed in the helper. Also search for each big-tech product name we don't yet cover. Static list (update the skill when the catalog grows):

Chrome, Gmail, Dropbox, Google Drive, Slack, Notion, ChatGPT, Google Maps, Google Search, WhatsApp.

### Step 2: SERP sweep (see `_shared/jina.md`)

One Jina Search call per non-EU product: `"European alternative to <product>"` with `gl=nl`, `hl=en`, `num=10`.

### Step 3: News sweep

Same Jina Search with `"<product>" news` / `"<product>" alternative 2026`. Post-filter results to the last 12 months using `date` fields where Jina provides them; otherwise infer from snippet text.

### Step 4: Cluster and classify

Group signals by the specific service or category each points at.

- Already have the service/category in Payload (name / slug contains match) → drop.
- Named service mentioned 5+ times across Reddit + SERP → `missing-service`.
- Category frequently mentioned with no dominant service → `new-category`.

### Step 5: Score priority

- **HIGH**: 10+ Reddit mentions OR 3+ news articles in last 12 months.
- **MEDIUM**: 3–10 Reddit mentions OR 1–2 news articles.
- **LOW**: below that.

### Step 6: Build the opportunity record

- `redditSignals[]`: top 10 posts by upvotes + relevance (subreddit, postUrl, snippet, date).
- `competitorUrls[]`: top 5 SERP results for the relevant query.
- `reasoning` richText: (1) what the signal looks like (N Reddit mentions, K news articles); (2) suggested action (add service X to category Y).

## Dedup against existing rows

Before any `mcp__Payload__createContentOpportunities` call, query existing rows with `status IN ("new", "reviewed", "queued")` via `mcp__Payload__findContentOpportunities`. Skip writes for:
- Exact `targetKeyword` match
- Fuzzy title match (Jaccard similarity on token sets > 0.7)

Rejected / written-status rows do not block re-discovery — if an opportunity disappears and comes back, we want to know.

## Error handling

| Failure | Behaviour |
|---|---|
| GSC MCP unavailable | Skip Mode A; Mode B still runs if allowed. Note in final report. |
| Reddit rate-limit | Skip remaining subreddits; rely on Jina SERP for Mode B. Note gap in each affected opportunity's `reasoning`. |
| Jina error / 429 | Back off 60s, retry once; if still failing skip SERP+news sweeps. Mode A unaffected. |
| Payload dedup check fails | Abort writes (don't create duplicates under error). Report error. |
| No opportunities found | Normal exit with "no new opportunities" summary. Not an error. |

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

`--dry-run`: print the full JSON shape of each would-be write, one per block.

## Cost per run

- GSC: ~6 MCP calls (free)
- Jina Search: ~20 queries × ~2k tokens (no content) = ~40k tokens (<0.5% of budget)
- Reddit: ~16 searches (free)
- Payload reads + writes: 10–50 per run

Full run: $0 out-of-pocket, ~5–10 min wall-clock.

## Important notes

- Cross-reference against Payload every time — double-writing a "missing-service" that actually exists is the fastest way to erode trust in the backlog.
- Include the ID of any matched existing page in `reasoning` so operators can jump straight to the page from admin.
- Reddit sentiment is a signal, not a conclusion. If a post says "I hate Dropbox", that's not automatically a case for a Dropbox alternative — it may be one user's bad week. Require 5+ mentions for `missing-service` to avoid single-post noise.
