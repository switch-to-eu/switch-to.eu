---
name: switch-to.eu
description: Honest guides to EU alternatives for big-tech services, laid out like a calm news site on warm paper.
colors:
  forest-green: "#0D492C"
  marigold: "#FBA616"
  harbour-sky: "#9BCDD0"
  soft-sage: "#B0D8B0"
  signal-navy: "#1E42B0"
  brick-orange: "#E45229"
  alert-red: "#E22028"
  rose: "#E282B4"
  cream: "#fefbf9"
  warm-paper: "#f1eee8"
  photo-mat: "#f3efe8"
  card-white: "#ffffff"
  ink: "#1a1a1a"
  hairline: "rgba(0, 0, 0, 0.1)"
typography:
  display:
    fontFamily: "Bonbance Bold Condensed, sans-serif"
    fontSize: "3rem"
    fontWeight: 800
    lineHeight: 1.02
  headline:
    fontFamily: "Bonbance Bold Condensed, sans-serif"
    fontSize: "2.25rem"
    fontWeight: 800
    lineHeight: 1.05
  title:
    fontFamily: "Bonbance Bold Condensed, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 800
    lineHeight: 1.08
  body:
    fontFamily: "Hanken Grotesk, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.625
  body-article:
    fontFamily: "Hanken Grotesk, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 400
    lineHeight: 1.75
  label:
    fontFamily: "Hanken Grotesk, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 600
    lineHeight: 1.25
  pill-label:
    fontFamily: "Hanken Grotesk, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: "0.05em"
  logo:
    fontFamily: "Anton, sans-serif"
    fontSize: "1.875rem"
    fontWeight: 400
    lineHeight: 1
rounded:
  block: "1rem"
  panel: "1.5rem"
  pill: "9999px"
spacing:
  chip: "4px 12px"
  gutter: "20px"
  card: "24px"
  section-mobile: "32px"
  panel-y: "48px"
  panel-x: "56px"
  section: "80px"
components:
  button-primary:
    backgroundColor: "{colors.forest-green}"
    textColor: "{colors.card-white}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "10px 24px"
  button-secondary:
    textColor: "{colors.forest-green}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "8px 20px"
  chip-quick-switch:
    textColor: "{colors.card-white}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "{spacing.chip}"
  chip-quick-switch-hover:
    backgroundColor: "{colors.marigold}"
    textColor: "{colors.forest-green}"
  pill-news:
    backgroundColor: "{colors.marigold}"
    textColor: "{colors.ink}"
    typography: "{typography.pill-label}"
    rounded: "{rounded.pill}"
    padding: "{spacing.chip}"
  pill-analysis:
    backgroundColor: "{colors.signal-navy}"
    textColor: "{colors.card-white}"
    typography: "{typography.pill-label}"
    rounded: "{rounded.pill}"
    padding: "{spacing.chip}"
  card:
    backgroundColor: "{colors.card-white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.panel}"
    padding: "{spacing.card}"
  panel-intro:
    backgroundColor: "{colors.forest-green}"
    textColor: "{colors.card-white}"
    rounded: "{rounded.panel}"
    padding: "48px 56px"
  panel-guides:
    backgroundColor: "{colors.harbour-sky}"
    textColor: "{colors.forest-green}"
    rounded: "{rounded.panel}"
  panel-newsletter:
    backgroundColor: "{colors.soft-sage}"
    textColor: "{colors.forest-green}"
    rounded: "{rounded.panel}"
  input-search:
    backgroundColor: "{colors.card-white}"
    textColor: "{colors.forest-green}"
    typography: "{typography.body}"
    rounded: "{rounded.pill}"
    height: "56px"
  input-field:
    backgroundColor: "{colors.card-white}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.pill}"
    height: "48px"
    padding: "0 20px"
  content-table:
    backgroundColor: "{colors.card-white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.block}"
---

# Design System: switch-to.eu

This file covers the website. The tool apps (KeepFocus, Plotty, Listy, PrivNote, Quiz, EU-Scan) keep their saturated tool colour schemes from `docs/brand.md`. `docs/brand.md` stays the reference for code-level details such as the tool schemes and the shape library.

## Overview

**Creative North Star: "The Warm Broadsheet"**

The site looks like a good news site printed on warm paper. Most of each page is neutral: a warm paper ground, white cards with a hairline border, and ink text. A few full brand-colour panels anchor the page and mark its main parts. Small saturated accents (card strips, type pills, dots) tie the palette together. The character comes from the details: condensed Bonbance headings in brand green, real photos, and a recognisable palette. It never comes from loud blocks or decoration.

The owner settled this direction on 2026-11-03 after three rounds of feedback. All-saturated cards were "a bit much". Shapes everywhere felt "childish and gimmicky". An all-white page was "ugly, barely any contrast". The Warm Broadsheet is the balance between these three failures. Later the same day, the owner also removed a "How we work" self-description panel as "AI slop".

The density is medium and content first. The homepage has no hero. A compact green intro panel holds the promise, the search and quick-switch chips, and the news follows directly.

**Key Characteristics:**
- Warm paper ground with white cards. Depth comes from contrast and hairlines, not from shadows.
- Bonbance headings in sentence case, at modest sizes, in brand green.
- A few full-colour anchor panels per page. Two adjacent panels never share a colour.
- Bold colour as small accents only: a 6px card strip, type pills, dots, region badges, the logo's ".eu".
- Full pill shapes for every button, chip and input.
- Real photos and screenshots, never illustration for its own sake.

## Colors

A warm neutral base carries the page. A deep forest green leads, and seven saturated brand colours appear in small, deliberate amounts.

### Primary
- **Forest Green** (#0D492C): headings on light grounds, primary buttons, links, the homepage intro panel and the footer. It is the voice of the site.

### Secondary
- **Marigold** (#FBA616): the heading colour on the green intro panel, the "news" article pill, the dateline dot, and the hover fill of quick-switch chips.
- **Harbour Sky** (#9BCDD0): the ground of the guides panel, with forest-green text.
- **Soft Sage** (#B0D8B0): the ground of the newsletter panel, and tone-on-tone shapes inside the green intro panel.

### Tertiary
- **Signal Navy** (#1E42B0): the "analysis" article pill and one of the card strips.
- **Brick Orange** (#E45229): the ".eu" in the website logo and one of the card strips.
- **Alert Red** (#E22028): error messages and one of the card strips.
- **Rose** (#E282B4): a card strip only.

### Neutral
- **Warm Paper** (#f1eee8): the page ground and the header ground. It is dark enough that white cards read as cards.
- **Card White** (#ffffff): cards, content panels, tables and form fields.
- **Ink** (#1a1a1a): body text on white and on light brand colours.
- **Photo Mat** (#f3efe8): the area behind a photo or screenshot while it loads, and behind images with transparent edges.
- **Cream** (#fefbf9): article blockquotes and guide step blocks.
- **Hairline** (black at 10%): card borders, the header rule, table row lines (8%) and dividers.

### Named Rules
**The Few Panels Rule.** Full brand colour fills only the anchor panels: the homepage intro (green), the guides panel (sky), the featured tool (its own tool surface colour), and the newsletter (sage). Two adjacent panels never share a colour.

**The Accent Not Ground Rule.** Outside the anchor panels, saturated colour appears only in small elements. A grid of saturated cards is not allowed on the website.

**The Text-on-Colour Rule.** Forest green, navy and red take white text. Marigold, sky, sage, rose and cream take ink or forest green. Orange takes ink for body text, because white on orange is only 3.8:1. Never fade text with opacity to make a pair work.

## Typography

**Display Font:** Bonbance Bold Condensed (with a sans-serif fallback)
**Body Font:** Hanken Grotesk (with a sans-serif fallback)
**Logo Font:** Anton, in the logo only

**Character:** A condensed, slightly quirky display face gives the headings warmth and a voice. A clean, open grotesk keeps the long reading text calm and easy.

### Hierarchy
- **Display** (800, 2.25rem to 3rem, 1.02): the homepage intro heading only, in marigold on green.
- **Headline** (800, 1.875rem to 2.25rem, 1.05): section headings and page titles. Page titles go up to 3rem on wide screens.
- **Title** (800, 1.25rem to 1.5rem, 1.08): card titles and article card headlines, in forest green.
- **Body** (400, 1rem, 1.625): running text on cards, listings and content pages. Content pages use a column of at most 48rem.
- **Body Article** (400, 1.125rem, 1.75): the news article reading column, at most 68ch wide.
- **Label** (600, 0.875rem, 1.25): buttons, chips, form labels and meta lines.
- **Pill Label** (600, 0.75rem, 0.05em tracking, uppercase): article type pills, region badges and card meta lines.

### Named Rules
**The Sentence Case Rule.** Bonbance headings are always in sentence case. Uppercase is only for small Hanken labels: pills, badges, navigation items and meta lines.

**The Logo-Only Anton Rule.** Anton appears in the logo and nowhere else.

**The No Filler Rule.** A heading has no subtitle line under it and no eyebrow label above it. If a heading needs a sentence of explanation, rewrite the heading.

## Layout

The content sits in a centred container of at most 80rem, with 12px, 24px and 32px side padding at small, medium and large widths. Sections stack with a gap of 32px on phones, 48px on small tablets and 80px from medium widths.

Panels and cards run edge to edge on phones. There they have square corners and only a top and bottom hairline. From medium widths they sit inside the container with rounded corners.

Card grids go from one column to two, three and four. The gutter is 20px from medium widths. On phones the cards stack with no gap, like rows in a list. Inside panels, a 12-column grid splits the content (the intro panel is 6 and 6, the newsletter is 5 and 7).

The homepage order is: intro panel, news, guides panel, picks, featured tool, newsletter. Article pages open with the photo at full width. The title panel overlaps the bottom edge of the photo, and the photo credit sits under it.

## Elevation & Depth

The system is flat. Depth comes from white cards on warm paper and from hairline borders, not from shadows. Shadows are only for layers that float above the page, such as the search suggestion list.

### Shadow Vocabulary
- **Floating layer** (`box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)`): dropdowns and search suggestions only.

### Named Rules
**The Flat Paper Rule.** Surfaces are flat at rest. A card shows its edge with a hairline and its colour with the top strip, never with a shadow.

## Shapes

Corners are generous and soft. Panels and cards have a 24px radius (from medium widths). Content blocks such as tables, blockquotes, alerts and dropdowns have a 16px radius. Every button, chip, input and badge is a full pill.

Each card carries one saturated strip, 6px high, across its top. The strip colour comes from an 8-colour rotation: sky, orange, marigold, green, rose, navy, sage, red.

The site has a library of 36 organic SVG shapes. On the website they appear only inside colour panels, tone-on-tone (for example sage on green), at 8 to 12% opacity. They float slowly, and the motion stops under reduced motion.

### Named Rules
**The Tone-on-Tone Rule.** A decorative shape is always the same colour family as its panel and is barely visible. Shapes never appear on white surfaces or on cards.

## Components

### Buttons
Calm, solid and round. Buttons do not change size or colour loudly.
- **Shape:** full pill (9999px).
- **Primary:** forest green fill with white text, 600 weight at 0.875rem to 1rem, 10px by 24px padding.
- **Hover / Focus:** the fill goes to 90% opacity. The focus state is a 2px outline in the colour that contrasts with the ground, offset by 2px.
- **Secondary:** a 2px forest-green outline with forest-green text. On a green ground it is a marigold outline.

### Chips
- **Quick-switch chips** (on the green intro panel): a white 40% outline with white text. On hover they fill with marigold and the text turns forest green.
- **Article type pills:** "news" is marigold with ink text, "analysis" is navy with white text. Uppercase pill label.
- **Region badges:** "EU" is forest green with white text. "EU-friendly" is marigold with forest-green text.
- **Recommended pill:** forest green at 10% with forest-green text and a small check mark, in the content next to the facts. It never sits on a screenshot.
- **Feature lists:** plain text with a small forest-green check mark per item, not chips. Chips look clickable, and a feature is not.

### Cards / Containers
- **Corner Style:** 24px from medium widths, square on phones.
- **Background:** card white on warm paper.
- **Shadow Strategy:** none (see Elevation & Depth).
- **Border:** 1px hairline. On phones, only the top and bottom edges.
- **Internal Padding:** 20px to 28px.
- **Anatomy:** the 6px colour strip, then the title in Bonbance, a meta line, two or three lines of body text, and a green pill or text link. A card has an image area only for a real photo or screenshot.

### Inputs / Fields
- **Search:** a white pill with a faint forest-green border, forest-green text, and a round green submit button inside it. On focus, the border turns solid green and a soft green ring (20%) appears.
- **Form fields:** white pills 48px high with 20px side padding and ink text. On focus the border turns forest green.
- **Error:** a red message in a pale red pill (red at 10%).

### Navigation
- **Header:** on the warm paper ground with a hairline rule under it. The logo is on the left, and the uppercase Hanken navigation and the language selector are on the right. Menu items get a white highlight on hover and focus.
- **Mobile:** a sheet menu.
- **Section tabs** (service pages): a sticky bar on warm paper with a hairline under it, like the header. The active tab is a forest-green pill. Inactive tabs are ink text in sentence case, with a faint tint on hover.
- **Footer:** forest green with white text.

### Intro Panel
The homepage starts with this panel. It is forest green with a marigold Bonbance heading, a dateline with a marigold dot, the search field and the quick-switch chips. Two sage shapes float at the edges at 10 to 12% opacity.

### Content Table
Tables in markdown content and the category comparison are white panels with a 16px radius and a hairline border. The column headers are Bonbance in forest green above a 2px green rule, and hairlines separate the rows. Row headers are semibold Hanken labels. On narrow screens the table scrolls sideways and the first column stays in place.

### Pick Card
On a buyer's-guide category page, each editorial pick is a card: the colour strip, the need as a soft green pill ("Best overall"), the service name as a title, the region badge and head office, the reason, two facts from the listing, a "Worth knowing:" line above a hairline, and one green pill action. Picks never carry scores, stars or rankings.

## Do's and Don'ts

### Do:
- **Do** put white cards (#ffffff, 1px hairline, 24px radius) on the warm paper ground (#f1eee8).
- **Do** give each card one 6px saturated strip across its top, from the 8-colour rotation.
- **Do** write Bonbance headings in sentence case: forest green on light grounds, marigold on the green panel.
- **Do** make every button, chip, input and badge a full pill, with a visible focus outline in place of the default ring.
- **Do** keep decorative shapes tone-on-tone inside colour panels, at 8 to 12% opacity, with motion off under reduced motion.
- **Do** show real, openly licensed photos on news articles, with the credit under the image.

### Don't:
- **Don't** fill a grid with saturated cards. The owner called that "a bit much".
- **Don't** put shapes or blob illustrations on white surfaces or on cards. The owner called that "childish and gimmicky".
- **Don't** make a page all white with no colour panels. The owner called that "ugly, barely any contrast".
- **Don't** add self-description panels such as "How we work" or "Why trust us". The owner removed one as "AI slop".
- **Don't** add reassurance lines about our own process, such as "Prices and facts checked on …". The owner calls these "AI slop" too.
- **Don't** put shapes, stickers or labels over screenshots. A recommendation is a soft green pill in the content.
- **Don't** use uppercase Bonbance headings, or Anton outside the logo.
- **Don't** put a subtitle under a heading or an eyebrow label above it.
- **Don't** put two panels of the same colour next to each other.
- **Don't** use square or slightly rounded buttons.
- **Don't** add dark mode or `dark:` classes. The site is light only.
