import "./styles/globals.css";

import { type Metadata } from "next";
import { fontVariables } from "@switch-to-eu/ui/fonts";
import { KanbanSquare, Plus } from "lucide-react";
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
import { type MainNavItem } from "@switch-to-eu/blocks/components/nav-types";
import { HeaderFeedback } from "@switch-to-eu/blocks/components/header-feedback";

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
  const currentYear = new Date().getFullYear();

  const navItems: MainNavItem[] = [
    { title: navT('about'), href: '/about' },
  ];

  return (
    <html lang={locale} className={fontVariables}>
      <body>
        <NextIntlClientProvider>
          <TRPCReactProvider>
            <div className="min-h-screen bg-muted">
              <Header
                logo={
                  <Link href="/">
                    <div className="flex items-start gap-2 transition-opacity hover:opacity-80">
                      <div className="flex items-center justify-center mt-1">
                        <KanbanSquare className="h-4 w-4 text-tool-primary-foreground" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-lg font-black text-tool-primary-foreground tracking-wide uppercase sm:text-xl leading-none">Kanban</span>
                        <BrandIndicator locale={locale} variant="compact" className="-mt-0.5" asSpan />
                      </div>
                    </div>
                  </Link>
                }
                navigation={
                  <>
                    <NavMenu navItems={navItems} />
                    <NavLanguageSelector locale={locale as Locale} />
                    <HeaderFeedback toolId="kanban" />
                    <Link href="/create">
                      <Button size="sm" variant="secondary">
                        <Plus className="mr-2 h-4 w-4" />
                        {t('createBoard')}
                      </Button>
                    </Link>
                  </>
                }
                mobileNavigation={
                  <MobileNav navItems={navItems} locale={locale as Locale}>
                    <HeaderFeedback toolId="kanban" />
                    <Link href="/create">
                      <Button size="sm" variant="secondary" className="w-full">
                        <Plus className="mr-2 h-4 w-4" />
                        {t('createBoard')}
                      </Button>
                    </Link>
                  </MobileNav>
                }
              />
              {children}
              <Footer
                currentToolId="kanban"
                feedbackToolId="kanban"
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
                copyright={
                  <>
                    &copy; {footerT.rich('copyright', {
                      year: String(currentYear),
                      link: (chunks) => (
                        <a
                          href="https://switch-to.eu"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-tool-primary-foreground/70 hover:text-brand-yellow transition-colors font-semibold underline"
                        >
                          {chunks}
                        </a>
                      ),
                    })}{' '}
                    <a
                      href="https://www.vinnie.studio"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-tool-primary-foreground/70 hover:text-brand-yellow transition-colors font-semibold underline"
                    >
                      Studio Vinnie
                    </a>
                    {' & '}
                    <a
                      href="https://www.mvpeters.com/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-tool-primary-foreground/70 hover:text-brand-yellow transition-colors font-semibold underline"
                    >
                      MVPeters
                    </a>
                  </>
                }
                branding={
                  <div className="flex flex-col gap-1">
                    <span className="text-lg font-black tracking-wide uppercase text-tool-primary-foreground">Kanban</span>
                    <BrandIndicator locale={locale} />
                  </div>
                }
              />
            </div>
          </TRPCReactProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
