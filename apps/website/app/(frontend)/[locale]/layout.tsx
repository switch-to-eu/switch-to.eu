import type { Metadata } from "next";
import PlausibleProvider from "next-plausible";

import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { LanguageSwitchBanner } from "@switch-to-eu/blocks/components/language-switch-banner";
import { routing } from "@switch-to-eu/i18n/routing";
import { getLocale, getTranslations } from "next-intl/server";
import { NextIntlClientProvider } from "next-intl";
import { generateLanguageAlternates } from "@switch-to-eu/i18n/utils";


export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const t = await getTranslations("common");

  const title = t("title");
  const description = t("description");

  // Default to localhost if NEXT_PUBLIC_URL is not defined
  const baseUrl = process.env.NEXT_PUBLIC_URL || "http://localhost:5010";

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
    alternates: generateLanguageAlternates("", locale),
    openGraph: {
      type: "website",
      siteName: title,
      description,
      locale: locale,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

// Generate the static params for all supported locales
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  await params;

  const siteUrl = process.env.NEXT_PUBLIC_URL || "https://www.switch-to.eu";

  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "switch-to.eu",
    url: siteUrl,
    logo: `${siteUrl}/favicon/favicon.svg`,
    sameAs: ["https://github.com/switch-to-eu"],
  };

  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "switch-to.eu",
    url: siteUrl,
  };

  return (
    <PlausibleProvider domain="www.switch-to.eu">
      <NextIntlClientProvider>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationJsonLd),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(websiteJsonLd),
          }}
        />
        <LanguageSwitchBanner />
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </NextIntlClientProvider>
    </PlausibleProvider>
  );
}
