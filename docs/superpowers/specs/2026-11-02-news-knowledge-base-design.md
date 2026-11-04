# News Knowledge Base (markdown graph) — Design

**Date:** 2026-11-02
**Status:** Draft, for discussion
**Replaces:** `2026-05-13-research-graph-design.md` (Neo4j). Same goal, no database.
**Scope:** A markdown knowledge base in `knowledge/` that AI skills read and maintain, feeding one researched news article per weekday.

## Goal

Publish a news article every weekday, researched and written by AI, reviewed by a human in a PR. Articles must:

- not repeat what we already wrote, and know what we already wrote,
- follow ongoing stories over weeks and months ("what changed since last time"),
- back every claim with a source we actually read,
- link to our own services, guides and categories.

That needs memory between runs. Plain RAG (embed chunks, retrieve top-k) gives no memory of storylines and no sense of time. A graph database gives both but costs a server, a schema, extraction pipelines and a query language. This design gets the useful parts of GraphRAG in plain markdown files that Claude Code reads with `rg` and edits with normal file tools.

## What we borrow, and from where

| Idea | Source | How it shows up here |
|---|---|---|
| LLM-maintained wiki: immutable raw sources, LLM-owned pages, `index.md`, `log.md`, ingest/query/lint | Karpathy's [LLM Wiki](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f) | The whole skeleton |
| Episodes as ground truth; every fact traces back to one; facts get invalidated, not deleted | Zep/[Graphiti](https://help.getzep.com/graphiti/graphiti/overview/) temporal knowledge graph | `sources/` notes; dated fact lines with `superseded` markers |
| Community summaries answer "what is going on overall" questions better than chunk retrieval | Microsoft [GraphRAG](https://www.microsoft.com/en-us/research/blog/graphrag-new-tool-for-complex-data-discovery-now-on-github/) | `stories/` pages, one synthesized summary per ongoing storyline |
| New notes link to old ones and can rewrite them ("memory evolution") | [A-Mem](https://proceedings.neurips.cc/paper_files/paper/2025/hash/19909c36f51abc4856b4560aff3d36d6-Abstract-Conference.html) (Zettelkasten for agents) | Ingest step updates the entity and story pages a source touches |

What we skip: embeddings, vector search, community-detection algorithms. At our scale (hundreds to low thousands of pages) `rg` over frontmatter plus a generated index is enough. [qmd](https://github.com/tobi/qmd) (local BM25 + vector search over markdown) is the upgrade path if it stops being enough.

**One rule the pure LLM-wiki pattern lacks:** code does the bookkeeping, the LLM does the thinking. Backlinks, the index, orphan detection and staleness are computed by a script, never hand-maintained by the model. LLMs are bad at keeping link tables consistent and good at writing summaries.

## Layout

```
knowledge/
  README.md                 # the schema: rules every skill follows (Karpathy's "schema" layer)
  index.md                  # GENERATED catalog: every page, type, one-line summary, last updated
  log.md                    # append-only: "2026-11-02 ingest | source | 2026-11-02-dutch-cloud-tender"
  graph.json                # GENERATED: nodes + edges + backlinks, for scripts and quick lookups
  inbox/2026-11-02.md       # daily scan output: candidate items, scored, before ingest
  sources/2026/11/2026-11-02-<slug>.md   # one per article/post/filing we read (immutable after ingest)
  entities/<kind>/<slug>.md # companies, regulations, institutions, people, places
  stories/<slug>.md         # ongoing storylines: the "community summaries"
content/
  articles/<slug>/en.md     # published news (same conventions as other content/)
```

`content/services`, `content/guides` and `content/categories` are already nodes in this graph. Entity pages point at them by slug and never duplicate them.

### Node types

**Source** (`sources/YYYY/MM/<date>-<slug>.md`): the episode. What we read, when, and what it says.

```markdown
---
type: source
url: https://www.example.nl/article
publisher: NOS
published: 2026-10-30
fetched: 2026-11-02
lang: nl
reliability: high            # high | medium | low (press release, forum post, etc.)
entities: [microsoft, dutch-government, cloud-act]
stories: [dutch-government-cloud-exit]
---
**Summary:** Two-sentence summary in English.

**Claims**
- `c1` The Ministry of Finance moves 40% of its workloads off Azure by 2028.
- `c2` Budget: €120M over four years.

**Quotes**
> "We cannot guarantee that data stays out of reach of US law." (State secretary, Dutch original translated)
```

Claim IDs (`c1`) give citations a stable target: `[[2026-11-02-dutch-cloud-tender#c2]]`.

**Entity** (`entities/<kind>/<slug>.md`), kind ∈ `company`, `regulation`, `institution`, `person`, `place`:

```markdown
---
type: entity
kind: company
name: Microsoft
aliases: [MSFT, Microsoft Corporation]
services: [microsoft-edge]                  # → content/services/<slug>
related: [{to: cloud-act, rel: subject-to}, {to: openai, rel: invests-in}]
summary: US cloud and software vendor; central to most EU sovereignty stories.
updated: 2026-11-02
---
## Current state
Rewritten on every ingest that touches it. Short, present tense, cited.

## Facts
- 2026-06-10 · Admitted under oath it cannot guarantee EU data is out of reach of US authorities. [[2026-06-10-french-senate-hearing#c1]]
- 2025-02-01 · ~~Claims "EU Data Boundary" keeps all EU data in the EU.~~ superseded 2026-06-10 [[2025-02-01-eu-data-boundary#c1]]
```

Facts are dated, one line each, always cited. Contradicted facts are struck through with a `superseded` date instead of deleted (Graphiti's invalidation, readable by humans).

**Story** (`stories/<slug>.md`): the most important node for news. One ongoing storyline.

```markdown
---
type: story
title: Dutch government moves off US cloud
status: active               # active | dormant | closed
entities: [dutch-government, microsoft, cloud-act]
categories: [storage, email]  # → content/categories
started: 2025-03-14
last_event: 2026-10-30
last_covered: 2026-09-12      # last article we published on it
heat: 7                       # GENERATED: events in last 30 days, weighted by source reliability
---
## Summary
What this story is about and where it stands now. Rewritten, not appended.

## Timeline
- 2026-10-30 · Finance ministry tender published. [[2026-11-02-dutch-cloud-tender#c1]]
- ...

## Open questions
- Which providers bid? Expected Q1 2027.

## Our coverage
- 2026-09-12 · [[articles/dutch-parliament-cloud-motion]], angle: the vote
```

### Edges

Edges live in frontmatter (`entities:`, `stories:`, `related:`, `services:`) so scripts can parse them, plus `[[wikilinks]]` in prose. The index script builds `graph.json` (adjacency + backlinks) from both. Obsidian opens the folder as a graph view for free.

## Operations

All are Claude Code skills, like the existing content pipeline.

| Skill | When | What it does |
|---|---|---|
| `/news-scan` | Weekday morning | Pull candidates from the sources list (RSS, Jina search on watch queries, Reddit MCP, GSC rising queries). Write `inbox/<date>.md`, scored. Drops anything whose URL already exists in `sources/`. |
| `/news-ingest` | After scan | For each kept candidate: fetch with Jina Reader, write the source note, then update the 3–10 entity and story pages it touches (current state, facts, timeline, superseded markers). Append to `log.md`. Run the index script. |
| `/news-pick` | After ingest | Rank stories: `heat` × relevance to switchers (does it map to a service or category we cover?) × time since `last_covered`. Prefer a new development on a known story over a one-off. Output the pick plus 2 backups with angles. |
| `/news-write` | After pick | Retrieval = the story page + its entities (1 hop) + their neighbors from `graph.json` (2 hops, summaries only) + cited source notes + our previous articles on the story. Writes `content/articles/<slug>/en.md` with `draft: true`, `story:`, `entities:`, `sources:`. Every factual sentence cites a claim ID. |
| `/news-check` | After write | Fact check: each cited claim must exist and support the sentence. Then the existing `humanize` and `seo-check`. Files the article back into the story's "Our coverage" and sets `last_covered`. |
| `/news-daily` | Weekdays | Runs the five above and opens one PR. A human reviews, removes `draft`, merges. |
| `/knowledge-lint` | Weekly | Contradictions between pages, stories whose summary is older than their last event, orphan entities, duplicate entities (alias overlap), sources nobody cites. Proposes fixes in a PR. |
| `/knowledge-prune` | Monthly | Compaction (below). |

### Pruning and rewriting

The base stays small and current by rewriting summaries instead of letting timelines grow forever:

- **Stories:** when a timeline passes ~25 entries, the oldest events fold into a `## Background` paragraph and their lines are removed. Stories with no event for 90 days become `dormant`; 365 days, `closed` (kept, excluded from the index's active list).
- **Sources:** after 12 months, a source still cited by a fact or article stays. One cited by nothing is deleted, since its claims already live in entity and story pages. Git history keeps everything anyway.
- **Entities:** superseded facts older than 12 months move into `## History`, one line each.

Git is the temporal store: `git log -p knowledge/stories/x.md` shows how our understanding of a story changed.

### The index script

`scripts/knowledge-index.ts` (no LLM, runs in a second):

1. Parse frontmatter of every file in `knowledge/` and `content/`.
2. Build nodes and edges, compute backlinks, write `graph.json`.
3. Compute `heat` per story from source dates and reliability.
4. Write `index.md`: active stories by heat, then entities by kind, one line each.
5. Report: broken links, orphans, stale summaries, uncited sources. Lint and CI use this.

## Bonus: news keeps the directory fresh

Entity pages link to `content/services`. When ingest records a fact about a service we list (price change, acquisition, data breach, new EU data center), it appends that service to `knowledge/flags.md`. The existing `/research` skill picks flagged services first. News coverage becomes the trigger for refreshing service pages.

## Site work needed (separate plan)

- `content/articles/` collection in the loader, `/[locale]/news/[slug]` route, a news index page, RSS feed, sitemap entries, `NewsArticle` JSON-LD.
- The April articles spec (`2026-04-21-articles-blog-design.md`) covered this for Payload. Its embeds and internal-link pills port to markdown as small shortcodes.
- Dutch: decide whether every article gets translated (via `/translate`) or only some.

## Rollout

1. **Seed (1 day):** write `knowledge/README.md` (schema), the index script, and bootstrap ~30 entities and ~10 stories from what we already know (our 45 service pages, key regulations: GDPR, DMA, DSA, Data Act, CLOUD Act, EU–US Data Privacy Framework).
2. **Manual week:** run `/news-daily` by hand each morning, tune scoring and prompts, fix the schema where it chafes.
3. **Automate:** a scheduled task fires `/news-daily` on weekdays and opens the PR. You review over coffee.
4. **Lint weekly, prune monthly.**

## Open questions

- Source list: which RSS feeds, newsletters, subreddits and watch queries? Start NL + EU-wide, or broader?
- Article length and format: short news (300–500 words) daily, or a mix with a weekly longer piece?
- Languages at launch: English only, or English + Dutch?
- Should `knowledge/` be public in the repo? It's a nice transparency story ("here's our research"), but it also exposes our pipeline.
