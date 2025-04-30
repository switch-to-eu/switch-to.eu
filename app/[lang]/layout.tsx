import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import "../globals.css";
import { locales } from "@/middleware";

import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { Locale } from "@/lib/i18n/dictionaries";

// Keep Geist Mono for code blocks
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}): Promise<Metadata> {
  const { lang } = await params;

  // Get the dictionary for the current locale
  const dict = await getDictionary(lang);

  return {
    title: dict.common.title,
    description: dict.common.description,
    alternates: {
      canonical: '/',
      languages: {
        'en': 'https://switch-to.eu/en',
        'nl': 'https://switch-to.eu/nl',
      },
    },
  };
}

// Generate the static params for all supported locales
export async function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ lang: Locale }>;
}>) {
  const { lang } = await params;


  return (
    <>
      <Header lang={lang} />
      <main className={`flex-1 ${geistMono.variable}`}>{children}</main>
      <Footer lang={lang} />
    </>
  );
}