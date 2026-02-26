import type { Metadata } from "next";
import { Globe } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { notFound } from "next/navigation";

import { Header } from "@switch-to-eu/blocks/components/header";
import { Footer } from "@switch-to-eu/blocks/components/footer";
import { BrandIndicator } from "@switch-to-eu/blocks/components/brand-indicator";
import { routing } from "@switch-to-eu/i18n/routing";
import { Link } from "@switch-to-eu/i18n/navigation";
import { LanguageSelector } from "@switch-to-eu/blocks/components/language-selector";
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

  const footerT = await getTranslations({
    locale,
    namespace: "layout.footer",
  });
  const currentYear = new Date().getFullYear();

  return (
    <NextIntlClientProvider>
      <TRPCReactProvider>
      <Header
        useContainer={false}
        containerClassName="container mx-auto px-4"
        logo={
          <Link href="/">
            <div className="flex items-start gap-2 transition-opacity hover:opacity-80">
              <div className="flex items-center justify-center mt-1">
                <Globe className="h-4 w-4 text-primary" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-black text-primary tracking-wide uppercase sm:text-xl leading-none">
                  Website Tool
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
          <div className="flex items-center gap-2">
            <LanguageSelector locale={locale} />
          </div>
        }
        mobileNavigation={
          <div className="flex items-center gap-2">
            <LanguageSelector locale={locale} />
          </div>
        }
      />
      <main className="flex-1">{children}</main>
      <Footer
        useContainer={false}
        containerClassName="container mx-auto px-4"
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
        copyright={
          <>
            &copy; {footerT("copyright", { year: String(currentYear) })}{" "}
            <a
              href="https://www.vinnie.studio"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-500 transition-colors font-semibold underline"
            >
              Studio Vinnie
            </a>
            {" & "}
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
          <BrandIndicator locale={locale} variant="compact" asSpan />
        }
      />
      </TRPCReactProvider>
    </NextIntlClientProvider>
  );
}
