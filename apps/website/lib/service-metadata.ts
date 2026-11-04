import type { Metadata, ResolvingMetadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { getServiceBySlug, getCategorySlug } from "@/lib/services";

export async function generateServiceMetadata({
  serviceName,
  locale,
  parent,
}: {
  serviceName: string;
  locale: string;
  parent: ResolvingMetadata;
}): Promise<Metadata> {
  const service = await getServiceBySlug(serviceName, locale);

  if (!service) {
    return { title: "Service Not Found" };
  }

  const name = service.name;
  const title = service.metaTitle || `${name} | switch-to.eu`;
  const description = service.metaDescription || service.description;
  const categorySlug = getCategorySlug(service.category);
  const keywords = [
    name,
    categorySlug,
    "EU service",
    "privacy-focused",
    "GDPR compliant",
    ...(service.tags ?? []),
  ];

  return {
    ...(await pageMetadata({
      parent,
      path: `services/eu/${serviceName}`,
      locale,
      title,
      description,
    })),
    keywords,
  };
}
