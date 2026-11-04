# AI Pattern Detection & Humanization

Reference doc for all humanize skills. Not an invocable skill.

## AI Pattern Detection List

These patterns can signal AI-generated text. They do not prove it. Look for clusters.

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

## Two-Pass Process

Read `_shared/voice.md` first. These patterns are signals, not errors. One weak signal alone is not a reason to edit. Rank what you find, and fix the structure before the words.

### Pass 1: Rewrite

- Fix the structure problems in `_shared/voice.md` first.
- Put the facts in the order that the reader asks.
- Find the patterns above where they cluster. Rewrite those parts in plain words, with specific details.
- Let the meaning set the sentence length. Do not add tricks to vary it.
- Replace any "not just X, but also Y" with two plain statements.

### Pass 2: Audit

Read the rewritten version and ask: "Where would a good editor stop reading?" Fix those parts. Do not add a contraction, a label such as "The catch:", or a short paragraph only to look human. Contractions are fine where a person uses them.

### Pass 3: Compare the facts

Compare the old and new text, claim by claim. List each dropped fact, and each claim that became stronger, lost its attribution or moved to a different subject. Fix these before you save. When you can, use a reader who did not make the rewrite.

## Evidence guard

Humanizing changes the style, never the facts. Rules from `_shared/evidence.md`:
- Keep hedges that carry evidence. "Not listed on their pricing page" must not become "doesn't have". "Some Reddit users report" must not become "users say" or a plain fact.
- Keep attributions on claims that only the company can confirm. One attribution per passage is enough.
- Keep every number, price, date and "as of".
- An opinion from us must rest on a fact that is already in the text or in the research fields. Don't add a new fact, a motive or a trend.

## Verification Checklist

After humanizing, the content should pass these checks:
- [ ] No em dashes and no semicolons
- [ ] The opening answers the reader's question
- [ ] No structure problem from `_shared/voice.md` remains
- [ ] Every fact from the old text is present, or removed on purpose and reported
- [ ] No claim became stronger or lost its attribution
- [ ] The trade-off is still on the page
