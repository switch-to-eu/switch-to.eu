import type { Metadata } from "next";
import { useTranslations } from "next-intl";
import { hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { PageLayout } from "@switch-to-eu/blocks/components/page-layout";
import { Container } from "@switch-to-eu/blocks/components/container";
import { routing, type Locale } from "@switch-to-eu/i18n/routing";
import { generateLanguageAlternates } from "@switch-to-eu/i18n/utils";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  return {
    alternates: generateLanguageAlternates("privacy", locale as Locale),
  };
}

export default function PrivacyPage() {
  const t = useTranslations("PrivacyPage");

  const sections = [
    "dataCollection",
    "encryption",
    "dataRetention",
    "thirdParty",
    "userRights",
    "contact",
  ] as const;

  return (
    <PageLayout paddingTopMobile paddingBottomMobile>
      <Container className="max-w-4xl">
        {/* Header */}
        <div className="mb-12">
          <h1 className="mb-4 font-heading text-4xl sm:text-5xl uppercase text-foreground">
            {t("hero.title")}
          </h1>
          <p className="mb-4 text-lg text-muted-foreground">{t("hero.subtitle")}</p>
          <p className="text-sm text-muted-foreground">{t("hero.lastUpdated")}</p>
        </div>

        {/* Summary */}
        <div className="mb-12 rounded-lg border border-success/20 bg-success/10 p-6">
          <h2 className="mb-4 font-heading text-2xl sm:text-3xl uppercase text-foreground">
            {t("summary.title")}
          </h2>
          <ul className="space-y-2">
            {(t.raw("summary.points") as string[]).map(
              (point: string, index: number) => (
                <li key={index} className="text-foreground">
                  &bull; {point}
                </li>
              ),
            )}
          </ul>
        </div>

        {/* Sections */}
        <div className="space-y-10">
          {sections.map((section) => (
            <section key={section}>
              <h2 className="mb-3 font-heading text-2xl uppercase text-foreground">
                {t(`${section}.title`)}
              </h2>
              <p className="leading-relaxed text-foreground">
                {t(`${section}.content`)}
              </p>
            </section>
          ))}
        </div>
      </Container>
    </PageLayout>
  );
}
