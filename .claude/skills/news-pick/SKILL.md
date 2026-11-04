---
name: news-pick
description: Pick today's news article topic from the knowledge base. Ranks active stories by heat, relevance to people switching to EU services, and time since we last covered them, then proposes one pick plus two backups, each with an angle and the claims that back it. Use when asked to "pick a story", "what should we write today", "news pick", or after /news-ingest.
argument-hint: "optional: '--exclude <story-slug>,...' or a story slug to evaluate on its own"
---

# News Pick Skill

Choose what today's article is about. Read-only on the knowledge base except for `log.md`.

Read first: `knowledge/README.md` (story fields) and `../_shared/knowledge.md` (commands).

## Step 1: Fresh index

Run `pnpm knowledge:index` so `graph.json` heat and dates reflect today's ingest. Then read `knowledge/index.md` (active stories by heat).

## Step 2: Candidates

All stories with `status: active`, plus any `dormant` story that got an event in the last 7 days. For each, collect from `graph.json` and the story frontmatter: `heat`, `last_event`, `last_covered`, linked `services` and `categories`, and the timeline entries newer than `last_covered`.

Also list unapproved articles: `grep -l '^draft: true' content/articles/*/en.md`. A story with an article still waiting for approval is not picked again until that article is approved or deleted.

## Step 3: Score

```
score = heat × relevance × freshness × development
```

- **relevance** (does it matter to someone switching?): 1.0 base, +0.5 per linked service (max +1.5), +0.5 if a linked category exists, +0.5 if a guide covers a linked service (`grep -l "^\(source\|target\)Service: <slug>$" content/guides/*/en.md`). Range 1.0 to 3.5.
- **freshness** (days since `last_covered`): never covered 1.5 · over 30 days 1.3 · 8 to 30 days 1.0 · 7 days or less 0.2.
- **development** (is there something new to say?): new timeline events since `last_covered` with at least one `medium`/`high` source 1.5 · new events from `low` sources only 0.5 · nothing new since `last_covered` 0.1.

**Big-news override:** a story covered in the last 7 days can still win when the new event is a decision, not a step (a ruling, a fine, a law adopted, a contract awarded, a shutdown or acquisition of a listed service). Say so explicitly in the reasoning.

Prefer a new development on a known story over a one-off: with close scores (within ~20%), take the story with more `## Our coverage` history or a longer timeline.

## Step 4: Angle and evidence

For the top three, read the story page and the source notes of the new timeline events. Draft for each:

- **Angle**: one sentence on what the article says that our previous coverage didn't. Read the `## Our coverage` lines (and the last article if needed) so the angle is a step forward, not a repeat.
- **Type**: `news` (300-600 words, default) or `analysis` (up to 1,200, only when several developments need connecting).
- **Evidence**: the claim refs the article would rest on (`[[2026-11-02-dutch-cloud-tender#c1]]`, …), at least two, at least one `high` or `medium`.
- **Switcher hook**: which services, categories or guides the "What this means for you" section would link to. If there is none, say so.
- **Doubts**: thin sourcing, contested claims, anything the writer must handle carefully.

If no story clears a sensible bar (all scores near zero, or only low-reliability news), say "no pick today" with the reason. A skipped day beats a weak article.

## Step 5: Log and report

Log one line (closing steps in `../_shared/knowledge.md`; the index was already rebuilt in Step 1, no knowledge pages changed):

```
2026-11-02 pick    | dutch-government-cloud-exit | angle: tender details · backups: dma-apple-compliance, gaia-x-future
```

Report:

```
## News pick 2026-11-02

**Pick: dutch-government-cloud-exit** (score 31.5 = heat 7 × relevance 2.0 × freshness 1.5 × development 1.5)
Angle: The finance ministry's €120M tender is the first concrete budget behind the cloud exit.
Type: news · last covered 2026-09-12 (parliament vote) · 3 new events since
Evidence: [[2026-11-02-dutch-cloud-tender#c1]], [[…#c2]], [[2026-10-31-tweakers-azure#c3]]
Switcher hook: services/nextcloud, services/stackit, guides/onedrive-to-nextcloud
Doubts: bidder list not public yet.

**Backup 1: …** (score …) …
**Backup 2: …** (score …) …

Skipped: dma-apple-compliance covered 2026-10-30, nothing new · …
```

`/news-write` takes the pick from this report, or from today's `pick` line in `log.md` when run on its own.
