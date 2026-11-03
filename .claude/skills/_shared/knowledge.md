# Shared Helper: Knowledge Base

Reference doc for every skill that reads or writes `knowledge/`. Not an invocable skill.

**The schema is `knowledge/README.md`.** Read it before any knowledge edit. It defines the source, entity and story formats, slugs, fact lines, supersession, `flags.md` and `log.md`. This file only collects the commands skills share. If the two disagree, the README wins.

## Finding things

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
