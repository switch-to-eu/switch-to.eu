---
name: seo-check-service
description: Run an SEO audit on a service in Payload CMS and store the score. Use when asked to "SEO check service", "audit service SEO", "score service ProtonMail".
argument-hint: "'<service name>'"
---

# SEO Check Service

Audit a service listing against a 10-point SEO checklist. Store score and notes via MCP.

**Before starting, read:** `.claude/skills/_shared/seo-checklist.md` for the scoring system and note format.

## Content-type-specific thresholds

**Item 5 — Content Length:**
- PASS: `description` 50-200 chars AND `content` body 300+ words
- PARTIAL: Close to thresholds
- FAIL: Significantly short

**Item 6 — Internal Context:**
- PASS: `category` set, `features` has 3+ items, `tags` has 2+ items
- PARTIAL: Some missing
- FAIL: Category missing

**Item 8 — Image:**
- PASS: `screenshot` or `logo` present
- FAIL: Neither present

## Process

### Step 1: Fetch the service

Use `mcp__Payload__findServices`:
```json
{"where": "{\"name\": {\"contains\": \"SERVICE_NAME\"}}", "limit": 1}
```

Get all fields including SEO tab fields (metaTitle, metaDescription, keywords, ogTitle, ogDescription).

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
- Check guides linking to this service have populated `sourceService` and `targetService`

Include subpage issues in `seoNotes` under a "Subpages" section. These don't affect the main score.

### Step 4: Save

Use `mcp__Payload__updateServices`:
- `seoScore`: the number (0-100)
- `seoNotes`: formatted summary (see `_shared/seo-checklist.md`)
- `lastSeoReviewAt`: today's date in ISO format
- If `metaTitle` or `metaDescription` are empty, populate with suggestions

### Step 5: Report

Show the user: score and rating, table of all 10 checks, subpage audit results, top 3 priority fixes.
