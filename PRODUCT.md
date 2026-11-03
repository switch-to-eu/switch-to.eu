# Impeccable — Design Context for switch-to.eu

This file tells design skills *who we are designing for* and *how it should feel*. For the mechanical system (colors, tokens, typography stack, shape library, layout primitives), read `docs/brand.md` first — it is the source of truth and must be followed. This file supplies the context brand.md does not cover.

## Design Context

### Users

Three overlapping audiences, all of whom must feel this site was built for them:

1. **Privacy-curious generalists** — everyday EU residents nudged here by a news story, a friend, or a creeping sense that Big Tech is no longer neutral. Not technical. Emotionally somewhere between mildly concerned and quietly overwhelmed. Want to be shown, not lectured.
2. **Motivated switchers** — have already decided they want out of a specific US service and are here to find the right EU alternative. Want specifics: price, what's comparable, where it falls short, how to migrate.
3. **Sovereignty-minded advocates** — often technical, already engaged, visit to share links, contribute guides, or pull evidence for arguments with friends. Value rigor, openness, and no-bullshit specificity over hand-holding.

**Job to be done**: help someone move from a non-EU service to an EU alternative with enough honest information to make a decision and enough practical guidance to follow through.

**Design implication**: hierarchy must let each group find their layer without talking down to the others. Curious newcomers land on category tiles and human-scale intros. Switchers jump into per-service detail. Advocates dig into research tabs, sources, and the GitHub trail.

### Brand Personality

Three words: **direct, warm, specific.**

- **Direct** — we do not pad, hedge, or sell. If an EU alternative is more expensive, we say so on the same page we recommend it.
- **Warm** — tone is a knowledgeable friend, not a regulator or an activist. Readers are capable adults; we explain without patronising and disagree without sneering.
- **Specific** — every claim is backed by a number, feature, or concrete trade-off. Vague reassurance ("great privacy!") is worse than honest weakness ("no native iOS app yet").

Emotional goals on arrival → departure: *uncertain → informed → quietly capable.* Never: hyped, shamed, or overwhelmed.

See `.claude/skills/informational-copy` for the written tone-of-voice rules (no em dashes, no semicolons, active voice, mandatory "Worth knowing:" trade-off sections). Design must match: visual swagger in shapes and colour, restraint in copy and claims.

### Aesthetic Direction

**Calm, warm, approachable, with personality. Never corporate, bureaucratic, or technical-for-technical's-sake.** (Toned down on 2026-11-03 at the owner's request: the earlier all-saturated look felt off-putting.)

Draw energy from the references documented in `docs/brand.md`: Pride Project posters (oversized uppercase display + organic shapes), Flavour United (structured 8-colour semantic palette), Vy brand (ultra-black condensed display, floating badges, pill CTAs), freeform quirky shapes library, Google Labs card grid.

**Theme**: light only. No dark mode. Every surface is a tinted light ground or a saturated brand-colour block — never a dark app shell with neon accents.

**Anti-references — things this site must NOT look like:**
- **SaaS marketing sites** (Linear, Vercel, Stripe, every Y Combinator landing page): gradient heroes, testimonial carousels, "trusted by" logo strips, CTA-stacked scroll. Too slick, too transactional, too anonymous.
- **EU institutional sites** (ec.europa.eu and kin): bureaucratic, serif-heavy, cluttered navigation, reads like a regulation. We are FOR the EU, we do not look LIKE the EU.
- **Generic developer tools**: monospace everywhere, dark terminal aesthetic, cyan/purple neon. Some of our users are technical; none of them came here because they wanted another terminal.

**Signature moves** (use them, don't abandon them):
- Anton display type for the home hero at `clamp(3rem, 7vw, 6rem)`: large and confident, not shouting (reduced from 14rem with the 2026-11-03 calm pass).
- Bonbance Bold Condensed, uppercase, at weight 800 for every section heading.
- Organic SVG shapes (from the 36-shape library) floating behind or around content blocks, staggered animation, always `aria-hidden` and `pointer-events-none`.
- White or lightly tinted panels with `rounded-3xl` corners and a hairline border (`border-black/10`) on a warm off-white page (`#faf8f5`). Brand green carries headings, buttons and links. At most one tinted section per screen. No full-saturation colour blocks as section grounds.
- Pill-shaped `rounded-full` buttons only. No square or slightly-rounded buttons anywhere.
- Cards rotate through the brand colours in small doses: a tinted band behind the shape or image and the shape itself (`apps/website/lib/quiet-palette.ts`). The card itself stays white with dark text.

### Accessibility

**Target: WCAG 2.2 AA, with reduced-motion respected.**

Non-negotiable rules for every design decision:

- Verify contrast ratios for every text + background pairing. The bold palette is easy to get wrong — yellow text on sky looks cheerful and fails.
- `:focus-visible` must be present on every interactive element. The pill-button style hides default focus rings; replace them, don't remove them.
- All shape animations (`animate-shape-float`, hero floats, and any new motion) must be disabled or reduced under `@media (prefers-reduced-motion: reduce)`. The shapes are decoration, never a carrier of information.
- Keyboard-complete navigation. No hover-only affordances; every hover-reveal must also appear on focus.
- Decorative shapes are always `aria-hidden="true"` and `pointer-events-none`. Shapes do not carry meaning — copy does.
- Respect the text-on-colour contrast rule from `docs/brand.md`: dark brand colours (green, navy, red, orange) take `#ffffff` foreground; light brand colours (yellow, sky, pink, sage, cream) take `#1a1a1a` foreground. Do not tint text off-palette to "make it work."

### Design Principles

These five override every other temptation. When a design choice feels clever but breaks one of these, drop the choice.

1. **Honesty over polish.** If something is more expensive, less featureful, or has a worse iOS app, show it on the same surface you recommend it. No asterisks, no "learn more" hides. The trade-off section is a first-class UI element, not a footnote.
2. **Personality in the details, restraint in the claims.** Display type, organic shapes and a touch of brand colour carry the character. Copy stays quiet: specific, factual, short.
3. **Colour is an accent, not a ground.** Neutral surfaces do the structural work. Brand colours appear in tags, tinted bands, shapes and one highlight per screen, never as a wall of saturated blocks.
4. **Organic shapes stay, softly.** Major sections get 1–3 floating shapes in brand tints at about 30% opacity, staggered timing, sized to overflow. They add warmth without competing with content.
5. **Three audiences, one page.** Every page should read correctly whether the visitor arrived curious, committed, or already-converted. Hierarchy and progressive disclosure (per `docs/brand.md` layout patterns) do this work — not separate sections addressed at each audience.

### When in Doubt

- `docs/brand.md` is the mechanical source of truth. Do not invent tokens, new shape treatments, new button shapes, or new heading weights. Reach for what is there.
- `.claude/skills/informational-copy` is the copy source of truth. Do not write copy that contradicts it even if the visual design feels like it wants punchier language.
- Anti-patterns the user has codified in memory: no "Popular" or similar badges, no external pricing/privacy links embedded in content, no license names in service copy. These apply to any new surface too.
