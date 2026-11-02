import { generateOgImage, ogSize, ogContentType } from "@/lib/og/og-image";
import { findService } from "@/lib/content/loader";

export const alt = "Non-EU Service";
export const size = ogSize;
export const contentType = ogContentType;

const badges: Record<string, string> = {
  en: "Non-EU Service",
  nl: "Niet-EU dienst",
};

export default async function Image({
  params,
}: {
  params: Promise<{ locale: string; service_name: string }>;
}) {
  const { locale, service_name } = await params;

  const service = findService(service_name, locale);

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
