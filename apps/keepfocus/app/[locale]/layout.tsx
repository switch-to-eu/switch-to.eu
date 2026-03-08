import { type Metadata } from "next";
import { Package } from "lucide-react";
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
import { getAllToolsSorted } from "@switch-to-eu/blocks/data/tools";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  const t = await getTranslations({ locale, namespace: 'layout.metadata' });

  return {
    title: t('title'),
    description: t('description'),
    icons: [
      { rel: "icon", url: "/favicon-96x96.png", sizes: "96x96", type: "image/png" },
      { rel: "icon", url: "/favicon.svg", type: "image/svg+xml" },
      { rel: "shortcut icon", url: "/favicon.ico" },
      { rel: "apple-touch-icon", url: "/apple-touch-icon.png", sizes: "180x180" },
    ],
    manifest: "/site.webmanifest",
    appleWebApp: {
      title: t('title'),
    },
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

  const navT = await getTranslations({ locale, namespace: 'layout.nav' });
  const footerT = await getTranslations({ locale, namespace: 'layout.footer' });
  const toolsT = await getTranslations({ locale, namespace: 'footerTools' });


  const allTools = getAllToolsSorted();
  const navItems: MainNavItem[] = [
    {
      title: navT('tools'),
      dropdown: 'mega',
      children: allTools
        .filter(tool => tool.id !== 'keepfocus')
        .map(tool => ({
          title: tool.name,
          href: tool.url,
          description: toolsT(tool.id as Parameters<typeof toolsT>[0]),
          icon: tool.icon,
          isExternal: true,
          disabled: tool.status !== 'active',
        })),
    },
  ];

  return (
    <NextIntlClientProvider>
      <div className="min-h-screen bg-muted">
        <Header
          logo={
            <Link href="/">
              <div className="flex items-start gap-2 transition-opacity hover:opacity-80">
                <div className="flex items-center justify-center mt-1">
                  <Package className="h-4 w-4 text-tool-primary" />
                </div>
                <div className="flex flex-col">
                  <span className="text-lg font-black text-tool-primary tracking-wide uppercase sm:text-xl leading-none">KeepFocus</span>
                  <BrandIndicator locale={locale} variant="compact" className="-mt-0.5" asSpan />
                </div>
              </div>
            </Link>
          }
          navigation={
            <>
              <NavMenu navItems={navItems} />
              <NavLanguageSelector locale={locale as Locale} />
            </>
          }
          mobileNavigation={
            <MobileNav navItems={navItems} locale={locale as Locale} />
          }
        />
        {children}
        <HeaderFeedback toolId="keepfocus" />
        <Footer
          currentToolId="keepfocus"
          feedbackToolId="keepfocus"
          toolsSectionTitle={toolsT('sectionTitle')}
          linksSectionTitle={toolsT('linksTitle')}
          links={[
            {
              label: footerT('privacy'),
              href: 'https://switch-to.eu/privacy',
              external: true,
            },
            {
              label: footerT('terms'),
              href: 'https://switch-to.eu/terms',
              external: true,
            },
          ]}
          branding={
            <div className="flex flex-col gap-1">
              <span className="text-lg font-black tracking-wide uppercase text-white">KeepFocus</span>
              <BrandIndicator locale={locale} />
            </div>
          }
        />
      </div>
    </NextIntlClientProvider>
  );
}