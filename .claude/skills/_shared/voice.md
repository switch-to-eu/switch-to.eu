# Voice guide

Reference doc for all content writing skills. Not an invocable skill. The owner approved this guide on 2026-11-04. The human samples are still missing.

## The voice in one sentence

A friend who did the research tells you what changes for you, what to do, and what they would do.

## Three fixed traits

The voice does not change from page to page. These traits come from `PRODUCT.md`.

| Trait | We are | We are not |
|---|---|---|
| Direct | We start with what changes for you. We say what we would do. | We do not build up to the point. We do not push you to a decision. |
| Warm | We write to a capable adult. We say "you can't open it". | We do not lecture or shame. We do not sound like a regulator, an activist or a help centre. |
| Specific | We give the date, the price and the limit. We name the company that made the claim. | We do not use vague praise. We do not give the reader every fact that we found. |

## Tone changes by page

| Page | The reader's state | Tone |
|---|---|---|
| News | "Does this affect me?" | Calm. The answer comes first. Short. |
| Service review | "Is this good enough for me?" | An opinion with evidence. The trade-off stays near the recommendation. |
| Buyer's guide | "Which one do I pick?" | We pick. We give the reason and the cost of the pick. |
| Migration guide | "What do I do now?" | Practical. One action at a time. |
| Fact on a card or in a table | A fast scan | Plain words that make sense alone. |

## How to write a text

1. **Write down the reader's question first.** Then answer it in the first two sentences.
2. **Put the facts in the order that the reader asks.** What happens? When? Does it affect me? What do I do? Do not use the order of the source.
3. **Group by the reader's situation when readers differ.** "If you built a GPT" is better than "What stays behind".
4. **Use the words that a person uses.** Write "shut down" and "can't open". Do not write "retire" and "become inaccessible".
5. **Cut true facts that do not help.** Move a fact lower or remove it. A source can list ten facts and the reader can need four.
6. **Attribute once per passage.** Name the source when a new source starts. Do not repeat "says" in each sentence.
7. **Say what we would do, and mark it as ours.** "We'd migrate" is an opinion from us. It must rest on a fact in the text.
8. **End on a fact or an action.** Do not end on a summary.
9. **Put background after the action.** Give the date of an announcement or the history lower in the text.
10. **Say the unknown outright.** Write "Mistral's page mentions a file limit but doesn't say how many". This is different from "not listed", which applies only to a page that we read.
11. **Flag claims from a company's own tests.** Say that the company ran the test. Do not repeat the number as a plain fact.
12. **Mark an unconfirmed report in the title.** Use "Source: claim" or name the source.
13. **Say who should not follow the advice.** A recommendation also says who should wait, and why.

**On long news:** a short list of key facts can open the text. Do not give it a fixed label.

**In reviews:** give the running cost per year and a cheaper named rival when we have a source for them.

## Plain language

The reader is a regular person, not a developer. Write "you" and "your". Use the active voice in most sentences. If a technical term is necessary, say what it means for the reader.

| Technical | Plain |
|---|---|
| "zero-access encryption" | "even the company can't read your emails" |
| "AES-256 encryption at rest" | "your data is scrambled so only you can read it" |
| "ISO 27001 certified" | "passed independent security audits" |
| "GDPR compliant" | "says it follows GDPR", unless an independent source confirms more |
| "open-source clients" | "the code is public, so anyone can check for problems" |
| "end-to-end encrypted" | "only you and your recipient can read the message" |
| "data stored in Swiss jurisdiction" | "your data is stored in Switzerland" |

Replace vague praise with a fact. Write "setup takes about 5 minutes", not "easy to set up". Write "Gmail scans your emails to show you targeted ads", not "Gmail spies on you". Every service has trade-offs, and we say them on the same page as the recommendation.

## Structure problems to look for

These problems matter more than single words. Fix them first.

- The opening restates the title.
- The first sentence of each paragraph summarises the paragraph too neatly.
- Every sentence has the same length and the same shape.
- A section announces itself, such as "What this means for you".
- The same label appears on every page, such as "Worth knowing:". Service listings and buyer's-guide cards keep this label for now. News does not use it.
- The last sentence repeats the point.

Do not repair these problems with tricks. Do not add a set number of contractions, a set sentence length or a phrase such as "The catch:".

## Evidence and style work together

The rules in `.claude/skills/_shared/evidence.md` stay. A style edit never changes a fact.

- A real hedge stays. "Might differ" stays if the source says "might".
- Attribution can move and merge. It cannot disappear from a claim that only the company can confirm.
- After each rewrite, compare the facts of the old text and the new text. Do this as a separate step, with a reader who did not make the rewrite.

## Words and punctuation

**House style that stays:** no em dashes, no semicolons, no exclamation marks, no hashtags, no emoji. This is a choice for our style. It is not evidence that a text reads well.

**Normal words that are allowed again:** can, may, could, might, it, that, just, really, probably, maybe. Use them when they carry meaning. "You can't open it" is good English.

**Weak signals:** words such as delve, landscape, tapestry, seamless, robust, leverage and game-changer. One such word is not an error. Look at the text again if several appear together. This list goes out of date, so do not treat it as a test.

**Allowed in moderation:** a plain comparison. "A Skill isn't a one-to-one copy" is fine. A decorative metaphor is not.

**Empty phrases:** cut "it's important to note", "when it comes to", "in today's world", "not just X, but also Y", "in conclusion" and "let's dive in". Write "to", not "in order to".

**Say "said" or "says".** Do not use "noted", "stated" or "highlighted" to add variety.

## Dutch terms

This rule is provisional. It comes from one day of Tweakers news, so check it against more pages.

- Write abbreviations in lowercase: ceo, cpu, nas.
- Write compounds as one word: cloudopslagdienst, opensourcebedrijf.
- Write units closed: 8GB.
- Keep product names as the company writes them: Skill, Custom Lumos.

## Before and after

Each pair comes from our own text. The owner must approve each pair.

**News opening**

> Before: OpenAI has scheduled custom GPTs in ChatGPT to retire on 11 December 2026. From that date, GPTs and their pages become inaccessible, OpenAI's FAQ says.

> After: OpenAI plans to shut down custom GPTs in ChatGPT on 11 December 2026. From that date, you can't open GPTs or their pages.

**News title**

> Before: Custom GPTs are scheduled to retire on 11 December. Your options, including leaving

> After: OpenAI plans to shut down custom GPTs on 11 December. What to do with yours

**News section heading**

> Before: What stays behind

> After: If you built a GPT

**A fact on a card**

> Before: Yes, daily limit not published

> After: Yes, with a daily message limit

**Advice with the reason**

> Before: Staying is a fair choice. If you like ChatGPT and your GPT has no custom actions, migrating is the least work.

> After: If you like ChatGPT and your GPT has no custom actions, we'd migrate. It's the least work: OpenAI does the copying and you test the result.

## Human samples

The target must be human writing. The text on this site is AI-written, so it cannot be the target.

**Needed from the owner:** 5 to 10 texts in the owner's own words, or articles from writers that the owner wants to sound like. Use them to fill in the traits above, with a quoted example for each trait. Use the articles of other writers as a guide only. Do not copy their text.

*No samples yet.*

## How we test the guide

1. Rewrite one text of each page type.
2. The owner reads the old and new text side by side.
3. A reader who did not write the text compares the facts.
4. Add the changes that the owner makes as new before-and-after pairs.

No score replaces step 2. We found no project that shows a writing skill improved how readers rate the text.

## Where these ideas come from

The ideas come from research on 2026-11-04. This guide has no copied text from these sources.

- [blader/humanizer](https://github.com/blader/humanizer): rank signals by strength, let a writing sample override the rules, and compare the facts.
- [Nanako0129/sepia](https://github.com/Nanako0129/sepia): rules per genre, and an opening on a person, place or number.
- [conorbronsdon/avoid-ai-writing](https://github.com/conorbronsdon/avoid-ai-writing): detection alone does not authorise an edit.
- [anthropics/knowledge-work-plugins, brand voice](https://github.com/anthropics/knowledge-work-plugins/tree/main/partner-built/brand-voice): the "we are / we are not" table.
- [mailchimp/content-style-guide](https://github.com/mailchimp/content-style-guide): voice stays fixed and tone follows the reader's state. The licence is non-commercial, so we use the idea and not the text.
- [Tweakers](https://tweakers.net/nieuws/list/20261103): put background last, say the unknown, flag lab claims, and use a house style for Dutch terms. We read one day of news and one review. We do not copy its neutral news voice, its unexplained jargon or its spec tables.
- [jamditis/claude-skills-journalism](https://github.com/jamditis/claude-skills-journalism): use "said", and put the most important facts first.

**How strong the evidence is:** studies show that examples improve style matching, and that structure survives word-level cleanup. These studies measure style match or detection, not whether a text reads well. The advice on rhythm, the em dash rule and the critic pass is opinion.
