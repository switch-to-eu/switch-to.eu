# Shared Helper: Content Files

Reference doc for every skill that reads or writes site content. Not an invocable skill.

All site content lives as markdown files in `content/` at the repo root. Skills read and edit them with the normal file tools (Read, Edit, Write, Grep, Glob). There is no CMS and no API. Review happens in `git diff` and PR review.

## Layout

```
content/
  services/<slug>/en.md        # all fields in YAML frontmatter, body = main markdown content
  services/<slug>/nl.md        # optional: only localized fields that differ from en + translated body
  categories/<slug>/{en,nl}.md
  guides/<slug>/{en,nl}.md     # body uses section markers (see below)
  landing-pages/<slug>/{en,nl}.md
  pages/<slug>/{en,nl}.md
```

- The directory name is the slug. There is no `slug` key in frontmatter.
- Relations are slugs: `category: email`, `recommendedAlternative: proton-mail`, guide `sourceService: gmail` / `targetService: proton-mail`, landing page `recommendedServices` / `relatedService`.
- Images: `screenshot: /images/services/<file>` points at `apps/website/public/images/services/<file>`.
- Body content is plain GitHub-flavoured markdown. Use `##` for sections. The page title comes from `name` / `title`, so don't add an H1 to service, category or guide bodies.

## Finding things

| Task | How |
|---|---|
| Service by name | `grep -il '^name: .*<name>' content/services/*/en.md` (case-insensitive; also try the slug: `ls content/services \| grep -i <stem>`) |
| Guide by source/target | `grep -l '^sourceService: <slug>$' content/guides/*/en.md \| xargs grep -l '^targetService: <slug>$'` |
| Services in a category | `grep -l '^category: <category-slug>$' content/services/*/en.md` |
| Field value across items | `grep -H '^researchStatus:' content/services/*/en.md` |
| Items missing a field | `grep -L '^seoScore:' content/services/*/en.md` |
| Items without a translation | `for d in content/services/*/; do [ -f "$d/nl.md" ] \|\| echo "$d"; done` |
| Body word count | `awk 'BEGIN{n=0} /^---$/{n++; next} n>=2' <file> \| wc -w` |

If a name search returns more than one match, pick the exact one or ask the user.

## Frontmatter groups and key order (en.md)

Frontmatter is grouped with YAML comment lines. Keep the comments, keep the group order, keep the key order inside each group. When you add a key that isn't there yet, put it at its documented position. If the group comment is missing, add it in the right place.

### Services

```text
---
# Listing
name, region (eu | non-eu | eu-friendly), category, featured, location, url, affiliateUrl,
freeOption, startingPrice, description, screenshot, features, pricingTiers, tags, angle
# Non-EU page (only used when region is non-eu)
issues, recommendedAlternative, oneLineProblem, whatYoudGain, whatYoudLose, faqs
# SEO
metaTitle, metaDescription, keywords, ogTitle, ogDescription
# Research (filled by /research)
researchStatus, lastResearchedAt, gdprCompliance, gdprNotes, privacyPolicyUrl, pricingDetails,
pricingUrl, headquarters, parentCompany, foundedYear, employeeCount, dataStorageLocations,
certifications, openSource, sourceCodeUrl, sourceUrls, userSentiment, redditMentions,
recentNews, researchNotes
# Workflow
draft, contentPipelineStatus, updatedAt, seoScore, seoNotes, lastSeoReviewAt
---
```

### Guides

```text
---
title, description, category, sourceService, targetService, difficulty (beginner | intermediate | advanced),
timeRequired, date, author, featuredOnHomepage, missingFeatures
# SEO
metaTitle, metaDescription, keywords, ogTitle, ogDescription
# Workflow
draft, contentPipelineStatus, updatedAt, seoScore, seoNotes, lastSeoReviewAt
---
```

### Categories, pages, landing pages

```text
---
title, description, icon (categories), category / recommendedServices / relatedService (landing pages)
# SEO
metaTitle, metaDescription, keywords, ogTitle, ogDescription
# Workflow
draft, contentPipelineStatus, updatedAt, seoScore, seoNotes, lastSeoReviewAt
---
```

Not every file has every group. Empty fields are omitted, not written as `null`, `''` or `[]`. If a value becomes empty, delete the key.

## Field shapes

Arrays that were "one text field per row" in the old CMS are plain lists of strings.

```yaml
features:                 # also: tags, issues, keywords, dataStorageLocations, certifications,
- End-to-end encrypted    #       whatYoudGain, whatYoudLose, missingFeatures, recommendedServices
- Free tier available
pricingTiers:
- name: Mail Plus
  price: €3.99/month
  billingNote: billed annually   # optional
  features:
  - 15 GB storage
  - 10 email addresses
sourceUrls:
- url: https://proton.me/pricing
  label: Proton Pricing page
faqs:
- question: Can I keep my Gmail address?
  answer: |-
    No. You get a new address. You can forward Gmail to it for as long as you like.
userSentiment:
  positive: 12
  negative: 4
  mixed: 3
  summary: 2-3 sentence consumer-facing summary.
  lastUpdated: '2026-11-02'
redditMentions:
- subreddit: r/privacy
  postUrl: https://www.reddit.com/r/privacy/comments/...
  postTitle: ...
  sentiment: positive        # positive | negative | mixed | neutral
  snippet: ...
  date: '2026-10-14'
recentNews:
- source: TechCrunch
  url: https://...
  title: ...
  date: '2026-09-30'
  summary: One-sentence consumer-facing summary.
researchNotes: |-
  ## Company

  Markdown narrative...
```

Enum values:
- `researchStatus`: `not-started | in-progress | needs-update | complete`
- `gdprCompliance`: `compliant | partial | non-compliant | unknown`
- `contentPipelineStatus`: `not-started | in-progress | written | humanized | seo-checked | translated | complete`

## Editing frontmatter safely

- **Use Edit, not a YAML round-trip.** Never load the frontmatter with a YAML library and dump it back. That drops the group comments, reorders keys, rewraps long strings and changes quoting. Make targeted Edit calls on the exact lines you change.
- **Quote when needed.** Wrap a string in single quotes when it contains `: ` or ` #`, starts with one of `' " - [ { * & ! | > % @ ?` or a backtick, or would otherwise parse as a number, boolean, null or date (`yes`, `no`, `true`, `1.0`, `2014`). Inside single quotes, write a literal `'` as `''`. Example: `metaTitle: 'Proton Mail: Swiss Encrypted Email'`.
- **Always quote dates**: `lastResearchedAt: '2026-11-02'`. Unquoted dates become Date objects in some parsers.
- **Long markdown values** (`researchNotes`, FAQ answers) use a `|-` block scalar indented two spaces. Every line of the block, blank lines included, belongs to the block until the indentation drops.
- **Lists** use the existing style: `- item` at the same indentation as the parent key.
- **One line per scalar.** Don't wrap long strings across lines.
- **Don't touch keys you weren't asked to change.**
- **Bump `updatedAt`** in en.md to today (`'YYYY-MM-DD'`) whenever you change en.md or nl.md for an item.

Validate after every write. This must print `ok`:

```bash
python3 -c '
import re, sys, yaml
for f in sys.argv[1:]:
    m = re.match(r"---\n(.*?)^---\n", open(f, encoding="utf-8").read(), re.S | re.M)
    assert m, f + ": no frontmatter block"
    d = yaml.safe_load(m.group(1)) or {}
    assert isinstance(d, dict), f + ": frontmatter is not a mapping"
print("ok", len(sys.argv) - 1, "files")
' content/services/<slug>/en.md content/services/<slug>/nl.md
```

## Localized fields and nl.md

Only these fields may appear in `nl.md`. Everything else lives only in `en.md`.

| Type | Localized fields |
|---|---|
| Services | name, startingPrice, description, features, angle, issues, oneLineProblem, whatYoudGain, whatYoudLose, faqs, gdprNotes, userSentiment, recentNews, pricingTiers, metaTitle, metaDescription, keywords, ogTitle, ogDescription + body |
| Guides | title, description, missingFeatures, SEO fields + body |
| Categories, pages, landing pages | title, description, SEO fields + body |

Rules:
- `nl.md` holds only the localized fields whose Dutch value **differs** from English. A missing key falls back to `en.md`. If the Dutch value would be identical (a brand name, a price in the same format), leave the key out.
- Fallback is per top-level key. A localized object or list (`pricingTiers`, `userSentiment`, `recentNews`, `faqs`) goes into `nl.md` whole, with untranslated parts copied from `en.md`.
- `nl.md` has no group comments. Keep the keys in the same relative order as `en.md`.
- `nl.md` always carries the full translated body. If there is no Dutch body, there is no `nl.md`.
- Never put research, workflow, relation or URL fields in `nl.md`.

## Guide body markers

Guide bodies are split into sections with HTML comments. Keep every marker exactly as written. Write markdown only between them.

```markdown
<!-- section:intro -->

...markdown...

<!-- end-section -->

<!-- section:beforeYouStart -->
...
<!-- end-section -->

<!-- section:steps -->

<!-- step-start -->
<!-- step-meta
title: Create your Proton account
video: https://.../proton1.mp4
videoOrientation: landscape
complete: false
-->

...step markdown...

<!-- step-end -->

<!-- end-section -->

<!-- section:troubleshooting -->
...
<!-- end-section -->

<!-- section:outro -->
...
<!-- end-section -->
```

- Section order: `intro`, `beforeYouStart`, `steps`, `troubleshooting`, `outro`.
- `step-meta` is YAML. `title` is required. `video` (URL), `videoOrientation` (`landscape | portrait`) and `complete` (boolean) are optional. Quote the title if it contains `: `.
- Don't invent `video` URLs. Leave the key out when there is no video.

## Drafts

`draft: true` in an en.md frontmatter (first key of the `# Workflow` group) hides the item from production builds. It still shows in `pnpm dev`.

- **New items** created by a skill must be written with `draft: true`. A human removes it during PR review to publish.
- **Existing items** (no `draft` key): edit in place and don't add `draft: true`. That would unpublish a live page. The PR review is the gate.
- Never remove `draft: true` yourself.

## Review

Nothing publishes automatically. Every change is a file change that a human reviews in `git diff` or a PR before merging. Skills never commit or push unless the user asks.
