import type { Metadata } from "next";
import { generateLanguageAlternates } from "@switch-to-eu/i18n/utils";
import type { Locale } from "@switch-to-eu/i18n/routing";
import { getServiceBySlug, getCategorySlug } from "@/lib/services";

const siteUrl = process.env.NEXT_PUBLIC_URL || "https://www.switch-to.eu";

export async function generateServiceMetadata({
  serviceName,
  locale,
}: {
  serviceName: string;
  locale: string;
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
    ...(service.tags?.map((t) => t.tag) ?? []),
  ];

  const basePath = `/services/eu/${serviceName}`;

  let ogImageUrl: string | undefined;
  if (typeof service.ogImage === "object" && service.ogImage?.url) {
    ogImageUrl = service.ogImage.url.startsWith("http")
      ? service.ogImage.url
      : `${siteUrl}${service.ogImage.url}`;
  }

  return {
    title,
    description,
    keywords,
    alternates: generateLanguageAlternates(basePath.slice(1), locale as Locale),
    openGraph: {
      title,
      description,
      ...(ogImageUrl ? { images: [{ url: ogImageUrl }] } : {}),
    },
  };
}
