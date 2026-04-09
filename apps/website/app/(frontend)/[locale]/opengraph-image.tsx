import { generateOgImage, ogSize, ogContentType } from "@/lib/og/og-image";

export const alt = "Switch-to.eu";
export const size = ogSize;
export const contentType = ogContentType;

const subtitles = {
  en: "Find EU alternatives to Big Tech services",
  nl: "Vind EU-alternatieven voor Big Tech diensten",
} as const;

const titles = {
  en: "Take Control of Your Digital Services",
  nl: "Neem Controle Over Je Digitale Diensten",
} as const;

export default async function Image({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  const loc = locale as keyof typeof titles;

  return generateOgImage({
    title: titles[loc],
    subtitle: subtitles[loc],
  });
}
