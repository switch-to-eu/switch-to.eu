---
name: seo-check-category
description: Run an SEO audit on a category page in content/ and store the score in its frontmatter. Use when asked to "SEO check category", "audit category SEO", "score category social-media".
argument-hint: "'<category slug>'"
---

# SEO Check Category

Audit a category page against a 10-point SEO checklist. Store score and notes in `content/categories/CATEGORY_SLUG/en.md`.

**Before starting, read:** `.claude/skills/_shared/seo-checklist.md` for the scoring system and note format, and `.claude/skills/_shared/content-files.md` for the file format.

## Content-type-specific thresholds

**Item 5 — Content Length:**
- PASS: `description` present AND body 30+ words
- PARTIAL: Description present but no content
- FAIL: No description

**Item 6 — Internal Context:**
- PASS: `icon` set and at least one service file has `category: <slug>`
- PARTIAL: Icon missing
- FAIL: No services in this category

**Item 8 — Image:**
- PARTIAL: N/A (no image required for categories)

## Process

### Step 1: Fetch the category

Read `content/categories/CATEGORY_SLUG/en.md` in full, including the `# SEO` group if present.

### Step 2: Run the 10-point checklist

Apply the checklist from `_shared/seo-checklist.md` with the thresholds defined above for items 5, 6, and 8.

No subpage audit for categories.

### Step 3: Save

Edit `content/categories/CATEGORY_SLUG/en.md` (see `_shared/content-files.md`):
- `seoScore`, `seoNotes` (`|-` block scalar), `lastSeoReviewAt` (quoted date) in the `# Workflow` group
- Auto-populate empty `metaTitle` / `metaDescription` in the `# SEO` group (add the group comment above `# Workflow` if missing)

Don't add or remove `draft`. Run the validation snippet.

### Step 4: Report

Show the user: score and rating, table of all 10 checks, top 3 priority fixes.
