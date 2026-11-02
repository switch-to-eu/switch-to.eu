---
name: content-link-edit
description: Swap a URL across all site content files in content/ (services, guides, categories, landing pages, pages, both locales), with optional per-locale replacements and visible-text rewriting. Use when fixing broken outbound links from an SEO crawl, retargeting a vendor's canonical URL, or otherwise rewriting URLs inside content.
argument-hint: "describe the change, e.g. 'fix broken links from the Ahrefs CSV' or 'replace <old-url> with <new-url>'"
---

# Content link edit

Rewrite URLs inside the markdown content files. Content lives in `content/` (see `../_shared/content-files.md`), so this is a grep plus targeted edits.

## When to use

- Broken outbound links surfaced by Ahrefs / GSC / similar.
- Vendor changed their canonical URL (e.g. `proton.me/support/knowledge-base` → `proton.me/support`, or `ec.europa.eu/odr` → `consumer-redress.ec.europa.eu/index_en|nl`).
- Locale-specific replacement (different target in `en.md` vs `nl.md`).

## Process

### Step 1: Find every occurrence

```bash
grep -rnF "<old-url>" content/
```

`-F` matches the URL literally. Group the hits by file. Check both `en.md` and `nl.md`, and both frontmatter (e.g. `url`, `affiliateUrl`, `privacyPolicyUrl`, `sourceUrls`, `step-meta video`) and body.

Watch for near-misses: trailing slash, `http` vs `https`, `www.` or not, query strings, anchors. Run a looser grep (e.g. on the path only) before concluding there are no other hits.

### Step 2: Verify replacement URLs (read-only `curl -I`)

Don't trust an obvious replacement. Hit each candidate URL once with `curl -sSI -L` and confirm a final 200. When a vendor has locale-specific pages (`/index_en`, `/index_nl`), verify both.

### Step 3: Plan the edits

For each hit, decide:

- **Locale**: use the `en` replacement in `en.md` and the `nl` replacement in `nl.md` when they differ.
- **Visible text**: in `[text](url)` links, if the text is the old URL itself, rewrite it too. Leave descriptive text ("Read the docs") alone. Bare autolinks (`<https://...>` or a plain URL) get replaced as a whole.
- **Match boundaries**: make sure the old URL isn't a prefix of a longer URL you don't want to change (`https://example.com/a` inside `https://example.com/a/b`).

Show the user the planned list (`file:line old → new`) before editing when there are more than a handful of hits.

### Step 4: Apply

Use the Edit tool per occurrence (or `replace_all` within one file when every occurrence in that file should change the same way). Don't use a blind `sed -i` across `content/`. It can't tell `en` from `nl` or a prefix from a full URL.

Frontmatter URLs follow the quoting rules in `_shared/content-files.md`. Bump `updatedAt` in the item's `en.md`.

### Step 5: Verify

```bash
grep -rnF "<old-url>" content/      # should print nothing (or only the hits you chose to keep)
grep -rnF "<new-url>" content/      # should list every replaced spot
```

Run the frontmatter validation snippet from `_shared/content-files.md` on every file you touched. Then show `git diff --stat content/` so the user can review in the diff.

## What this skill doesn't do

- **Doesn't add or remove links.** Restructuring a sentence around a different link target is a content edit, not a URL swap.
- **Doesn't touch internal links** (e.g. `/privacy`) unless the user asks.
- **Vendor moved to a totally different platform**: don't just swap the URL. The link probably needs a different target with different visible text. Flag it to the user.
