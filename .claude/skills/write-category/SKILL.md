---
name: write-category
description: Write or rewrite content for a category page on switch-to.eu. Use when asked to "write a category", "write category social-media", "draft category content".
argument-hint: "'<category slug>'"
---

# Write Category Content

Write a category page description for switch-to.eu.

**Before writing, read:** `.claude/skills/_shared/voice.md` for tone and writing rules, `.claude/skills/_shared/content-files.md` for the file layout, frontmatter editing rules and draft handling, `.claude/skills/_shared/evidence.md` for what counts as proof.

## Process

### Step 0 (optional): Knowledge context

```bash
pnpm -s knowledge context categories/<slug> --budget 3000 2>/dev/null
```

A short brief: every service in this category with its one-line summary, plus any guide or article filed under it. Use it to see the space before you write. It is not a source: the concrete fact still comes from the research fields of the services in the category (Step 2, `_shared/evidence.md`).

### Step 1: Fetch the category

Read `content/categories/CATEGORY_SLUG/en.md`. If it doesn't exist, check `ls content/categories` for the right slug.

### Step 2: Fetch services in this category

See what services exist in this category. This gives you context for what to write about.
```bash
grep -l '^category: CATEGORY_SLUG$' content/services/*/en.md | xargs -r grep -H '^name:\|^region:\|^description:'
```

### Step 3: Write the content

**`description`** (required, localized): 1 sentence. Under 150 characters. A subtitle that says what makes EU alternatives different in this space. Lead with the reader's situation, not a definition.

- Bad: "Social media platforms based in the European Union with strong privacy protections."
- Good: "Your posts, your audience, no ads mining your data."
- Bad: "European email providers offering secure and private communication."
- Good: "Your inbox, not an advertising platform."

**Body** (markdown below the frontmatter): 2-3 sentences. Brief context about what the services in this category do and why EU matters here. Keep it tight. No "Worth knowing" section (that's per-service). No essay.

- State a concrete fact about the mainstream options in this space
- Say what the EU alternatives do differently, in one sentence
- Optionally: acknowledge the real trade-off or friction

Example for email:
"Most free email providers scan your inbox to sell targeted ads. The services listed here are run by European companies that make money from subscriptions instead. You lose some convenience features, but your messages stay private."

### Step 4: Save

Edit `content/categories/CATEGORY_SLUG/en.md`: `description` in the frontmatter, body below the closing `---`. Keep the other keys and the group comments as they are, bump `updatedAt`, run the validation snippet from `_shared/content-files.md`.

Existing categories have no `draft` key. Don't add one. A brand-new category file gets `draft: true` as the first key of `# Workflow`. Don't touch `nl.md`.

## Self-check before saving

1. Is the description under 150 characters?
2. Is the content 2-3 sentences, not more?
3. Does it mention a concrete fact, not a vague claim? Does that fact come from the research fields of the services in the category?
4. Does it avoid repeating what the services themselves say? (No specific service names.)
