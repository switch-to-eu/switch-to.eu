import { generateOgImage, ogSize, ogContentType } from "@/lib/og/og-image";
import { getServiceBySlug } from "@/lib/services";

export const alt = "EU Service";
export const size = ogSize;
export const contentType = ogContentType;

const badges: Record<string, string> = {
  en: "EU Service",
  nl: "EU-dienst",
};

export default async function Image({
  params,
}: {
  params: Promise<{ locale: string; service_name: string }>;
}) {
  const { locale, service_name } = await params;
  const service = await getServiceBySlug(service_name, locale);

  if (!service) {
    return generateOgImage({
      title: "Service Not Found",
      badge: badges[locale] ?? badges.en,
    });
  }

  return generateOgImage({
    title: service.name,
    subtitle: service.description,
    badge: badges[locale] ?? badges.en,
  });
}
