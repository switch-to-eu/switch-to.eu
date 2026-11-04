---
name: knowledge-lint
description: Weekly health pass over the knowledge base in knowledge/. Uses the index script's health report, then fixes contradictions between pages, stale story summaries, orphan and duplicate entities (merging duplicates), uncited sources, stories that should be dormant or closed, malformed fact lines and coverage lines for deleted articles. Use when asked to "lint the knowledge base", "knowledge lint", "clean up knowledge", or weekly.
argument-hint: "optional: '--report-only' (list problems, change nothing)"
---

# Knowledge Lint Skill

Keep the base consistent. Fix in the working tree, the owner reviews the diff. With `--report-only`, list everything and change nothing.

Read first: `knowledge/README.md` (the rules being enforced) and `../_shared/knowledge.md`.

## Step 1: Health report

Run `pnpm knowledge:index` and keep its report: broken links, orphans, stale story summaries, uncited sources, duplicate-alias candidates, dormant candidates. Also run `pnpm knowledge:index --check`. Work through the checks below, the report's items first.

## Checks

### 1. Broken links and invalid frontmatter
From `--check`. Fix the slug, create the missing page if it should exist, or unlink. Must end at exit 0.

### 2. Coverage of deleted or renamed articles
For each `[[articles/<slug>]]` in a story's `## Our coverage` with no `content/articles/<slug>/en.md`: the owner rejected it. Remove the line and set `last_covered` to the date of the newest remaining coverage line (delete the key if none remain).

### 3. Duplicate entities
For each duplicate-alias candidate (and anything `rg -i "^name:" knowledge/entities` shows twice under different spellings), decide if it's really the same thing. If so, merge:
1. Keep the page with more backlinks (`jq '.backlinks["<slug>"] | length' knowledge/graph.json`), or the older one on a tie.
2. Move fact lines into the keeper in date order. Same fact on both → one line with both citations. Union `aliases` (add the dropped page's `name` too), `services`, `related`. Rewrite `## Current state` from the merged facts.
3. Rewrite every reference to the dropped slug: `rg -l "\b<dup>\b" knowledge content/articles --glob '!knowledge/index.md' --glob '!knowledge/graph.json' --glob '!knowledge/log.md' --glob '!knowledge/inbox/**'`. Check each hit by hand (wikilinks `[[<dup>`, frontmatter lists `entities:`, `related: {to: <dup>}`), then replace. Don't blind-replace a slug that's also an English word.
4. Delete the duplicate file.

### 4. Contradictions
Compare, for the pages touched since the last lint (`rg "^\d{4}-\d{2}-\d{2} (ingest|lint)" knowledge/log.md | tail -50`, plus the stories in the report):
- A story `## Summary` vs the `## Current state` of its entities.
- Fact lines on different entities about the same event (dates, numbers, who did what).
- `## Current state` vs that page's own newest facts.
Resolve by the README rule: newer and more reliable wins, the loser is struck through with `superseded <today>`. If two sources of equal standing disagree, don't pick: state both ("NOS reports X, Reuters reports Y") and add an open question to the story.

### 5. Stale story summaries
Stories where `last_event` is newer than the summary reflects (report: stale). Rewrite `## Summary` from the timeline. Bump `updated`.

### 6. Status
- `active` with `last_event` older than 90 days → `dormant`.
- `dormant` with `last_event` older than 365 days, or the story is resolved (final ruling, contract awarded and done) → `closed`.
- `dormant`/`closed` with an event in the last 90 days → `active`.

### 7. Orphan entities
An entity with no backlinks and no `entities:` mention in any source. If it was created by mistake and has no facts, delete it. If it has facts, link it from the story or entity it belongs to (add to `entities:` or `related:`). Otherwise leave it and list it.

### 8. Uncited sources
A source note that no entity, story or article cites (no backlinks, and its url isn't in any `content/articles/*/*.md`). If it's from the last 7 days, ingest probably skipped a step: add the fact or timeline line it supports. Older ones: list them, `/knowledge-prune` deletes them after 12 months.

### 9. Malformed lines
- Fact and timeline lines that don't match `^- (~~)?\d{4}-\d{2}-\d{2} · .+\[\[[a-z0-9-]+#c\d+\]\]`:
  `rg -n "^- " knowledge/entities knowledge/stories | rg -v "^[^:]+:\d+:- (~~)?\d{4}-\d{2}-\d{2} · .*\[\[[a-z0-9-]+#c\d+\]\]"` (then ignore lines in `## Open questions`, `## Our coverage` and `## History`, which have their own shapes).
- Facts out of date order (newest first). Struck facts without `superseded YYYY-MM-DD`.
- Citations to a claim id that doesn't exist in the source note.
- `related` with a `rel` not in the README list. Unquoted frontmatter dates.

### 10. flags.md
Lines pointing at a service that no longer exists: remove. Lines older than 30 days: keep, list them in the report (someone should run `/research flagged`).

## Close

Validate frontmatter on every file touched. `pnpm knowledge:index`, `pnpm knowledge:index --check` until it passes. Log one line summarising:

```
2026-11-07 lint    | 2 duplicates merged, 4 stale summaries, 3 stories dormant, 5 malformed lines | knowledge/
```

## Report

```
✓ knowledge-lint 2026-11-07
  Merged: msft → microsoft, eu-commission → european-commission
  Contradictions: 1 resolved (aws data boundary), 1 left open (NOS vs Reuters on tender size → open question)
  Summaries rewritten: 4 · Status: 3 → dormant, 1 → closed
  Orphans: 2 deleted, 1 linked, 1 left (listed)
  Uncited sources: 3 (oldest 2026-08-14)
  Malformed lines fixed: 5 · Coverage lines removed: 1 (rejected draft)
  Stale flags: services/proton-mail (34 days)
  Needs a human: <judgement calls>
```
