---
name: research
description: Research a digital service and store structured findings in Payload CMS. Gathers company basics, pricing, privacy posture, Reddit sentiment, and recent news via Jina Reader/Search and the Reddit MCP. Use when asked to research a service, investigate a company, gather pricing/privacy/compliance data, or populate the Research tab on a service. Trigger phrases include "research this service", "investigate", "gather data on", "fill in research for".
argument-hint: "service name (e.g. 'ProtonMail'); comma-separate for multiple; add --dry-run to gather without writing"
---

# Service Research Skill

Research a digital service and store structured findings in Payload via MCP. Populates both the pre-existing research fields (GDPR, pricing, headquarters, certifications) AND the newer structured fields (`userSentiment`, `redditMentions`, `recentNews`) that render on the public service page.

Read these helpers first:
- `../_shared/jina.md` — Reader + Search
- `../_shared/reddit.md` — sentiment gathering
- `../_shared/payload-operational.md` — writing structured research fields + merge semantics
- `../_shared/lexical-json.md` — richText JSON format for `researchNotes`
- `../_shared/voice.md` — tone rules for any consumer-facing copy we generate

## Inputs

- Argument: service name, or comma-separated list of service names.
- Flags: `--dry-run` — gather and print the JSON payload, don't call Payload update.

## Per-service flow

### Step 1: Resolve the service

`mcp__Payload__findServices` with `{ where: { name: { contains: "<name>" } }, limit: 5 }`. If none found, ask the user whether to create a new service row or correct the name.

If found, mark `researchStatus=in-progress` and `lastResearchedAt=<today>` via `mcp__Payload__updateServices` so parallel runs don't collide.

### Step 2: Gather data in parallel

Dispatch these fetches concurrently; don't serialize.

**(a) Vendor site pages via Jina Reader** (see `_shared/jina.md`)
- `<url>` — homepage / about page
- `<url>/pricing` — pricing page
- `<url>/privacy` — privacy policy
- `<url>/security` — security page (404 is fine, just skip)

If Jina Reader returns empty / 403 / 429 for any URL, fall through to Playwright local as described in `_shared/jina.md`. Log which fetcher succeeded for each URL.

**(b) Reddit sentiment via Reddit MCP** (see `_shared/reddit.md`)
- For each default subreddit, search the service name with `time_filter=year`, `limit=25`.
- For the top 5 upvoted posts, optionally `get_post_comments(limit=5, sort="top")` to pull quotable snippets.

**(c) Recent news via Jina Search**
- Query: `"<service name>" review`, `"<service name>" news`, `"<service name>" privacy`
- `num=10`, `gl=nl`, `hl=en`, `X-Respond-With: markdown` header to get article body content in the same call.
- Post-filter to results dated within the last 12 months.

**(d) Security / breach scan via Jina Search**
- Query: `"<service name>" data breach`, `"<service name>" security audit` — `num=5` each.
- Extract any specific incident mentions with dates for `researchNotes`.

### Step 3: Process Reddit data into structured form

For each collected Reddit post / top comment:

- Classify sentiment per `_shared/reddit.md` heuristics: `positive | negative | mixed | neutral`.
- Extract a 150–250 char snippet from the most relevant sentence.
- Populate `redditMentions[]` with `{ subreddit, postUrl, postTitle, sentiment, snippet, date }`.

Aggregate counts into `userSentiment`:
- `positive`, `negative`, `mixed` = counts of each bucket.
- `summary` = 2–3 sentence consumer-facing description in EN (the `translate` skill handles NL later).
- `lastUpdated` = today.

If no Reddit data found, set `summary = "No recent Reddit discussion found in the last 12 months."` and all counts to 0. Don't fabricate.

### Step 4: Process news data into structured form

Dedup by URL. Keep the top 10 by recency. For each:
- `source` (publication name, parsed from URL or snippet)
- `url`, `title`, `date`
- `summary`: 1-sentence consumer-facing summary generated from the Jina-read body (EN only).

Populate `recentNews[]`. If empty, leave it as `[]`.

### Step 5: Populate existing research fields

Same mapping as the previous version of this skill. Key fields:

| Finding | Field |
|---|---|
| GDPR posture | `gdprCompliance` (compliant / partial / non-compliant / unknown) |
| GDPR summary | `gdprNotes` (localized, EN here) |
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

Build Lexical richText (see `_shared/lexical-json.md`) synthesizing all gathered data. Section order (H2 headings):

1. **Company** — founded, HQ, parent, size, open-source status.
2. **Pricing** — free tier, paid tiers, enterprise.
3. **Privacy & GDPR** — compliance posture, data locations, notable concerns.
4. **Security** — certifications, audits, known incidents with dates.
5. **User sentiment** — derived from `userSentiment.summary` + one concrete quote from `redditMentions[]`.
6. **Recent news** — up to 3 most recent items from `recentNews[]` as a bulleted list.
7. **Sources** — cite each URL used.

### Step 7: Merge semantics — don't clobber good data

Before calling `mcp__Payload__updateServices`:

- **Scalar fields** (`headquarters`, `foundedYear`, `gdprCompliance`, etc.): include in payload only if the new value is non-empty.
- **Pre-existing array fields** (`certifications`, `dataStorageLocations`): replace wholesale only if the new array is non-empty.
- **New structured fields** (`userSentiment`, `redditMentions`, `recentNews`): always replace with fresh data, even if empty — they're time-sensitive.
- **`researchNotes`**: always regenerate.

### Step 8: Write to Payload

`mcp__Payload__updateServices` with the merged payload, including `researchStatus: "complete"` and `lastResearchedAt: <today>`. Skip if `--dry-run`; print the payload as a JSON block instead.

## Error handling

| Failure | Behaviour |
|---|---|
| Vendor site unreachable | Note in `researchNotes`; preserve existing Payload data for that field. |
| Jina Reader empty | Fall through to Playwright local; if that also fails, note gap in `researchNotes`. |
| All fetchers fail for a URL | Skip that URL; note gap in `researchNotes`. |
| Reddit empty | `redditMentions: []`, `userSentiment.summary = "No recent Reddit discussion found"`, counts 0. |
| Jina Search empty for news | `recentNews: []`, note in `researchNotes`. |
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
- Jina Search: ~5 queries (with content) = ~50k tokens (~0.5% of monthly budget)
- Jina Reader: ~4 pages (negligible)
- Payload writes: 1

Per service: $0 out-of-pocket, 2–3 min. Backfilling 50 services at 5-parallel: ~1h wall-clock.

## Important notes

- EN-only for `userSentiment.summary` and `recentNews[].summary` in this phase. The existing `translate` skill picks them up on a later run.
- Cite sources: every non-obvious claim in `researchNotes` must reference a `sourceUrls[]` entry.
- Respect Reddit's Responsible Builder Policy (see `_shared/reddit.md`): always credit source URL when rendering a Reddit quote on the public site.
- Follow `_shared/voice.md` for any consumer-facing prose. Summaries should be direct, honest, specific — no marketing fluff, no em dashes, no banned words.
