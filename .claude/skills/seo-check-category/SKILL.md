---
name: seo-check-category
description: Run an SEO audit on a category page in Payload CMS and store the score. Use when asked to "SEO check category", "audit category SEO", "score category social-media".
argument-hint: "'<category slug>'"
---

# SEO Check Category

Audit a category page against a 10-point SEO checklist. Store score and notes via MCP.

**Before starting, read:** `.claude/skills/_shared/seo-checklist.md` for the scoring system and note format.

## Content-type-specific thresholds

**Item 5 — Content Length:**
- PASS: `description` present AND `content` body 30+ words
- PARTIAL: Description present but no content
- FAIL: No description

**Item 6 — Internal Context:**
- PASS: `icon` set, `slug` set
- PARTIAL: Icon missing
- FAIL: Slug missing

**Item 8 — Image:**
- PARTIAL: N/A (no image required for categories)

## Process

### Step 1: Fetch the category

Use `mcp__Payload__findCategories`:
```json
{"where": "{\"slug\": {\"equals\": \"CATEGORY_SLUG\"}}", "limit": 1}
```

Get all fields including SEO tab fields.

### Step 2: Run the 10-point checklist

Apply the checklist from `_shared/seo-checklist.md` with the thresholds defined above for items 5, 6, and 8.

No subpage audit for categories.

### Step 3: Save

Use `mcp__Payload__updateCategories`:
- `seoScore`, `seoNotes`, `lastSeoReviewAt`
- Auto-populate empty `metaTitle` / `metaDescription`

### Step 4: Report

Show the user: score and rating, table of all 10 checks, top 3 priority fixes.
