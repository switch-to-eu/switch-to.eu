---
name: seo-check-service
description: Run an SEO audit on a service in content/ and store the score in its frontmatter. Use when asked to "SEO check service", "audit service SEO", "score service ProtonMail".
argument-hint: "'<service name>'"
---

# SEO Check Service

Audit a service listing against a 10-point SEO checklist. Store score and notes in `content/services/<slug>/en.md`.

**Before starting, read:** `.claude/skills/_shared/seo-checklist.md` for the scoring system and note format, and `.claude/skills/_shared/content-files.md` for the file format.

## Content-type-specific thresholds

**Item 5 — Content Length:**
- PASS: `description` 50-200 chars AND body 300+ words
- PARTIAL: Close to thresholds
- FAIL: Significantly short

**Item 6 — Internal Context:**
- PASS: `category` set, `features` has 3+ items, `tags` has 2+ items
- PARTIAL: Some missing
- FAIL: Category missing

**Item 8 — Image:**
- PASS: `screenshot` present (and the file exists in `apps/website/public/images/services/`)
- FAIL: Missing

## Process

### Step 1: Fetch the service

```bash
grep -il '^name: .*SERVICE_NAME' content/services/*/en.md
```

Read the whole file, including the `# SEO` group (metaTitle, metaDescription, keywords, ogTitle, ogDescription) and the body.

### Step 2: Run the 10-point checklist

Apply the checklist from `_shared/seo-checklist.md` with the thresholds defined above for items 5, 6, and 8.

### Step 3: Audit subpages

**Pricing subpage** (if `pricingTiers` or `pricingDetails` exist):
- Check `startingPrice` is set
- Check `freeOption` is set correctly
- Check `pricingTiers` has structured data

**Security subpage** (if security data exists):
- Check `gdprCompliance` is set (not "unknown")
- Check `certifications` has entries
- Check `dataStorageLocations` has entries

**Comparison subpages** (from guides):
- Check guides linking to this service have populated `sourceService` and `targetService` (`grep -l 'Service: <slug>$' content/guides/*/en.md`)

Include subpage issues in `seoNotes` under a "Subpages" section. These don't affect the main score.

### Step 4: Evidence check (not scored)

Run the evidence check from `_shared/seo-checklist.md`. Its flags go in `seoNotes` under `EVIDENCE:` and don't change the score.

### Step 5: Save

Edit the item's `en.md` (see `_shared/content-files.md` for groups, quoting and validation):
- `seoScore`: the number (0-100), `# Workflow` group
- `seoNotes`: formatted summary (see `_shared/seo-checklist.md`) as a `|-` block scalar, `# Workflow` group
- `lastSeoReviewAt`: today's date, quoted (`'YYYY-MM-DD'`), `# Workflow` group
- If `metaTitle` or `metaDescription` are empty, populate with suggestions in the `# SEO` group

Don't add or remove `draft`. Run the validation snippet.

### Step 6: Report

Show the user: score and rating, table of all 10 checks, subpage audit results, evidence flags, top 3 priority fixes.
