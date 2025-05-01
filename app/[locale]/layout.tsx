import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import "../globals.css";

import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { routing } from "@/i18n/routing";
import { getLocale, getTranslations } from "next-intl/server";

// Keep Geist Mono for code blocks
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const t = await getTranslations("common");

  const title = t("title");
  const description = t("description");
  return {
    title,
    description,
    alternates: {
      canonical: "/",
      languages: {
        en: "https://switch-to.eu/en",
        nl: "https://switch-to.eu/nl",
      },
    },
    openGraph: {
      images: [
        {
          url: "/images/share.png",
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      type: "website",
      siteName: title,
      description,
      locale: locale,
    },
    twitter: {
      card: "summary_large_image",
      images: ["/images/share.png"],
      title,
      description,
    },
  };
}

// Generate the static params for all supported locales
export async function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Header />

      <main className={`flex-1 ${geistMono.variable}`}>{children}</main>
      <Footer />
    </>
  );
}
