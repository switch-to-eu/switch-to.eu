import type { Metadata } from "next";
import { getServiceBySlug, getCategorySlug } from "@/lib/services";

export async function generateServiceMetadata({
  serviceName,
  locale,
  section = "overview",
  comparisonServiceName,
}: {
  serviceName: string;
  locale: string;
  section?: "overview" | "pricing" | "security" | "comparison";
  comparisonServiceName?: string;
}): Promise<Metadata> {
  const service = await getServiceBySlug(serviceName, locale);

  if (!service) {
    return { title: "Service Not Found" };
  }

  const name = service.name;

  // Build title
  let title: string;
  switch (section) {
    case "pricing":
      title = `${name} Pricing | switch-to.eu`;
      break;
    case "security":
      title = `${name} Security & Privacy | switch-to.eu`;
      break;
    case "comparison":
      title = `${name} vs ${comparisonServiceName} | switch-to.eu`;
      break;
    case "overview":
    default:
      title = `${name} | EU Service | switch-to.eu`;
      break;
  }

  // Build description — use real data when available
  let description: string;
  switch (section) {
    case "pricing": {
      const parts: string[] = [];
      if (service.freeOption) parts.push("free plan available");
      if (service.startingPrice) parts.push(`paid plans from ${service.startingPrice}`);
      const tierCount = service.pricingTiers?.length ?? 0;
      if (tierCount > 0) parts.push(`${tierCount} tiers`);
      description = parts.length > 0
        ? `${name} pricing: ${parts.join(", ")}. Full breakdown of plans, features, and limits.`
        : `Compare ${name} free and paid plans. See what you get at each tier.`;
      break;
    }
    case "security": {
      const parts: string[] = [];
      if (service.gdprCompliance === "compliant") parts.push("GDPR compliant");
      const certs = service.certifications?.map((c) => c.certification.split(" (")[0]) ?? [];
      if (certs.length > 0) parts.push(certs.slice(0, 2).join(", "));
      const locations = service.dataStorageLocations?.map((l) => l.location) ?? [];
      if (locations.length > 0) parts.push(`data stored in ${locations.join(", ")}`);
      description = parts.length > 0
        ? `${name} security: ${parts.join(". ")}. Full privacy and compliance details.`
        : `${name} security details: encryption, GDPR compliance, data storage, certifications.`;
      break;
    }
    case "comparison":
      description = `Compare ${name} and ${comparisonServiceName}. Privacy, pricing, and features side by side.`;
      break;
    case "overview":
    default:
      description = service.description;
      break;
  }

  // Build keywords per section
  let keywords: string[] | undefined;
  const categorySlug = getCategorySlug(service.category);
  switch (section) {
    case "pricing":
      keywords = [name, "pricing", "plans", "free plan", categorySlug, "EU service"];
      break;
    case "security":
      keywords = [name, "security", "privacy", "GDPR", "data protection", categorySlug, "EU service"];
      break;
    case "comparison":
      keywords = [name, comparisonServiceName ?? "", "comparison", "vs", "alternative", "EU service", "privacy"];
      break;
    case "overview":
    default:
      keywords = [
        name,
        categorySlug,
        "EU service",
        "privacy-focused",
        "GDPR compliant",
        ...(service.tags?.map((t) => t.tag) ?? []),
      ];
      break;
  }

  // Build path suffix per section
  let pathSuffix: string;
  switch (section) {
    case "pricing":
      pathSuffix = "/pricing";
      break;
    case "security":
      pathSuffix = "/security";
      break;
    case "comparison":
      pathSuffix = `/vs-${comparisonServiceName}`;
      break;
    case "overview":
    default:
      pathSuffix = "";
      break;
  }

  const basePath = `/services/eu/${serviceName}${pathSuffix}`;

  return {
    title,
    description,
    ...(keywords ? { keywords } : {}),
    alternates: {
      canonical: `https://switch-to.eu/${locale}${basePath}`,
      languages: {
        en: `https://switch-to.eu/en${basePath}`,
        nl: `https://switch-to.eu/nl${basePath}`,
      },
    },
  };
}
