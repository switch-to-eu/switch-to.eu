---
name: opportunity-finder
description: Produce a ranked backlog of content ideas grounded in real signals. Mode A mines GSC for queries we don't rank for; Mode B mines Reddit and Jina SERP for services and categories we don't cover. Writes ranked findings to docs/seo/opportunities/<slug>.md (one file per opportunity). Use when asked to "find opportunities", "what should we write next", "seo backlog", "content gaps".
argument-hint: "Optional flags: --mode=demand|supply, --locale=en|nl|both, --top=N, --dry-run"
---

# Opportunity Finder Skill

Mine GSC + Reddit + Jina SERP for content opportunities and persist them as markdown files in `docs/seo/opportunities/`, one file per opportunity. One entry point, unified output via the `type` field. Run monthly.

Read these helpers first:
- `../_shared/gsc.md` — GSC MCP tool catalogue (lean on pre-built analysis tools)
- `../_shared/jina.md` — Jina Search for SERP + content
- `../_shared/reddit.md` — Reddit search patterns
- `../_shared/content-files.md` — where existing content lives (for cross-referencing) and frontmatter quoting/validation

## Inputs

- `--mode=demand` → run only Mode A (GSC).
- `--mode=supply` → run only Mode B (Reddit + SERP + news).
- Default: run both.
- `--locale=en|nl|both` (default: `both`) — restrict signal to one locale.
- `--top=N` — keep only the top N opportunities by priority (after dedup).
- `--dry-run` — print would-be files, don't write them.

## Mode A — demand-driven (GSC)

Lean on the Suganthan MCP's pre-built analysis tools; the skill's job is translating their output into opportunity files.

### Step 1: Pull signals in parallel

- `mcp__gsc__content_gaps` with `min_impressions: 50` → topics with demand and no page.
- `mcp__gsc__quick_wins` with `min_impressions: 100` → queries at positions 4–15 where an existing page could move up.
- `mcp__gsc__content_recommendations` → the MCP's own prioritised action list.
- If locale includes `nl`: `mcp__gsc__advanced_search_analytics` with `{ filters: [{ dimension: "country", operator: "equals", expression: "NLD" }], dimensions: ["query"], row_limit: 50, order_by: "impressions" }` → NL-specific candidates.

### Step 2: Cross-reference against existing content

For each candidate query/topic, check whether we already have a page targeting it:

- Services: `ls content/services | grep -i '<normalized slug stem>'` and `grep -il '^name: .*<query term>' content/services/*/en.md`.
- Same for `content/guides`, `content/pages`, `content/landing-pages` (match on directory name and `^title:`), and `content/categories`.
- Also grep `metaTitle` / `keywords` lines: `grep -ril '<query term>' content/*/*/en.md`.
- If any match found → opportunity `type = almost-ranking`; include the matched file path (e.g. `content/services/proton-mail/en.md`) in the `## Reasoning` body.
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
- `## Reasoning` (file body): 2 paragraphs — (1) what GSC showed (impressions, position, CTR gap); (2) what to do (create X, or update existing Y), with the specific file path cited.

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

- Already have the service/category in `content/` (directory name / `name` / `title` match) → drop.
- Named service mentioned 5+ times across Reddit + SERP → `missing-service`.
- Category frequently mentioned with no dominant service → `new-category`.

### Step 5: Score priority

- **HIGH**: 10+ Reddit mentions OR 3+ news articles in last 12 months.
- **MEDIUM**: 3–10 Reddit mentions OR 1–2 news articles.
- **LOW**: below that.

### Step 6: Build the opportunity record

- `redditSignals[]`: top 10 posts by upvotes + relevance (subreddit, postUrl, snippet, date).
- `competitorUrls[]`: top 5 SERP results for the relevant query.
- `## Reasoning` (file body): (1) what the signal looks like (N Reddit mentions, K news articles); (2) suggested action (add service X to category Y).

## Writing opportunity files

One file per opportunity: `docs/seo/opportunities/<slug>.md`. Create the directory if it doesn't exist. `<slug>` is the target keyword, lowercased and hyphenated (`overstappen-van-gmail-naar-proton`). If that file name is taken by a different opportunity, append the type (`-missing-guide`).

```markdown
---
type: missing-guide             # missing-guide | missing-service | almost-ranking | new-category
priority: high                  # high | medium | low
status: new                     # new | reviewed | queued | written | rejected
discoveredAt: '2026-11-02'
title: 'Migration guide: Gmail → Proton Mail (NL)'
targetKeyword: overstappen van gmail naar proton
locale: nl                      # en | nl | both
estimatedMonthlyImpressions: 850
competitorUrls:
- url: https://...
  title: ...
  rank: 1
sourceQueries:                  # Mode A: GSC rows that triggered this
- query: overstappen van gmail naar proton
  impressions: 850
  position: 18.3
redditSignals:                  # Mode B: Reddit posts that triggered this
- subreddit: r/europe
  postUrl: https://www.reddit.com/r/europe/comments/...
  snippet: ...
  date: '2026-10-12'
# Set once acted on:
resultingType: guide            # service | guide
resultingSlug: gmail-to-proton-mail
---

## Reasoning

...
```

Omit keys you have no data for (`sourceQueries` in Mode B, `redditSignals` in Mode A, `resulting*` until acted on). Quote dates and any string containing `: `. Validate the frontmatter with the snippet from `_shared/content-files.md`.

## Dedup against existing files

Before writing, read the frontmatter of every file in `docs/seo/opportunities/`:

```bash
grep -H '^targetKeyword:\|^title:\|^status:' docs/seo/opportunities/*.md
```

Skip writes when an existing file matches on:
- Exact `targetKeyword`
- Fuzzy title match (Jaccard similarity on token sets > 0.7)

Every status blocks re-creation, including `rejected` and `written`. Never overwrite or delete an existing file. `rejected` marks a false positive a human flagged, so leaving it in place is what keeps it from coming back. If a `rejected` / `written` opportunity shows a much stronger signal now (e.g. 5x the impressions), mention it in the run report instead of writing a new file.

## Error handling

| Failure | Behaviour |
|---|---|
| GSC MCP unavailable | Skip Mode A; Mode B still runs if allowed. Note in final report. |
| Reddit rate-limit | Skip remaining subreddits; rely on Jina SERP for Mode B. Note gap in each affected opportunity's `## Reasoning`. |
| Jina error / 429 | Back off 60s, retry once; if still failing skip SERP+news sweeps. Mode A unaffected. |
| Dedup check fails (can't read `docs/seo/opportunities/`) | Abort writes (don't create duplicates under error). Report error. |
| No opportunities found | Normal exit with "no new opportunities" summary. Not an error. |

## Output format

```
opportunity-finder: found <N> new, <M> dupes skipped
────────────────────────────────────────────────
HIGH   missing-guide     overstappen van gmail naar proton    ~850 imp/mo (NL)
HIGH   almost-ranking    european cloud storage               pos 12, 1420 imp/mo
MED    missing-service   Qwant Maps                           6 Reddit mentions
...
→ Written to docs/seo/opportunities/ (<N> files)
```

`--dry-run`: print each would-be file, one per block.

## Cost per run

- GSC: ~6 MCP calls (free)
- Jina Search: ~20 queries × ~2k tokens (no content) = ~40k tokens (<0.5% of budget)
- Reddit: ~16 searches (free)
- File reads + writes: 10–50 per run

Full run: $0 out-of-pocket, ~5–10 min wall-clock.

## Important notes

- Cross-reference against `content/` every time — double-writing a "missing-service" that actually exists is the fastest way to erode trust in the backlog.
- Include the file path of any matched existing page in `## Reasoning` so reviewers can jump straight to it.
- Review the backlog by reading `docs/seo/opportunities/` (e.g. `grep -H '^priority:\|^status:' docs/seo/opportunities/*.md`). Flag false positives by setting `status: rejected` so dedup behaves on re-runs.
- Reddit sentiment is a signal, not a conclusion. If a post says "I hate Dropbox", that's not automatically a case for a Dropbox alternative — it may be one user's bad week. Require 5+ mentions for `missing-service` to avoid single-post noise.
