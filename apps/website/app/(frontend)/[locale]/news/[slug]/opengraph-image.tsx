import { generateOgImage, ogSize, ogContentType } from "@/lib/og/og-image";
import { findArticle } from "@/lib/content/loader";

export const alt = "News";
export const size = ogSize;
export const contentType = ogContentType;

const badges: Record<string, string> = {
  en: "News",
  nl: "Nieuws",
};

export default async function Image({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const article = findArticle(slug, locale);

  return generateOgImage({
    title: article?.title ?? "Article Not Found",
    subtitle: article?.description,
    badge: badges[locale] ?? badges.en,
  });
}
