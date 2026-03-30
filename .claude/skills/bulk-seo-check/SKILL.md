---
name: bulk-seo-check
description: Run SEO audits on multiple services, guides, or pages in parallel. Use when asked to "SEO check all", "bulk SEO", "audit all services", or score SEO across many items at once.
argument-hint: "'service all' or 'guide all' or 'service <name1>, <name2>, ...' or 'below <score>'"
---

# Bulk SEO Check Skill

Run SEO audits on multiple items in parallel by dispatching one subagent per item.

## Argument parsing

| Argument | Meaning |
|----------|---------|
| `service ProtonMail, Tutanota` | SEO check these specific services |
| `service all` | SEO check all services |
| `guide all` | SEO check all guides |
| `service below 70` | Re-check services with seoScore below 70 |
| `service unchecked` | Check services that have never been SEO-reviewed |
| `all` | Check everything (services + guides + pages) |

## Process

### Step 1: Build the item list

**For `service unchecked`:**
```json
mcp__payload__findServices: {"where": "{\"lastSeoReviewAt\": {\"exists\": false}}", "limit": 100}
```

**For `service below 70`:**
```json
mcp__payload__findServices: {"where": "{\"seoScore\": {\"less_than\": 70}}", "limit": 100}
```

**For `all`:** Query services, guides, and pages separately. Combine the lists.

### Step 2: Confirm with user

Show count and list. Ask for confirmation.

### Step 3: Dispatch parallel SEO audit agents

**Agent prompt template:**

```
You are running an SEO audit on {COLLECTION_TYPE} "{ITEM_NAME}" for switch-to.eu.

Use the /seo-check skill. Process:

1. Fetch the item from Payload:
   {FIND_TOOL}: {FIND_QUERY}

2. Run the 10-point SEO checklist. Score each PASS (10), PARTIAL (5), FAIL (0):
   1. Meta Title: present, 40-60 chars, contains keyword
   2. Meta Description: present, 150-160 chars, value proposition
   3. Keywords: 3-8 relevant keywords defined
   4. Heading Structure: proper hierarchy, keyword in H2
   5. Content Length: service 300+ words, guide 500+ words
   6. Internal Context: category set, features 3+, tags 2+
   7. Open Graph: ogTitle + ogDescription present and correct length
   8. Image: screenshot or logo present
   9. Readability: short paragraphs, active voice, Flesch 60+
   10. Freshness: reviewed within 90 days

3. Calculate total score (max 100).

4. Save via {UPDATE_TOOL}:
   - seoScore: [number]
   - seoNotes: [formatted summary with PASS/ISSUES/suggestions]
   - lastSeoReviewAt: [today ISO date]
   - If metaTitle or metaDescription empty, populate with suggestions

Return: item name, score, rating, top 3 issues.
```

### Step 4: Collect and report

```
## Bulk SEO Audit Complete

Audited: X/Y items
Average score: XX/100

| Item | Type | Score | Rating | Top Issue |
|------|------|-------|--------|-----------|
| ProtonMail | Service | 85 | Good | Missing ogDescription |
| Gmail | Service | 45 | Major issues | No meta fields |
| ... | ... | ... | ... | ... |

Score distribution:
- Excellent (90-100): X items
- Good (70-89): X items
- Needs work (50-69): X items
- Major issues (<50): X items

Priority fixes (items scoring below 50):
1. [item]: [what to fix]
```

## Guardrails

- **Max parallel agents:** 10 at a time.
- **Lightweight agents:** SEO checks don't use WebSearch, so they're fast. Can batch 10 comfortably.
- **Auto-populate:** Empty metaTitle and metaDescription get filled with suggestions.
