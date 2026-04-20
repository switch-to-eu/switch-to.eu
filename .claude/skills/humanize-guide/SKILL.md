---
name: humanize-guide
description: Strip AI writing patterns from a migration guide in Payload CMS. Use when asked to "humanize guide", "de-AI guide gmail-to-protonmail", "make guide sound human".
argument-hint: "'<guide slug>'"
---

# Humanize Guide Content

Remove AI writing patterns from a migration guide in Payload CMS. Two-pass process: rewrite, then audit.

**Before starting, read:** `.claude/skills/_shared/humanize-patterns.md` for the 18 AI patterns and two-pass process.

## Fields to check

- `intro` (richText)
- `beforeYouStart` (richText)
- `steps[].content` (richText, each step)
- `troubleshooting` (richText)
- `outro` (richText)

## Process

### Step 1: Fetch the guide

Use `mcp__Payload__findGuides`:
```json
{"where": "{\"slug\": {\"equals\": \"GUIDE_SLUG\"}}", "limit": 1}
```

Get all richText fields listed above.

### Step 2: First pass — Rewrite

Apply the pattern detection from `_shared/humanize-patterns.md` to every field listed above.

For `steps`: check each step's content individually. Steps should start with an action verb and be 2-3 sentences. Fix any that read like marketing copy.

For `troubleshooting`: Q&A pairs should be direct. No "Great question!" or setup language.

### Step 3: Second pass — Audit

Re-read the rewritten version. Fix remaining AI patterns per the audit checklist in `_shared/humanize-patterns.md`.

### Step 4: Save

Use `mcp__Payload__updateGuides` with the guide ID. Only update fields that changed.

### Step 5: Report

Tell the user:
- How many patterns were found and fixed (by category)
- Which fields were updated
- Any remaining concerns
