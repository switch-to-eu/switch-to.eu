import { generateOgImage, ogSize, ogContentType } from "@/lib/og/og-image";

export const alt = "Switch-to.eu";
export const size = ogSize;
export const contentType = ogContentType;

const subtitles: Record<string, string> = {
  en: "Find EU alternatives to Big Tech services",
  nl: "Vind EU-alternatieven voor Big Tech diensten",
};

const titles: Record<string, string> = {
  en: "Take Control of Your Digital Services",
  nl: "Neem Controle Over Je Digitale Diensten",
};

export default async function Image({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return generateOgImage({
    title: titles[locale] ?? titles.en,
    subtitle: subtitles[locale] ?? subtitles.en,
  });
}
