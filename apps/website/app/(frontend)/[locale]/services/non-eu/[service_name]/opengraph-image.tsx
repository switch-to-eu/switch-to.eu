import { generateOgImage, ogSize, ogContentType } from "@/lib/og/og-image";
import { getPayload } from "@/lib/payload";
import type { Service } from "@/payload-types";

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

  const payload = await getPayload();
  const { docs } = await payload.find({
    collection: "services",
    where: {
      and: [
        { _status: { equals: "published" } },
        { slug: { equals: service_name } },
      ],
    },
    locale: locale as "en" | "nl",
    depth: 0,
    limit: 1,
  });
  const service = docs[0] as Service | undefined;

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
