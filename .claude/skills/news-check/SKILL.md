---
name: news-check
description: Fact-check and polish a news article in content/articles/<slug>/en.md. Maps every factual sentence to a claim in a knowledge source note, fixes or cuts unsupported sentences, verifies internal links and frontmatter slugs, then applies the humanize and SEO rules adapted for articles. Use when asked to "check the article", "fact check", "news check", or after /news-write.
argument-hint: "'<article-slug>' (default: the article written today)"
---

# News Check Skill

The last gate before the owner reads the draft. Fix what you can, cut what you can't support, report the rest.

Read first:
- `../_shared/content-files.md` (Articles section), `knowledge/README.md`, `../_shared/knowledge.md`
- `../_shared/humanize-patterns.md` and `../_shared/voice.md` (humanize rules)
- `../_shared/seo-checklist.md` (adapted below)

## Inputs

`<article-slug>`, or the article from today's `write` line in `knowledge/log.md`. Works on `en.md` only. Never removes `draft`.

## Step 1: Load

Read `content/articles/<slug>/en.md`. For every link in the body and every `sources:` entry, find the source note by URL: `pnpm -s knowledge resolve "<url>" 2>/dev/null` returns it as a `1.0 url` hit of type `source`, and `pnpm -s knowledge node <source-slug> 2>/dev/null` gives its path and claims. A URL with no source note is an **unread source**: the article may not rest on it. Read every matching source note in full.

## Step 2: Fact check

Go sentence by sentence through the body (and `title`, `description`):

1. Is it a factual claim? (Numbers, dates, names, events, who said what, cause and effect.) Framing and the reader advice in "What this means for you" are not, but any fact inside them is (prices, features, where data is stored: check those against `content/services/<slug>/en.md`).
2. Map it to a claim: `[[source#cN]]` whose source URL is linked in the article or listed in `sources`. Use `/news-write`'s claim map if it's in the conversation, but verify each mapping yourself.
3. Classify:
   - **supported**: the claim says this.
   - **overstated**: the claim says less (rounded up numbers, "will" for "plans to", a single source's view stated as fact, a low-reliability source stated without attribution). Fix the wording to match the claim.
   - **unsupported**: no claim says it. Find support in another source note already in the base (then add its link and `sources` entry), or cut the sentence. Never add a fact from memory or a fresh web search here. New facts go through `/news-ingest` first.
   - **contradicted**: a newer fact on the entity/story page supersedes it. Rewrite to the current fact.
4. Check dates against the source's `published` date: "yesterday", "this week" and similar must match. Prefer absolute dates.

After fixes, every link and `sources` entry must still be used. Remove `sources` entries the body no longer relies on.

## Step 3: Links and slugs

- Internal links: each `/services/eu/<slug>` or `/services/non-eu/<slug>` resolves to `content/services/<slug>/en.md` and the region matches. `/services/<category>` resolves to `content/categories/<category>/en.md`. `/guides/<category>/<slug>` resolves to `content/guides/<slug>/en.md` with that `category`. `/news/<slug>` or earlier articles resolve to `content/articles/<slug>/en.md`. No `/en/` or `/nl/` prefixes.
- Frontmatter slugs: `story` exists in `knowledge/stories`, each `entities` slug in `knowledge/entities`, each `services`/`categories`/`guides` slug in `content/`.
- Links to draft site content (a service or guide with `draft: true`) will 404 in production: flag them.
- The story's `## Our coverage` has a line for this article. If not, add it (format in `/news-write`).

## Step 4: Humanize

Apply the 18 patterns and the two-pass process from `../_shared/humanize-patterns.md`, plus the banned words and phrases in `../_shared/voice.md`. Article-specific:

- News lede: the first sentence states the event. No scene-setting, no rhetorical question.
- Attribution verbs: "said", "says", "wrote". Not "claimed", "admitted", "slammed", unless the source uses that framing and we attribute it.
- No "Worth knowing" heading here. The trade-off lives in "What this means for you".
- Don't humanize away precision. A number stays a number.

## Step 5: SEO (adapted for articles)

Score with the 10-point method from `../_shared/seo-checklist.md`, with these article rules:

| # | Check | Article rule |
|---|---|---|
| 1 | Meta title | `metaTitle`, else `title`: 40-60 chars, contains the main keyword |
| 2 | Meta description | `description`: 140-160 chars, says what happened, not keyword-stuffed |
| 3 | Keywords | 3-8, what someone would search for this news |
| 4 | Headings | No H1. `##` only past ~400 words. `What this means for you` present (or justified absence) |
| 5 | Length | `news` 300-600 words, `analysis` up to 1,200 |
| 6 | Internal context | `story` set, at least one internal link to a service, category or guide, `services`/`categories` match what the body links |
| 7 | Sources | At least two sources, or one primary `high` source. All linked inline. (Replaces Open Graph: articles have no OG fields.) |
| 8 | Image | N/A (PARTIAL by definition, 5 pts) |
| 9 | Readability | As in the checklist |
| 10 | Freshness | `date` and `updatedAt` are today or the intended publish date |

Fix what you can (lengths, keywords, a missing internal link). The Articles spec has no `seoScore`/`seoNotes` fields, so **don't write the score into the file**. It goes in the report.

## Step 6: Save and close

Edit with targeted Edit calls. Bump `updatedAt`. Validate frontmatter (`../_shared/content-files.md`). If the story page changed, validate it too. Then `pnpm knowledge:index --check` (it also checks article links) and log:

```
2026-11-02 check   | content/articles/dutch-finance-ministry-cloud-tender/en.md | 18 claims ok, 2 reworded, 1 cut · SEO 85
```

## Report

```
✓ news-check: dutch-finance-ministry-cloud-tender
  Fact check: 21 factual sentences · 18 supported · 2 overstated (fixed) · 1 unsupported (cut: "the largest IT tender in Dutch history")
  Links: 3 sources ok · 4 internal ok · 0 broken
  Humanize: 7 patterns fixed (2 rule of three, 1 em dash, 4 banned words)
  SEO: 85/100 (Good) · issues: description 171 chars → shortened
  For the owner: <anything that needs a human judgement: tone calls, a claim we kept but you should eyeball, a missing source>
```
