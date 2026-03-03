import { Container } from "@/components/layout/container";
import { PageLayout } from "@/components/layout/page-layout";
import { getTranslations, getLocale } from "next-intl/server";
import { generateLanguageAlternates } from "@switch-to-eu/i18n/utils";
import { Banner } from "@switch-to-eu/blocks/components/banner";
import { BrandCard } from "@switch-to-eu/blocks/components/brand-card";
import { SectionHeading } from "@switch-to-eu/blocks/components/section-heading";

import { FILTER_WHITE } from "@switch-to-eu/ui/lib/shape-filters";

const CONTRIBUTION_CARDS = [
  { titleKey: "cards.migration.title", descKey: "cards.migration.description", ctaKey: "cards.migration.cta", href: "/contribute/guide", colorIndex: 0, shape: "spark" },
  { titleKey: "cards.tester.title", descKey: "cards.tester.description", ctaKey: "cards.tester.cta", href: "/feedback", colorIndex: 1, shape: "cloud" },
  { titleKey: "cards.discover.title", descKey: "cards.discover.description", ctaKey: "cards.discover.cta", href: "/feedback", colorIndex: 2, shape: "tulip" },
  { titleKey: "cards.technical.title", descKey: "cards.technical.description", ctaKey: "cards.technical.cta", href: "https://github.com/switch-to-eu/switch-to.eu/", external: true, colorIndex: 3, shape: "speech" },
  { titleKey: "cards.ideas.title", descKey: "cards.ideas.description", ctaKey: "cards.ideas.cta", href: "/feedback", colorIndex: 4, shape: "heart" },
  { titleKey: "cards.translate.title", descKey: "cards.translate.description", ctaKey: "cards.translate.cta", href: "mailto:hi@switch-to.eu", external: true, colorIndex: 5, shape: "sunburst" },
] as const;

export async function generateMetadata() {
  const t = await getTranslations("contribute");
  const locale = await getLocale();

  return {
    title: t("title"),
    description: t("description"),
    alternates: generateLanguageAlternates("contribute", locale),
  };
}

export default async function ContributePage() {
  const t = await getTranslations("contribute");

  return (
    <PageLayout>
      {/* Hero Section */}
      <section>
        <Container noPaddingMobile overlapHeader>
          <Banner
            color="bg-brand-green"
            shapes={[
              { shape: "tulip", className: "-top-8 -right-8 w-36 h-36 sm:w-48 sm:h-48" },
              { shape: "pebble", className: "-bottom-10 -left-10 w-40 h-40 sm:w-52 sm:h-52", opacity: 0.1, delay: "-3s" },
            ]}
          >
            <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
              <div className="flex-1">
                <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl uppercase text-brand-yellow mb-6">
                  {t("hero.title")}
                </h1>
                <p className="text-white/90 text-base sm:text-lg">
                  {t("hero.description")}
                </p>
              </div>
              <div className="w-48 h-48 sm:w-64 sm:h-64 relative flex-shrink-0">
                <div className="absolute inset-0">
                  <img
                    src="/images/shapes/wide-heart.svg"
                    alt=""
                    className="w-full h-full object-contain select-none animate-shape-float"
                    style={{ filter: FILTER_WHITE, opacity: 0.3, animationDuration: "7s" }}
                    aria-hidden="true"
                  />
                </div>
                <div className="absolute inset-8">
                  <img
                    src="/images/shapes/clover.svg"
                    alt=""
                    className="w-full h-full object-contain select-none animate-shape-float"
                    style={{ filter: FILTER_WHITE, opacity: 0.5, animationDuration: "6s", animationDelay: "-2s" }}
                    aria-hidden="true"
                  />
                </div>
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
                title={t(card.titleKey)}
                description={t(card.descKey)}
                ctaText={t(card.ctaKey)}
                href={card.href}
                external={"external" in card ? card.external : undefined}
                shape={`/images/shapes/${card.shape}.svg`}
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
            color="bg-brand-navy"
            shapes={[
              { shape: "starburst", className: "-top-6 -right-6 w-32 h-32 sm:w-44 sm:h-44" },
            ]}
            contentClassName="text-center max-w-2xl mx-auto"
          >
            <h2 className="font-heading text-4xl sm:text-5xl uppercase text-brand-yellow mb-4 sm:mb-6">
              {t("whyMatters.title")}
            </h2>
            <p className="text-brand-sky text-base sm:text-lg">
              {t("whyMatters.description")}
            </p>
          </Banner>
        </Container>
      </section>
    </PageLayout>
  );
}
