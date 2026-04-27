# Non-EU Service Page Redesign — Design Spec

**Date:** 2026-04-27
**Status:** Approved (brainstorm complete, ready for implementation plan)
**Owner:** simon
**Target route:** `/[locale]/services/non-eu/[service_name]` (e.g. `/en/services/non-eu/chrome`)

---

## Problem

The current non-EU service page (e.g. `/services/non-eu/chrome`) is framed as a *service detail page* — a write-up about Chrome with a sidebar of issues and a single recommended alternative.

Search Console data over the last 90 days tells us this is wrong:

- All non-EU pages combined: **0 clicks, 24 impressions** across 15 query+page pairs.
- Searcher intent is unmistakable: `"eu alternatives to {service}"`, `"european {service} alternative"`, `"{service} eu"`, and Dutch equivalents (`"alternatief voor {service}"`).
- We rank position 7–12 in English (page 1–2) and 58–69 in Dutch (buried). We are getting *seen* for the right intent and *not clicked*.

The diagnosis: the page reads as "about Chrome" when the searcher wants "EU alternatives to Chrome." The title, the H1, the structure all signal the wrong page.

## Goal

Transform `/services/non-eu/[slug]` into an **"EU alternatives to {service}" landing page** that:

1. Matches the searcher's intent in the H1 and meta-title (keyword-perfect).
2. Surfaces the recommended EU alternative in the first viewport.
3. Uses the page-internal information already in Payload (GDPR notes, headquarters, sources, etc.) that today is collected but never rendered.
4. Earns trust through dated review, cited sources, plain-English GDPR notes, and recent-news context.
5. Captures People-Also-Ask traffic via a structured FAQ block.

## Non-goals

- **Not** redesigning the migration guide (`/guides/[category]/[slug]`). Guides remain the place for step-by-step migration content and head-to-head spec tables.
- **Not** redesigning `/services/eu/[slug]`. EU service pages have a different intent and a different design.
- **Not** building comparison/spec tables on this page. Those belong in the migration guide.
- **Not** building new admin tooling beyond standard Payload field additions.

## Architecture

### Page sections, in order

1. **Hero** — orange (`bg-brand-orange`) banner block.
   - H1: `EU Alternatives to {service.name}` (the literal search query).
   - Sub: `service.oneLineProblem` (a punchy one-sentence lede).
   - Top right: existing `RegionBadge` for `non-eu`.
   - Bottom of hero: inline lead-alt teaser card — alt name, 1-line description, "See why ↓" CTA that anchors to section 3.

2. **Trust strip** — thin horizontal row directly below the hero.
   - GDPR badge derived from `service.gdprCompliance` ("Partial GDPR compliance" / "Non-compliant" / "Compliant").
   - Headquarters: `service.headquarters` (e.g. "Mountain View, CA, US").
   - "Last reviewed: {month year}" from `service.lastResearchedAt`.
   - Sources count: "{n} sources cited" linking to section 11.

3. **Recommended alternative** — full card, evolution of existing `RecommendedAlternative` component.
   - Adds: alt's `gdprCompliance` badge, alt's `headquarters`, alt's `openSource` + `sourceCodeUrl` link, alt's top 4–5 `features[]` as pills, alt's `gdprNotes` summary in 1–2 sentences.
   - Keeps: name, description, screenshot, location, freeOption, startingPrice, "Try {alt}" outbound, "Learn more" internal link, migration guide link(s) when present.

4. **What you'd gain / What you'd lose** — two-column honesty panel.
   - Left (gain): list of `service.whatYoudGain[].point` items.
   - Right (lose): list of `service.whatYoudLose[].point` items.
   - Both are framed in the heading as *vs* the recommended alternative: "Switching from {service.name} to {alt.name}: what you get / what you give up".
   - Renders only when `service.recommendedAlternative` is set and the panel arrays have ≥1 item.

5. **Other EU alternatives** — grid of remaining EU services in the same category.
   - Existing `ServiceCard` extended with an optional `angle` line above the description ("Most private", "Closest to Chrome", etc.).
   - Reads `service.angle` from each alternative.
   - Excludes the recommended alternative.
   - Includes the existing `SuggestServiceCard` at the end.

6. **Why people are switching** — the *demoted* critique block.
   - The existing `service.issues[]` list (currently in the sidebar/collapsible).
   - The existing rich-text `service.content` body.
   - Heading reframed from "Why is {service} problematic?" to "Why people are switching from {service}".
   - On mobile, this block is collapsed by default with a "Read more" expander; on desktop it expands inline.

7. **Where your data goes** — company snapshot card.
   - Renders `service.parentCompany` ("Owned by Alphabet Inc.").
   - `service.headquarters`.
   - `service.dataStorageLocations[]` as a chip list.
   - `service.openSource` ("Closed source" / "Open source — {sourceCodeUrl}").
   - `service.foundedYear`, `service.employeeCount` as small meta when present.

8. **Recent news** — chronological list of `service.recentNews[]`.
   - One row per news item: source, date, title (linked to `url`), 1-sentence `summary`.
   - Hidden when array is empty.
   - Heading: "Recent news about {service.name}".

9. **What people say** — Reddit-derived social proof.
   - `service.userSentiment.summary` (2–3 sentence consumer-facing paragraph) at the top.
   - Below: 2–3 quote cards from `service.redditMentions[]`, each showing subreddit, sentiment chip, and snippet.
   - Hidden when both `summary` is empty and `redditMentions` is empty.
   - Heading: "What people say about {service.name}".

10. **FAQs** — accordion of `service.faqs[]`.
    - Renders client-side accordion (collapsed by default).
    - Emits JSON-LD `FAQPage` schema in the page `<head>`.
    - Hidden when `faqs[]` is empty.

11. **Sources & methodology** — page footer trust block.
    - "Last reviewed: {full date}" from `lastResearchedAt`.
    - List of `sourceUrls[]` with their `label`s.
    - Hidden when `sourceUrls[]` is empty. (A site-wide methodology page is out of scope here; can be linked from this block when one exists.)

### Sidebar deprecation

The current desktop sidebar (Issues / "Why switch" pillars) is removed. Issues move into section 6. The pillars (Data Sovereignty, GDPR Compliance, Legal Recourse, Support EU Digital) are removed entirely — they are generic boilerplate that adds nothing per-service and competes with the new per-service trust strip and "Where your data goes" card.

## Schema changes

### `Services` collection — new fields

All localized fields render to the page in the user's locale; non-localized are factual.

| Field | Type | Localized | Tab | Description |
|---|---|---|---|---|
| `oneLineProblem` | `textarea` | yes | Content | Lede shown under the hero H1. ~100–140 chars. Editorial — punchy, specific. |
| `whatYoudGain` | `array<{point: text}>` | yes | Content | 2–3 wins gained by switching from this service to its `recommendedAlternative`. Hidden behind a `condition: data?.region === "non-eu"`. |
| `whatYoudLose` | `array<{point: text}>` | yes | Content | 2–3 honest trade-offs vs `recommendedAlternative`. Same condition as above. |
| `faqs` | `array<{question: text, answer: richText}>` | yes | Content | Page-level FAQs (about *considering* the switch). Distinct from guide FAQs (about *executing* the switch). |
| `angle` | `text` | yes | General | One short line ("Most private", "Closest to Chrome"). Lives on every service — used when this service is rendered as a non-recommended alternative on someone else's page. Optional. |

### `Guides` collection — new field

| Field | Type | Description |
|---|---|---|
| `migrationDifficulty` | `select` (`easy` / `medium` / `hard`) | Difficulty of the specific source→target switch. Lives in the Guide's General tab. Read by the non-EU service page when a guide exists for the source-service to recommended-alternative pair. |

### Field placement summary

- `oneLineProblem`, `whatYoudGain`, `whatYoudLose`, `faqs` go in the **Content** tab on Services.
- `angle` goes in the **General** tab on Services (it's an editorial positioning line, not body content).
- `migrationDifficulty` goes on Guides, in the General tab.

### No fields removed

All current fields stay. The redesign is additive on the data layer.

## Components

### New components (apps/website)

- `TrustStrip` — section 2.
- `GainLosePanel` — section 4. Hides itself if no `recommendedAlternative` or both arrays empty.
- `WhereYourDataGoes` — section 7.
- `RecentNews` — section 8.
- `WhatPeopleSay` — section 9.
- `FaqAccordion` — section 10. Includes JSON-LD `<script type="application/ld+json">` emit.

### Modified components

- `RecommendedAlternative` — extended to render the alt's `gdprCompliance`, `headquarters`, `openSource` + `sourceCodeUrl`, `features[]`, `gdprNotes`.
- `ServiceCard` — optional `angle` line above the description (new prop, no breaking change).
- `apps/website/app/(frontend)/[locale]/services/non-eu/[service_name]/page.tsx` — new section ordering, new data fetches (alt at depth 2 already gives us most of what we need), removal of sidebar layout in favour of full-width sections.

### Component props are read-only on Service

No new mutations. The page is read-only; admin edits happen in Payload.

## Data flow

- `page.tsx` fetches the service at `depth: 2` (already in place) — gives us `recommendedAlternative` populated with all its fields including new ones (`whatYoudGain`/`Lose` are localized text on the *non-EU* service, so they come on the same fetch).
- `page.tsx` continues to fetch the EU-alternatives grid (same query as today).
- `migrationDifficulty` comes from the existing `guides` query already in `page.tsx`.
- No new server queries are required for the redesign itself, beyond what's already done.

## i18n

- All new visible fields are localized.
- Section headings live in `packages/i18n/messages/website/{locale}.json` under a new `services.detail.nonEu.*` namespace tree (the existing namespace already exists; new keys added).
- Dutch translations for fixed copy ("Recent news about", "What people say about", "Switching from X to Y: what you get / what you give up") are required for parity.

## Trust signals / E-E-A-T

The redesign deliberately raises trust signals that today are weak:

- **Dated review** — `lastResearchedAt` shown in the trust strip and footer.
- **Cited sources** — `sourceUrls[]` listed in the footer, with a "{n} sources cited" link in the trust strip jumping to it.
- **Plain-English GDPR summary** — `gdprNotes` rendered (currently never shown).
- **Where data is stored** — `dataStorageLocations[]` rendered.
- **Recent regulatory context** — `recentNews[]` rendered.
- **Independent voice** — `userSentiment.summary` + Reddit snippets render an external perspective.

## Brand alignment

The redesign respects `docs/brand.md`:
- Hero stays on the brand-orange banner with Anton-style H1 (current pattern).
- Section blocks use the existing colour rotation via `getCardColor(index)` for the alternatives grid.
- New sections use brand surfaces (`bg-brand-cream`, `bg-brand-navy`, `bg-brand-green`) per their role; trust strip uses cream, gain/lose uses green/coral, "where data goes" uses navy with light text.
- Pill buttons (`rounded-full`) only.
- Decorative shapes (`DecorativeShape`) on the hero and on the recommended alternative card, matching current usage.
- Light mode only (no `dark:` classes).

## Content / research prep

The redesign is meaningless without the data behind it. The non-EU set has these gaps right now (verified on Chrome's record, confirmed empty across the set):

| Field | Status | How to fill |
|---|---|---|
| `userSentiment` | Empty | `/bulk-research` skill (existing) on the non-EU set |
| `redditMentions[]` | Empty | Same |
| `recentNews[]` | Empty | Same — must include EU regulatory actions / fines |
| `certifications[]` | Mostly empty | Same |
| `oneLineProblem` | Doesn't exist | Editorial — likely an extension to `/write service` skill |
| `whatYoudGain[]` / `whatYoudLose[]` | Doesn't exist | Editorial — same skill extension |
| `faqs[]` | Doesn't exist | Editorial — same skill extension, with an SEO emphasis (PAA-derived questions) |
| `angle` | Doesn't exist | Editorial — quick pass per service |

Two prep tracks need to run in parallel with the page implementation:

- **Track A (data backfill):** run `/bulk-research` on the non-EU set to populate the existing-but-empty fields.
- **Track B (editorial):** extend `/write service` to also produce `oneLineProblem`, `whatYoudGain`, `whatYoudLose`, `faqs`, `angle`. Then run it across the non-EU set (and `angle` across all services).

The implementation plan should sequence these so the page ships with real data behind every block, not empty arrays gracefully hiding most of the page. Tracks A and B can be split out as their own plans during plan-writing if the engineering and content workstreams want independent timelines.

## Success criteria

Measurable, time-bound:

1. The page ranks for `"eu alternatives to {service}"` in English at position ≤ 5 within 60 days of ship for at least 3 of the top 5 non-EU services (Chrome, Gmail, Google Drive, Instagram, WhatsApp).
2. CTR on impressions for that intent rises from 0% to ≥ 5% within the same window.
3. At least one FAQ block produces a PAA-style snippet in the SERP for at least one query.
4. The page's HTML emits valid JSON-LD `FAQPage` schema (verifiable with Google's Rich Results test).

Long-tail goals (no specific deadline):
- Dutch positions move from 58–69 into page 1 for the same intent.
- Inbound clicks to migration guides increase (downstream conversion).

## Risks and mitigations

- **Data backfill takes longer than the build** — mitigation: ship the page behind a feature flag or per-service when its data is complete; until then, current page stays. Or: ship the page; sections with no data render nothing (already designed for graceful hiding) — page will be visibly thinner on under-researched services. Decision deferred to plan.
- **Editorial drift between `oneLineProblem`/`whatYoudLose` and the issues array** — mitigation: the `/write service` skill should reuse the same source material for both; review pass before publish.
- **`whatYoudGain`/`whatYoudLose` go stale when `recommendedAlternative` changes** — mitigation: a content-pipeline check that flags these fields for re-write when the rec changes. Out of scope for this design; tracked for follow-up.
- **PAA snippets require well-formed FAQ content, not all `faqs[]` will earn one** — mitigation: SEO skill review of FAQs on publish.

## Open questions (deferred to plan)

- Where exactly does `migrationDifficulty` render on the page? (My lean: as a small chip on the migration-guide CTA inside the recommended alternative card.)
- Are gain/lose entries free-text strings, or do they want an icon prop per item? (My lean: free text, keep schema simple.)
- Should the trust strip be sticky-on-scroll or static? (My lean: static; sticky competes with the existing site header.)

These are not blockers — the plan can pick reasonable defaults and we course-correct in review.
