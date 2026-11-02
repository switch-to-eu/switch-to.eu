---
name: news-daily
description: Run the whole daily news pipeline - scan, ingest, pick, write, check - and end with a short briefing for the owner (what was picked, why, open doubts). Produces one English draft article per weekday. Designed to be run by hand or by a weekday scheduled task. Use when asked to "run the news", "daily news", "news-daily", or "today's article".
argument-hint: "optional: '--no-write' (stop after pick), '--story <slug>' (skip scan/pick), '--commit' (commit/PR at the end, only when asked)"
---

# News Daily Skill

One run = today's knowledge updates + one draft article + a briefing. Each step is its own skill. Run them in order, in this conversation, and pass results along instead of re-reading where possible.

```
/news-scan → /news-ingest → /news-pick → /news-write → /news-check → briefing
```

Read each step's `SKILL.md` when you reach it: `../news-scan/`, `../news-ingest/`, `../news-pick/`, `../news-write/`, `../news-check/`.

## Before starting

- Weekend? The pipeline is for weekdays. On Saturday or Sunday, ask before running (or, in a scheduled run, scan and ingest only, no article).
- `git status --short`: note uncommitted changes in `knowledge/` or `content/articles/` from an earlier run and mention them in the briefing. Don't discard them.
- Article already written today (`rg "^$(date +%F) write" knowledge/log.md`)? Don't write a second one. Run scan and ingest only and say so.
- Check `$JINA_API_KEY` (see `../_shared/jina.md`). Without it, stop: nothing downstream works.

## Steps

1. **Scan** (`/news-scan`). Monday: `--days 3`.
2. **Ingest** (`/news-ingest`) the kept items. If none were kept, continue: pick can still work on yesterday's events.
3. **Pick** (`/news-pick`). "No pick today" is a valid outcome: skip 4 and 5 and explain in the briefing.
4. **Write** (`/news-write`) the pick. If writing shows the evidence is too thin, fall back to backup 1 once.
5. **Check** (`/news-check`) the article.

If a step fails, stop the chain at that point, keep what was done, and report the failure. Don't skip ahead with stale data.

`--story <slug>`: skip scan and pick, write about that story (ingest still runs if the inbox has unchecked items).
`--no-write`: stop after pick. Useful for a manual week of tuning.

## Briefing for the owner

End with this, and nothing longer. The owner reads it over coffee.

```
## News 2026-11-02

**Today's draft:** Dutch finance ministry puts €120M cloud contract up for EU tender
content/articles/dutch-finance-ministry-cloud-tender/en.md · news · 480 words · SEO 85

**Why this one:** first concrete budget behind the Dutch cloud exit. Story heat 7, last covered 2026-09-12. Links Nextcloud and STACKIT.
**Backups:** dma-apple-compliance (nothing new since 30 Oct), gaia-x-future (low-reliability sources only)

**Doubts to check before approving:**
- c3 from Tweakers says "around 40%", the ministry says "up to 40%". Article uses "up to".
- No bidders named yet. The article says so.

**Knowledge base:** 9 sources · 12 entities updated, 2 new · 4 stories updated, 1 new · 1 service flagged (microsoft-365)
**Health:** index --check passed · 1 orphan entity (sovereign-cloud-stack)

**Waiting on you:**
- Approve en.md (remove `draft`), then `/translate article dutch-finance-ministry-cloud-tender nl`
- Drafts still open: <older articles with draft: true, and nl.md files with draft: true>
- Flags for /research: services/microsoft-365
```

Gather "Waiting on you" with:

```bash
grep -l '^draft: true' content/articles/*/en.md content/articles/*/nl.md 2>/dev/null
for d in content/articles/*/; do [ -f "$d/en.md" ] && ! grep -q '^draft: true' "$d/en.md" && [ ! -f "$d/nl.md" ] && echo "needs nl: $d"; done
for d in content/articles/*/; do [ -f "$d/nl.md" ] && ! grep -q '^draft: true' "$d/nl.md" && [ ! -f "$d/fr.md" ] && echo "needs fr: $d"; done
sed -n '/^- /p' knowledge/flags.md
```

Approved articles that still need a translation: offer to run `/translate article <slug> nl` (or `fr`). Don't translate unasked in a scheduled run unless the prompt says so.

## Logging

Each step logs its own line. news-daily adds nothing extra. Every step that changed knowledge already ran `pnpm knowledge:index`.

## Committing

Don't commit, push or open a PR unless the user asks in this conversation or the scheduled-task prompt says so (`--commit`). When asked: branch `news/<today>`, one commit with `knowledge/` and `content/articles/` changes only, PR titled `News <today>: <article title>` with the briefing as the body.

## Running on a schedule

This skill is built to run unattended. A weekday scheduled task (e.g. 06:40 Europe/Amsterdam, Monday to Friday) with the prompt `/news-daily` (add `--commit` if the PR should be opened automatically) gives the owner a draft and a briefing every morning. In a scheduled run there is nobody to answer questions: never ask, take the documented default, and put every judgement call in "Doubts".
