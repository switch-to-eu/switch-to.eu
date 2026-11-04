import { Container } from "@switch-to-eu/blocks/components/container";
import { PageLayout } from "@switch-to-eu/blocks/components/page-layout";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "next-intl";
import type { Metadata, ResolvingMetadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { Banner } from "@switch-to-eu/blocks/components/banner";
import { BrandCard } from "@switch-to-eu/blocks/components/brand-card";
import { getCardColor } from "@/lib/quiet-palette";
import { SectionHeading } from "@switch-to-eu/blocks/components/section-heading";

const CONTRIBUTION_CARDS = [
  { titleKey: "cards.migration.title", descKey: "cards.migration.description", ctaKey: "cards.migration.cta", href: "/contribute/guide", colorIndex: 0, shape: "spark" },
  { titleKey: "cards.tester.title", descKey: "cards.tester.description", ctaKey: "cards.tester.cta", href: "/feedback", colorIndex: 1, shape: "cloud" },
  { titleKey: "cards.discover.title", descKey: "cards.discover.description", ctaKey: "cards.discover.cta", href: "/feedback", colorIndex: 2, shape: "tulip" },
  { titleKey: "cards.technical.title", descKey: "cards.technical.description", ctaKey: "cards.technical.cta", href: "https://github.com/switch-to-eu/switch-to.eu/", external: true, colorIndex: 3, shape: "speech" },
  { titleKey: "cards.ideas.title", descKey: "cards.ideas.description", ctaKey: "cards.ideas.cta", href: "/feedback", colorIndex: 4, shape: "heart" },
  { titleKey: "cards.translate.title", descKey: "cards.translate.description", ctaKey: "cards.translate.cta", href: "mailto:hi@switch-to.eu", external: true, colorIndex: 5, shape: "sunburst" },
] as const;

export async function generateMetadata(
  { params }: { params: Promise<{ locale: Locale }> },
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("contribute");

  return pageMetadata({
    parent,
    path: "contribute",
    locale,
    title: t("meta.title"),
    description: t("meta.description"),
  });
}

export default async function ContributePage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("contribute");

  return (
    <PageLayout>
      {/* Hero Section */}
      <section>
        <Container noPaddingMobile>
          <Banner
            color="bg-white border-y md:border border-black/10"
          >
            <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
              <div className="flex-1">
                <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl text-brand-green mb-6">
                  {t("hero.title")}
                </h1>
                <p className="text-[#1a1a1a] text-base sm:text-lg">
                  {t("hero.description")}
                </p>
              </div>
            </div>
          </Banner>
        </Container>
      </section>

      {/* Contribution Cards Section */}
      <section>
        <Container noPaddingMobile>
          <SectionHeading>{t("helpSection.title")}</SectionHeading>

          <div className="grid gap-0 md:gap-5 auto-rows-fr grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {CONTRIBUTION_CARDS.map((card) => (
              <BrandCard
                key={card.titleKey}
                colorIndex={card.colorIndex}
                colors={getCardColor(card.colorIndex)}
                title={t(card.titleKey)}
                description={t(card.descKey)}
                ctaText={t(card.ctaKey)}
                href={card.href}
                external={"external" in card ? card.external : undefined}
                contentClassName="text-center"
              />
            ))}
          </div>
        </Container>
      </section>

      {/* Why Your Contribution Matters Section */}
      <section>
        <Container noPaddingMobile>
          <Banner
            color="bg-white border-y md:border border-black/10"
            contentClassName="text-center max-w-2xl mx-auto"
          >
            <h2 className="font-heading text-3xl sm:text-4xl text-brand-green mb-4 sm:mb-6">
              {t("whyMatters.title")}
            </h2>
            <p className="text-[#1a1a1a] text-base sm:text-lg">
              {t("whyMatters.description")}
            </p>
          </Banner>
        </Container>
      </section>
    </PageLayout>
  );
}
