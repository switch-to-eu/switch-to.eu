---
name: humanize
description: Strip AI writing patterns from content stored in Payload CMS. Use when asked to "humanize", "de-AI", "make this sound human", "clean up the writing", or review content for AI patterns. Runs a two-pass rewrite on content fetched via MCP.
argument-hint: "'service <name>' or 'guide <slug>'"
---

# Humanize Skill

Remove AI writing patterns from content in Payload CMS. Two-pass process: rewrite, then audit.

## AI Pattern Detection List

These patterns signal AI-generated text. Find and fix all of them.

### Structural patterns
1. **Rule of three**: "X, Y, and Z" lists appearing more than once per 200 words
2. **Parallel sentence openings**: 3+ consecutive sentences starting the same way
3. **Symmetric paragraphs**: Every paragraph roughly the same length
4. **Formulaic transitions**: "Moreover," "Furthermore," "Additionally," at paragraph starts
5. **Setup-punchline structure**: "While X may seem Y, the reality is Z"

### Word-level patterns
6. **Inflated vocabulary**: "utilize" (use), "facilitate" (help), "leverage" (use), "implement" (do/set up), "comprehensive" (specific list instead), "robust" (describe what it actually does)
7. **Hedging clusters**: "It's important to note that," "It's worth mentioning," "It should be noted"
8. **Vague intensifiers**: "very," "really," "incredibly," "extremely," "significantly"
9. **AI-favorite words**: "delve," "landscape," "tapestry," "realm," "paradigm," "synergy," "ecosystem" (unless technically accurate), "holistic," "seamless," "cutting-edge," "game-changer"
10. **Promotional adjectives**: "revolutionary," "groundbreaking," "innovative," "state-of-the-art," "best-in-class"

### Tone patterns
11. **Excessive enthusiasm**: Multiple exclamation marks, "exciting," "amazing," "incredible"
12. **False certainty**: "undoubtedly," "without question," "clearly" (when the thing isn't clear)
13. **Anthropomorphization**: "the tool understands," "the platform knows," "the service cares"
14. **Reader flattery**: "as a savvy user," "for discerning professionals"
15. **Empty empathy**: "we understand how frustrating," "we know how important"

### Punctuation patterns
16. **Em dash overuse**: More than 1 per 500 words (our rule: zero em dashes)
17. **Semicolons**: Remove all. Split into two sentences.
18. **Ellipses for drama**: "And then... everything changed."

## Process

### Step 1: Fetch the content

For services: `mcp__payload__findServices` with name search, get `description`, `content`, `features`, `issues`.
For guides: `mcp__payload__findGuides` with slug search, get `intro`, `beforeYouStart`, `steps`, `troubleshooting`, `outro`.

### Step 2: First pass — Rewrite

Go through every text field. For each one:
- Find every instance of the 18 patterns above
- Rewrite to sound natural. Shorter sentences. Specific details instead of adjectives.
- Vary sentence length: mix 6-word and 20-word sentences
- Use contractions naturally ("it's", "don't", "won't")
- Replace any "not just X, but also Y" with two plain statements

### Step 3: Second pass — Audit

Read the rewritten version and ask: "What still makes this obviously AI-generated?"
Fix those remaining issues. Common second-pass catches:
- Too-perfect paragraph structure (add one short 1-sentence paragraph)
- No contractions (add 2-3 natural ones)
- Every sentence follows subject-verb-object (vary with an occasional "The hard part:" or "In practice:")
- No personality (add one slightly opinionated observation with "Worth knowing:" or "The catch:")

### Step 4: Save back to Payload

Use `mcp__payload__updateServices` or `mcp__payload__updateGuides` to save the rewritten content. Only update the text fields that changed.

### Step 5: Report

Tell the user:
- How many patterns were found and fixed (by category)
- Which fields were updated
- Any remaining concerns

## Verification

After humanizing, the content should pass these checks:
- [ ] No em dashes anywhere
- [ ] No semicolons
- [ ] No words from the banned list
- [ ] Sentence length varies (some 5-8 words, some 15-25)
- [ ] At least one contraction per 100 words
- [ ] No three consecutive sentences starting the same way
- [ ] At least one acknowledged limitation or trade-off
- [ ] Reading it aloud doesn't feel robotic
