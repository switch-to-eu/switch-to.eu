# Brief: category pages as buyer's guides

Shaped with the owner on 2026-11-03. Visual authority: `DESIGN.md` ("The Warm Broadsheet"). Storage is built first. The other seven categories follow after the owner reviews Storage.

## 1. Job and audience

- Most visitors arrive from search on a query such as "EU cloud storage" or "Google Drive alternative Europe". They are mostly motivated switchers, with some curious generalists.
- Mode: Read, with one action at the end. The visitor wants to know which service to pick, why, and what they give up.

## 2. Outcome and proof

- Primary action: pick a service and go on to its listing or to a migration guide. Success is a click to a listing, a guide or the vendor, not time on the page.
- Proof: facts from the listings (price, free plan, head office, data location, open source, category-specific specs), each traceable to the listing's `sourceUrls` with `checkedAt` dates.
- Product truth: picks always carry their trade-off. The page says plainly when few options have a head office in an EU member state (Storage has one: Nextcloud).

## 3. Selected direction

Inside the existing world, top to bottom:

1. **Header panel** (forest green, like the homepage intro): the `headline` as h1 in marigold, a one-line description, and the first pick as a white card with a quick "Try <service>" click-through and a link to the full review. The owner asked for this on 2026-11-03, because a white header with only two lines left too much empty space. No "checked on" line: the owner removed it as AI slop.
2. **Our picks** (2 or 3 cards): a need label ("Best overall", "Best free plan", "Best to run yourself"), the service name, region badge and head office, a reason in one or two sentences, a "Worth knowing:" trade-off, the price from the listing, and one action: "Read the switching guide" when a guide to that service exists, else "See the full review".
3. **Comparison table**, built from the listings: one row per service in the category (`eu` and `eu-friendly`). Base columns: head office with region, free plan, paid from, open source. Category columns come from each listing's `specs`. Uses the content-table style (sticky first column, sideways scroll on phones).
4. **How to choose**: the category's markdown body, rewritten as a short buyer's guide, with 3 to 5 questions as h3 headings.
5. **Switching guides** in this category, when any exist.
6. **All services**: the existing card grid.
7. Newsletter.

The "Our picks" cards replace the large "featured service" blocks on category pages.

## 4. Scope and boundaries

- Storage only in this pass. A category without `picks` or `compare` keeps working: those sections are simply hidden.
- No star ratings, scores, rankings or "Popular" badges. Picks are editorial and explained. An affiliate link never decides a pick, and the disclosure shows only where an affiliate link exists.
- No new colours or component styles outside `DESIGN.md`.

## 5. Data model

- **Category** (`content/categories/<slug>/en.md`, localized fields in `nl.md`):
  - `picks`: list of `{ label, service, reason, tradeoff }`. `service` is a service slug. `label`, `reason` and `tradeoff` are localized.
  - `compare`: list of `{ key, label }`, the category-specific table columns. `label` is localized.
  - The body: the "How to choose" text.
  - `metaTitle` and `metaDescription` for the buyer's-guide search intent.
- **Service** (`content/services/<slug>/en.md`, localized values in `nl.md`):
  - `specs`: a map from a `compare` key to a short value, for example `freeStorage: 5 GB` or `e2eEncryption: All files`. Every value traces to a `sourceUrls` entry.

## 6. States and ranges

- 3 to 12 services per category (Storage: 4 shown).
- A spec with no value shows "Not listed", never "No" (evidence rule 1).
- Long names and values wrap. On phones the picks stack and the table scrolls sideways.
- 0 picks: the section is hidden. 0 guides: the section is hidden.

## 7. Open decisions

- The owner confirms the Storage picks and their reasons before publishing.
- FAQs with FAQ structured data are left for a later pass.
