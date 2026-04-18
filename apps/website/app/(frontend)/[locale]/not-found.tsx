import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@switch-to-eu/i18n/navigation";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("notFound");
  return {
    title: t("title"),
    robots: { index: false, follow: false },
    alternates: { canonical: null },
  };
}

export default async function LocaleNotFound() {
  const t = await getTranslations("notFound");
  return (
    <div className="flex flex-1 flex-col items-center justify-center py-20">
      <h1 className="text-4xl font-bold mb-4">{t("heading")}</h1>
      <p className="text-muted-foreground mb-6">{t("message")}</p>
      <Link
        href="/"
        className="text-primary underline hover:no-underline"
      >
        {t("cta")}
      </Link>
    </div>
  );
}
