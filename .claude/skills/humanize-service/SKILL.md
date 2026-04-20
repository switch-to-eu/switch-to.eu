---
name: humanize-service
description: Strip AI writing patterns from a service listing in Payload CMS. Use when asked to "humanize service", "de-AI service ProtonMail", "make service content sound human".
argument-hint: "'<service name>'"
---

# Humanize Service Content

Remove AI writing patterns from a service listing in Payload CMS. Two-pass process: rewrite, then audit.

**Before starting, read:** `.claude/skills/_shared/humanize-patterns.md` for the 18 AI patterns and two-pass process.

## Fields to check

- `description`
- `content` (richText)
- `features` (array of tags)
- `issues` (array, if present)
- `gdprNotes`

## Process

### Step 1: Fetch the service

Use `mcp__Payload__findServices`:
```json
{"where": "{\"name\": {\"contains\": \"SERVICE_NAME\"}}", "limit": 1}
```

Get: `description`, `content`, `features`, `issues`, `gdprNotes`.

### Step 2: First pass — Rewrite

Apply the pattern detection from `_shared/humanize-patterns.md` to every field listed above. Rewrite flagged text following the two-pass process.

For `features`: check each tag is 2-4 words and doesn't use inflated vocabulary. Replace "Comprehensive security suite" with "Built-in encryption."

For `content`: this is the main focus. Check every paragraph for all 18 patterns.

### Step 3: Second pass — Audit

Re-read the rewritten version. Fix remaining AI patterns per the audit checklist in `_shared/humanize-patterns.md`.

### Step 4: Save

Use `mcp__Payload__updateServices` with the service ID. Only update fields that changed.

### Step 5: Report

Tell the user:
- How many patterns were found and fixed (by category)
- Which fields were updated
- Any remaining concerns
