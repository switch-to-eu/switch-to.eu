/**
 * Shared helpers for generating LLM-friendly markdown from Payload CMS content.
 * Used by /llms.txt and individual .md route handlers.
 */

import type { Service, Guide, Category } from "@/payload-types";
import { lexicalToMarkdown } from "./lexical-to-markdown";
import { getGdprLabel } from "./services";

const BASE_URL = process.env.NEXT_PUBLIC_URL ?? "https://www.switch-to.eu";

// ---------------------------------------------------------------------------
// Service → Markdown
// ---------------------------------------------------------------------------

export function serviceToMarkdown(service: Service): string {
  const lines: string[] = [];

  lines.push(`# ${service.name}`);
  lines.push("");
  lines.push(`> ${service.description}`);
  lines.push("");

  // Metadata
  lines.push(`- **Based in**: ${service.location}`);
  lines.push(`- **Website**: ${service.url}`);

  const freeLabel = service.freeOption ? "Yes" : "No";
  const priceNote = service.startingPrice
    ? ` · From ${service.startingPrice}`
    : "";
  lines.push(`- **Free option**: ${freeLabel}${priceNote}`);

  const gdpr = getGdprLabel(service.gdprCompliance);
  if (gdpr) lines.push(`- **GDPR**: ${gdpr}`);

  if (service.openSource) {
    const srcLink = service.sourceCodeUrl
      ? ` ([source](${service.sourceCodeUrl}))`
      : "";
    lines.push(`- **Open source**: Yes${srcLink}`);
  }

  if (service.headquarters) {
    lines.push(`- **Headquarters**: ${service.headquarters}`);
  }
  if (service.foundedYear) {
    lines.push(`- **Founded**: ${service.foundedYear}`);
  }

  lines.push("");

  // Features
  if (service.features && service.features.length > 0) {
    lines.push("## Features");
    lines.push("");
    for (const f of service.features) {
      lines.push(`- ${f.feature}`);
    }
    lines.push("");
  }

  // Main content
  const content = lexicalToMarkdown(service.content as Parameters<typeof lexicalToMarkdown>[0]);
  if (content) {
    lines.push("## About");
    lines.push("");
    lines.push(content);
    lines.push("");
  }

  // Issues (non-EU services)
  if (service.issues && service.issues.length > 0) {
    lines.push("## Known Issues");
    lines.push("");
    for (const issue of service.issues) {
      lines.push(`- ${issue.issue}`);
    }
    lines.push("");
  }

  // Data storage locations
  if (service.dataStorageLocations && service.dataStorageLocations.length > 0) {
    lines.push("## Data Storage");
    lines.push("");
    for (const loc of service.dataStorageLocations) {
      lines.push(`- ${loc.location}`);
    }
    lines.push("");
  }

  // Certifications
  if (service.certifications && service.certifications.length > 0) {
    lines.push("## Certifications");
    lines.push("");
    for (const cert of service.certifications) {
      lines.push(`- ${cert.certification}`);
    }
    lines.push("");
  }

  return lines.join("\n").trim();
}

// ---------------------------------------------------------------------------
// Guide → Markdown
// ---------------------------------------------------------------------------

export function guideToMarkdown(guide: Guide): string {
  const lines: string[] = [];

  lines.push(`# ${guide.title}`);
  lines.push("");
  lines.push(`> ${guide.description}`);
  lines.push("");

  // Metadata
  lines.push(`- **Difficulty**: ${guide.difficulty}`);
  lines.push(`- **Time required**: ${guide.timeRequired}`);

  const source =
    typeof guide.sourceService === "object"
      ? guide.sourceService.name
      : null;
  const target =
    typeof guide.targetService === "object"
      ? guide.targetService.name
      : null;
  if (source) lines.push(`- **From**: ${source}`);
  if (target) lines.push(`- **To**: ${target}`);

  lines.push("");

  // Intro
  const intro = lexicalToMarkdown(guide.intro as Parameters<typeof lexicalToMarkdown>[0]);
  if (intro) {
    lines.push("## Why switch?");
    lines.push("");
    lines.push(intro);
    lines.push("");
  }

  // Before you start
  const before = lexicalToMarkdown(guide.beforeYouStart as Parameters<typeof lexicalToMarkdown>[0]);
  if (before) {
    lines.push("## Before you start");
    lines.push("");
    lines.push(before);
    lines.push("");
  }

  // Steps
  if (guide.steps && guide.steps.length > 0) {
    lines.push("## Steps");
    lines.push("");
    for (let i = 0; i < guide.steps.length; i++) {
      const step = guide.steps[i]!;
      lines.push(`### Step ${i + 1}: ${step.title}`);
      lines.push("");
      const stepContent = lexicalToMarkdown(step.content as Parameters<typeof lexicalToMarkdown>[0]);
      if (stepContent) {
        lines.push(stepContent);
        lines.push("");
      }
    }
  }

  // Missing features
  if (guide.missingFeatures && guide.missingFeatures.length > 0) {
    lines.push("## Features you might miss");
    lines.push("");
    for (const mf of guide.missingFeatures) {
      lines.push(`- ${mf.feature}`);
    }
    lines.push("");
  }

  // Troubleshooting
  const troubleshooting = lexicalToMarkdown(
    guide.troubleshooting   );
  if (troubleshooting) {
    lines.push("## Troubleshooting");
    lines.push("");
    lines.push(troubleshooting);
    lines.push("");
  }

  // Outro
  const outro = lexicalToMarkdown(guide.outro as Parameters<typeof lexicalToMarkdown>[0]);
  if (outro) {
    lines.push("## Next steps");
    lines.push("");
    lines.push(outro);
    lines.push("");
  }

  return lines.join("\n").trim();
}

// ---------------------------------------------------------------------------
// Index (llms.txt) builder
// ---------------------------------------------------------------------------

export function buildLlmsIndex(
  categories: Category[],
  services: Service[],
  guides: Guide[]
): string {
  const lines: string[] = [];

  lines.push("# switch-to.eu");
  lines.push(
    "> European alternatives to Big Tech services. Honest reviews, privacy research, GDPR compliance checks, and step-by-step migration guides."
  );
  lines.push("");
  lines.push(
    "switch-to.eu helps people switch from mainstream Big Tech services to European digital alternatives. Each service listing includes privacy research, pricing, GDPR compliance status, and honest trade-offs. Each migration guide includes step-by-step instructions, time estimates, and troubleshooting."
  );
  lines.push("");

  // Core pages
  lines.push("## Core pages");
  lines.push("");
  lines.push(`- [Home](${BASE_URL}/en): Browse EU alternatives and migration guides`);
  lines.push(`- [About](${BASE_URL}/en/about): Mission and story behind switch-to.eu`);
  lines.push(`- [Tools](${BASE_URL}/en/tools): Free privacy-focused tools built in the EU`);
  lines.push(`- [Search](${BASE_URL}/en/search): Search all services and guides`);
  lines.push(`- [Contribute](${BASE_URL}/en/contribute): Help improve switch-to.eu`);
  lines.push("");

  // Categories (top-level landing pages for each service category)
  if (categories.length > 0) {
    lines.push("## Service categories");
    lines.push("");
    for (const c of categories) {
      lines.push(`- [${c.title}](${BASE_URL}/en/services/${c.slug}): ${c.description}`);
    }
    lines.push("");
  }

  // EU & EU-friendly services (one link each, no sub-links)
  const eu = services.filter(
    (s) => s.region === "eu" || s.region === "eu-friendly"
  );

  if (eu.length > 0) {
    lines.push("## EU services");
    lines.push("");
    const grouped = groupByCategory(eu);
    for (const [categoryName, items] of grouped) {
      lines.push(`### ${categoryName}`);
      lines.push("");
      for (const s of items) {
        const gdpr = getGdprLabel(s.gdprCompliance);
        const meta: string[] = [];
        if (s.location) meta.push(s.location);
        if (gdpr) meta.push(`GDPR: ${gdpr}`);
        if (s.freeOption) meta.push("free tier available");
        const suffix = meta.length > 0 ? ` (${meta.join(", ")})` : "";
        lines.push(
          `- [${s.name}](${BASE_URL}/en/services/eu/${s.slug}): ${s.description}${suffix}`
        );
      }
      lines.push("");
    }
  }

  // Migration guides (one link each, no sub-links)
  if (guides.length > 0) {
    lines.push("## Migration guides");
    lines.push("");
    const grouped = groupGuidesByCategory(guides);
    for (const [categoryName, items] of grouped) {
      lines.push(`### ${categoryName}`);
      lines.push("");
      for (const g of items) {
        const source =
          typeof g.sourceService === "object" ? g.sourceService.name : null;
        const target =
          typeof g.targetService === "object" ? g.targetService.name : null;
        const catSlug =
          typeof g.category === "object" ? g.category.slug : "uncategorized";
        const meta = [`${g.difficulty}`, g.timeRequired].join(", ");
        const label = source && target ? `${source} → ${target}` : g.title;
        lines.push(
          `- [${label}](${BASE_URL}/en/guides/${catSlug}/${g.slug}): ${g.description} (${meta})`
        );
      }
      lines.push("");
    }
  }

  return lines.join("\n").trim();
}

function groupByCategory(services: Service[]): [string, Service[]][] {
  const map = new Map<string, Service[]>();
  for (const s of services) {
    const name =
      typeof s.category === "object" ? s.category.title : "Other";
    const list = map.get(name) ?? [];
    list.push(s);
    map.set(name, list);
  }
  return [...map.entries()];
}

function groupGuidesByCategory(guides: Guide[]): [string, Guide[]][] {
  const map = new Map<string, Guide[]>();
  for (const g of guides) {
    const name =
      typeof g.category === "object" ? g.category.title : "Other";
    const list = map.get(name) ?? [];
    list.push(g);
    map.set(name, list);
  }
  return [...map.entries()];
}
