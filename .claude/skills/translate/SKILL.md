---
name: translate
description: Translate site content in content/ to another locale by writing the <locale>.md file next to en.md. Use when asked to "translate", "localize", "write in Dutch", "write in French", "add Dutch version", "translate the article", or work with non-English content. Reads en.md, translates all localized fields and the body, and writes nl.md with only the fields that differ. News articles get a full translation per locale (nl, fr) with their own approval rules.
argument-hint: "'service <name> nl', 'guide <slug> nl' or 'article <slug> nl|fr' (e.g. 'service ProtonMail nl', 'article dutch-finance-ministry-cloud-tender fr')"
---

# Translation Skill

Translate content from English to another locale. The English source is `content/<type>/<slug>/en.md`. The translation is `content/<type>/<slug>/<locale>.md`.

## Supported locales

- `en` — English (source, default)
- `nl` — Dutch (Nederlands): all collections
- `fr` — French (français): **articles only**. Services, guides, categories, pages and landing pages are en/nl. Refuse `fr` for them.

News articles (`article <slug> <locale>`) follow their own flow: see **Articles** at the end. Steps 1 to 4 below are for the other collections.

## Process

### Step 1: Read the English and existing Dutch files

Read `.claude/skills/_shared/content-files.md` first (localized field list, nl.md rules, guide markers).

- Services: find with `grep -il '^name: .*NAME' content/services/*/en.md`
- Guides: `content/guides/<slug>/en.md`
- Categories, pages, landing pages: `content/<type>/<slug>/en.md`

Read the whole `en.md`. If `<locale>.md` already exists next to it, read it too. Keep any existing Dutch values that are still correct translations of the current English, and keep per-locale step-meta `video` URLs from the existing Dutch guide.

Localized fields to translate (only those present in `en.md`):
- Services: name, startingPrice, description, features, angle, issues, oneLineProblem, whatYoudGain, whatYoudLose, faqs, gdprNotes, userSentiment (translate `summary`, copy the counts and date), recentNews (translate each `summary`, copy the rest), pricingTiers (tier names, prices, billing notes, features), metaTitle, metaDescription, keywords, ogTitle, ogDescription + body
- Guides: title, description, missingFeatures, SEO fields + body (every section, every step's markdown and step-meta `title`)
- Categories, pages, landing pages: title, description, SEO fields + body

### Step 2: Translate

Translate all localized fields. Follow these rules:

**General:**
- Translate meaning, not words. The Dutch version should read naturally in Dutch.
- Keep the same tone as the English: direct, practical, slightly opinionated.
- Do NOT translate: brand names, service names, technical terms (API, GDPR, URL, etc.). Keep GDPR as GDPR, not AVG.
- Keep the same structure and paragraph breaks.
- Match the informational-copy tone rules in Dutch too: no marketing fluff, no vague claims.

**Dutch-specific:**
- Use "je/jij" (informal you), not "u" (formal). Switch-to.eu is informal.
- Dutch compound words: write as one word (e.g. "privacybeleid" not "privacy beleid").
- Keep sentences short. Dutch tends toward longer constructions — fight that.
- "Data" is both singular and plural in Dutch. Don't write "datas."

**What NOT to translate (never goes in nl.md):**
- `url`, `affiliateUrl`, `screenshot` and other URLs (not localized)
- `region`, `featured`, `freeOption` (not localized)
- `category`, `recommendedAlternative`, `sourceService`, `targetService` and other relations (not localized)
- Research fields other than `gdprNotes`, `userSentiment`, `recentNews` (not localized)
- SEO fields: translate `metaTitle`, `metaDescription`, `ogTitle`, `ogDescription`, `keywords` but NOT `seoScore`, `seoNotes`, `lastSeoReviewAt`
- Workflow fields (`draft`, `contentPipelineStatus`, `updatedAt`)
- Guide section and step markers, and step-meta keys other than `title`

### Step 3: Write the translation file

Write `content/<type>/<slug>/<locale>.md` (create it, or overwrite the existing one after merging in what you kept from Step 1):

- **Frontmatter:** only localized fields whose translated value differs from English. Leave out keys where the Dutch value would be identical (brand names, a price written the same way). Same relative key order as `en.md`. No group comments. Same field shapes (lists of strings, `pricingTiers` objects, `faqs` with `|-` answers). Follow the quoting rules in `_shared/content-files.md`.
- **Body:** the full translated body. Keep headings at the same levels and the same paragraph breaks. Keep links, but point internal links at the same paths.
- **Guides:** keep every `<!-- section:... -->`, `<!-- end-section -->`, `<!-- step-start -->` and `<!-- step-end -->` marker exactly. Keep the same number of steps in the same order. In each `step-meta` block, translate `title` and copy the other keys (`video`, `videoOrientation`, `complete`) from `en.md`, unless the existing Dutch file had its own `video` URL for that step.

Then bump `updatedAt` in `en.md`. Don't add or remove `draft`.

Run the validation snippet from `_shared/content-files.md` on both files. For guides, also check the marker counts match:

```bash
for f in content/guides/<slug>/en.md content/guides/<slug>/nl.md; do echo "$f $(grep -c '<!-- step-start -->' $f) steps, $(grep -c '<!-- section:' $f) sections"; done
```

### Step 4: Report

Tell the user:
- What was translated (fields list)
- Target locale
- Which fields were left out of `nl.md` because they match English
- Remind them to review the translation in `git diff` / the PR

## Post-translation SEO

After translation, the user should run:
```
/seo-check service <name>
```
This also checks the Dutch SEO fields in `nl.md` and notes Dutch issues in `seoNotes`. The keywords, meta title, and meta description should be localized (not just translated — adapted for the target market's search terms).

## Quality notes

- Machine translation of SEO keywords rarely works. After translating, review keywords for Dutch search intent. "cloud storage" might be searched as "cloudopslag" in Dutch.
- Run `/humanize` on the Dutch version if it reads stiffly.

## Articles (`article <slug> nl|fr`)

News articles in `content/articles/<slug>/` are translated **in full** per locale, and every locale is approved separately. Read the **Articles** section of `_shared/content-files.md` first. It overrides the nl.md rules above for this collection.

### Preconditions (check, in this order)

1. `en.md` exists and has **no** `draft:` key. If it still has `draft: true`, refuse: the English isn't approved yet.
2. **`nl`:** if `nl.md` already exists without `draft` (approved), ask before overwriting. Re-translating would put it back into draft and unpublish the Dutch.
3. **`fr`:** `nl.md` must exist and have no `draft:` key. If it's missing or still a draft, refuse and say which step is pending (translate nl, or approve nl). If `fr.md` already exists, ask before overwriting.
4. Any other locale: refuse. Articles are en, nl, fr.

In a scheduled or unattended run, "ask" means: skip and report it.

### What goes in the file

Translate from `en.md` (the source of truth, also for `fr`; read `nl.md` too as a reference for terms the owner approved). The translation file holds only:

- `title`, `description` (140-160 characters in the target language too), `metaTitle` if en has one, `keywords` (adapted to what people search in that language, not word for word)
- `draft: true` **for `nl` only**. `fr.md` has **no** `draft` key: French is AI-only and goes live as soon as `fr` is a site locale.
- the full translated body

Never copy the shared keys (`date`, `type`, `story`, `entities`, `services`, `categories`, `guides`, `sources`, `author`, `updatedAt`). Keep the `# SEO` / `# Workflow` group comments only if en.md's layout needs them for the keys you write (`# SEO` above `metaTitle`/`keywords`, `# Workflow` above `draft`).

```markdown
---
title: Financiën zet cloudcontract van €120 miljoen in Europese aanbesteding
description: …
# SEO
keywords: [soevereine cloud, Rijksoverheid, Microsoft]
# Workflow
draft: true
---

Translated body…
```

### Body rules

- Same paragraphs, same `##` headings (translated), same order. `## What this means for you` → `## Wat betekent dit voor jou` / `## Ce que cela change pour vous`.
- Keep every link target unchanged: source URLs point at the original articles, internal links stay root-relative without locale (`/services/eu/nextcloud`). Translate the link text.
- Quotes: translate from the English text, unless the original source was in the target language. Then use the original wording from the source note's URL (fetch it with Jina Reader if needed) instead of a back-translation.
- Numbers and dates in the target language's format (below). Don't round or change any number.
- Don't add or drop facts. The translation must pass the same fact check as en.md.

Don't touch `en.md` or `nl.md` (when writing `fr`). Validate the new file with the snippet in `_shared/content-files.md`.

Log it, since the story's coverage is now multilingual: `<today> translate | content/articles/<slug>/<locale>.md | draft` (or `| live` for fr) in `knowledge/log.md`, then `pnpm knowledge:index`.

### Dutch for articles

The Dutch rules above apply (je/jij, compounds as one word, short sentences, GDPR stays GDPR). Plus: `€120 miljoen`, `€3,99`, `2 november 2026`, `40 procent` or `40%`. Dutch institutions by their Dutch name (Rijksoverheid, ministerie van Financiën, Tweede Kamer). EU institutions by their usual Dutch name (Europese Commissie, Europees Parlement, Hof van Justitie van de EU).

### French (fr)

- **Vous**, always. Tone stays direct and plain: a knowledgeable friend, not a press release. French favours long sentences and nominal style. Fight it: short sentences, verbs over nouns.
- The informational-copy rules apply: no em dashes (use commas, colons or full stops; French dialogue dashes too), no semicolons, no exclamation marks, no marketing words (« révolutionnaire », « incontournable », « innovant »).
- **Legal names, French usage:** GDPR → **RGPD**. Every French reader, newsroom and the CNIL use RGPD, and "GDPR" reads as an anglicism. (Dutch keeps GDPR by house choice. In French that choice would cost clarity and search traffic.) DMA, DSA, AI Act, Data Act and Cloud Act stay as is (French press uses these). On first mention you may add the French name in brackets: « le DMA (règlement sur les marchés numériques) ». CNIL, not "the French data protection authority".
- Keep brand and service names as is. Translate EU institution names (Commission européenne, Parlement européen, Cour de justice de l'UE).
- Typography: guillemets « … » with non-breaking spaces inside, a non-breaking space before `:`, `?`, `!`, `%` and `€`. Numbers: `120 millions d'euros`, `3,99 €`, `40 %`, dates `2 novembre 2026`.
- Keywords: French search terms (« cloud souverain », « alternative européenne à Gmail »), not translated English.
