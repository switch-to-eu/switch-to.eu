import { generateOgImage, ogSize, ogContentType } from "@/lib/og/og-image";
import { getPayload } from "@/lib/payload";
import type { Guide } from "@/payload-types";

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

  const payload = await getPayload();
  const { docs } = await payload.find({
    collection: "guides",
    where: {
      and: [
        { _status: { equals: "published" } },
        { slug: { equals: service } },
      ],
    },
    locale: locale as "en" | "nl",
    depth: 2,
    limit: 1,
  });
  const guide = docs[0] as Guide | undefined;

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
