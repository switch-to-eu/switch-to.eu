import { Metadata } from "next";
import { Container } from "@/components/layout/container";
import { PageLayout } from "@/components/layout/page-layout";
import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@switch-to-eu/i18n/navigation";
import { generateLanguageAlternates } from "@switch-to-eu/i18n/utils";
import { Banner } from "@switch-to-eu/blocks/components/banner";
import { BrandCard } from "@switch-to-eu/blocks/components/brand-card";
import { SectionHeading } from "@switch-to-eu/blocks/components/section-heading";
import { DecorativeShape } from "@switch-to-eu/blocks/components/decorative-shape";
import { shapes } from "@switch-to-eu/blocks/shapes";

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

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("about");
  const locale = await getLocale();

  return {
    title: t("title"),
    description: t("description"),
    alternates: generateLanguageAlternates("about", locale),
  };
}

export default async function AboutPage() {
  const t = await getTranslations("about");
  const starShape = shapes["star"];

  return (
    <PageLayout>
      {/* Hero Section */}
      <section>
        <Container noPaddingMobile overlapHeader>
          <Banner
            color="bg-brand-navy"
            shapes={[
              { shape: "blob", className: "-top-8 -right-8 w-36 h-36 sm:w-48 sm:h-48", opacity: 0.2 },
              { shape: "pebble", className: "-bottom-10 -left-10 w-40 h-40 sm:w-52 sm:h-52", delay: "-3s" },
            ]}
          >
            <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
              <div className="flex-1">
                <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl uppercase text-brand-yellow mb-6">
                  {t("initiative.heading")}
                </h1>
                <p className="text-brand-sky text-base sm:text-lg">
                  {t("initiative.intro")}
                </p>
              </div>
              <div className="w-48 h-48 sm:w-64 sm:h-64 relative flex-shrink-0">
                <DecorativeShape
                  shape="circle"
                  className="inset-0"
                  opacity={0.25}
                  duration="8s"
                />
                <DecorativeShape
                  shape="star"
                  className="inset-6"
                  opacity={0.5}
                  duration="6s"
                  delay="-2s"
                />
                <DecorativeShape
                  shape="fleur"
                  className="bottom-2 right-2 w-16 h-16 sm:w-20 sm:h-20"
                  opacity={0.35}
                  duration="7s"
                  delay="-4s"
                />
              </div>
            </div>
          </Banner>
        </Container>
      </section>

      {/* Mission & Details */}
      <section>
        <Container>
          <div className="grid gap-5 sm:gap-6 md:grid-cols-2">
            <div>
              <h2 className="font-heading text-3xl sm:text-4xl uppercase text-brand-green mb-4">
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
              <h2 className="font-heading text-3xl sm:text-4xl uppercase text-brand-green mb-4">
                {t("initiative.whatWeDo.title")}
              </h2>
              <p className="text-base sm:text-lg">
                {t("initiative.whatWeDo.description")}
              </p>
            </div>

            <div>
              <h2 className="font-heading text-3xl sm:text-4xl uppercase text-brand-green mb-4">
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
                      <span className="inline-block w-6 h-6 mt-0.5 flex-shrink-0 text-brand-green">
                        {starShape && (
                          <svg viewBox={starShape.viewBox} aria-hidden="true">
                            <path d={starShape.d} fill="currentColor" />
                          </svg>
                        )}
                      </span>
                      {point}
                    </li>
                  )
                )}
              </ul>
            </div>

            <div>
              <h2 className="font-heading text-3xl sm:text-4xl uppercase text-brand-green mb-4">
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
      </section>

      {/* Three Pillars Section */}
      <section>
        <Container noPaddingMobile>
          <SectionHeading>{t("pillarsTitle")}</SectionHeading>
          <div className="grid gap-0 md:gap-5 auto-rows-fr md:grid-cols-3">
            {PILLAR_CARDS.map((card) => (
              <BrandCard
                key={card.titleKey}
                colorIndex={card.colorIndex}
                title={t(card.titleKey)}
                description={t(card.descKey)}
                shape={card.shape}
                contentClassName="text-center"
              />
            ))}
          </div>
        </Container>
      </section>

      {/* Why Choose EU Services Section */}
      <section>
        <Container noPaddingMobile>
          <SectionHeading>{t("whyChooseTitle")}</SectionHeading>
          <p className="text-base sm:text-lg mb-10 max-w-2xl px-3 md:px-0">
            {t("whyChooseDescription")}
          </p>

          <div className="grid gap-0 md:gap-5 auto-rows-fr md:grid-cols-2">
            {WHY_CHOOSE_CARDS.map((card) => (
              <BrandCard
                key={card.titleKey}
                colorIndex={card.colorIndex}
                title={t(card.titleKey)}
                description={t(card.descKey)}
                shape={card.shape}
                shapePosition="accent"
              />
            ))}
          </div>
        </Container>
      </section>
    </PageLayout>
  );
}
