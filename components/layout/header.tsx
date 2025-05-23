import { MainNav } from "@/components/navigation/main-nav";
import { MobileNav } from "@/components/navigation/mobile-nav";
import { Container } from "@/components/layout/container";
import { LanguageSelector } from "@/components/navigation/language-selector";
import { Link } from "@/i18n/navigation";
import { useLocale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { headers } from "next/headers";

export async function Header() { // Changed to async
  const locale = useLocale();
  const t = await getTranslations({locale, namespace: "navigation"}); // Fetch translations
  const businessSuffix = t("logoBusinessSuffix");
  const heads = headers();
  const pathname = heads.get("x-next-pathname") || "";
  const currentMode = pathname.startsWith("/business") ? "business" : "consumer";

  const logoHref = currentMode === "business" ? "/business" : "/";
  const logoTextBase = "switch-to.eu";

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <Container className="flex h-16 items-center justify-between">
        <Link href={logoHref} className="flex items-center space-x-2">
          <h1 className="font-bold font-bricolage-grotesque text-xl md:text-2xl">
            {logoTextBase}
            {currentMode === "business" && (
              <span className="text-sm font-semibold ml-2 text-primary"> {/* Updated to text-primary for theming */}
                {businessSuffix}
              </span>
            )}
          </h1>
        </Link>
        <div className="hidden md:flex items-center gap-4">
          <MainNav />
          <nav className="flex items-center gap-2">
            <Link
              href="/"
              className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-primary"
            >
              {t('consumer')}
            </Link>
            <Link
              href="/business"
              className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-primary"
            >
              {t('business')}
            </Link>
          </nav>
          <LanguageSelector locale={locale} />
        </div>
        <div className="md:hidden">
          <MobileNav />
        </div>
      </Container>
    </header>
  );
}
