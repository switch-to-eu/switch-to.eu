import type { Metadata } from "next";
import { Globe } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { notFound } from "next/navigation";

import { Header } from "@switch-to-eu/blocks/components/header";
import { Footer } from "@switch-to-eu/blocks/components/footer";
import { BrandIndicator } from "@switch-to-eu/blocks/components/brand-indicator";
import { routing, type Locale } from "@switch-to-eu/i18n/routing";
import { Link } from "@switch-to-eu/i18n/navigation";
import { NavLanguageSelector } from "@switch-to-eu/blocks/components/nav-language-selector";
import { NavMenu } from "@switch-to-eu/blocks/components/nav-menu";
import { MobileNav } from "@switch-to-eu/blocks/components/mobile-nav";
import type { MainNavItem } from "@switch-to-eu/blocks/components/nav-types";
import { HeaderFeedback } from "@switch-to-eu/blocks/components/header-feedback";
import { TRPCReactProvider } from "@/lib/trpc-client";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  const t = await getTranslations({ locale, namespace: "layout.metadata" });

  return {
    title: t("title"),
    description: t("description"),
  };
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  const navT = await getTranslations({ locale, namespace: 'layout.nav' });
  const footerT = await getTranslations({
    locale,
    namespace: "layout.footer",
  });


  const navItems: MainNavItem[] = [];

  return (
    <NextIntlClientProvider>
      <TRPCReactProvider>
      <Header
        logo={
          <Link href="/">
            <div className="flex items-start gap-2 transition-opacity hover:opacity-80">
              <div className="flex items-center justify-center mt-1">
                <Globe className="h-4 w-4 text-tool-primary" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-black text-tool-primary tracking-wide uppercase sm:text-xl leading-none">
                  EU-Scan
                </span>
                <BrandIndicator
                  locale={locale}
                  variant="compact"
                  className="-mt-0.5"
                  asSpan
                />
              </div>
            </div>
          </Link>
        }
        navigation={
          <>
            <NavMenu navItems={navItems} />
            <NavLanguageSelector locale={locale as Locale} />
            <HeaderFeedback toolId="eu-scan" />
          </>
        }
        mobileNavigation={
          <MobileNav navItems={navItems} locale={locale as Locale}>
            <HeaderFeedback toolId="eu-scan" />
          </MobileNav>
        }
      />
      <main className="flex-1">{children}</main>
      <Footer
        feedbackToolId="eu-scan"
        links={[
          {
            label: footerT("privacy"),
            href: "https://switch-to.eu/privacy",
            external: true,
          },
          {
            label: footerT("terms"),
            href: "https://switch-to.eu/terms",
            external: true,
          },
        ]}
        branding={
          <BrandIndicator locale={locale} variant="compact" asSpan />
        }
      />
      </TRPCReactProvider>
    </NextIntlClientProvider>
  );
}
