---
name: news-write
description: Write today's news article from the knowledge base. Builds context from the picked story, its entities, graph neighbours, the cited source notes and our previous coverage, then writes content/articles/<slug>/en.md as a draft with inline source links, internal links to services and guides, and a "What this means for you" section. Use when asked to "write the news article", "news write", "write an article about <story>", or after /news-pick.
argument-hint: "optional: '<story-slug>' and an angle in quotes; default = today's pick from knowledge/log.md"
---

# News Write Skill

Write one English article that advances one story. The owner approves it by removing `draft`.

Read first:
- `../_shared/content-files.md`, section **Articles**: the file format, slug rules, body rules and approval flow. Follow it exactly.
- `../informational-copy/SKILL.md` and `../_shared/voice.md`: site tone. No em dashes, no semicolons, no banned words, knowledgeable friend.
- `knowledge/README.md` and `../_shared/knowledge.md`.

## Inputs

- `<story-slug> "angle"`: write that.
- No argument: today's pick from `/news-pick` in this conversation, else the latest `pick` line for today in `knowledge/log.md`. No pick today → stop and suggest running `/news-pick`.

## Step 1: Build context

Gather, in this order, and stop reading when you have enough:

1. **The story page** `knowledge/stories/<slug>.md`, in full.
2. **Its entities (1 hop)**: every slug in the story's `entities:`. Read `## Current state` and the facts newer than `last_covered`.
3. **Neighbours (2 hops), summaries only**: 1-hop neighbours of those entities from `graph.json` (command in `../_shared/knowledge.md`). Read only their `summary:` line or story `title`. This is for framing, not facts.
4. **Source notes**: every source cited in the story's timeline since `last_covered`, plus any source whose claim you plan to state. Collect claim refs with the "Claims a page cites" command. Read each note in full: url, publisher, published date, reliability, claims.
5. **Our previous coverage**: every `[[articles/<slug>]]` in `## Our coverage`. Read those articles' en.md. List what they already said, so you don't repeat it. A one-sentence recap with a link to the earlier article is fine.
6. **Site content to link**: each slug in the story's `services:` and `categories:` (`content/services/<slug>/en.md`: `name`, `region`, `category`, `description`), plus guides for those services (`grep -l "^\(source\|target\)Service: <slug>$" content/guides/*/en.md`).

## Step 2: Write

**Slug:** English, kebab-case, 3 to 7 words, the news not the date (`dutch-finance-ministry-cloud-tender`). Check `ls content/articles/<slug>` is free.

**Frontmatter** per the Articles spec: `title`, `description` (140-160 chars), `date: '<today>'`, `type`, `story`, `entities`, `services`, `categories`, `guides`, `sources` (one entry per source note you used: title, publisher, url, date = published), `author: Switch-to.eu`, `# SEO` (`metaTitle` when the title is over 60 chars, `keywords` 3-8), `# Workflow` with `draft: true` and `updatedAt: '<today>'`. Every slug you list must exist.

**Body:**
- Lead with the news: what happened, who, when, the key number. First paragraph stands on its own.
- Then context: why it matters for the EU, what came before (link the earlier article if we have one), what's still open.
- **Every factual sentence rests on a claim** in a source note you read. Link the source inline at the claim, with a normal markdown link to the source note's `url`: `the ministry [put €120M out to tender](https://nos.nl/...)`. One link per source per paragraph is enough.
- Low-reliability sources: attribute ("users on r/BuyFromEU report…") or leave out. Contested claims: attribute ("Microsoft says…").
- No speculation beyond the story's `## Open questions`, and phrase those as open ("The ministry hasn't said which providers bid.").
- Internal links, root-relative, no locale: services `/services/eu/<slug>` (region `eu` or `eu-friendly`) or `/services/non-eu/<slug>`, categories `/services/<category-slug>`, guides `/guides/<category>/<guide-slug>`, our earlier articles `/news/<article-slug>` (only approved ones, never a draft).
- End with `## What this means for you`: what an EU reader can do, with links to the relevant services or guides, and the honest trade-off (price, missing features, effort). Skip the section only when nothing is actionable, and say so in the report.
- Length: `news` 300-600 words, `analysis` up to 1,200. `##` subheads only past ~400 words. No H1.
- Tone: informational-copy. Direct, warm, specific. Swagger nowhere. No "breaking", no "game-changer", no outrage.

Keep a private claim map while writing (sentence → `[[source#cN]]`). Put it in your report so `/news-check` and the owner can verify quickly. It doesn't go in the file.

Validate the frontmatter with the snippet in `../_shared/content-files.md`.

## Step 3: File it in the story

In `knowledge/stories/<story>.md`:
- Add a line at the top of `## Our coverage`: `- <today> · [[articles/<slug>]], angle: <angle>.`
- Set `last_covered: '<today>'` and `updated: '<today>'`.

The README says `last_covered` is set on approval. We set it **on write** instead, so tomorrow's `/news-pick` doesn't pick the same story while this draft waits for review. If the owner rejects the article and deletes it, `/knowledge-lint` removes the coverage line and restores `last_covered` from the previous one.

## Step 4: Close

`pnpm knowledge:index` and `pnpm knowledge:index --check` (the new `articles/<slug>` link must resolve). Log:

```
2026-11-02 write   | content/articles/dutch-finance-ministry-cloud-tender/en.md | story dutch-government-cloud-exit, last_covered set on write (draft)
```

## Report

```
✓ news-write: dutch-finance-ministry-cloud-tender (news, 480 words, draft)
  Story: dutch-government-cloud-exit · angle: first concrete budget behind the cloud exit
  Sources: 3 (NOS high, Tweakers high, Rijksoverheid high)
  Internal links: /services/eu/nextcloud, /guides/storage/onedrive-to-nextcloud
  Claim map:
    P1 S1 "The finance ministry put €120M…" → [[2026-11-02-dutch-cloud-tender#c2]]
    …
  Not repeated from earlier coverage: the parliament vote (linked instead)
  → content/articles/dutch-finance-ministry-cloud-tender/en.md
```

Next: `/news-check <slug>`.
