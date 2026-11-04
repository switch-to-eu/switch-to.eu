import type { Metadata, ResolvingMetadata } from "next";
import { Container } from "@switch-to-eu/blocks/components/container";
import { PageLayout } from "@switch-to-eu/blocks/components/page-layout";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "next-intl";
import { Link } from "@switch-to-eu/i18n/navigation";
import { pageMetadata } from "@/lib/seo";
import { Banner } from "@switch-to-eu/blocks/components/banner";
import { BrandCard } from "@switch-to-eu/blocks/components/brand-card";
import { getCardColor } from "@/lib/quiet-palette";
import { SectionHeading } from "@switch-to-eu/blocks/components/section-heading";
import { Check } from "lucide-react";

const PILLAR_CARDS = [
  { titleKey: "pillars.pillar1.title", descKey: "pillars.pillar1.description", colorIndex: 0, shape: "spark" },
  { titleKey: "pillars.pillar2.title", descKey: "pillars.pillar2.description", colorIndex: 4, shape: "heart" },
  { titleKey: "pillars.pillar3.title", descKey: "pillars.pillar3.description", colorIndex: 6, shape: "flower" },
] as const;

const WHY_CHOOSE_CARDS = [
  { titleKey: "whyChoosePoints.point1.title", descKey: "whyChoosePoints.point1.description", colorIndex: 2, shape: "sunburst" },
  { titleKey: "whyChoosePoints.point2.title", descKey: "whyChoosePoints.point2.description", colorIndex: 0, shape: "cloud" },
  { titleKey: "whyChoosePoints.point3.title", descKey: "whyChoosePoints.point3.description", colorIndex: 1, shape: "tulip" },
  { titleKey: "whyChoosePoints.point4.title", descKey: "whyChoosePoints.point4.description", colorIndex: 3, shape: "speech" },
] as const;

export async function generateMetadata(
  { params }: { params: Promise<{ locale: Locale }> },
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("about");

  return pageMetadata({
    parent,
    path: "about",
    locale,
    title: t("title"),
    description: t("description"),
  });
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("about");

  return (
    <PageLayout gapMobile>
        <Container noPaddingMobile>
          <Banner
            color="bg-white border-y md:border border-black/10"
          >
            <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
              <div className="flex-1">
                <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl text-brand-green mb-6">
                  {t("initiative.heading")}
                </h1>
                <p className="text-[#1a1a1a] text-base sm:text-lg">
                  {t("initiative.intro")}
                </p>
              </div>
            </div>
          </Banner>
        </Container>

      {/* Mission & Details */}
        <Container>
          <div className="grid gap-5 sm:gap-6 md:grid-cols-2">
            <div>
              <h2 className="font-heading text-3xl text-brand-green mb-4 mt-4 md:mt-0">
                {t("initiative.mission.title")}
              </h2>
              <p className="text-base sm:text-lg mb-4">
                {t("initiative.mission.description1")}
              </p>
              <p className="text-base sm:text-lg">
                {t("initiative.mission.description2")}
              </p>
            </div>

            <div>
              <h2 className="font-heading text-3xl text-brand-green mb-4">
                {t("initiative.whatWeDo.title")}
              </h2>
              <p className="text-base sm:text-lg">
                {t("initiative.whatWeDo.description")}
              </p>
            </div>

            <div>
              <h2 className="font-heading text-3xl text-brand-green mb-4">
                {t("initiative.uniqueness.title")}
              </h2>
              <p className="text-base sm:text-lg mb-4">
                {t("initiative.uniqueness.description1")}
              </p>
              <p className="text-base sm:text-lg mb-6">
                {t("initiative.uniqueness.description2")}
              </p>
              <ul className="space-y-3">
                {(t.raw("initiative.uniqueness.points") as Array<string>).map(
                  (point: string, index: number) => (
                    <li
                      key={index}
                      className="flex items-start gap-3 text-base sm:text-lg"
                    >
                      <Check className="w-5 h-5 mt-1 flex-shrink-0 text-brand-green" aria-hidden="true" />
                      {point}
                    </li>
                  )
                )}
              </ul>
            </div>

            <div>
              <h2 className="font-heading text-3xl text-brand-green mb-4">
                {t("initiative.callToAction.title")}
              </h2>
              <p className="text-base sm:text-lg mb-6">
                {t("initiative.callToAction.description")}
              </p>
              <Link
                href="/#categories"
                className="inline-block px-6 sm:px-8 py-3 bg-brand-green text-white font-medium rounded-full hover:opacity-90 transition-colors text-sm sm:text-base"
              >
                {t("viewServicesButton")}
              </Link>
            </div>
          </div>
        </Container>

      {/* Three Pillars Section */}
        <Container noPaddingMobile>
          <SectionHeading>{t("pillarsTitle")}</SectionHeading>
          <div className="grid gap-0 md:gap-5 auto-rows-fr md:grid-cols-3">
            {PILLAR_CARDS.map((card) => (
              <BrandCard
                key={card.titleKey}
                colorIndex={card.colorIndex}
                colors={getCardColor(card.colorIndex)}
                title={t(card.titleKey)}
                description={t(card.descKey)}
                contentClassName="text-center"
              />
            ))}
          </div>
        </Container>

      {/* Why Choose EU Services Section */}
        <Container noPaddingMobile>
          <SectionHeading>{t("whyChooseTitle")}</SectionHeading>

          <div className="grid gap-0 md:gap-5 auto-rows-fr md:grid-cols-2">
            {WHY_CHOOSE_CARDS.map((card) => (
              <BrandCard
                key={card.titleKey}
                colorIndex={card.colorIndex}
                colors={getCardColor(card.colorIndex)}
                title={t(card.titleKey)}
                description={t(card.descKey)}
                shapePosition="accent"
              />
            ))}
          </div>
        </Container>
    </PageLayout>
  );
}
