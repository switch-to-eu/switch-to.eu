---
name: knowledge-prune
description: Monthly compaction of the knowledge base in knowledge/, exactly per knowledge/README.md - fold story timelines past 25 entries into Background, move superseded facts older than 12 months into History, delete sources older than 12 months that nothing cites, and set stories dormant or closed. Never deletes anything cited. Use when asked to "prune the knowledge base", "knowledge prune", "compact knowledge", or monthly.
argument-hint: "optional: '--dry-run' (list what would change)"
---

# Knowledge Prune Skill

Keep the base small and current. Rewrite, fold and delete only what the README allows. Git history keeps everything, so nothing is lost, but every deletion still has to be safe.

Read first: `knowledge/README.md` (Story `## Background`, Entity `## History`, status rules) and `../_shared/knowledge.md`.

`--dry-run`: list every change below, edit nothing.

## Step 0: Fresh index and lint first

`pnpm knowledge:index`. If the last `lint` line in `knowledge/log.md` is more than 7 days old, run `/knowledge-lint` first. Pruning a base with broken links or duplicates makes things worse.

Cutoff date: `CUTOFF=$(date -d '12 months ago' +%F)`.

## Step 1: Story status

Per the README: `active` with `last_event` older than 90 days → `dormant`. No event for 365 days, or resolved → `closed`. Bump `updated`.

## Step 2: Fold long timelines

For each story whose `## Timeline` has more than 25 entries:

1. Keep the newest 25 lines. Everything older folds.
2. Rewrite `## Background` (create it above `## Timeline` if missing) as one or two paragraphs of plain prose covering what was there plus the folded events. Keep citations (`[[source#cN]]`) for the events the prose still states. Events too minor to mention lose their line and their citation.
3. Remove the folded lines from `## Timeline`.

The facts on entity pages are untouched. Only the story timeline is compacted.

## Step 3: Entity history

For each entity, struck facts whose `superseded` date is before `$CUTOFF`: move the line, unchanged, from `## Facts` to `## History` (create it after `## Facts` if missing), newest first. Current facts are never moved, however old.

## Step 4: Delete old uncited sources

Candidates: source notes whose filename date (the fetch date) is before `$CUTOFF`:

```bash
find knowledge/sources -name '*.md' | while read f; do d=$(basename "$f" | cut -c1-10); [[ "$d" < "$CUTOFF" ]] && echo "$f"; done
```

Run this **after** Steps 2 and 3, since folding changes what's cited. Re-run `pnpm knowledge:index` first. A candidate is deleted only if all three are empty:

1. Backlinks: `jq -r --arg s "<slug>" '.backlinks[$s][]?' knowledge/graph.json`
2. Any reference in pages: `rg -l "\[\[<slug>(#c\d+)?\]\]" knowledge content --glob '!knowledge/log.md' --glob '!knowledge/inbox/**'`
3. Its URL in an article: `rg -lF "<url>" content/articles`

If any of them hits, the source stays. When in doubt, it stays. Log and inbox mentions don't count as citations (they're history).

## Step 5: Close

Validate frontmatter on every file touched. `pnpm knowledge:index` and `pnpm knowledge:index --check` until it passes (a deletion that breaks a link means step 4 was wrong: restore the file with `git checkout -- <file>`). Log:

```
2026-12-01 prune   | 3 timelines folded, 7 facts → History, 12 sources deleted, 4 stories dormant, 1 closed | knowledge/
```

## Report

```
✓ knowledge-prune 2026-12-01 (cutoff 2025-12-01)
  Stories: 4 → dormant, 1 → closed · 3 timelines folded (dutch-government-cloud-exit: 31 → 25 entries)
  Entities: 7 superseded facts moved to History (microsoft 3, aws 2, …)
  Sources: 15 older than cutoff · 12 deleted · 3 kept (still cited)
  Index: --check passed
```

## Never

- Delete a source that anything cites, or an entity or story page (that's lint's job, and only for duplicates or empty orphans).
- Delete or rewrite a current (non-struck) fact.
- Rewrite source notes.
