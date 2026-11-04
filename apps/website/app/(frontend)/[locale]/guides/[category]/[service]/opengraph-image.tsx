import { generateOgImage, ogSize, ogContentType } from "@switch-to-eu/blocks/og/og-image";
import { findGuide } from "@/lib/content/loader";

export const alt = "Migration Guide";
export const size = ogSize;
export const contentType = ogContentType;

const badges: Record<string, string> = {
  en: "Migration Guide",
  nl: "Migratiegids",
};

export default async function Image({
  params,
}: {
  params: Promise<{ locale: string; category: string; service: string }>;
}) {
  const { locale, service } = await params;

  const guide = findGuide(service, locale);

  if (!guide) {
    return generateOgImage({
      title: "Guide Not Found",
      badge: badges[locale] ?? badges.en,
    });
  }

  return generateOgImage({
    title: guide.title,
    subtitle: guide.description ?? undefined,
    badge: badges[locale] ?? badges.en,
  });
}
