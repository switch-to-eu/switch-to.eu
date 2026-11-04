---
name: news-ingest
description: Ingest news into the knowledge base. For each kept item in today's inbox (or a given URL), fetch it with Jina Reader, write the source note, then update the entity and story pages it touches (current state, cited fact lines, supersession, story timeline/summary/status), flag affected services and rebuild the index. Use when asked to "ingest", "ingest the inbox", "add this article to the knowledge base", or after /news-scan.
argument-hint: "optional: inbox date (default today), one or more URLs, or '--dry-run'"
---

# News Ingest Skill

Turn what we read into knowledge. Sources are the ground truth. Entity and story pages are rewritten from them.

Read first:
- `knowledge/README.md`: the schema. Follow it exactly for source, entity and story pages, fact lines, supersession and `flags.md`.
- `../_shared/knowledge.md`: lookup commands, validation, closing steps.
- `../_shared/jina.md`: Reader.

## Inputs

- No argument: every `- [ ]` item in `knowledge/inbox/<today>.md`.
- A date: that day's inbox.
- One or more URLs: ingest those directly (no inbox needed).
- `--dry-run`: print the source notes and the planned page edits, write nothing.

## Step 1: Plan slugs

Run `pnpm knowledge:index` first, so the search store knows every source and entity up to now.

For each item:

1. **Check the URL isn't ingested yet**: `pnpm -s knowledge resolve "<url>" 2>/dev/null`, also for its `also:` URLs. A `1.0 url` hit of type `source` means it's already in the base: drop the item with reason `already ingested: [[<source-slug>]]` (Step 6 marks the inbox line), or for a URL argument, stop and say so. A `0.8 … same site` hit is another article from the same publisher, not a duplicate.
2. **Choose the source slug** now, before any fan-out: `<today>-<3-6 kebab words>`, path `knowledge/sources/<YYYY>/<MM>/<slug>.md` (today = fetch date). Check it's unused across the whole base: `find knowledge -name "<slug>.md"`.

## Step 2: Write source notes (fan out allowed)

Per item:

1. Fetch with Jina Reader. If the body is a paywall teaser or under ~200 words, try the `also:` URLs from the inbox, then a Jina Search for the same event. If nothing readable, mark the inbox line `[-] … · dropped: paywalled` and move on.
2. Write the source note exactly per the README: frontmatter (`type`, `title` in English, `url` of the page actually read, `publisher`, `published`, `fetched`, `lang`, `reliability`, `entities`, `stories`), `**Summary:**`, `**Claims**` (3 to 10, atomic, numbered, only what the source says, contested claims attributed), `**Quotes**` (optional, translated with the language noted).
3. In `entities:` and `stories:` use existing slugs where they exist. Look each one up: `pnpm -s knowledge resolve "<name>" 2>/dev/null` for entities, `pnpm -s knowledge search "<words>" --type story 2>/dev/null` for stories. For things without a page yet, add the slug you propose and say so in the hand-off.

**Fan-out:** with more than 3 items, dispatch one subagent per item (Agent tool, `run_in_background: true`, max 10). **Subagents write their own source note and nothing else.** No entity, story, flags, inbox, log or index edits, and no `pnpm knowledge:index` (the store from Step 1 is enough). Each prompt includes: the URL(s), the assigned slug and path, today's date, the instruction to read `knowledge/README.md`, `.claude/skills/_shared/jina.md` and the "Search store and CLI" section of `.claude/skills/_shared/knowledge.md`, the instruction to look up every entity and story slug with `resolve` and `search --type story` (never guess a slug), and this return format:

```
source: <slug> | dropped: <reason>
claims: c1 … (one line each, as written)
entities: <existing slugs> | new: <proposed slug> (<kind>, one-line why)
stories: <existing slugs> | new: <proposed story> (why it's a storyline)
services affected: <service slug> · <what changed> · c<N>
```

Wait for all subagents, then continue alone. Entity and story pages are shared between sources, so **only the main agent edits them**, one source at a time in published-date order (oldest first). That keeps fact order and supersession right, and avoids two agents rewriting the same page.

## Step 3: Update entities (main agent, per source)

For each entity the source touches:

1. **Find before creating.** `pnpm -s knowledge resolve "<name>" 2>/dev/null`, then again with the stem and with the company's website if the source gives one (a `service` hit `via home` is a listed service it provides). A hit under another name means: use it, and add the new spelling to its `aliases`. A derived owner company (`node` says "no knowledge note yet") has no page: if you create one, use its slug. Pages you created earlier in this run aren't in the store until the next `pnpm knowledge:index`, so re-index after each source's edits before you resolve again.
2. **Create only when it will recur**: it's central to the source, or already showed up in an earlier source. A one-off name stays plain text in the claim. New pages follow the README template, with the right `kind` folder, `summary`, `services` (only slugs that exist in `content/services`) and `related` (only `rel` values from the README list).
3. **Add fact lines** for what's new: `- YYYY-MM-DD · statement. [[<source-slug>#cN]]`. Date = when it happened. Insert in date order (newest first). A fact we already have from another source gets the extra citation on the same line, not a second line.
4. **Supersede contradictions.** If the new claim contradicts an existing fact, strike the old line, add `superseded <today>`, keep its citation, and put the new fact above. A low-reliability source never supersedes a higher one: record it as `X says …` instead, or leave it to `## Open questions` on the story.
5. **Rewrite `## Current state`** when the facts changed it. Short, present tense, cited. Rewrite, don't append.
6. Update `related` edges if the source shows a new relationship, and set `updated: '<today>'`.

## Step 4: Update stories (main agent, per source)

1. Find the story: the source's `stories:`, else `pnpm -s knowledge search "<words>" --type story 2>/dev/null` and the stories that `pnpm -s knowledge node <main-entity-slug> 2>/dev/null` lists under Links (`involves → this`).
2. **Existing story:** add a timeline line (`- YYYY-MM-DD · event. [[source#cN]]`, newest first). Rewrite `## Summary` so it reflects where things stand now. Update `## Open questions` (remove answered ones, add new ones). Set `last_event` to the newest timeline date, `updated` to today, union new `entities`/`services`/`categories`. A `dormant` story with a new event goes back to `active`.
3. **New story** only when it's genuinely a storyline: an event that will have follow-ups (a tender with a deadline, a court case, a law in negotiation, a migration in progress), not a one-off announcement. One-offs live as facts on entity pages. Before creating, check it isn't a chapter of an existing story. New stories: `status: active`, `started` = first event date, no `last_covered`, empty `## Our coverage`.
4. Never touch `## Our coverage` or `last_covered` here. That's `/news-write`.

## Step 5: Flag listed services

When a new fact changes something a service listing states (price, ownership, data location, a breach, shutdown, new EU hosting), compare it with `content/services/<slug>/en.md` (`startingPrice`, `pricingTiers`, `parentCompany`, `dataStorageLocations`, `headquarters`, `recentNews`). If the listing is now out of date, append to `knowledge/flags.md` per the README:

```
- 2026-11-02 · services/proton-mail · price increase for Mail Plus · [[2026-11-02-proton-pricing#c1]]
```

Skip it if the same service and issue is already flagged. Don't edit `content/services` here.

## Step 6: Update the inbox

Mark each line: `[x] … → [[<source-slug>]]` or `[-] … · dropped: <reason>`.

## Step 7: Close

1. Validate frontmatter of every file touched (snippet in `../_shared/knowledge.md`).
2. `pnpm knowledge:index`, then `pnpm knowledge:index --check`. Fix broken links (usually a slug typo or a link to an entity you decided not to create) until it passes. Read the health report: if it lists a duplicate-alias candidate involving a page you just created, merge now (see `/knowledge-lint`) rather than leaving it.
3. Log one line per source, plus one for flags:

```
2026-11-02 ingest  | sources/2026/11/2026-11-02-dutch-cloud-tender.md | +1 source, ~3 entities (+1 new), ~1 story
2026-11-02 flag    | services/microsoft-365 | data location change | [[2026-11-02-dutch-cloud-tender#c3]]
```

## Report

```
✓ news-ingest inbox/2026-11-02 (9 items)
  Sources: 8 written, 1 dropped (paywalled)
  Entities: 12 updated, 2 created (finnish-ministry-of-finance, sovereign-cloud-stack)
  Stories: 4 updated, 1 created (eu-cloud-certification-scheme), 1 re-activated
  Superseded facts: 2 (microsoft, aws)
  Flags: services/microsoft-365
  Index: --check passed · health: 1 orphan, 0 broken links
```

## Rules

- Everything in English. Translate claims and quotes, note the original language.
- Claims say only what the source says. No inference, no background knowledge sneaked in. If you know something the source doesn't say, it needs its own source.
- Low-reliability sources (Reddit, forums, social) can raise a question. They never settle one, and never become an unattributed fact.
- Sources are immutable after ingest. Fix typos only.
