---
name: seo-check-guide
description: Run an SEO audit on a migration guide in Payload CMS and store the score. Use when asked to "SEO check guide", "audit guide SEO", "score guide gmail-to-protonmail".
argument-hint: "'<guide slug>'"
---

# SEO Check Guide

Audit a migration guide against a 10-point SEO checklist. Store score and notes via MCP.

**Before starting, read:** `.claude/skills/_shared/seo-checklist.md` for the scoring system and note format.

## Content-type-specific thresholds

**Item 5 — Content Length:**
- PASS: `intro` + `steps` + `troubleshooting` total 500+ words
- PARTIAL: Close to threshold
- FAIL: Significantly short

**Item 6 — Internal Context:**
- PASS: `sourceService` and `targetService` set, `difficulty` set, `category` set
- PARTIAL: Some missing
- FAIL: sourceService or targetService missing

**Item 8 — Image:**
- PARTIAL: N/A (no image required for guides)

## Process

### Step 1: Fetch the guide

Use `mcp__Payload__findGuides`:
```json
{"where": "{\"slug\": {\"equals\": \"GUIDE_SLUG\"}}", "limit": 1}
```

Get all fields including SEO tab fields.

### Step 2: Run the 10-point checklist

Apply the checklist from `_shared/seo-checklist.md` with the thresholds defined above for items 5, 6, and 8.

No subpage audit for guides.

### Step 3: Save

Use `mcp__Payload__updateGuides`:
- `seoScore`, `seoNotes`, `lastSeoReviewAt`
- Auto-populate empty `metaTitle` / `metaDescription`

### Step 4: Report

Show the user: score and rating, table of all 10 checks, top 3 priority fixes.
