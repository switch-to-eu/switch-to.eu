---
name: write-category
description: Write or rewrite content for a category page on switch-to.eu. Use when asked to "write a category", "write category social-media", "draft category content".
argument-hint: "'<category slug>'"
---

# Write Category Content

Write a category page description for switch-to.eu.

**Before writing, read:** `.claude/skills/_shared/voice.md` for tone and writing rules, `.claude/skills/_shared/lexical-json.md` for richText format.

## Process

### Step 1: Fetch the category

Use `mcp__Payload__findCategories`:
```json
{"where": "{\"slug\": {\"equals\": \"CATEGORY_SLUG\"}}", "limit": 1}
```

### Step 2: Fetch services in this category

Use `mcp__Payload__findServices` to see what services exist in this category. This gives you context for what to write about.
```json
{"where": "{\"category\": {\"equals\": CATEGORY_ID}}", "limit": 50, "depth": 0}
```

### Step 3: Write the content

**`description`** (required, localized): 1 sentence. Under 150 characters. A subtitle that says what makes EU alternatives different in this space. Lead with the reader's situation, not a definition.

- Bad: "Social media platforms based in the European Union with strong privacy protections."
- Good: "Your posts, your audience, no ads mining your data."
- Bad: "European email providers offering secure and private communication."
- Good: "Your inbox, not an advertising platform."

**`content`** (richText, Lexical JSON): 2-3 sentences. Brief context about what the services in this category do and why EU matters here. Keep it tight. No "Worth knowing" section (that's per-service). No essay.

- State a concrete fact about the mainstream options in this space
- Say what the EU alternatives do differently, in one sentence
- Optionally: acknowledge the real trade-off or friction

Example for email:
"Most free email providers scan your inbox to sell targeted ads. The services listed here are run by European companies that make money from subscriptions instead. You lose some convenience features, but your messages stay private."

### Step 4: Save

Use `mcp__Payload__updateCategories` with the category ID. Set `_status: "draft"`.

## Self-check before saving

1. Is the description under 150 characters?
2. Is the content 2-3 sentences, not more?
3. Does it mention a concrete fact, not a vague claim?
4. Does it avoid repeating what the services themselves say? (No specific service names.)
