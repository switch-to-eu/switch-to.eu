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

  // Build description
  let description: string;
  switch (section) {
    case "pricing":
      description = `Compare ${name} free and paid plans. See what you get at each tier.`;
      break;
    case "security":
      description = `${name} security details: encryption, GDPR compliance, data storage, certifications.`;
      break;
    case "comparison":
      description = `Compare ${name} and ${comparisonServiceName}. Privacy, pricing, and features side by side.`;
      break;
    case "overview":
    default:
      description = service.description;
      break;
  }

  // Build keywords (overview only)
  let keywords: string[] | undefined;
  if (section === "overview") {
    const categorySlug = getCategorySlug(service.category);
    keywords = [
      name,
      categorySlug,
      "EU service",
      "privacy-focused",
      "GDPR compliant",
      ...(service.tags?.map((t) => t.tag) ?? []),
    ];
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
