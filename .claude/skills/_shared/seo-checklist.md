# SEO Audit Checklist

Reference doc for all seo-check skills. Not an invocable skill.

## 10-Point Checklist

Score each item: PASS (10 pts), PARTIAL (5 pts), FAIL (0 pts).

**1. Meta Title** (field: `metaTitle`)
- PASS: Present, 40-60 characters, contains a target keyword
- PARTIAL: Present but wrong length or missing keyword
- FAIL: Empty

**2. Meta Description** (field: `metaDescription`)
- PASS: Present, 150-160 characters, contains value proposition, not keyword-stuffed
- PARTIAL: Present but wrong length or generic
- FAIL: Empty

**3. Keywords** (field: `keywords`)
- PASS: 3-8 keywords defined, relevant to content
- PARTIAL: 1-2 keywords or some seem irrelevant
- FAIL: Empty

**4. Heading Structure** (analyze `content` or section fields)
- PASS: Single H1 (or title field), H2s for sections, no skipped levels, keyword in at least one H2
- PARTIAL: Minor issues (skipped level, no keyword in headings)
- FAIL: No headings or broken hierarchy

**5. Content Length** (thresholds vary by content type — defined in per-type skill)
- PASS: Meets type-specific threshold
- PARTIAL: Close to threshold
- FAIL: Significantly short

**6. Internal Context** (what to check varies by content type — defined in per-type skill)
- PASS: All required relationships and metadata set
- PARTIAL: Some missing
- FAIL: Critical metadata missing

**7. Open Graph** (fields: `ogTitle`, `ogDescription`)
- PASS: Both present, ogTitle under 70 chars, ogDescription under 200 chars
- PARTIAL: One present
- FAIL: Both empty

**8. Image** (what counts varies by content type — defined in per-type skill)
- PASS: At least one image present
- PARTIAL: N/A (no image required for this content type)
- FAIL: No images on a page that should have one

**9. Readability** (analyze content text)
- PASS: Paragraphs 1-4 sentences, no paragraph over 150 words, active voice predominant, Flesch Reading Ease estimate 60+
- PARTIAL: Some long paragraphs or passive voice
- FAIL: Wall of text, heavy jargon, passive voice dominant

**10. Freshness signals**
- PASS: `lastSeoReviewAt` within 90 days OR content recently updated
- PARTIAL: Review older than 90 days
- FAIL: Never reviewed

## Scoring

Score = sum of all items. Maximum 100.

Rating:
- 90-100: Excellent
- 70-89: Good
- 50-69: Needs work
- Below 50: Major issues

## Note Format

Write `seoNotes` as:
```
Score: [X]/100 ([Rating])
Checked: [date]

PASS: [list items that passed]
ISSUES:
- [Item]: [specific problem + fix recommendation]
- [Item]: [specific problem + fix recommendation]

Suggested metaTitle: "[if missing or bad, suggest one]"
Suggested metaDescription: "[if missing or bad, suggest one]"
```

## Fields to Save

- `seoScore`: the number (0-100)
- `seoNotes`: the summary text
- `lastSeoReviewAt`: today's date in ISO format
- If `metaTitle` or `metaDescription` are empty, also populate them with suggested values
