# Research Graph (Neo4j) — Design

**Date:** 2026-05-13
**Status:** Approved, awaiting plan
**Scope:** Isolated `research/` worker that ingests external signals, stores them as a graph in Neo4j, and produces a ranked content backlog plus an ad-hoc Cypher sandbox.

## Goal

Use Neo4j as a "feeding ground" for content ideation on switch-to.eu. Pull signals from newsletters, Reddit, news/blog RSS, Google Search Console, and Google Trends; extract topics/entities/sentiment with Claude; surface ranked candidates for new services, guides, and landing pages.

Two consumer paths:
1. **Automated backlog** — digest job pushes ranked candidates into Payload `contentOpportunities`.
2. **Cypher sandbox** — ad-hoc exploration via Neo4j Browser.

## Non-goals

- Service catalog modeling (the existing Payload schema covers that).
- Real-time ingestion. Daily-ish cadence is fine.
- Author / Reddit-user reputation modeling (v1 skip).
- IMAP newsletter ingestion (v1 covers what's available via RSS).

## Architecture

Isolated top-level `research/` folder, sibling to `neo4j/`. Not part of the Turborepo apps. Self-contained `package.json`.

```
research/
  src/
    sources/         # one fetcher per source kind: rss, reddit, gsc, trends
    extract/
      extract.ts     # raw → entities/topics via Claude API
      prompts/       # versioned extraction prompts
    graph/
      schema.cypher  # constraints + indexes (idempotent)
      upsert.ts      # graph writers (neo4j-driver)
      queries/       # named Cypher queries used by digest + skills
    digest/
      backlog.ts     # builds ranked backlog → Payload ContentOpportunities (via MCP)
    config/
      sources.json   # source list (output of a separate Claude research pass)
  raw/               # gitignored: JSONL per source per day
  package.json
```

**Data flow:** `fetchers → raw/ JSONL → extractor → Neo4j → digest → Payload ContentOpportunities`

**Storage layout (Approach B — raw store + Neo4j as derived index):**
- Raw fetched payloads live as JSONL files in `research/raw/YYYY-MM-DD/{source-slug}.jsonl`. Append-only, dedup on `url`, gitignored.
- Neo4j stores the derived graph: documents, topics, entities, queries, mentions. Raw bodies stay out.
- Re-running extraction against the raw store rebuilds the graph from scratch — important because extraction prompts will evolve.

**Runtime triggers:**
- All work is driven by Claude Code skills (no separate cron in v1).
- Each skill is a thin wrapper around a `pnpm --filter research run <name>` invocation.

## Graph schema

```
Nodes
─────
(:Source        {slug, name, kind, url})                  // kind ∈ rss | reddit | gsc | trends | newsletter
(:Document      {url, title, publishedAt, fetchedAt,
                 sourceKind, lang, rawPath, summary,
                 extractedAt, extractedWithPrompt})
(:Topic         {slug, label, description})
(:Entity        {slug, name, kind, aliases})              // kind ∈ service | regulation | company | person | place | product
(:Query         {text, lang})                             // shared across GSC + Trends when text matches

Edges
─────
(Source)-[:PUBLISHED]->(Document)
(Document)-[:MENTIONS {sentiment, theme, weight, snippet}]->(Entity | Topic | Query)
   //   theme ∈ complaint | praise | announcement | switch-story | regulation-update | how-to | other
(Topic)-[:PARENT_OF]->(Topic)
(Topic)-[:RELATED_TO {weight}]->(Topic)
(Entity)-[:RELATED_TO {weight}]->(Entity)

Constraints / indexes
─────────────────────
UNIQUE: Document.url, Topic.slug, Entity.slug, Source.slug
INDEX:  Document.publishedAt, Document.fetchedAt, Query.text
```

**Decisions:**
- GSC + Trends rows become `Document`s (one per query-per-period). Time-series falls out of `Document.publishedAt` windows.
- `MENTIONS` is an edge with `{sentiment, theme, weight, snippet}` — promotable to a node later if needed.
- `Query` is shared across GSC and Trends — same string = same node.
- No `ExistingContent` projection in the graph. Coverage check at digest time via Payload MCP (`service_list`, `guide_list`, `landingPage_list`).

## Skills

| Skill | Action |
|---|---|
| `/research-ingest [source?]` | Read `config/sources.json`, fetch new items per source kind, append to `raw/YYYY-MM-DD/{source}.jsonl`. Idempotent on `url`. |
| `/research-extract [since?]` | Read raw JSONL since timestamp, call Claude (`claude-sonnet-4-6`), upsert into Neo4j. |
| `/research-digest [window=7d]` | Cypher → candidate topics; Payload MCP coverage filter; write `contentOpportunities` drafts. |
| `/research-pipeline` | Runs the three above in sequence. |

## Fetchers

One file per source kind, all return `Promise<RawDoc[]>` with shape:

```ts
{ sourceSlug, url, title, body, publishedAt, lang, extra?: Record<string, unknown> }
```

| Source | Library / API |
|---|---|
| RSS (newsletters, news, blogs) | `rss-parser` |
| Reddit | Direct Reddit JSON API with auth (`REDDIT_USERNAME` / `REDDIT_PASSWORD` from `.env`) |
| GSC | `mcp__gsc__advanced_search_analytics` — invoked from the skill, rows passed to TS |
| Trends | `google-trends-api` (unofficial, maintained) |

Newsletters via IMAP deferred. RSS-first.

## Extraction

Single Claude call per Document. Prompt requests:

```json
{
  "summary": "≤200 chars",
  "lang": "en|nl|...",
  "topics": [{ "slug": "data-sovereignty", "label": "Data sovereignty" }],
  "entities": [{ "slug": "telegram", "name": "Telegram", "kind": "service" }],
  "queries": ["whatsapp eu alternative"],
  "mentions": [
    { "target": "entity:telegram", "sentiment": -0.4, "theme": "complaint", "snippet": "..." }
  ]
}
```

- Zod-validated, then upserted.
- Topics/entities are `MERGE`'d on slug — schema converges over time.
- Prompts versioned in `extract/prompts/`. Prompt version is recorded on `Document.extractedWithPrompt` so we can re-process selectively.
- GSC + Trends rows skip the LLM — directly upserted (Query node + Document node + Mention edge with `theme: "search-signal"`).

## Digest (the backlog)

Cypher pulls candidates ranked by signal:
- recent `MENTIONS` count (last N days)
- diversity of sources (count distinct `Source`)
- not-yet-covered (filtered after Payload MCP coverage lookup)

Output: ranked list → one `contentOpportunity` row per candidate, with the top 3 evidence snippets attached as `redditQuotes` / `evidence` fields (matching whatever the existing `contentOpportunities` shape allows).

## Configuration

- `research/.env` (gitignored): `NEO4J_URI`, `NEO4J_USER`, `NEO4J_PASSWORD`, `ANTHROPIC_API_KEY`, `REDDIT_USERNAME`, `REDDIT_PASSWORD`, `GOOGLE_APPLICATION_CREDENTIALS` (if GSC needs it outside the MCP path).
- `research/config/sources.json` — source list. Output of a separate Claude research pass; not generated as part of this design.

## First slice (what we build first)

The MVP loop, runnable end-to-end:

1. Bootstrap `research/` package, Neo4j connection helper, `schema.cypher` constraints.
2. RSS fetcher (easiest source kind).
3. Extractor with v1 prompt.
4. Three example Cypher queries: trending topics, trending entities, source diversity.
5. Manual `pnpm` scripts. Skill wrappers come right after.

Reddit, GSC, Trends layered in once the loop above works end-to-end on RSS alone.

## Open questions (defer to plan)

- Exact shape of `contentOpportunities` evidence fields — check current Payload schema before writing the digest.
- Whether to share the Anthropic API key with the website's existing key or scope a new one.
- Cron / `schedule` skill integration once the manual loop is stable.
