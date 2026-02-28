# Switch-to.eu Brand Design Guidelines

## Brand Identity

Switch-to.eu is a platform helping users switch from non-EU digital services to EU alternatives. The visual identity is bold, colorful, and optimistic — communicating approachability and empowerment through a vibrant palette, playful organic shapes, and strong typographic hierarchy.

### Design Inspirations

The redesign draws from five key references (see `docs/inspiration/`):

1. **Pride Project posters** — oversized uppercase display type with colorful organic shapes (blobs, hearts, circles, diamonds) layered on top, creating depth and energy
2. **Flavour United color system** — a structured 8-color brand palette where each color carries semantic meaning, presented in a bold grid
3. **Vy brand** — ultra-black condensed display type with floating badge shapes scattered across the hero, pill-shaped CTAs
4. **Quirky freeform shapes library** — a library of organic, hand-drawn-feeling SVG shapes (flowers, blobs, squiggles, stars) used as decorative elements
5. **Google Labs card grid** — colorful cards in a responsive grid, each with a distinct background color, rounded corners, and consistent card anatomy

---

## Color Palette

### Brand Colors

| Name    | CSS Variable       | Hex       | Tailwind Class      | Usage                                         |
| ------- | ------------------ | --------- | ------------------- | --------------------------------------------- |
| Yellow  | `--brand-yellow`   | `#FBA616` | `brand-yellow`      | Primary accent, CTAs, headings on dark, badges |
| Green   | `--brand-green`    | `#0D492C` | `brand-green`       | Section headings, text on light backgrounds    |
| Sky     | `--brand-sky`      | `#9BCDD0` | `brand-sky`         | Subtext on dark backgrounds, info accents      |
| Red     | `--brand-red`      | `#E22028` | `brand-red`         | Error states, high-contrast cards              |
| Pink    | `--brand-pink`     | `#E282B4` | `brand-pink`        | Search input accents, decorative shapes        |
| Navy    | `--brand-navy`     | `#1E42B0` | `brand-navy`        | Hero backgrounds, header text, links           |
| Sage    | `--brand-sage`     | `#B0D8B0` | `brand-sage`        | Subtle backgrounds, progress indicators        |
| Orange  | `--brand-orange`   | `#E45229` | `brand-orange`      | Warning accents, high-energy cards             |
| Cream   | `--brand-cream`    | `#fefbf9` | `brand-cream`       | Content block backgrounds (guides)             |

### Semantic Colors (Light Mode)

| Role               | Hex       | Usage                                |
| ------------------ | --------- | ------------------------------------ |
| Background         | `#e5e7eb` | Page background (website app)        |
| Foreground         | `#383838` | Default body text                    |
| Primary            | `#1a3c5a` | Primary actions, card headings       |
| Primary Foreground | `#ffffff` | Text on primary                      |
| Muted              | `#f8f9fa` | Subtle backgrounds                   |
| Muted Foreground   | `#334155` | Secondary text                       |
| Destructive        | `#ff4a4a` | Error actions                        |
| Border             | `#e5e7eb` | Default borders                      |

Note: The UI package base background is `#fefbf9` (cream). The website app overrides this to `#e5e7eb` (gray) in its own `globals.css`.

### Color Pairing Rules

- **Dark sections** (hero, newsletter, contribute): Navy (`#1E42B0`) or Green (`#0D492C`) background with Yellow (`#FBA616`) headings and Sky (`#9BCDD0`) body text
- **Light sections** (content, about): White/cream background with Green (`#0D492C`) headings and default foreground body text
- **Category cards** cycle through all 8 brand colors as backgrounds, pairing with either white or green text depending on contrast
- **Buttons on dark backgrounds**: Yellow fill with Navy text (primary), Yellow outline with Yellow text (secondary)
- **Buttons on light backgrounds**: Green fill with white text

---

## Typography

### Font Stack

| Role             | Font                        | CSS Variable                        | Weight | Usage                           |
| ---------------- | --------------------------- | ----------------------------------- | ------ | ------------------------------- |
| Hero display     | Anton                       | `--font-anton`                      | 400    | Hero `h1` only — ultra-black condensed |
| Section headings | Bonbance Bold Condensed     | `--font-bonbance`                   | 800    | All `h1`-`h6`, section titles, logo |
| Body             | Hanken Grotesk SemiBold     | `--font-hanken-grotesk`             | 400    | Paragraphs, list items, labels  |
| Bold text        | Hanken Grotesk Bold         | `--font-hanken-grotesk-bold`        | 700    | `<strong>`, `<b>` elements      |
| Italic text      | Hanken Grotesk SemiBold Italic | `--font-hanken-grotesk-italic`   | —      | `<em>` elements                 |
| Bold italic      | Hanken Grotesk Bold Italic  | `--font-hanken-grotesk-bold-italic` | —      | Combined bold + italic          |
| Display (alt)    | KT Kiyosuna Sans Bold       | `--font-kiyosuna-sans`              | —      | Available for special use       |
| Display light    | KT Kiyosuna Sans Light      | `--font-kiyosuna-sans-light`        | —      | Available for special use       |
| Monospace        | System monospace stack      | `--font-mono`                       | —      | Code blocks                     |

### Tailwind Aliases

```
--font-sans     → var(--font-hanken-grotesk)       // body default
--font-heading  → var(--font-bonbance)              // heading default (website)
--font-bold     → var(--font-hanken-grotesk-bold)
```

Note: The UI package base uses `--font-bricolage-grotesque` as the heading default. The website app overrides this to `--font-bonbance` in its own `globals.css`.

### Heading Treatment

All headings (`h1`–`h6`) use Bonbance Bold Condensed at weight 800. Section headings are **always uppercase** and use the `font-heading` Tailwind utility.

```html
<!-- Section heading pattern -->
<h2 class="font-heading text-4xl sm:text-5xl uppercase text-brand-green">
  Section Title
</h2>

<!-- Section heading on dark background -->
<h2 class="font-heading text-4xl sm:text-5xl md:text-6xl uppercase text-brand-yellow">
  Section Title
</h2>
```

### Hero Display Type

The home hero uses Anton at a fluid size for maximum impact:

```css
font-family: var(--font-anton);
font-size: clamp(3.5rem, 12vw, 14rem);
font-weight: 400;
line-height: 0.9;
letter-spacing: -0.02em;
text-transform: uppercase;
color: var(--brand-yellow);
```

### Logo

The site logo ("Switch.to-eu") uses Bonbance at weight 400 in Navy:

```html
<h1 style="font-family: var(--font-bonbance); font-weight: 400"
    class="text-2xl md:text-3xl tracking-wide text-brand-navy">
  Switch.to-eu
</h1>
```

---

## Shape System

### Overview

The design uses a library of 36 organic, freeform SVG shapes stored at `apps/website/public/images/shapes/`. These shapes are a core part of the brand identity, inspired by the Quirky Freeform Shapes and Pride Project references.

### Available Shapes

```
arch         asterisk     blob         bumpy-cloud   circle
clover       clover-3     cloud        coral         cross
daisy        diamond-4    fleur        flower        heart
hourglass    peanut       pebble       petal         pill
pin          puddle       scallop      spark         speech
splat        squiggle     star         starburst     sunburst
swirl        ticket       triangle     tulip         wave
wide-heart
```

### Usage Patterns

**Decorative background shapes** — placed absolutely positioned within sections, rendered as white silhouettes (via CSS filter `brightness(0) invert(1)`) at low opacity (10-25%), with gentle floating animation:

```html
<div class="absolute -top-8 -right-8 w-36 h-36 sm:w-48 sm:h-48 opacity-20 pointer-events-none">
  <Image
    src="/images/shapes/sunburst.svg"
    alt=""
    fill
    class="object-contain select-none animate-shape-float"
    style="filter: brightness(0) invert(1)"
    aria-hidden="true"
  />
</div>
```

**Card decorative shapes** — used within category/pillar cards as the visual focal point, tinted to match the card's text color via CSS filter:

```
/* For dark text (brand-green) on light cards */
filter: brightness(0) saturate(100%) invert(20%) sepia(95%) saturate(750%)
        hue-rotate(127deg) brightness(93%) contrast(102%);

/* For white text on dark cards */
filter: brightness(0) invert(1);
```

**Inline SVG shapes** — the Hero uses inline SVG components (`BlobShape`, `PebbleShape`, `PuddleShape`, `CircleShape`, `DiamondShape`, `HeartShape`, `HalfCircleShape`) defined in `HeroShapes.tsx` with brand color fills and animated floating.

### Shape Animation

**Gentle float** (`animate-shape-float`):
```css
@keyframes shape-float {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-6px) rotate(1.5deg); }
}
.animate-shape-float {
  animation: shape-float ease-in-out infinite;
}
```

Duration is typically 6-9s, with staggered `animationDelay` values (e.g., `-1.5s`, `-3s`, `-5s`) to prevent shapes from moving in sync.

**Hero float** — more complex multi-axis movement with 3 keyframe variants (`hero-float-1`, `hero-float-2`, `hero-float-3`) at 12-20s duration, combining translate, rotate, and subtle scale transforms. These keyframes are dynamically injected at runtime by `HeroShapes.tsx` (not in the CSS files), and used by the inline SVG shape components (`BlobShape`, `PebbleShape`, etc.).

### Shape Placement Rules

- Shapes overflow their parent container (negative offsets like `-top-8`, `-right-8`)
- Always set `pointer-events-none` and `aria-hidden="true"`
- Use 2-3 shapes per section, varying size and animation timing
- On dark backgrounds, shapes are white silhouettes at 10-25% opacity
- On light card backgrounds, shapes are tinted to match the card's text color
- Shapes should feel scattered and organic, never aligned or gridded

---

## Layout Patterns

### Page Structure

Pages use a vertical stack with consistent spacing:

```html
<div class="flex flex-col gap-8 sm:gap-12 md:gap-20 py-4 sm:py-6 md:py-8">
  <!-- sections -->
</div>
```

### Container

Content width is capped at `max-w-7xl` with responsive horizontal padding:

```html
<div class="container max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
```

### Section Blocks

Full-bleed colored sections use a rounded container pattern:

```html
<section>
  <div class="container max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
    <div class="bg-brand-navy rounded-3xl">
      <div class="relative px-6 sm:px-10 md:px-16 py-12 sm:py-16 md:py-20 overflow-hidden">
        <!-- decorative shapes (absolute) -->
        <!-- content (relative z-10) -->
      </div>
    </div>
  </div>
</section>
```

Background colors rotate between Navy (`bg-brand-navy`) and Green (`bg-brand-green`) for dark sections.

### Card Grid

Category and pillar cards use a responsive grid:

```html
<div class="grid gap-5 sm:gap-6 grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 auto-rows-fr">
```

Each card follows a consistent anatomy:
1. Decorative shape area (top, with animated SVG)
2. Content area (bottom, with title, description, optional CTA pill)

---

## Component Styles

### Border Radius

| Token        | Value                       | Usage                      |
| ------------ | --------------------------- | -------------------------- |
| `rounded-3xl`| 1.5rem                     | Section blocks, cards      |
| `rounded-2xl`| 1rem                       | Content blocks, alerts     |
| `rounded-xl` | 0.75rem                    | Buttons, inputs            |
| `rounded-full`| 9999px                    | Pill buttons, badges, progress bars |

The design strongly favors large radius values. Cards and sections always use `rounded-3xl`.

### Buttons

**Primary CTA (on dark)**:
```html
<a class="px-6 sm:px-8 py-3 bg-brand-yellow text-brand-navy font-medium rounded-full
          hover:opacity-90 transition-colors text-sm sm:text-base">
```

**Secondary CTA (on dark)**:
```html
<a class="px-6 sm:px-8 py-3 border border-brand-yellow text-brand-yellow font-medium
          rounded-full hover:bg-brand-yellow hover:text-brand-navy transition-colors
          text-sm sm:text-base">
```

**Action button (on light)**:
```html
<button class="px-8 py-3 bg-brand-green text-white rounded-full font-semibold text-sm
               hover:opacity-90 transition-opacity">
```

**Card pill button**:
```html
<span class="bg-brand-green text-white inline-block px-5 py-2 rounded-full text-sm font-semibold">
```

All interactive buttons use `rounded-full` (pill shape). Hover transitions use `opacity-90` or color fill swap.

### Inputs

Inputs on dark backgrounds use translucent styling:

```html
<input class="h-12 px-5 bg-white/10 border-white/20 text-white
              placeholder:text-white/30 rounded-full
              focus:border-brand-yellow focus:ring-brand-yellow" />
```

### Navigation

- Header text: Hanken Grotesk Bold, uppercase, tracking-wide, Navy color
- Links: underline on hover, no background change
- Header background: `bg-gray-300` with no bottom border

### Alerts / Callouts

Three semantic variants using brand colors:

| Variant   | Container                                                  |
| --------- | ---------------------------------------------------------- |
| Warning   | `bg-brand-yellow/10 border-brand-yellow/30 text-brand-green` |
| Error     | `bg-brand-red/5 border-brand-red/20 text-brand-green`       |
| Info      | `bg-brand-sky/15 border-brand-sky/30 text-brand-green`       |

All use `rounded-2xl` with a light tinted background and subtle border.

### Guide Steps

Guide content blocks use the cream background:

```html
<div class="guide-step mb-6 rounded-2xl bg-brand-cream p-6 sm:p-8 shadow-sm">
```

Step numbers use a circular badge:

```html
<span class="bg-brand-yellow text-brand-green w-8 h-8 rounded-full flex items-center
             justify-center mr-3 text-sm font-bold">1</span>
```

### Progress Indicators

Progress bars use a rounded-full track with animated fill:

```html
<div class="h-1.5 bg-brand-sage/30 rounded-full overflow-hidden">
  <div class="h-full rounded-full bg-brand-yellow transition-all duration-500 ease-out"
       style="width: 66%"></div>
</div>
```

Colors: `bg-brand-yellow` for in-progress, `bg-brand-green` for complete.

---

## Color Card Rotation

Category cards, pillar cards, and feature cards cycle through a predefined color sequence. Each entry defines background, text, button, and shape colors:

| #  | Background       | Text Color   | Button                    | Shape    |
| -- | ---------------- | ------------ | ------------------------- | -------- |
| 1  | `bg-brand-sky`   | Green        | `bg-brand-green text-white` | spark    |
| 2  | `bg-brand-orange`| White        | `bg-white text-brand-orange`| cloud    |
| 3  | `bg-brand-yellow`| Green        | `bg-brand-green text-white` | tulip    |
| 4  | `bg-brand-green` | White        | `bg-white text-brand-green` | speech   |
| 5  | `bg-brand-pink`  | Green        | `bg-brand-green text-white` | heart    |
| 6  | `bg-brand-navy`  | White        | `bg-white text-brand-navy`  | sunburst |
| 7  | `bg-brand-sage`  | Green        | `bg-brand-green text-white` | flower   |
| 8  | `bg-brand-red`   | White        | `bg-white text-brand-red`   | starburst|

Rule: light backgrounds (sky, yellow, pink, sage) pair with Green text; dark backgrounds (orange, green, navy, red) pair with White text.

---

## MDX Content Styling

Markdown/MDX content rendered in `.mdx-content` receives specific styles:

- Headings: Bonbance Bold Condensed, weight 800
- Body text: Hanken Grotesk, weight 400, `leading-relaxed`
- Links: Navy color, underline on hover
- Code: system monospace, light gray background, small rounded corners
- Bold: Hanken Grotesk Bold, weight 700
- Italic: Hanken Grotesk SemiBold Italic
- Blockquotes: left border, italic
- Horizontal rules: gray border with generous vertical margin (`my-8`)

---

## Dark Mode

Dark mode is supported via the `.dark` class. Key overrides:

| Token      | Dark Value  |
| ---------- | ----------- |
| Background | `#0f172a`   |
| Foreground | `#f8fafc`   |
| Card       | `#1e293b`   |
| Primary    | `#64a5f6`   |
| Muted      | `#1e293b`   |
| Border     | `rgba(255, 255, 255, 0.1)` |

Brand colors (yellow, green, sky, red, pink, navy, sage, orange) do not change between modes.

---

## Key Design Principles

1. **Bold and vibrant** — use the full palette generously; every section should have visual energy
2. **Uppercase headings** — section headings are always uppercase to convey strength and clarity
3. **Organic shapes everywhere** — decorative shapes appear in every major section, softening the bold type and adding playfulness
4. **Generous rounding** — cards use `rounded-3xl`, buttons use `rounded-full`; sharp corners are avoided
5. **High contrast pairings** — Yellow on Navy, Green on light, White on dark; always ensure readability
6. **Fluid typography** — hero type scales fluidly from 3.5rem to 14rem using `clamp()`
7. **Staggered animation** — shapes float independently with offset delays to feel natural, not mechanical
8. **Consistent card anatomy** — every card follows the same structure: shape area + content area + optional CTA pill
