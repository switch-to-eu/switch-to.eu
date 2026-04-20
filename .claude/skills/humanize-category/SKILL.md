---
name: humanize-category
description: Strip AI writing patterns from a category page in Payload CMS. Use when asked to "humanize category", "de-AI category social-media", "make category content sound human".
argument-hint: "'<category slug>'"
---

# Humanize Category Content

Remove AI writing patterns from a category page in Payload CMS. Two-pass process: rewrite, then audit.

**Before starting, read:** `.claude/skills/_shared/humanize-patterns.md` for the 18 AI patterns and two-pass process.

## Fields to check

- `description` (textarea)
- `content` (richText)

## Process

### Step 1: Fetch the category

Use `mcp__Payload__findCategories`:
```json
{"where": "{\"slug\": {\"equals\": \"CATEGORY_SLUG\"}}", "limit": 1}
```

Get: `description`, `content`.

### Step 2: First pass — Rewrite

Apply the pattern detection from `_shared/humanize-patterns.md` to both fields.

The `description` is a single sentence (under 150 chars). Check for inflated vocabulary and vague claims. The `content` is 2-3 sentences. Check for all 18 patterns.

### Step 3: Second pass — Audit

Re-read the rewritten version. Fix remaining AI patterns per the audit checklist in `_shared/humanize-patterns.md`.

### Step 4: Save

Use `mcp__Payload__updateCategories` with the category ID. Only update fields that changed.

### Step 5: Report

Tell the user:
- How many patterns were found and fixed (by category)
- Which fields were updated
- Any remaining concerns
