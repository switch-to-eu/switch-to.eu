import "./styles/globals.css";

import { type Metadata } from "next";
import { Geist } from "next/font/google";
import { ListChecks, Plus } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { TRPCReactProvider } from "@/lib/trpc-client";
import { Header } from "@switch-to-eu/blocks/components/header";
import { Footer } from "@switch-to-eu/blocks/components/footer";
import { Button } from "@switch-to-eu/ui/components/button";
import { BrandIndicator } from "@switch-to-eu/blocks/components/brand-indicator";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { routing } from "@switch-to-eu/i18n/routing";
import { notFound } from "next/navigation";
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
  };
}

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

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
  const currentYear = new Date().getFullYear();

  return (
    <html lang={locale} className={`${geist.variable}`}>
      <body>
        <NextIntlClientProvider>
          <TRPCReactProvider>
            <div className="min-h-screen bg-gray-50">
              <Header
                logo={
                  <Link href="/">
                    <div className="flex items-start gap-2 transition-opacity hover:opacity-80">
                      <div className="flex items-center justify-center mt-1">
                        <ListChecks className="h-4 w-4 text-primary-color" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-lg font-black text-primary-color tracking-wide uppercase sm:text-xl leading-none">Listy</span>
                        <BrandIndicator locale={locale} variant="compact" className="-mt-0.5" asSpan />
                      </div>
                    </div>
                  </Link>
                }
                navigation={
                  <div className="flex items-center gap-2">
                    <LanguageSelector locale={locale} />
                    <Link href="/about">
                      <Button variant="ghost" size="sm">
                        {t('about')}
                      </Button>
                    </Link>
                    <Link href="/create">
                      <Button size="sm">
                        <Plus className="mr-2 h-4 w-4" />
                        {t('createList')}
                      </Button>
                    </Link>
                  </div>
                }
                mobileNavigation={
                  <Link href="/create">
                    <Button size="sm">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </Link>
                }
              />
              {children}
              <Footer
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
                          className="text-teal-600 hover:text-teal-500 transition-colors font-semibold underline"
                        >
                          {chunks}
                        </a>
                      ),
                    })}{' '}
                    <a
                      href="https://www.vinnie.studio"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-teal-600 hover:text-teal-500 transition-colors font-semibold underline"
                    >
                      Studio Vinnie
                    </a>
                    {' & '}
                    <a
                      href="https://www.mvpeters.com/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-teal-600 hover:text-teal-500 transition-colors font-semibold underline"
                    >
                      MVPeters
                    </a>
                  </>
                }
                branding={<BrandIndicator locale={locale} variant="compact" asSpan />}
              />
            </div>
          </TRPCReactProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
