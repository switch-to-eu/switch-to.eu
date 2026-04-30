# Non-EU Service Page Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Spec:** [`docs/superpowers/specs/2026-04-27-non-eu-page-redesign-design.md`](../specs/2026-04-27-non-eu-page-redesign-design.md)

**Goal:** Reframe `/[locale]/services/non-eu/[service_name]` as an "EU alternatives to {service}" landing page that surfaces existing-but-hidden Payload data and adds a small set of new fields and components.

**Architecture:** All work happens in `apps/website` and `packages/i18n`. The page is a server component that already fetches the service at `depth: 2`; the redesign reorders sections, swaps the sidebar layout for full-width sections, and adds new components that render existing-but-unused fields plus five new fields on Services and one on Guides.

**Tech Stack:** Next.js 16 App Router, Payload CMS (Postgres), `next-intl` v4, Tailwind, shadcn/ui via `@switch-to-eu/ui`, `@payloadcms/richtext-lexical`.

**Out of scope (parallel tracks, separate plans):**
- Track A — running `/bulk-research` on the non-EU set to fill `userSentiment`, `redditMentions`, `recentNews`, `certifications`. Without this, sections 8–9 render hidden.
- Track B — extending `/write service` (or a new skill) to author `oneLineProblem`, `whatYoudGain`, `whatYoudLose`, `faqs`, and `angle`. Without this, sections 4 and 10 render hidden.

The engineering plan below ships the page; once tracks A and B catch up, the page fills in.

---

## Phase 1 — Schema additions

### Task 1: Add new fields to Services collection

**Files:**
- Modify: `apps/website/collections/Services.ts`

- [ ] **Step 1: Add `angle` to the General tab**

In `apps/website/collections/Services.ts`, inside the General tab `fields` array, after the `tags` field, add:

```ts
{
  name: "angle",
  type: "text",
  localized: true,
  admin: {
    description:
      "One short positioning line shown when this service appears as a non-recommended alternative on someone else's page (e.g. 'Most private', 'Closest to Chrome'). Optional.",
  },
},
```

- [ ] **Step 2: Add `oneLineProblem`, `whatYoudGain`, `whatYoudLose`, `faqs` to the Content tab**

In the Content tab `fields` array, after `recommendedAlternative`, add:

```ts
{
  name: "oneLineProblem",
  type: "textarea",
  localized: true,
  admin: {
    description:
      "Punchy one-sentence lede shown under the page H1 (~100–140 chars). Non-EU services only.",
    condition: (data) => data?.region === "non-eu",
  },
},
{
  name: "whatYoudGain",
  type: "array",
  localized: true,
  admin: {
    description:
      "2–3 wins gained by switching to the recommended alternative. Non-EU services only; renders when recommendedAlternative is set.",
    condition: (data) => data?.region === "non-eu",
  },
  fields: [{ name: "point", type: "text", required: true }],
},
{
  name: "whatYoudLose",
  type: "array",
  localized: true,
  admin: {
    description:
      "2–3 honest trade-offs vs the recommended alternative. Non-EU services only.",
    condition: (data) => data?.region === "non-eu",
  },
  fields: [{ name: "point", type: "text", required: true }],
},
{
  name: "faqs",
  type: "array",
  localized: true,
  admin: {
    description:
      "Page-level FAQs about considering the switch (distinct from migration-guide FAQs about executing it). Emitted as JSON-LD FAQPage.",
  },
  fields: [
    { name: "question", type: "text", required: true },
    { name: "answer", type: "richText", required: true },
  ],
},
```

- [ ] **Step 3: Run Payload type generation**

```bash
pnpm --filter website payload generate:types
```

Expected: `apps/website/payload-types.ts` updated with the five new fields on `Service` and `ServicesSelect`.

- [ ] **Step 4: Verify build**

```bash
pnpm --filter website lint && pnpm --filter website build
```

Expected: passes.

- [ ] **Step 5: Commit**

```bash
git add apps/website/collections/Services.ts apps/website/payload-types.ts
git commit -m "feat(payload): add oneLineProblem, gain/lose, faqs, angle to Services"
```

---

### Task 2: Add `migrationDifficulty` to Guides collection

**Files:**
- Modify: `apps/website/collections/Guides.ts`

- [ ] **Step 1: Add the field**

In `apps/website/collections/Guides.ts`, in the General tab `fields` array (or top-level fields if no tabs — check existing structure), add:

```ts
{
  name: "migrationDifficulty",
  type: "select",
  options: [
    { label: "Easy", value: "easy" },
    { label: "Medium", value: "medium" },
    { label: "Hard", value: "hard" },
  ],
  admin: {
    description:
      "How hard is the source→target switch? Read by the non-EU service page when this guide matches that pair.",
  },
},
```

- [ ] **Step 2: Run Payload type generation**

```bash
pnpm --filter website payload generate:types
```

- [ ] **Step 3: Verify build**

```bash
pnpm --filter website lint && pnpm --filter website build
```

- [ ] **Step 4: Commit**

```bash
git add apps/website/collections/Guides.ts apps/website/payload-types.ts
git commit -m "feat(payload): add migrationDifficulty to Guides"
```

---

## Phase 2 — i18n keys

### Task 3: Add new EN message keys

**Files:**
- Modify: `packages/i18n/messages/website/en.json`

- [ ] **Step 1: Add a new `nonEu.redesign` block under `services.detail`**

Locate `services.detail.nonEu` in `en.json`. Add the following keys alongside what's already there (do not remove existing keys — they are still used by the demoted "Why people are switching" block and the trust panel data):

```json
"redesign": {
  "h1Template": "EU Alternatives to {name}",
  "trustStrip": {
    "lastReviewed": "Last reviewed {date}",
    "sourcesCount": "{count, plural, one {# source} other {# sources}}",
    "sourcesAnchor": "View sources"
  },
  "gainLose": {
    "headingTemplate": "Switching from {source} to {target}",
    "gain": "What you get",
    "lose": "What you give up"
  },
  "otherAlternatives": "Other EU alternatives",
  "whyPeopleSwitch": "Why people are switching from {name}",
  "whereDataGoes": {
    "title": "Where your data goes",
    "ownedBy": "Owned by {company}",
    "headquarters": "Headquarters",
    "dataStored": "Data stored in",
    "openSource": "Open source",
    "closedSource": "Closed source",
    "viewCode": "View source code"
  },
  "recentNews": {
    "title": "Recent news about {name}",
    "empty": ""
  },
  "whatPeopleSay": {
    "title": "What people say about {name}",
    "subreddit": "r/{name}"
  },
  "faq": {
    "title": "Frequently asked questions"
  },
  "sources": {
    "title": "Sources & methodology",
    "lastReviewed": "Last reviewed: {date}"
  },
  "gdprBadge": {
    "compliant": "GDPR compliant",
    "partial": "Partial GDPR compliance",
    "non-compliant": "Not GDPR compliant",
    "unknown": "GDPR status unknown"
  },
  "migrationDifficulty": {
    "easy": "Easy switch",
    "medium": "Medium switch",
    "hard": "Hard switch"
  }
}
```

- [ ] **Step 2: Verify build (which type-checks `Messages`)**

```bash
pnpm --filter website build
```

- [ ] **Step 3: Commit**

```bash
git add packages/i18n/messages/website/en.json
git commit -m "feat(i18n): add EN keys for non-EU page redesign"
```

---

### Task 4: Add NL translations

**Files:**
- Modify: `packages/i18n/messages/website/nl.json`

- [ ] **Step 1: Add the same key tree, translated**

```json
"redesign": {
  "h1Template": "EU-alternatieven voor {name}",
  "trustStrip": {
    "lastReviewed": "Laatst beoordeeld op {date}",
    "sourcesCount": "{count, plural, one {# bron} other {# bronnen}}",
    "sourcesAnchor": "Bekijk bronnen"
  },
  "gainLose": {
    "headingTemplate": "Overstappen van {source} naar {target}",
    "gain": "Wat je krijgt",
    "lose": "Wat je inlevert"
  },
  "otherAlternatives": "Andere EU-alternatieven",
  "whyPeopleSwitch": "Waarom mensen overstappen van {name}",
  "whereDataGoes": {
    "title": "Waar je data heen gaat",
    "ownedBy": "Eigendom van {company}",
    "headquarters": "Hoofdkantoor",
    "dataStored": "Data opgeslagen in",
    "openSource": "Open source",
    "closedSource": "Gesloten broncode",
    "viewCode": "Bekijk broncode"
  },
  "recentNews": {
    "title": "Recent nieuws over {name}",
    "empty": ""
  },
  "whatPeopleSay": {
    "title": "Wat mensen zeggen over {name}",
    "subreddit": "r/{name}"
  },
  "faq": {
    "title": "Veelgestelde vragen"
  },
  "sources": {
    "title": "Bronnen en methodologie",
    "lastReviewed": "Laatst beoordeeld: {date}"
  },
  "gdprBadge": {
    "compliant": "AVG-conform",
    "partial": "Gedeeltelijk AVG-conform",
    "non-compliant": "Niet AVG-conform",
    "unknown": "AVG-status onbekend"
  },
  "migrationDifficulty": {
    "easy": "Makkelijke overstap",
    "medium": "Gemiddelde overstap",
    "hard": "Moeilijke overstap"
  }
}
```

- [ ] **Step 2: Verify build**

```bash
pnpm --filter website build
```

- [ ] **Step 3: Commit**

```bash
git add packages/i18n/messages/website/nl.json
git commit -m "feat(i18n): add NL translations for non-EU page redesign"
```

---

## Phase 3 — New components

All new components live in `apps/website/components/non-eu/`. Create that directory in Task 5 (the first new-component task).

### Task 5: TrustStrip component

**Files:**
- Create: `apps/website/components/non-eu/TrustStrip.tsx`

- [ ] **Step 1: Create the component**

```tsx
// apps/website/components/non-eu/TrustStrip.tsx
import { getTranslations, getFormatter } from "next-intl/server";
import type { Service } from "@/payload-types";

export async function TrustStrip({ service }: { service: Service }) {
  const t = await getTranslations("services.detail.nonEu.redesign");
  const format = await getFormatter();

  const gdpr = service.gdprCompliance ?? "unknown";
  const sourcesCount = service.sourceUrls?.length ?? 0;
  const lastReviewed = service.lastResearchedAt
    ? format.dateTime(new Date(service.lastResearchedAt), {
        year: "numeric",
        month: "long",
      })
    : null;

  return (
    <div className="rounded-3xl bg-brand-cream px-5 py-3 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
      <span className="inline-flex items-center gap-2 font-semibold">
        <span
          aria-hidden
          className={`w-2.5 h-2.5 rounded-full ${
            gdpr === "compliant"
              ? "bg-brand-green"
              : gdpr === "partial"
              ? "bg-brand-yellow"
              : gdpr === "non-compliant"
              ? "bg-brand-orange"
              : "bg-gray-400"
          }`}
        />
        {t(`gdprBadge.${gdpr}`)}
      </span>
      {service.headquarters && (
        <span className="text-gray-700">{service.headquarters}</span>
      )}
      {lastReviewed && (
        <span className="text-gray-700">
          {t("trustStrip.lastReviewed", { date: lastReviewed })}
        </span>
      )}
      {sourcesCount > 0 && (
        <a href="#sources" className="text-gray-700 underline">
          {t("trustStrip.sourcesCount", { count: sourcesCount })}
        </a>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Verify build**

```bash
pnpm --filter website build
```

- [ ] **Step 3: Commit**

```bash
git add apps/website/components/non-eu/TrustStrip.tsx
git commit -m "feat(website): add TrustStrip component for non-EU page"
```

---

### Task 6: GainLosePanel component

**Files:**
- Create: `apps/website/components/non-eu/GainLosePanel.tsx`

- [ ] **Step 1: Create the component**

```tsx
// apps/website/components/non-eu/GainLosePanel.tsx
import { getTranslations } from "next-intl/server";
import type { Service } from "@/payload-types";

export async function GainLosePanel({
  service,
  recommendedName,
}: {
  service: Service;
  recommendedName: string;
}) {
  const t = await getTranslations("services.detail.nonEu.redesign.gainLose");

  const gain = (service.whatYoudGain ?? []).map((g) => g.point);
  const lose = (service.whatYoudLose ?? []).map((l) => l.point);
  if (gain.length === 0 && lose.length === 0) return null;

  return (
    <section className="rounded-3xl bg-brand-cream p-6 sm:p-8">
      <h2 className="font-heading text-2xl sm:text-3xl uppercase mb-6">
        {t("headingTemplate", { source: service.name, target: recommendedName })}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {gain.length > 0 && (
          <div className="rounded-2xl bg-brand-green text-white p-5">
            <h3 className="font-heading uppercase text-lg mb-3">{t("gain")}</h3>
            <ul className="space-y-2 text-sm">
              {gain.map((point, i) => (
                <li key={i} className="flex gap-2">
                  <span aria-hidden>✓</span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        {lose.length > 0 && (
          <div className="rounded-2xl bg-brand-orange text-white p-5">
            <h3 className="font-heading uppercase text-lg mb-3">{t("lose")}</h3>
            <ul className="space-y-2 text-sm">
              {lose.map((point, i) => (
                <li key={i} className="flex gap-2">
                  <span aria-hidden>−</span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Verify build**

```bash
pnpm --filter website build
```

- [ ] **Step 3: Commit**

```bash
git add apps/website/components/non-eu/GainLosePanel.tsx
git commit -m "feat(website): add GainLosePanel component"
```

---

### Task 7: WhereYourDataGoes component

**Files:**
- Create: `apps/website/components/non-eu/WhereYourDataGoes.tsx`

- [ ] **Step 1: Create the component**

```tsx
// apps/website/components/non-eu/WhereYourDataGoes.tsx
import { getTranslations } from "next-intl/server";
import type { Service } from "@/payload-types";

export async function WhereYourDataGoes({ service }: { service: Service }) {
  const t = await getTranslations("services.detail.nonEu.redesign.whereDataGoes");

  const locations = (service.dataStorageLocations ?? []).map((l) => l.location);
  const hasContent =
    !!service.parentCompany ||
    !!service.headquarters ||
    locations.length > 0 ||
    typeof service.openSource === "boolean";
  if (!hasContent) return null;

  return (
    <section className="rounded-3xl bg-brand-navy text-white p-6 sm:p-8">
      <h2 className="font-heading uppercase text-2xl sm:text-3xl mb-5 text-brand-yellow">
        {t("title")}
      </h2>
      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 text-sm">
        {service.parentCompany && (
          <div>
            <dt className="text-white/60 uppercase text-xs tracking-wider mb-1">
              {t("ownedBy", { company: "" }).trim()}
            </dt>
            <dd>{service.parentCompany}</dd>
          </div>
        )}
        {service.headquarters && (
          <div>
            <dt className="text-white/60 uppercase text-xs tracking-wider mb-1">
              {t("headquarters")}
            </dt>
            <dd>{service.headquarters}</dd>
          </div>
        )}
        {locations.length > 0 && (
          <div className="sm:col-span-2">
            <dt className="text-white/60 uppercase text-xs tracking-wider mb-1">
              {t("dataStored")}
            </dt>
            <dd className="flex flex-wrap gap-2">
              {locations.map((loc, i) => (
                <span
                  key={i}
                  className="rounded-full bg-white/10 px-3 py-1 text-xs"
                >
                  {loc}
                </span>
              ))}
            </dd>
          </div>
        )}
        {typeof service.openSource === "boolean" && (
          <div className="sm:col-span-2">
            <dd>
              {service.openSource ? (
                <>
                  <span className="font-semibold">{t("openSource")}</span>
                  {service.sourceCodeUrl && (
                    <>
                      {" — "}
                      <a
                        href={service.sourceCodeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline text-brand-yellow"
                      >
                        {t("viewCode")}
                      </a>
                    </>
                  )}
                </>
              ) : (
                <span>{t("closedSource")}</span>
              )}
            </dd>
          </div>
        )}
      </dl>
    </section>
  );
}
```

- [ ] **Step 2: Verify build**

```bash
pnpm --filter website build
```

- [ ] **Step 3: Commit**

```bash
git add apps/website/components/non-eu/WhereYourDataGoes.tsx
git commit -m "feat(website): add WhereYourDataGoes component"
```

---

### Task 8: RecentNews component

**Files:**
- Create: `apps/website/components/non-eu/RecentNews.tsx`

- [ ] **Step 1: Create the component**

```tsx
// apps/website/components/non-eu/RecentNews.tsx
import { getTranslations, getFormatter } from "next-intl/server";
import type { Service } from "@/payload-types";

export async function RecentNews({ service }: { service: Service }) {
  const t = await getTranslations("services.detail.nonEu.redesign.recentNews");
  const format = await getFormatter();

  const items = service.recentNews ?? [];
  if (items.length === 0) return null;

  return (
    <section className="rounded-3xl bg-white border border-black/5 p-6 sm:p-8">
      <h2 className="font-heading uppercase text-2xl sm:text-3xl mb-5">
        {t("title", { name: service.name })}
      </h2>
      <ul className="divide-y divide-black/10">
        {items.map((item, i) => (
          <li key={i} className="py-3 flex flex-col sm:flex-row sm:items-baseline sm:gap-4">
            <span className="text-xs text-gray-500 sm:w-32 shrink-0">
              {item.date
                ? format.dateTime(new Date(item.date), {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })
                : null}
              {item.source ? ` · ${item.source}` : ""}
            </span>
            <div className="flex-1">
              {item.title && (
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold underline"
                >
                  {item.title}
                </a>
              )}
              {item.summary && (
                <p className="text-sm text-gray-700 mt-1">{item.summary}</p>
              )}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
```

- [ ] **Step 2: Verify build**

```bash
pnpm --filter website build
```

- [ ] **Step 3: Commit**

```bash
git add apps/website/components/non-eu/RecentNews.tsx
git commit -m "feat(website): add RecentNews component"
```

---

### Task 9: WhatPeopleSay component

**Files:**
- Create: `apps/website/components/non-eu/WhatPeopleSay.tsx`

- [ ] **Step 1: Create the component**

```tsx
// apps/website/components/non-eu/WhatPeopleSay.tsx
import { getTranslations } from "next-intl/server";
import type { Service } from "@/payload-types";

export async function WhatPeopleSay({ service }: { service: Service }) {
  const t = await getTranslations("services.detail.nonEu.redesign.whatPeopleSay");

  const summary = service.userSentiment?.summary;
  const mentions = service.redditMentions ?? [];
  if (!summary && mentions.length === 0) return null;

  return (
    <section className="rounded-3xl bg-brand-cream p-6 sm:p-8">
      <h2 className="font-heading uppercase text-2xl sm:text-3xl mb-5">
        {t("title", { name: service.name })}
      </h2>
      {summary && (
        <p className="text-base sm:text-lg leading-relaxed mb-6 max-w-3xl">
          {summary}
        </p>
      )}
      {mentions.length > 0 && (
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {mentions.slice(0, 4).map((m, i) => (
            <li
              key={i}
              className="rounded-2xl bg-white p-4 border border-black/5"
            >
              <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                <span className="font-semibold">
                  {t("subreddit", { name: m.subreddit })}
                </span>
                {m.sentiment && (
                  <span
                    className={`rounded-full px-2 py-0.5 ${
                      m.sentiment === "positive"
                        ? "bg-brand-green/15 text-brand-green"
                        : m.sentiment === "negative"
                        ? "bg-brand-orange/15 text-brand-orange"
                        : "bg-gray-200 text-gray-700"
                    }`}
                  >
                    {m.sentiment}
                  </span>
                )}
              </div>
              {m.snippet && <p className="text-sm">"{m.snippet}"</p>}
              {m.postUrl && (
                <a
                  href={m.postUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-gray-500 underline mt-2 inline-block"
                >
                  {m.postTitle ?? m.postUrl}
                </a>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
```

- [ ] **Step 2: Verify build**

```bash
pnpm --filter website build
```

- [ ] **Step 3: Commit**

```bash
git add apps/website/components/non-eu/WhatPeopleSay.tsx
git commit -m "feat(website): add WhatPeopleSay component"
```

---

### Task 10: FaqAccordion component (with JSON-LD)

**Files:**
- Create: `apps/website/components/non-eu/FaqAccordion.tsx`

- [ ] **Step 1: Create the component**

The component renders an accordion AND emits a JSON-LD `FAQPage` schema. Lexical rich text answers must be flattened to plain text for the schema.

```tsx
// apps/website/components/non-eu/FaqAccordion.tsx
import { getTranslations } from "next-intl/server";
import {
  convertLexicalToHTML,
  defaultHTMLConverters,
} from "@payloadcms/richtext-lexical/html";
import type { SerializedEditorState } from "@payloadcms/richtext-lexical/lexical";
import type { Service } from "@/payload-types";

function lexicalToPlainText(data: SerializedEditorState): string {
  // Flatten Lexical → HTML → strip tags. Good enough for JSON-LD.
  const html = convertLexicalToHTML({
    converters: defaultHTMLConverters,
    data,
    disableContainer: true,
  });
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

export async function FaqAccordion({ service }: { service: Service }) {
  const t = await getTranslations("services.detail.nonEu.redesign.faq");
  const faqs = (service.faqs ?? []).filter((f) => f.question && f.answer);
  if (faqs.length === 0) return null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: lexicalToPlainText(f.answer as SerializedEditorState),
      },
    })),
  };

  return (
    <section className="rounded-3xl bg-white border border-black/5 p-6 sm:p-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <h2 className="font-heading uppercase text-2xl sm:text-3xl mb-5">
        {t("title")}
      </h2>
      <div className="space-y-2">
        {faqs.map((f, i) => {
          const html = convertLexicalToHTML({
            converters: defaultHTMLConverters,
            data: f.answer as SerializedEditorState,
            disableContainer: true,
          });
          return (
            <details
              key={i}
              className="rounded-2xl bg-brand-cream px-4 py-3 group"
            >
              <summary className="cursor-pointer list-none font-semibold flex justify-between items-center">
                <span>{f.question}</span>
                <span aria-hidden className="ml-3 group-open:rotate-45 transition-transform">+</span>
              </summary>
              <div
                className="prose prose-sm mt-3 max-w-none"
                dangerouslySetInnerHTML={{ __html: html }}
              />
            </details>
          );
        })}
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Verify build**

```bash
pnpm --filter website build
```

- [ ] **Step 3: Commit**

```bash
git add apps/website/components/non-eu/FaqAccordion.tsx
git commit -m "feat(website): add FaqAccordion with FAQPage JSON-LD"
```

---

### Task 11: Sources component

**Files:**
- Create: `apps/website/components/non-eu/Sources.tsx`

- [ ] **Step 1: Create the component**

```tsx
// apps/website/components/non-eu/Sources.tsx
import { getTranslations, getFormatter } from "next-intl/server";
import type { Service } from "@/payload-types";

export async function Sources({ service }: { service: Service }) {
  const t = await getTranslations("services.detail.nonEu.redesign.sources");
  const format = await getFormatter();

  const urls = service.sourceUrls ?? [];
  if (urls.length === 0) return null;

  const lastReviewed = service.lastResearchedAt
    ? format.dateTime(new Date(service.lastResearchedAt), {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  return (
    <section
      id="sources"
      className="rounded-3xl bg-white border border-black/5 p-6 sm:p-8"
    >
      <h2 className="font-heading uppercase text-2xl sm:text-3xl mb-3">
        {t("title")}
      </h2>
      {lastReviewed && (
        <p className="text-sm text-gray-600 mb-4">
          {t("lastReviewed", { date: lastReviewed })}
        </p>
      )}
      <ul className="space-y-1 text-sm">
        {urls.map((s, i) => (
          <li key={i}>
            <a
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              className="underline text-brand-navy"
            >
              {s.label ?? s.url}
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
```

- [ ] **Step 2: Verify build**

```bash
pnpm --filter website build
```

- [ ] **Step 3: Commit**

```bash
git add apps/website/components/non-eu/Sources.tsx
git commit -m "feat(website): add Sources component"
```

---

## Phase 4 — Modify existing components

### Task 12: Extend RecommendedAlternative

**Files:**
- Modify: `apps/website/components/ui/RecommendedAlternative.tsx`

- [ ] **Step 1: Expand the `RecommendedAlternativeService` Pick type**

Replace the existing Pick with:

```ts
export type RecommendedAlternativeService = Pick<
  Service,
  | "name"
  | "slug"
  | "region"
  | "location"
  | "freeOption"
  | "startingPrice"
  | "description"
  | "url"
  | "affiliateUrl"
  | "screenshot"
  | "gdprCompliance"
  | "headquarters"
  | "openSource"
  | "sourceCodeUrl"
  | "features"
  | "gdprNotes"
>;
```

- [ ] **Step 2: Render the new fields inside the existing card body**

Inside the `<div className="px-6 sm:px-8 ...">` block, after the existing meta-info row (`{/* Meta info */}`) and before the `{/* Actions */}` block, add a new mid-card panel:

```tsx
<div className="bg-white/10 rounded-2xl p-4 mb-5 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
  {service.gdprCompliance && (
    <div>
      <span className="block text-xs text-white/60 uppercase tracking-wider">
        GDPR
      </span>
      <span className="text-white">
        {t(`recommendedAlternative.gdpr.${service.gdprCompliance}`)}
      </span>
    </div>
  )}
  {service.headquarters && (
    <div>
      <span className="block text-xs text-white/60 uppercase tracking-wider">
        HQ
      </span>
      <span className="text-white">{service.headquarters}</span>
    </div>
  )}
  {typeof service.openSource === "boolean" && (
    <div>
      <span className="block text-xs text-white/60 uppercase tracking-wider">
        Source
      </span>
      <span className="text-white">
        {service.openSource ? (
          service.sourceCodeUrl ? (
            <a
              href={service.sourceCodeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              Open source ↗
            </a>
          ) : (
            "Open source"
          )
        ) : (
          "Closed source"
        )}
      </span>
    </div>
  )}
  {service.features && service.features.length > 0 && (
    <div className="sm:col-span-2">
      <span className="block text-xs text-white/60 uppercase tracking-wider mb-1">
        Key features
      </span>
      <ul className="flex flex-wrap gap-1.5">
        {service.features.slice(0, 5).map((f, i) => (
          <li
            key={i}
            className="rounded-full bg-white/15 px-2.5 py-0.5 text-xs"
          >
            {f.feature}
          </li>
        ))}
      </ul>
    </div>
  )}
</div>
```

If `service.gdprNotes` is set, add a small italic line under the description:

```tsx
{service.gdprNotes && (
  <p className="text-brand-cream/80 text-sm italic mb-4 max-w-xl">
    {service.gdprNotes}
  </p>
)}
```

- [ ] **Step 3: Add the GDPR i18n keys**

Add to `services.detail.recommendedAlternative.gdpr` in both `en.json` and `nl.json`:

```json
"gdpr": {
  "compliant": "Fully compliant",
  "partial": "Partial compliance",
  "non-compliant": "Not compliant",
  "unknown": "Status unknown"
}
```

NL:
```json
"gdpr": {
  "compliant": "Volledig conform",
  "partial": "Gedeeltelijk conform",
  "non-compliant": "Niet conform",
  "unknown": "Status onbekend"
}
```

- [ ] **Step 4: Verify build**

```bash
pnpm --filter website build
```

- [ ] **Step 5: Commit**

```bash
git add apps/website/components/ui/RecommendedAlternative.tsx packages/i18n/messages/website/en.json packages/i18n/messages/website/nl.json
git commit -m "feat(website): expand RecommendedAlternative with GDPR/HQ/source/features"
```

---

### Task 13: Add `angle` to ServiceCard

**Files:**
- Modify: `apps/website/components/ui/ServiceCard.tsx`

- [ ] **Step 1: Read current ServiceCard structure (re-confirm prop shape)**

Open the file. Locate where the description renders.

- [ ] **Step 2: Render `angle` above the description when present**

Add, immediately above the description paragraph:

```tsx
{service.angle && (
  <span className="block text-[11px] uppercase tracking-wider font-bold text-brand-orange mb-1">
    {service.angle}
  </span>
)}
```

`service` already includes `angle` once Task 1 ran type generation, no prop change needed.

- [ ] **Step 3: Verify build**

```bash
pnpm --filter website build
```

- [ ] **Step 4: Commit**

```bash
git add apps/website/components/ui/ServiceCard.tsx
git commit -m "feat(website): show editorial angle on ServiceCard when set"
```

---

## Phase 5 — Page rewrite

### Task 14: Rewrite the non-EU service page

**Files:**
- Modify: `apps/website/app/(frontend)/[locale]/services/non-eu/[service_name]/page.tsx`

- [ ] **Step 1: Read existing imports and helpers**

The current file already fetches the service at `depth: 2`, resolves the recommended alternative, the migration guides, and the EU alternatives. Keep that fetching logic.

- [ ] **Step 2: Replace the JSX return**

Replace the whole `return (...)` block with the new full-width layout. New imports needed at the top:

```ts
import { TrustStrip } from "@/components/non-eu/TrustStrip";
import { GainLosePanel } from "@/components/non-eu/GainLosePanel";
import { WhereYourDataGoes } from "@/components/non-eu/WhereYourDataGoes";
import { RecentNews } from "@/components/non-eu/RecentNews";
import { WhatPeopleSay } from "@/components/non-eu/WhatPeopleSay";
import { FaqAccordion } from "@/components/non-eu/FaqAccordion";
import { Sources } from "@/components/non-eu/Sources";
```

Replace the existing `<PageLayout>` body with:

```tsx
return (
  <PageLayout>
    <Container noPaddingMobile>
      {/* 1. HERO */}
      <Banner
        color="bg-brand-orange"
        className="py-10 sm:py-14"
        shapes={[
          {
            shape: "starburst",
            className: "-top-6 -right-6 w-32 h-32 sm:w-44 sm:h-44",
          },
        ]}
      >
        <div className="flex justify-between items-start mb-4">
          <h1 className="font-heading text-4xl sm:text-5xl uppercase text-white">
            {t("redesign.h1Template", { name: service.name })}
          </h1>
          <RegionBadge region={service.region} />
        </div>
        {service.oneLineProblem && (
          <p className="text-white/90 text-base sm:text-lg max-w-2xl">
            {service.oneLineProblem}
          </p>
        )}
        {!service.oneLineProblem && (
          <p className="text-white/90 text-base sm:text-lg max-w-2xl">
            {service.description}
          </p>
        )}
      </Banner>
    </Container>

    {/* 2. TRUST STRIP */}
    <Container noPaddingMobile>
      <TrustStrip service={service} />
    </Container>

    {/* 3. RECOMMENDED ALTERNATIVE */}
    {resolvedAlternative && (
      <Container noPaddingMobile>
        <RecommendedAlternative
          service={resolvedAlternative}
          sourceService={service.name}
          migrationGuides={migrationGuides}
        />
      </Container>
    )}

    {/* 4. GAIN / LOSE PANEL */}
    {resolvedAlternative && (
      <Container noPaddingMobile>
        <GainLosePanel service={service} recommendedName={resolvedAlternative.name} />
      </Container>
    )}

    {/* 5. OTHER EU ALTERNATIVES */}
    {otherAlternatives.length > 0 && (
      <Container noPaddingMobile>
        <SectionHeading>{t("redesign.otherAlternatives")}</SectionHeading>
        <div className="grid gap-0 md:gap-5 auto-rows-fr grid-cols-2 md:grid-cols-4">
          {otherAlternatives.map((alt, index) => (
            <ServiceCard
              key={alt.name}
              service={alt}
              showCategory={false}
              colorIndex={index}
            />
          ))}
          <SuggestServiceCard colorIndex={otherAlternatives.length} />
        </div>
      </Container>
    )}

    {/* 6. WHY PEOPLE ARE SWITCHING (demoted critique) */}
    {(issues.length > 0 || htmlContent) && (
      <Container noPaddingMobile>
        <section className="rounded-3xl bg-white border border-black/5 p-6 sm:p-8">
          <h2 className="font-heading uppercase text-2xl sm:text-3xl mb-5">
            {t("redesign.whyPeopleSwitch", { name: service.name })}
          </h2>
          {issues.length > 0 && (
            <ul className="space-y-2 mb-6">
              {issues.map((issue, i) => (
                <li key={i} className="flex gap-3 text-sm sm:text-base">
                  <span aria-hidden className="text-brand-orange">⚠</span>
                  <span>{issue}</span>
                </li>
              ))}
            </ul>
          )}
          {htmlContent && (
            <div
              className="mdx-content prose prose-slate prose-sm sm:prose max-w-none"
              dangerouslySetInnerHTML={{ __html: htmlContent }}
            />
          )}
        </section>
      </Container>
    )}

    {/* 7. WHERE YOUR DATA GOES */}
    <Container noPaddingMobile>
      <WhereYourDataGoes service={service} />
    </Container>

    {/* 8. RECENT NEWS */}
    <Container noPaddingMobile>
      <RecentNews service={service} />
    </Container>

    {/* 9. WHAT PEOPLE SAY */}
    <Container noPaddingMobile>
      <WhatPeopleSay service={service} />
    </Container>

    {/* 10. FAQ */}
    <Container noPaddingMobile>
      <FaqAccordion service={service} />
    </Container>

    {/* 11. SOURCES */}
    <Container noPaddingMobile>
      <Sources service={service} />
    </Container>
  </PageLayout>
);
```

Remove the old `WarningCollapsible` import and the old desktop sidebar / generic "why switch" pillars block — they no longer render. Remove the unused `t` namespace `services.detail.nonEu` reads where they're now obsolete.

- [ ] **Step 3: Verify build**

```bash
pnpm --filter website build
```

- [ ] **Step 4: Commit**

```bash
git add apps/website/app/\(frontend\)/[locale]/services/non-eu/[service_name]/page.tsx
git commit -m "feat(website): rewrite non-EU page as 'EU alternatives to X' landing"
```

---

### Task 15: Update page metadata to match new H1

**Files:**
- Modify: `apps/website/app/(frontend)/[locale]/services/non-eu/[service_name]/page.tsx` (the `generateMetadata` function only)

- [ ] **Step 1: Update the title and description fallbacks**

In `generateMetadata`, replace the title/description lines with:

```ts
const title =
  service.metaTitle ||
  `EU Alternatives to ${service.name} | switch-to.eu`;
const description =
  service.metaDescription ||
  service.oneLineProblem ||
  service.description;
```

The keywords array stays as it is.

- [ ] **Step 2: Verify build**

```bash
pnpm --filter website build
```

- [ ] **Step 3: Commit**

```bash
git add apps/website/app/\(frontend\)/[locale]/services/non-eu/[service_name]/page.tsx
git commit -m "feat(website): update non-EU page meta title to 'EU Alternatives to X'"
```

---

## Phase 6 — Verification

### Task 16: Smoke-test the redesigned page

**Files:**
- Existing: `apps/website/e2e/smoke.spec.ts`

- [ ] **Step 1: Confirm the existing smoke spec covers a non-EU service URL**

Open the smoke spec. Confirm at least one URL like `/services/non-eu/chrome` is in the loop. If not, add it (one line in the `urls` array, both EN and NL).

- [ ] **Step 2: Run smoke tests**

```bash
pnpm --filter website test:e2e
```

Expected: all pages render with status 200, no error overlay, body visible.

- [ ] **Step 3: Manually verify FAQ JSON-LD on a real page**

```bash
pnpm --filter website dev
# In another terminal:
curl -s http://localhost:3000/en/services/non-eu/chrome | grep -A 20 'application/ld+json'
```

Expected: a `FAQPage` schema is emitted (will be empty until Task 11 has data — that's fine, the script tag should still be absent if `faqs[]` is empty, present otherwise).

- [ ] **Step 4: Commit (if smoke spec was edited)**

```bash
git add apps/website/e2e/smoke.spec.ts
git commit -m "test(website): cover non-EU services in smoke tests"
```

---

### Task 17: Manual QA pass + visual review

- [ ] **Step 1: Pick three test services** in admin (e.g. Chrome, Gmail, Instagram). Confirm each has `region: "non-eu"` and at least a `recommendedAlternative` set.

- [ ] **Step 2: Run `pnpm --filter website dev` and load each in EN and NL.**

For each page, confirm:
1. H1 reads "EU Alternatives to {Name}".
2. The hero shows `oneLineProblem` if set, falls back to `description` otherwise.
3. Trust strip renders with GDPR badge and HQ.
4. Recommended alternative card shows the new GDPR/HQ/source/features panel.
5. Gain/lose panel renders only when `whatYoudGain` or `whatYoudLose` is set.
6. Other alternatives grid renders, with `angle` lines where set.
7. "Why people are switching" section renders existing issues + content body.
8. Where-your-data-goes card renders with at least HQ and parent company.
9. Recent news / What people say / FAQ render only when their data is present.
10. Sources block renders.

- [ ] **Step 3: View page source on one URL.** Confirm only one `<h1>` per page and that the JSON-LD `FAQPage` is present when `faqs[]` is populated.

- [ ] **Step 4: Take screenshots in EN + NL** of the redesigned page for the PR description. Compare to the old design.

(No commit — manual QA only.)

---

## Done when

- All 17 tasks above are complete.
- `pnpm lint && pnpm build` passes from repo root.
- Playwright smoke tests pass.
- A non-EU service with **all** new fields filled (set up at least one — e.g. Chrome with `oneLineProblem`, `whatYoudGain[]`, `whatYoudLose[]`, `faqs[]`, `recentNews[]`, `userSentiment.summary`) renders every section visibly.

## Follow-up (separate plans)

- Track A: `/bulk-research` run on the non-EU set to populate `userSentiment`, `redditMentions`, `recentNews`, `certifications`.
- Track B: Extend `/write service` to author `oneLineProblem`, `whatYoudGain`, `whatYoudLose`, `faqs`, `angle`. Then run on the non-EU set.
- Pageaudit (using existing `/seo-audit`) on the redesigned Chrome page 4 weeks after ship to verify GSC clicks, position, and FAQ snippet capture.
