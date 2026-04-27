import { type Metadata } from "next";
import { Calendar, Plus } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { TRPCReactProvider } from "@/lib/trpc-client";
import { Header } from "@switch-to-eu/blocks/components/header";
import { Footer } from "@switch-to-eu/blocks/components/footer";
import { Button } from "@switch-to-eu/ui/components/button";
import { BrandIndicator } from "@switch-to-eu/blocks/components/brand-indicator";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { routing, type Locale } from "@switch-to-eu/i18n/routing";
import { notFound } from "next/navigation";
import { Link } from "@switch-to-eu/i18n/navigation";
import { NavLanguageSelector } from "@switch-to-eu/blocks/components/nav-language-selector";
import { NavMenu } from "@switch-to-eu/blocks/components/nav-menu";
import { MobileNav } from "@switch-to-eu/blocks/components/mobile-nav";
import type { MainNavItem } from "@switch-to-eu/blocks/components/nav-types";
import { HeaderFeedback } from "@switch-to-eu/blocks/components/header-feedback";
import { generateLanguageAlternates } from "@switch-to-eu/i18n/utils";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  const t = await getTranslations({ locale, namespace: 'layout.metadata' });

  const baseUrl = process.env.NEXT_PUBLIC_URL || "https://poll.switch-to.eu";

  return {
    metadataBase: new URL(baseUrl),
    title: t('title'),
    description: t('description'),
    icons: {
      icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
    },
    alternates: generateLanguageAlternates("", locale as Locale),
  };
}

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  const t = await getTranslations({ locale, namespace: 'layout.header' });
  const navT = await getTranslations({ locale, namespace: 'layout.nav' });
  const footerT = await getTranslations({ locale, namespace: 'layout.footer' });
  const toolsT = await getTranslations({ locale, namespace: 'footerTools' });


  const navItems: MainNavItem[] = [
    { title: navT('about'), href: '/about' },
  ];

  return (
    <NextIntlClientProvider>
      <TRPCReactProvider>
        <div className="min-h-screen bg-muted">
          <Header
            logo={
              <Link href="/">
                <div className="flex items-start gap-2 transition-opacity hover:opacity-80">
                  <div className="flex items-center justify-center mt-1">
                    <Calendar className="h-4 w-4 text-tool-primary" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-lg font-black text-tool-primary tracking-wide uppercase sm:text-xl leading-none">Plotty</span>
                    <BrandIndicator locale={locale} variant="compact" className="-mt-0.5" asSpan />
                  </div>
                </div>
              </Link>
            }
            navigation={
              <>
                <NavMenu navItems={navItems} />
                <Link href="/create">
                  <Button size="sm" variant="secondary">
                    <Plus className="mr-2 h-4 w-4" />
                    {t('createPoll')}
                  </Button>
                </Link>
                <NavLanguageSelector locale={locale as Locale} />
              </>
            }
            mobileNavigation={
              <MobileNav navItems={navItems} locale={locale as Locale}>
                <Link href="/create">
                  <Button size="sm" variant="secondary" className="w-full">
                    <Plus className="mr-2 h-4 w-4" />
                    {t('createPoll')}
                  </Button>
                </Link>
              </MobileNav>
            }
          />
          {children}
          <HeaderFeedback toolId="plotty" />
          <Footer
            currentToolId="plotty"
            feedbackToolId="plotty"
            toolsSectionTitle={toolsT('sectionTitle')}
            linksSectionTitle={toolsT('linksTitle')}
            links={[
              {
                label: footerT('about'),
                href: '/about',
              },
              {
                label: footerT('privacy'),
                href: '/privacy',
              },
            ]}
            branding={
              <div className="flex flex-col gap-1">
                <span className="text-lg font-black tracking-wide uppercase text-white">Plotty</span>
                <BrandIndicator locale={locale} />
              </div>
            }
          />
        </div>
      </TRPCReactProvider>
    </NextIntlClientProvider>
  );
}
