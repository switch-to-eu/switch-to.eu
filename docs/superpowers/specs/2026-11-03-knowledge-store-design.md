# Knowledge store: search, links and writing context

Status: Built (2026-11-03). Builds on [2026-11-02-news-knowledge-base-design.md](2026-11-02-news-knowledge-base-design.md), which keeps the markdown files as the source of truth.

## Problem

The writing skills collect context with many `rg`, `jq` and `find` calls, one call per hop, and they read whole files. Entity names only match by alias regex, so duplicates are likely. `graph.json` holds only nodes and a few edges: no text, no aliases, no URLs, no claim text, no dates per fact. People have no way to browse the research.

## Decision

Add a local search store next to the markdown. The markdown stays the source of truth. The store is a cache that `pnpm knowledge:index` rebuilds in about a second.

- **SQLite through `node:sqlite`** (Node 24). No server and no new runtime dependency. The file is `knowledge/.cache/knowledge.db`, and git ignores it.
- **Full-text search with FTS5**, with accents ignored, over every knowledge note and every content file in English and Dutch. Pages are split at headings, so a hit points at a passage.
- **Embeddings are optional.** One client covers every provider with the OpenAI embeddings API: Mistral (EU, the default when `MISTRAL_API_KEY` is set), OpenAI, and LM Studio on this machine. Vectors are cached by text hash in `knowledge/.cache/embeddings.db`, so a rebuild sends only changed passages. Search merges the full-text and vector rankings (reciprocal rank fusion). Without a provider, search is full-text only.
- **Current knowledge goes in as data.** The research fields of each service become dated facts. `sourceUrls` keep their `checkedAt`. `recentNews` and Reddit mentions become dated events, and `knowledge/flags.md` lines become flag events. A fact takes the newer of `lastResearchedAt` and the check date of the page it cites.
- **Derived links.** The store adds the edges that frontmatter implies: guide to its two services, non-EU service to its recommended alternative, landing page to its services. Each `parentCompany` becomes a company node that "provides" the service, unless a knowledge entity with that name or alias exists. "Google (Alphabet Inc.)" also links Google to Alphabet with "part-of".
- **One query API for everyone.** `src/query.ts` serves the CLI, the explorer and the tests, so people and skills see the same results.

Why not more: at about 100,000 words plus a growing set of notes, a vector database or a graph database adds a server and costs more than it saves. A full embedding run costs a few cents with Mistral or OpenAI.

## Commands

```bash
pnpm knowledge:index                       # graph.json, index.md, the store, and embeddings if configured
pnpm -s knowledge search "<text>"          # --type service,entity --lang nl --limit 10 --json
pnpm -s knowledge node <id>                # facts, links both ways, events, sources, claims, aliases
pnpm -s knowledge resolve "<name or URL>"  # existing nodes; no match means new
pnpm -s knowledge related <id>             # --hops 2
pnpm -s knowledge context <id or topic>    # cited markdown brief, --budget 6000 --query "..." --lang nl
pnpm knowledge:explore                     # local web explorer for people (port 4400)
```

Node ids: knowledge slugs are bare (`microsoft`), site content has its collection as prefix (`services/proton-mail`), and derived companies use the slug of the company name (`alphabet`).

## Rules

- Run `pnpm knowledge:index` after any edit to `knowledge/` or `content/`, before a query. The store is only as fresh as the last index.
- The store never replaces a citation. A brief shows where each fact comes from, and the skills still cite claims and sources.
- A derived company is not a knowledge note. When news is about the company, write an entity note. The store then uses that note.

## Later

- Seed `knowledge/` with entity notes for the companies that own the most listed services (Alphabet, Meta, Microsoft, Proton).
- An MCP server over the same query API, if shell calls from skills become a limit.
