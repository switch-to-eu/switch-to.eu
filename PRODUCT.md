# Product

<!-- impeccable:product-schema 1 -->

This file holds the durable product truth for design skills: who the site is for, what it is for, and what it must never claim. The website's visual system is in `DESIGN.md` ("The Warm Broadsheet"). `docs/brand.md` holds the code-level details: tokens, the tool apps' colour schemes and the shape library.

## Platform

web

## Users

Three overlapping audiences, all of whom must feel this site was built for them:

1. **Privacy-curious generalists**: everyday EU residents nudged here by a news story, a friend, or a creeping sense that Big Tech is no longer neutral. Not technical. Emotionally somewhere between mildly concerned and quietly overwhelmed. Want to be shown, not lectured.
2. **Motivated switchers**: have already decided they want out of a specific US service and are here to find the right EU alternative. Want specifics: price, what's comparable, where it falls short, how to migrate.
3. **Sovereignty-minded advocates**: often technical, already engaged, visit to share links, contribute guides, or pull evidence for arguments with friends. Value rigor, openness, and no-bullshit specificity over hand-holding.

**Job to be done**: help someone move from a non-EU service to an EU alternative with enough honest information to make a decision and enough practical guidance to follow through.

Most visitors arrive from search, directly on a service or category page (Search Console export and 90-day analytics, 2026-11-03). Storage pages draw a large share. Hierarchy must let each group find their layer on that first page without talking down to the others.

## Product Purpose

switch-to.eu helps people in Europe leave non-EU (mostly US big-tech) services for EU alternatives. It does this with honest service listings, step-by-step migration guides, weekday EU tech news, and free EU-built tools.

Success over the next year (confirmed by the owner, 2026-11-03):

1. **People actually switch.** Visitors finish a guide or click through to an EU service. Page views alone are not the goal.
2. **Top search result.** switch-to.eu is the result people find for searches such as "Gmail alternative EU" or "Google Drive Europe".
3. **Income covers costs.** Affiliate income pays for hosting, research tools and time, so the project can continue.

## Positioning

What similar lists of EU alternatives cannot truthfully copy (confirmed by the owner, 2026-11-03):

- **Trade-offs plus guides.** Each recommendation shows its downsides on the same page, and step-by-step migration guides take the reader all the way to the new service.
- **News tied to action.** Weekday EU tech news links each story to what a reader can switch to.
- **Own EU tools.** Free privacy tools (PrivNote, Plotty, Listy, KeepFocus, Quiz, EU-Scan) that are themselves EU-built alternatives.

The content and research are public on GitHub, but the owner does not lead with that as a claim. A "How we work" self-description panel was removed on 2026-11-03.

## Operating Context

- **Operator and money:** an independent project of a small team. Affiliate links, where they exist, are the only income. There are no paid placements. The site says that affiliate partnerships never influence reviews or recommendations. The affiliate disclosure shows only where an affiliate link exists.
- **Content workflow:** content is markdown in git (`content/`). AI-assisted skills research, write, humanize and SEO-check each item. New items enter as drafts, and the owner reviews the diff before publishing. News is one AI-researched article per weekday: the owner approves the English version, then the Dutch translation.
- **Research memory:** a knowledge graph in `knowledge/` with sourced, numbered claims, searchable with `pnpm knowledge`. Claims audits re-check listings against vendors' current pages.
- **Locales:** English (default) and Dutch. French is stored for articles but not served yet.
- **Infrastructure:** Vercel hosting. `dev.switch-to.eu` shows the `develop` branch behind Vercel login, with noindex. Plausible analytics, Mailcoach newsletter, GitHub issues for feedback.

## Capabilities and Constraints

- **Sections:** service listings, category pages, migration guides, landing pages (for example "Quit ChatGPT"), news, newsletter, site search, and the tools.
- **Region rule (decided 2026-11-03):** `eu` means a head office in an EU member state. `eu-friendly` means recommended, with a head office outside the EU (Switzerland, UK, EEA, or a non-European organisation the site still recommends). `non-eu` is a service people leave. A recommended alternative is an `eu` service where a good one exists.
- **Evidence rules:** "not listed" is not "doesn't have". Prices and facts that change carry a check date. Company-only claims and Reddit views are attributed. No guessed motives. Rules in `.claude/skills/_shared/evidence.md`.
- **Tools:** Plotty, Listy and PrivNote are end-to-end encrypted, with the key in the URL fragment and no accounts. KeepFocus, Quiz and EU-Scan need no account either.
- **Terminology:** "EU alternative", "EU-friendly", "switch", "migration guide", and "Worth knowing" for the trade-off section.
- **Light only.** There is no dark mode.
- **Open decisions:** at least one guide that ends at a company in an EU member state is planned (none of the four current guides does). The owner wants category pages to read more like buyer's guides. The research has started, and the format is not decided yet.

## Brand Commitments

Three words: **direct, warm, specific.**

- **Direct**: we do not pad, hedge, or sell. If an EU alternative is more expensive, we say so on the same page we recommend it.
- **Warm**: tone is a knowledgeable friend, not a regulator or an activist. Readers are capable adults. We explain without patronising and disagree without sneering.
- **Specific**: every claim is backed by a number, feature, or concrete trade-off. Vague reassurance ("great privacy!") is worse than honest weakness ("no native iOS app yet").

Emotional goals on arrival → departure: *uncertain → informed → quietly capable.* Never: hyped, shamed, or overwhelmed.

Written tone rules are in `.claude/skills/informational-copy`: no em dashes, no semicolons, active voice, a mandatory "Worth knowing:" trade-off section. Copy stays restrained even where the design has character.

**Anti-references the owner made binding.** The site must not look like:

- **SaaS marketing sites** (Linear, Vercel, Stripe, every Y Combinator landing page): gradient heroes, testimonial carousels, "trusted by" logo strips, CTA-stacked scroll. Too slick, too transactional, too anonymous.
- **EU institutional sites** (ec.europa.eu and kin): bureaucratic, serif-heavy, cluttered navigation, reads like a regulation. We are FOR the EU, we do not look LIKE the EU.
- **Generic developer tools**: monospace everywhere, dark terminal aesthetic, cyan/purple neon. Some of our users are technical. None of them came here because they wanted another terminal.

**Codified anti-patterns:** no "Popular" or similar badges, no external pricing or privacy links embedded in content, no license names in service copy, no self-description panels ("How we work", "Why trust us").

## Evidence on Hand

- **Content:** 45 service listings (13 with a head office in an EU member state), 4 migration guides, 8 categories, 1 landing page, privacy and terms pages.
- **News:** the news section exists, but all 8 articles are layout samples (`sample: true`). No real article is published yet.
- **Research:** 182 source notes and 14 company entities in `knowledge/`. Five claims audits in `docs/claims-audits/`. A content review, a top-pages SEO audit and an offering-gaps report in `docs/reviews/` and `docs/seo/`. Research briefs for five new guides in `docs/guides/research/`.
- **Search data:** a Search Console export and 90-day analytics from 2026-11-03 (supplied by the owner, not stored in the repository).
- **Images:** 8 openly licensed article photos in `apps/website/public/images/articles/` and 26 service screenshots in `apps/website/public/images/services/`.
- **Affiliate links:** two listings, Proton Mail and Proton Drive (Proton partner programme).
- **Absences that must not be fabricated:** user counts, switch counts, testimonials, press coverage, "trusted by" logos, partner endorsements, and any claim that a company pays for or reviews its listing.

## Product Principles

1. **Honesty over polish.** If something is more expensive, less featureful, or has a worse iOS app, show it on the same surface that recommends it. No asterisks, no "learn more" hides. The trade-off section is a first-class part of the page.
2. **Recommendations are not for sale.** An affiliate link never changes what the site recommends or how it ranks a service. Disclose it where it appears, and only there.
3. **Take the reader all the way.** A recommendation is not finished until the reader can act on it: a guide, clear steps, or a tool. Success is a switch, not a visit.
4. **Specific and sourced.** Every claim has a number, a feature or a source, and changing facts carry a date. Show the real thing (real photos, real screenshots, source links), never invented proof.
5. **Three audiences, one page.** Every page should read correctly whether the visitor arrived curious, committed, or already converted. Hierarchy and progressive disclosure do this work, not separate sections for each audience.

## Accessibility & Inclusion

**Target: WCAG 2.2 AA, with reduced motion respected.**

Non-negotiable rules for every design decision:

- Verify contrast ratios for every text and background pair. The bold palette is easy to get wrong: yellow text on sky looks cheerful and fails.
- `:focus-visible` must be present on every interactive element. The pill-button style hides default focus rings. Replace them, don't remove them.
- Any motion must be disabled or reduced under `@media (prefers-reduced-motion: reduce)`.
- Keyboard-complete navigation. No hover-only affordances: every hover reveal must also appear on focus.
- Photos carry real alt text. Thumbnails that repeat a linked headline use `alt=""`.
- Follow the text-on-colour rule: green, navy and red take `#ffffff`. Yellow, sky, pink, sage and cream take `#1a1a1a`. Orange takes `#1a1a1a` for body text (white on orange is 3.8:1). Do not tint text off-palette to "make it work".
- Content is written for non-technical readers in plain language, in English and Dutch.

## When in Doubt

- `DESIGN.md` and `docs/brand.md` are the mechanical source of truth. Do not invent tokens, new shape treatments, new button shapes, or new heading weights. Reach for what is there.
- `.claude/skills/informational-copy` is the copy source of truth. Do not write copy that contradicts it, even if the visual design seems to want punchier language.
