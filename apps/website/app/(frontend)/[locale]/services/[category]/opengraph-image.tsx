import { generateOgImage, ogSize, ogContentType } from "@switch-to-eu/blocks/og/og-image";
import { findCategory } from "@/lib/content/loader";

export const alt = "EU alternatives";
export const size = ogSize;
export const contentType = ogContentType;

const badges: Record<string, string> = {
  en: "EU alternatives",
  nl: "EU-alternatieven",
};

export default async function Image({
  params,
}: {
  params: Promise<{ locale: string; category: string }>;
}) {
  const { locale, category } = await params;

  const categoryDoc = findCategory(category, locale);

  return generateOgImage({
    title: categoryDoc?.title ?? category,
    subtitle: categoryDoc?.description,
    badge: badges[locale] ?? badges.en,
  });
}
