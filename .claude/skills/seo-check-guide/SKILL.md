---
name: seo-check-guide
description: Run an SEO audit on a migration guide in content/ and store the score in its frontmatter. Use when asked to "SEO check guide", "audit guide SEO", "score guide gmail-to-protonmail".
argument-hint: "'<guide slug>'"
---

# SEO Check Guide

Audit a migration guide against a 10-point SEO checklist. Store score and notes in `content/guides/GUIDE_SLUG/en.md`.

**Before starting, read:** `.claude/skills/_shared/seo-checklist.md` for the scoring system and note format, and `.claude/skills/_shared/content-files.md` for the file format.

## Content-type-specific thresholds

**Item 5 — Content Length:**
- PASS: `intro` + `steps` + `troubleshooting` sections total 500+ words
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

Read `content/guides/GUIDE_SLUG/en.md` in full, including the `# SEO` group if present.

### Step 2: Run the 10-point checklist

Apply the checklist from `_shared/seo-checklist.md` with the thresholds defined above for items 5, 6, and 8.

No subpage audit for guides.

### Step 3: Evidence check (not scored)

Run the evidence check from `_shared/seo-checklist.md` against the research fields of both `sourceService` and `targetService`. Its flags go in `seoNotes` under `EVIDENCE:` and don't change the score.

### Step 4: Save

Edit `content/guides/GUIDE_SLUG/en.md` (see `_shared/content-files.md`):
- `seoScore`, `seoNotes` (`|-` block scalar), `lastSeoReviewAt` (quoted date) in the `# Workflow` group
- Auto-populate empty `metaTitle` / `metaDescription` in the `# SEO` group (add the group comment above `# Workflow` if missing)

Don't add or remove `draft`. Run the validation snippet.

### Step 5: Report

Show the user: score and rating, table of all 10 checks, evidence flags, top 3 priority fixes.
