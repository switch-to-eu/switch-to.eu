import { type Metadata } from "next";
import { Package } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { notFound } from "next/navigation";

import { Button } from "@switch-to-eu/ui/components/button";
import { Header } from "@switch-to-eu/blocks/components/header";
import { Footer } from "@switch-to-eu/blocks/components/footer";
import { BrandIndicator } from "@switch-to-eu/blocks/components/brand-indicator";
import { routing } from "@switch-to-eu/i18n/routing";
import { Link } from "@switch-to-eu/i18n/navigation";
import { LanguageSelector } from "@switch-to-eu/blocks/components/language-selector";

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

  const t = await getTranslations({ locale, namespace: 'layout.header' });
  const footerT = await getTranslations({ locale, namespace: 'layout.footer' });
  const toolsT = await getTranslations({ locale, namespace: 'footerTools' });
  const currentYear = new Date().getFullYear();

  return (
    <NextIntlClientProvider>
      <div className="min-h-screen bg-gray-50">
        <Header
          useContainer={false}
          containerClassName="container mx-auto px-4"
          logo={
            <Link href="/">
              <div className="flex items-start gap-2 transition-opacity hover:opacity-80">
                <div className="flex items-center justify-center mt-1">
                  <Package className="h-4 w-4 text-primary-color" />
                </div>
                <div className="flex flex-col">
                  <span className="text-lg font-black text-primary-color tracking-wide uppercase sm:text-xl leading-none">KeepFocus</span>
                  <BrandIndicator locale={locale} variant="compact" className="-mt-0.5" asSpan />
                </div>
              </div>
            </Link>
          }
          navigation={
            <div className="flex items-center gap-2">
              <LanguageSelector locale={locale} />
              <Link href="/about">
                <Button className="bg-primary hover:bg-primary/90" size="sm">
                  {t('about')}
                </Button>
              </Link>
            </div>
          }
          mobileNavigation={
            <div className="flex items-center gap-2">
              <LanguageSelector locale={locale} />
              <Link href="/about">
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90" size="sm">
                  {t('about')}
                </Button>
              </Link>
            </div>
          }
        />
        {children}
        <Footer
          useContainer={false}
          containerClassName="container mx-auto px-4"
          currentToolId="keepfocus"
          toolsSectionTitle={toolsT('sectionTitle')}
          linksSectionTitle={toolsT('linksTitle')}
          links={[
            {
              label: footerT('about'),
              href: '/about',
            },
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
          copyright={
            <>
              &copy; {footerT('copyright', { year: String(currentYear) })}{' '}
              <a
                href="https://www.vinnie.studio"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-500 transition-colors font-semibold underline"
              >
                Studio Vinnie
              </a>
              {' & '}
              <a
                href="https://www.mvpeters.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-500 transition-colors font-semibold underline"
              >
                MVPeters
              </a>
            </>
          }
          branding={
            <div className="flex flex-col gap-1">
              <span className="text-lg font-black tracking-wide uppercase text-foreground">KeepFocus</span>
              <BrandIndicator locale={locale} />
            </div>
          }
        />
      </div>
    </NextIntlClientProvider>
  );
}