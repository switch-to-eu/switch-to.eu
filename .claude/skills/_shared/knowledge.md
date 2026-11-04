# Shared Helper: Knowledge Base

Reference doc for every skill that reads or writes `knowledge/`. Not an invocable skill.

**The schema is `knowledge/README.md`.** Read it before any knowledge edit. It defines the source, entity and story formats, slugs, fact lines, supersession, `flags.md` and `log.md`. This file only collects the commands skills share. If the two disagree, the README wins.

## Search store and CLI

`pnpm knowledge:index` also builds a local search store, `knowledge/.cache/knowledge.db` (gitignored, a cache that is safe to delete). It holds the full text of every knowledge note and every content file in English and Dutch, dated facts from the service research fields, URLs with their `checkedAt`, source claims, story timelines, `recentNews`, open flags from `flags.md`, and owner companies derived from `parentCompany` (`alphabet` provides `services/gmail`). Query it before you reach for `rg`, `jq` or `find`: one call returns what used to take several.

**The store is only as fresh as the last index.** Run `pnpm knowledge:index` after any edit in `knowledge/` or `content/`, before you query. A command that says there is no store needs the same.

Add `2>/dev/null` to every command (pnpm prints an unrelated config warning on stderr). Add `--json` for machine-readable output.

| Command | Returns |
|---|---|
| `pnpm -s knowledge resolve "<name or URL>" 2>/dev/null` | Existing nodes for a name, alias or URL, with a confidence. Drops legal suffixes (`Proton AG` finds `proton`) and normalises URLs (scheme, `www.`, query string, trailing slash). `No match for "…": treat it as new.` means new. |
| `pnpm -s knowledge node <id> 2>/dev/null` | One node: file path, facts with dates and citations, links in both directions, events (story timeline, news, Reddit, flags), sources with check dates, claims, aliases. |
| `pnpm -s knowledge related <id> --hops 2 2>/dev/null` | Every node within N hops, both directions, with the edge that reached it. |
| `pnpm -s knowledge search "<text>" --type story,entity --lang nl --limit 10 2>/dev/null` | Ranked nodes with their best passage. Flags are optional. Types: `source`, `entity`, `story`, `article`, `service`, `guide`, `category`, `landing-page`, `page`. |
| `pnpm -s knowledge context <id or topic> --budget 3000 2>/dev/null` | A compact, cited markdown brief for writing: the node in full (facts, claims, links, events, sources, best passages), then each neighbour in one line. `--query "<question>"` focuses the passages, `--lang nl` keeps Dutch ones. Default budget 6000 tokens. |
| `pnpm knowledge:explore` | A local web explorer for people (port 4400). Skills don't need it. |

What it replaces:

| Old lookup | Now |
|---|---|
| Entity by name or alias | `resolve "<name>"` |
| Source by URL | `resolve "<url>"`. A hit of type `source` means it's already ingested. |
| Who links to a page, 1-hop neighbours | `node <id>` (under Links), or `related <id> --hops 1` |
| Story by topic | `search "<words>" --type story` |
| One claim's text | `node <source-slug>` (under Claims) |
| Company that owns a service, and its other services | `node services/<slug>` (the Links line ending `provides → this`) |

Reading `resolve`:
- `1.0 alias` or `1.0 url`: the same thing. Use it.
- `0.9 alias`: the same name without a legal suffix. Almost always the same company.
- `0.8 url … same site`: another page on the same host. For a source that means the same publisher, not the same article.
- `0.7 prefix` and `0.5 title`: candidates only. Check them with `node` before you decide.
- A `service` hit `via source`, `pricing` or `privacy` means the URL is in that listing's research fields. It doesn't mean a knowledge source exists.
- `node` prints "derived from parentCompany, no knowledge note yet" (`"virtual": 1` with `--json`) for an owner company without a file. When you create its entity page, use that slug, so its links to the services stay the same.

## Finding things with rg and jq

The fallback when the store is missing or stale and you can't rebuild it. Still the way for what the store leaves out: inbox URLs, story `status` and `last_covered`, stories by heat, and the claims a page cites.

| Task | How |
|---|---|
| Entity by name or alias | `rg -il "aliases:.*\b<name>\b\|^name: <name>" knowledge/entities` (try the stem too: `rg -il "<stem>" knowledge/entities`) |
| Story by topic | `rg -il "^title: .*<word>" knowledge/stories`, then `rg -l "<entity-slug>" knowledge/stories` |
| Any page by slug | `find knowledge -name "<slug>.md"` |
| Source by URL | `rg -lF "<host/path>" knowledge/sources` (strip scheme, `www.`, query string and trailing slash first) |
| URL seen in any inbox | `rg -F "<host/path>" knowledge/inbox` |
| Active stories | `rg -l "^status: active" knowledge/stories` |
| Claims a page cites | `rg -o "\[\[(\d{4}-\d{2}-\d{2}-[a-z0-9-]+)#(c\d+)\]\]" -r '$1#$2' <file> \| sort -u` |
| One claim's text | `` rg -n '^- `c2` ' $(find knowledge/sources -name "<source-slug>.md") `` |
| Who links to a page | `jq -r --arg s "<id>" '.backlinks[$s][]?' knowledge/graph.json` |
| 1-hop neighbours | `jq -r --arg s "<id>" '.edges[] \| select(.from==$s or .to==$s) \| if .from==$s then .to else .from end' knowledge/graph.json \| sort -u` |
| Node metadata | `jq --arg s "<id>" '.nodes[$s]' knowledge/graph.json` |
| Stories by heat | `jq -r '.nodes \| to_entries[] \| select(.value.type=="story" and .value.status=="active") \| "\(.value.heat // 0)\t\(.key)\t\(.value.last_event)\t\(.value.last_covered // "never")"' knowledge/graph.json \| sort -rn` |
| Entity summaries (cheap context) | `rg -H "^summary:" knowledge/entities/*/<slug>.md` |
| Listed service exists | `ls content/services/<slug>/en.md` |

Graph node ids: knowledge slugs are bare (`microsoft`, `2026-11-02-dutch-cloud-tender`). Site content is prefixed (`services/proton-mail`, `categories/email`, `guides/<slug>`, `articles/<slug>`).

`graph.json` and `index.md` are only as fresh as the last `pnpm knowledge:index`. Run it before reading them if anything changed since.

## Writing rules that trip skills up

- Dates in frontmatter are quoted: `published: '2026-10-30'`.
- Fact lines: `- YYYY-MM-DD · statement. [[source-slug#cN]]`, newest first, the date is when it happened. The separator is a middle dot `·` (U+00B7) with a space on each side.
- Supersede, never delete: `- ~~YYYY-MM-DD · old statement.~~ superseded YYYY-MM-DD [[source#cN]]`, with the new fact added above it.
- Edit frontmatter with targeted Edit calls, never a YAML round-trip (same rules as `_shared/content-files.md`).
- Never hand-edit `knowledge/index.md` or `knowledge/graph.json`.
- Knowledge pages are English notes, plain and neutral. Not the site voice.

Validate frontmatter on every file you touched (prints `ok`):

```bash
uv run .claude/skills/_shared/check-frontmatter.py <files>
```

## Closing every knowledge-changing run

1. `pnpm knowledge:index` and read its health report.
2. `pnpm knowledge:index --check`. Fix every broken link and invalid frontmatter it reports (usually a typo'd slug, or a link to an entity that doesn't exist yet: create it or unlink it). Re-run until it exits 0.
3. Append one line per operation to `knowledge/log.md` (format in the README): `YYYY-MM-DD <op> | <target> | <note>`.

If `pnpm knowledge:index` doesn't exist yet, say so in the report and carry on. Don't build the index by hand.

## Commits

Skills never commit or push. The owner reviews `git diff` and commits, unless the user or a scheduled-task prompt explicitly asks for a commit or PR.
