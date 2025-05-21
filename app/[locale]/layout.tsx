import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import "../globals.css";
import PlausibleProvider from "next-plausible";

import {
  bricolageGrotesqueExtraBold,
  hankenGroteskSemiBold,
  hankenGroteskBold,
  hankenGroteskBoldItalic,
  hankenGroteskSemiBoldItalic,
} from "../fonts";

import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { routing } from "@/i18n/routing";
import { getLocale, getTranslations } from "next-intl/server";
import { NextIntlClientProvider, Locale } from "next-intl";
import { generateLanguageAlternates } from "@/lib/utils";

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

  // Default to localhost if NEXT_PUBLIC_URL is not defined
  const baseUrl = process.env.NEXT_PUBLIC_URL!;

  return {
    metadataBase: new URL(baseUrl),
    title,
    description,
    icons: {
      icon: [
        { url: "/favicon/favicon.svg", type: "image/svg+xml" },
        {
          url: "/favicon/favicon-96x96.png",
          sizes: "96x96",
          type: "image/png",
        },
      ],
      apple: [{ url: "/favicon/apple-touch-icon.png" }],
      other: [
        {
          rel: "manifest",
          url: "/favicon/site.webmanifest",
        },
      ],
    },
    alternates: generateLanguageAlternates("", baseUrl),
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

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: Locale }>;
}>) {
  const { locale } = await params;

  return (
    <html lang={locale}>
      <PlausibleProvider domain="switch-to.eu">
        <body
          className={`${bricolageGrotesqueExtraBold.variable} ${hankenGroteskSemiBold.variable} ${hankenGroteskBold.variable} ${hankenGroteskBoldItalic.variable} ${hankenGroteskSemiBoldItalic.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
        >
          <NextIntlClientProvider>
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </NextIntlClientProvider>
        </body>
      </PlausibleProvider>
    </html>
  );
}
