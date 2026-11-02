---
name: translate
description: Translate site content in content/ to another locale by writing the <locale>.md file next to en.md. Use when asked to "translate", "localize", "write in Dutch", "add Dutch version", or work with non-English content. Reads en.md, translates all localized fields and the body, and writes nl.md with only the fields that differ.
argument-hint: "'service <name> <locale>' or 'guide <slug> <locale>' (e.g. 'service ProtonMail nl')"
---

# Translation Skill

Translate content from English to another locale. The English source is `content/<type>/<slug>/en.md`. The translation is `content/<type>/<slug>/<locale>.md`.

## Supported locales

- `en` — English (source, default)
- `nl` — Dutch (Nederlands)

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
