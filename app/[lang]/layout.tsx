import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import "../globals.css";
import Script from "next/script";
import { locales } from "@/middleware";

import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import {
  bricolageGrotesqueExtraBold,
  hankenGroteskSemiBold,
  hankenGroteskBold,
  hankenGroteskBoldItalic,
  hankenGroteskSemiBoldItalic
} from "../fonts";
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

  // Get the dictionary for the current locale
  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Switch-to.EU",
    "url": `https://switch-to.eu/${lang}`,
    "description": "A guide to help you switch from non-EU to EU-based digital services and products.",
    "inLanguage": lang,
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `https://switch-to.eu/${lang}/search?q={search_term_string}`
      },
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <html lang={lang} suppressHydrationWarning>
      <head>
        <Script
          id="website-jsonld"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
      </head>
      <body
        className={`${bricolageGrotesqueExtraBold.variable} ${hankenGroteskSemiBold.variable} ${hankenGroteskBold.variable} ${hankenGroteskBoldItalic.variable} ${hankenGroteskSemiBoldItalic.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
      >
        <Header lang={lang} />
        <main className="flex-1">{children}</main>
        <Footer lang={lang} />
      </body>
    </html>
  );
}