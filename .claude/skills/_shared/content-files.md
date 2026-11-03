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
  articles/<slug>/{en,nl,fr}.md  # news articles, see "Articles" below (different locale rules)
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
| Articles awaiting approval (any locale) | `grep -l '^draft: true' content/articles/*/{en,nl}.md 2>/dev/null` |
| Approved articles without Dutch | `for d in content/articles/*/; do grep -q '^draft: true' "$d/en.md" \|\| [ -f "$d/nl.md" ] \|\| echo "$d"; done` |
| Dutch approved, French missing | `for d in content/articles/*/; do [ -f "$d/nl.md" ] && ! grep -q '^draft: true' "$d/nl.md" && [ ! -f "$d/fr.md" ] && echo "$d"; done` |
| Articles on a story | `grep -l '^story: <story-slug>$' content/articles/*/en.md` |
| Articles mentioning a service | `grep -lE '^services:.*\b<slug>\b\|/services/(eu\|non-eu)/<slug>\b' content/articles/*/en.md` |
| Articles citing a URL | `grep -lF '<url>' content/articles/*/*.md` |

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

## Articles

News articles live in `content/articles/<slug>/`. They differ from other collections in two ways: **every locale file is a full article** (title, description, SEO and body all translated, no fallback to English), and **every locale file has its own `draft` flag**, because each language is approved separately.

The slug is English, kebab-case, 3 to 7 words, describing the news (`dutch-finance-ministry-cloud-tender`), with no date in it.

### en.md

```markdown
---
title: Dutch finance ministry puts €120M cloud contract up for EU tender
description: One or two sentences, 140-160 characters. Used as the standfirst and meta description.
date: '2026-11-02'          # publication date, set when written, updated on approval
type: news                  # news | analysis
story: dutch-government-cloud-exit          # knowledge/stories/<slug>
entities: [dutch-government, microsoft]     # knowledge/entities slugs
services: [microsoft-365, nextcloud]        # content/services slugs mentioned or recommended
categories: [storage]                       # content/categories slugs
guides: []                                  # content/guides slugs worth linking
sources:
  - {title: 'Finance ministry tenders sovereign cloud', publisher: NOS, url: 'https://…', date: '2026-10-30'}
author: Switch-to.eu
image: /images/articles/<slug>.jpg          # header photo, see "Article photos" below
imageAlt: 'The Danish parliament building, Christiansborg, seen from above'
imageCredit: 'Photo: Kristoffer Trolle, CC BY 2.0, via Wikimedia Commons'
imageCreditUrl: 'https://commons.wikimedia.org/…'   # the photo's licence/source page
# SEO
metaTitle: …                # optional, falls back to title
keywords: [sovereign cloud, Dutch government]
# Workflow
draft: true
updatedAt: '2026-11-02'
---

Body in markdown. 300-600 words for `news`, up to 1,200 for `analysis`.
```

- **Only en.md** holds the shared keys: `date`, `type`, `story`, `entities`, `services`, `categories`, `guides`, `sources`, `author`, `image`, `imageCredit`, `imageCreditUrl`. `imageAlt` may be translated.
- **Article photos:** every article gets a real, openly licensed photo of the place, institution or thing the news is about (a parliament building, a court, a data centre). No AI-generated images, no logos, no stock people-at-laptops. Find one via the Openverse API (`https://api.openverse.org/v1/images/?q=<query>&license=cc0,by,pdm&aspect_ratio=wide&size=large`), prefer Wikimedia Commons, and record `creator`, `license`, `license_version` and `foreign_landing_url`. Download the 1920px Wikimedia thumbnail (`…/commons/thumb/<a>/<ab>/<file>/1920px-<file>`, send a User-Agent with a contact URL, and wait between requests: Commons rate-limits). Convert to a 1600px-wide JPEG around quality 78 and save it as `apps/website/public/images/articles/<slug>.jpg`. Credit line: `Photo: <creator>, CC BY <version>, via Wikimedia Commons` (or `public domain (CC0)`). The credit renders under the header photo and links to `imageCreditUrl`. If nothing fitting and openly licensed exists, leave the image keys out: the page falls back to a text header.
- **Translations** (`nl.md`, `fr.md`) hold `title`, `description`, SEO keys, `draft` and the body, all translated. A missing locale file means the article doesn't exist in that language.
- **Body:** no H1 (the page renders `title`). Use `##` subheads only when the piece is longer than ~400 words. Link sources inline at the claim with a normal markdown link to the original URL. Link our own pages with root-relative paths without a locale (`/services/eu/nextcloud`, `/guides/storage/google-drive-to-pcloud`); the site adds the locale.
- **Every factual sentence** must be traceable to a claim in a `knowledge/sources` note whose `url` matches a link or a `sources` entry. `/news-check` enforces this.
- End `news` pieces with a short `## What this means for you` section: what an EU reader can actually do, linking the relevant services or guides. Skip it only when nothing actionable exists.

### Approval flow (per locale)

1. `/news-write` creates `en.md` with `draft: true`. A human reads it and removes `draft` to approve.
2. `/translate article <slug> nl` writes `nl.md` with `draft: true`. A human re-reads the Dutch and removes `draft`.
3. `/translate article <slug> fr` writes `fr.md` **without** `draft` (AI-only, no human review) and only after `nl.md` is approved.

The site serves a locale only if its file exists and has no `draft: true`. `fr` isn't a site locale yet, so `fr.md` files are stored but not served until it is added.

## Review

Nothing publishes automatically. Every change is a file change that a human reviews in `git diff` or a PR before merging. Skills never commit or push unless the user asks.
