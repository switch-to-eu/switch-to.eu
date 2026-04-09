# Service Page Refactor Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Eliminate 12 redundant Payload queries, extract shared utilities, and make the service page architecture DRY and consistent.

**Architecture:** Centralize all service data fetching into shared query functions with Next.js `cache()` deduplication. Extract repeated logic (GDPR labels, presence checks, static params) into utilities. Fix consistency issues across subpages.

**Tech Stack:** Next.js 16 App Router, Payload CMS, React `cache()`, TypeScript

---

### Task 1: Create shared service query utilities

**Files:**
- Create: `apps/website/lib/services.ts`

- [ ] **Step 1: Create the shared query module**

```typescript
import { cache } from "react";
import { getPayload } from "@/lib/payload";
import type { Service, Guide } from "@/payload-types";

const EU_REGIONS = ["eu", "eu-friendly"] as const;
const LOCALES = ["en", "nl"] as const;

// Cached per-request: fetch once, reuse across layout + page + metadata
export const getServiceBySlug = cache(
  async (slug: string, locale: string): Promise<Service | null> => {
    const payload = await getPayload();
    const { docs } = await payload.find({
      collection: "services",
      where: {
        slug: { equals: slug },
        region: { in: [...EU_REGIONS] },
      },
      locale: locale as "en" | "nl",
      depth: 1,
      limit: 1,
    });
    return (docs[0] as Service) ?? null;
  }
);

export const getRelatedGuides = cache(
  async (serviceId: number, locale: string): Promise<Guide[]> => {
    const payload = await getPayload();
    const { docs } = await payload.find({
      collection: "guides",
      where: { targetService: { equals: serviceId } },
      locale: locale as "en" | "nl",
      depth: 1,
      limit: 10,
    });
    return docs as Guide[];
  }
);

export const getSimilarServices = cache(
  async (
    categoryId: number,
    excludeId: number,
    locale: string
  ): Promise<Service[]> => {
    const payload = await getPayload();
    const { docs } = await payload.find({
      collection: "services",
      where: {
        category: { equals: categoryId },
        id: { not_equals: excludeId },
        region: { in: [...EU_REGIONS] },
      },
      locale: locale as "en" | "nl",
      limit: 5,
    });
    return (docs as Service[])
      .sort((a, b) => {
        if (a.featured && !b.featured) return -1;
        if (!a.featured && b.featured) return 1;
        return 0;
      })
      .slice(0, 4);
  }
);

// Shared static params generators
export async function getAllEuServiceSlugs() {
  const payload = await getPayload();
  const { docs } = await payload.find({
    collection: "services",
    where: { region: { in: [...EU_REGIONS] } },
    limit: 100,
  });
  return LOCALES.flatMap((locale) =>
    docs.map((s) => ({ locale, service_name: s.slug }))
  );
}

// Helper: extract category slug from populated or ID reference
export function getCategorySlug(category: Service["category"]): string {
  return typeof category === "object" ? category.slug : String(category);
}

export function getCategoryId(category: Service["category"]): number {
  return typeof category === "object" ? category.id : category;
}

export function getScreenshotUrl(
  screenshot: Service["screenshot"]
): string | undefined {
  return typeof screenshot === "object" && screenshot
    ? screenshot.url ?? undefined
    : undefined;
}

// GDPR label from compliance status
export function getGdprLabel(
  compliance: Service["gdprCompliance"]
): string | null {
  switch (compliance) {
    case "compliant":
      return "GDPR Compliant";
    case "partial":
      return "Partially Compliant";
    case "non-compliant":
      return "Non-Compliant";
    default:
      return null;
  }
}

// Presence checks for conditional tabs/sections
export function hasPricingData(service: Service): boolean {
  return !!(
    (service.pricingTiers && service.pricingTiers.length > 0) ||
    service.pricingDetails ||
    service.startingPrice
  );
}

export function hasSecurityData(service: Service): boolean {
  return !!(
    service.gdprCompliance ||
    (service.certifications && service.certifications.length > 0) ||
    (service.dataStorageLocations && service.dataStorageLocations.length > 0)
  );
}

// Build card-compatible shape from Service
export function toServiceCard(service: Service, fallbackCategorySlug: string) {
  return {
    name: service.name,
    category:
      typeof service.category === "object"
        ? service.category.slug
        : fallbackCategorySlug,
    location: service.location,
    region: service.region as "eu" | "non-eu" | "eu-friendly",
    freeOption: service.freeOption ?? false,
    startingPrice: service.startingPrice ?? undefined,
    description: service.description,
    url: service.url,
    screenshot: getScreenshotUrl(service.screenshot),
    features: service.features?.map((f) => f.feature) ?? [],
    tags: service.tags?.map((t) => t.tag) ?? [],
    featured: service.featured ?? false,
  };
}
```

- [ ] **Step 2: Verify module compiles**

Run: `cd apps/website && npx tsc --noEmit --pretty 2>&1 | head -20`

- [ ] **Step 3: Commit**

```bash
git add apps/website/lib/services.ts
git commit -m "refactor: extract shared service query utilities with cache()"
```

---

### Task 2: Create shared metadata generator

**Files:**
- Create: `apps/website/lib/service-metadata.ts`

- [ ] **Step 1: Create metadata utility**

```typescript
import { Metadata } from "next";
import { getServiceBySlug, getCategorySlug } from "@/lib/services";
import type { Service } from "@/payload-types";

type Section = "overview" | "pricing" | "security" | "comparison";

const sectionTitles: Record<Section, (name: string) => string> = {
  overview: (name) => `${name} | EU Service | switch-to.eu`,
  pricing: (name) => `${name} Pricing | switch-to.eu`,
  security: (name) => `${name} Security & Privacy | switch-to.eu`,
  comparison: (name) => `${name} | switch-to.eu`,
};

const sectionDescriptions: Record<Section, (name: string) => string> = {
  overview: (name) => ``,  // uses service.description
  pricing: (name) =>
    `Compare ${name} free and paid plans. See what you get at each tier.`,
  security: (name) =>
    `${name} security details: encryption, GDPR compliance, data storage, certifications.`,
  comparison: () => ``,  // built dynamically
};

export async function generateServiceMetadata({
  serviceName,
  locale,
  section = "overview",
  comparisonServiceName,
}: {
  serviceName: string;
  locale: string;
  section?: Section;
  comparisonServiceName?: string;
}): Promise<Metadata> {
  const service = await getServiceBySlug(serviceName, locale);
  if (!service) return { title: "Service Not Found" };

  const categorySlug = getCategorySlug(service.category);
  const basePath = `https://switch-to.eu/${locale}/services/eu/${serviceName}`;
  const sectionPath =
    section === "overview" ? "" : `/${section === "comparison" ? `vs-${comparisonServiceName}` : section}`;

  const title =
    section === "comparison" && comparisonServiceName
      ? `${service.name} vs ${comparisonServiceName} | switch-to.eu`
      : sectionTitles[section](service.name);

  const description =
    section === "overview"
      ? service.description
      : section === "comparison" && comparisonServiceName
        ? `Compare ${service.name} and ${comparisonServiceName}. Privacy, pricing, and features side by side.`
        : sectionDescriptions[section](service.name);

  return {
    title,
    description,
    keywords:
      section === "overview"
        ? [
            service.name,
            categorySlug,
            "EU service",
            "privacy-focused",
            "GDPR compliant",
            ...(service.tags?.map((t) => t.tag) || []),
          ]
        : undefined,
    alternates: {
      canonical: `${basePath}${sectionPath}`,
      languages: {
        en: `https://switch-to.eu/en/services/eu/${serviceName}${sectionPath}`,
        nl: `https://switch-to.eu/nl/services/eu/${serviceName}${sectionPath}`,
      },
    },
  };
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/website/lib/service-metadata.ts
git commit -m "refactor: extract shared service metadata generator"
```

---

### Task 3: Refactor layout.tsx to use shared utilities

**Files:**
- Modify: `apps/website/app/(frontend)/[locale]/services/eu/[service_name]/layout.tsx`

- [ ] **Step 1: Replace inline queries with shared functions**

Replace all inline Payload queries with imports from `@/lib/services`. Remove duplicate helper functions (`getAvailableTabs` stays but uses shared helpers). Remove inline `similarServices` mapping logic (use `toServiceCard`).

Key changes:
- Import `getServiceBySlug`, `getRelatedGuides`, `getSimilarServices`, `getCategorySlug`, `getCategoryId`, `getScreenshotUrl`, `hasPricingData`, `hasSecurityData`, `toServiceCard`
- Remove inline `payload.find()` calls (3 of them)
- Remove inline `screenshotUrl` derivation
- Remove inline `similarServices` mapping
- Remove inline `categorySlug`/`categoryFormatted` derivation

- [ ] **Step 2: Verify page loads**

Navigate to `http://localhost:5010/en/services/eu/proton-mail` and confirm it renders.

- [ ] **Step 3: Commit**

```bash
git add apps/website/app/\(frontend\)/\[locale\]/services/eu/\[service_name\]/layout.tsx
git commit -m "refactor: layout uses shared service query utilities"
```

---

### Task 4: Refactor overview page.tsx

**Files:**
- Modify: `apps/website/app/(frontend)/[locale]/services/eu/[service_name]/page.tsx`

- [ ] **Step 1: Replace queries with shared functions**

- Import `getServiceBySlug`, `getAllEuServiceSlugs`, `hasPricingData`, `hasSecurityData`, `getGdprLabel` from `@/lib/services`
- Import `generateServiceMetadata` from `@/lib/service-metadata`
- Replace `generateStaticParams` body with `return getAllEuServiceSlugs()`
- Replace `generateMetadata` body with `return generateServiceMetadata({ serviceName: service_name, locale })`
- Replace inline `getPayload()` + find in render with `getServiceBySlug(service_name, locale)`
- Replace inline `hasPricing`/`hasSecurity`/`gdprLabel` logic with shared helpers

- [ ] **Step 2: Verify page loads**

- [ ] **Step 3: Commit**

```bash
git add apps/website/app/\(frontend\)/\[locale\]/services/eu/\[service_name\]/page.tsx
git commit -m "refactor: overview page uses shared utilities"
```

---

### Task 5: Refactor pricing page

**Files:**
- Modify: `apps/website/app/(frontend)/[locale]/services/eu/[service_name]/pricing/page.tsx`

- [ ] **Step 1: Replace queries with shared functions**

Same pattern as Task 4:
- Use `getServiceBySlug` instead of inline query
- Use `generateServiceMetadata` with `section: "pricing"`
- Use `getAllEuServiceSlugs` filtered by `hasPricingData` for static params
- Remove unused imports (`getPayload`)

- [ ] **Step 2: Verify pricing page loads**

- [ ] **Step 3: Commit**

```bash
git add apps/website/app/\(frontend\)/\[locale\]/services/eu/\[service_name\]/pricing/page.tsx
git commit -m "refactor: pricing page uses shared utilities"
```

---

### Task 6: Refactor security page

**Files:**
- Modify: `apps/website/app/(frontend)/[locale]/services/eu/[service_name]/security/page.tsx`

- [ ] **Step 1: Replace queries with shared functions**

Same pattern:
- Use `getServiceBySlug`, `getGdprLabel`, `hasSecurityData`
- Use `generateServiceMetadata` with `section: "security"`
- Filter static params by `hasSecurityData`
- Remove inline GDPR label/color logic (use shared `getGdprLabel`)

- [ ] **Step 2: Verify security page loads**

- [ ] **Step 3: Commit**

```bash
git add apps/website/app/\(frontend\)/\[locale\]/services/eu/\[service_name\]/security/page.tsx
git commit -m "refactor: security page uses shared utilities"
```

---

### Task 7: Refactor comparison page

**Files:**
- Modify: `apps/website/app/(frontend)/[locale]/services/eu/[service_name]/[comparison]/page.tsx`

- [ ] **Step 1: Replace queries with shared functions**

- Use `getServiceBySlug` for both EU and non-EU service (add a non-region-filtered variant or pass region filter)
- Use `generateServiceMetadata` with `section: "comparison"`
- Use `getRelatedGuides` or inline guide query (comparison needs source+target filter)
- Fix the missing region filter on non-EU service lookup (bug)

- [ ] **Step 2: Verify comparison page loads**

- [ ] **Step 3: Commit**

```bash
git add apps/website/app/\(frontend\)/\[locale\]/services/eu/\[service_name\]/\[comparison\]/page.tsx
git commit -m "refactor: comparison page uses shared utilities, fix region filter bug"
```

---

### Task 8: Clean up unused code and fix consistency

**Files:**
- Modify: `apps/website/components/ui/ServiceSubNav.tsx`

- [ ] **Step 1: Remove unused `serviceName` prop**

Update the interface and component signature to remove the unused prop. Update the call site in `layout.tsx`.

- [ ] **Step 2: Verify all tabs still work**

Navigate to each tab: overview, pricing, security, vs-gmail.

- [ ] **Step 3: Commit**

```bash
git add apps/website/components/ui/ServiceSubNav.tsx apps/website/app/\(frontend\)/\[locale\]/services/eu/\[service_name\]/layout.tsx
git commit -m "refactor: remove unused serviceName prop from ServiceSubNav"
```

---

### Task 9: Final verification

- [ ] **Step 1: Check all pages render**

Navigate to each page and verify:
- `http://localhost:5010/en/services/eu/proton-mail` (overview)
- `http://localhost:5010/en/services/eu/proton-mail/pricing` (pricing)
- `http://localhost:5010/en/services/eu/proton-mail/security` (security)
- `http://localhost:5010/en/services/eu/proton-mail/vs-gmail` (comparison)

- [ ] **Step 2: Check Dutch locale**

Navigate to `http://localhost:5010/nl/services/eu/proton-mail` and verify.

- [ ] **Step 3: Run build**

```bash
pnpm --filter website build
```

- [ ] **Step 4: Final commit if any fixes needed**
