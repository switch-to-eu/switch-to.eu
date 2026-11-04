import type { Metadata } from "next";
import PlausibleProvider from "next-plausible";

import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { JsonLd } from "@/components/JsonLd";
import { routing } from "@switch-to-eu/i18n/routing";
import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { hasLocale, NextIntlClientProvider } from "next-intl";
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
      siteName: "switch-to.eu",
      description,
      locale: locale,
    },
    // Next.js fills the title, description and image from `openGraph`.
    twitter: {
      card: "summary_large_image",
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
  // The proxy matcher skips paths with a dot, so this segment can hold any value.
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  const skipLabel = (await getTranslations("common"))("skipToContent");

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
    <PlausibleProvider src="https://plausible.io/js/pa-DeH7r_C_YnnJNew1CLX5I.js">
      <NextIntlClientProvider>
        <JsonLd data={organizationJsonLd} />
        <JsonLd data={websiteJsonLd} />
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-full focus:bg-brand-green focus:px-5 focus:py-2.5 focus:text-white focus:font-semibold focus:outline-solid focus:outline-2 focus:outline-offset-2 focus:outline-brand-yellow"
        >
          {skipLabel}
        </a>
        <Header />
        {/* Pages render their own <main> (PageLayout). This wrapper is the skip-link target. */}
        <div id="main-content" tabIndex={-1} className="flex-1 flex flex-col outline-none">
          {children}
        </div>
        <Footer />
      </NextIntlClientProvider>
    </PlausibleProvider>
  );
}
