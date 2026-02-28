import "./styles/globals.css";

import { type Metadata } from "next";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { Palette, Type, Component, LayoutGrid, Sparkles } from "lucide-react";

import { fontVariables } from "@switch-to-eu/ui/fonts";
import { routing } from "@switch-to-eu/i18n/routing";
import { Link } from "@switch-to-eu/i18n/navigation";

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

const navItems = [
  { href: "/", label: "overview", icon: LayoutGrid },
  { href: "/colors", label: "colors", icon: Palette },
  { href: "/typography", label: "typography", icon: Type },
  { href: "/shapes", label: "shapes", icon: Sparkles },
  { href: "/components", label: "components", icon: Component },
  { href: "/blocks", label: "blocks", icon: LayoutGrid },
] as const;

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  const t = await getTranslations({ locale, namespace: "layout.nav" });

  return (
    <html lang={locale}>
      <body className={`${fontVariables} antialiased`}>
        <NextIntlClientProvider>
          <div className="flex min-h-screen">
            <aside className="w-64 border-r border-border bg-muted/30 p-6 flex flex-col gap-1">
              <Link href="/" className="mb-6">
                <h1 className="text-xl font-bold text-primary">UI Kit</h1>
                <p className="text-xs text-muted-foreground">Switch-to.eu Design System</p>
              </Link>
              <nav className="flex flex-col gap-1">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-foreground/70 hover:bg-muted hover:text-foreground transition-colors"
                  >
                    <item.icon className="h-4 w-4" />
                    {t(item.label)}
                  </Link>
                ))}
              </nav>
            </aside>
            <main className="flex-1 overflow-y-auto p-8">
              {children}
            </main>
          </div>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
