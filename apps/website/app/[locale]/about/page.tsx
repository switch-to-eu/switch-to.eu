import { Metadata } from "next";
import Image from "next/image";
import { Container } from "@/components/layout/container";
import { getLocale, getTranslations } from "next-intl/server";
import { generateLanguageAlternates } from "@switch-to-eu/i18n/utils";

import { FILTER_BRAND_GREEN, FILTER_WHITE } from "@switch-to-eu/ui/lib/shape-filters";

const PILLAR_CARDS = [
  {
    titleKey: "pillars.pillar1.title",
    descKey: "pillars.pillar1.description",
    bg: "bg-brand-sky",
    text: "text-brand-green",
    shape: "spark",
    shapeFilter: FILTER_BRAND_GREEN,
  },
  {
    titleKey: "pillars.pillar2.title",
    descKey: "pillars.pillar2.description",
    bg: "bg-brand-pink",
    text: "text-brand-green",
    shape: "heart",
    shapeFilter: FILTER_BRAND_GREEN,
  },
  {
    titleKey: "pillars.pillar3.title",
    descKey: "pillars.pillar3.description",
    bg: "bg-brand-sage",
    text: "text-brand-green",
    shape: "flower",
    shapeFilter: FILTER_BRAND_GREEN,
  },
] as const;

const WHY_CHOOSE_CARDS = [
  {
    titleKey: "whyChoosePoints.point1.title",
    descKey: "whyChoosePoints.point1.description",
    bg: "bg-brand-yellow",
    text: "text-brand-green",
    shape: "sunburst",
    shapeFilter: FILTER_BRAND_GREEN,
  },
  {
    titleKey: "whyChoosePoints.point2.title",
    descKey: "whyChoosePoints.point2.description",
    bg: "bg-brand-sky",
    text: "text-brand-green",
    shape: "cloud",
    shapeFilter: FILTER_BRAND_GREEN,
  },
  {
    titleKey: "whyChoosePoints.point3.title",
    descKey: "whyChoosePoints.point3.description",
    bg: "bg-brand-orange",
    text: "text-white",
    shape: "tulip",
    shapeFilter: FILTER_WHITE,
  },
  {
    titleKey: "whyChoosePoints.point4.title",
    descKey: "whyChoosePoints.point4.description",
    bg: "bg-brand-green",
    text: "text-white",
    shape: "speech",
    shapeFilter: FILTER_WHITE,
  },
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

  return (
    <div className="flex flex-col gap-8 sm:gap-12 md:gap-20 py-4 sm:py-6 md:py-8">
      {/* Hero Section */}
      <section>
        <div className="container max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="bg-brand-navy rounded-3xl">
            <div className="relative px-6 sm:px-10 md:px-16 py-12 sm:py-16 md:py-20 overflow-hidden">
              {/* Decorative shapes */}
              <div className="absolute -top-8 -right-8 w-36 h-36 sm:w-48 sm:h-48 opacity-20 pointer-events-none">
                <Image
                  src="/images/shapes/blob.svg"
                  alt=""
                  fill
                  className="object-contain select-none animate-shape-float"
                  style={{ filter: FILTER_WHITE }}
                  aria-hidden="true"
                  unoptimized
                />
              </div>
              <div className="absolute -bottom-10 -left-10 w-40 h-40 sm:w-52 sm:h-52 opacity-15 pointer-events-none">
                <Image
                  src="/images/shapes/pebble.svg"
                  alt=""
                  fill
                  className="object-contain select-none animate-shape-float"
                  style={{ filter: FILTER_WHITE, animationDelay: "-3s" }}
                  aria-hidden="true"
                  unoptimized
                />
              </div>

              <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 md:gap-12">
                <div className="flex-1">
                  <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl uppercase text-brand-yellow mb-6">
                    {t("initiative.heading")}
                  </h1>
                  <p className="text-brand-sky text-base sm:text-lg">
                    {t("initiative.intro")}
                  </p>
                </div>
                <div className="w-48 h-48 sm:w-64 sm:h-64 relative flex-shrink-0">
                  <div className="absolute inset-0">
                    <Image
                      src="/images/shapes/circle.svg"
                      alt=""
                      fill
                      className="object-contain select-none animate-shape-float"
                      style={{ filter: FILTER_WHITE, opacity: 0.25, animationDuration: "8s" }}
                      aria-hidden="true"
                      unoptimized
                    />
                  </div>
                  <div className="absolute inset-6">
                    <Image
                      src="/images/shapes/star.svg"
                      alt=""
                      fill
                      className="object-contain select-none animate-shape-float"
                      style={{ filter: FILTER_WHITE, opacity: 0.5, animationDuration: "6s", animationDelay: "-2s" }}
                      aria-hidden="true"
                      unoptimized
                    />
                  </div>
                  <div className="absolute bottom-2 right-2 w-16 h-16 sm:w-20 sm:h-20">
                    <Image
                      src="/images/shapes/fleur.svg"
                      alt=""
                      fill
                      className="object-contain select-none animate-shape-float"
                      style={{ filter: FILTER_WHITE, opacity: 0.35, animationDuration: "7s", animationDelay: "-4s" }}
                      aria-hidden="true"
                      unoptimized
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Details */}
      <section>
        <Container>
          <div className="max-w-3xl mx-auto space-y-10">
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
              <ul className="space-y-3 mb-8">
                {(t.raw("initiative.uniqueness.points") as Array<string>).map(
                  (point: string, index: number) => (
                    <li
                      key={index}
                      className="flex items-start gap-3 text-base sm:text-lg"
                    >
                      <span className="inline-block w-6 h-6 mt-0.5 flex-shrink-0 relative">
                        <Image
                          src="/images/shapes/star.svg"
                          alt=""
                          fill
                          className="object-contain"
                          style={{ filter: FILTER_BRAND_GREEN }}
                          aria-hidden="true"
                          unoptimized
                        />
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
              <p className="text-base sm:text-lg">
                {t("initiative.callToAction.description")}
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* Three Pillars Section */}
      <section>
        <Container>
          <h2 className="font-heading text-4xl sm:text-5xl uppercase mb-10 text-brand-green">
            {t("pillarsTitle")}
          </h2>
          <div className="grid gap-5 sm:gap-6 md:grid-cols-3 auto-rows-fr">
            {PILLAR_CARDS.map((card, index) => (
              <div
                key={card.titleKey}
                className={`${card.bg} rounded-3xl flex flex-col overflow-hidden`}
              >
                {/* Decorative shape area */}
                <div className="relative h-40 sm:h-48 flex items-center justify-center">
                  <Image
                    src={`/images/shapes/${card.shape}.svg`}
                    alt=""
                    fill
                    className="object-contain p-4 sm:p-6 select-none animate-shape-float"
                    style={{
                      filter: card.shapeFilter,
                      animationDuration: `${6 + (index % 3) * 1.5}s`,
                      animationDelay: `${index * -1.5}s`,
                    }}
                    aria-hidden="true"
                    unoptimized
                  />
                </div>

                {/* Content area */}
                <div className="flex flex-col flex-1 px-5 pb-5 sm:px-6 sm:pb-6 text-center">
                  <h3
                    className={`${card.text} mb-2 font-bold text-lg sm:text-xl`}
                  >
                    {t(card.titleKey)}
                  </h3>
                  <p
                    className={`${card.text} text-sm sm:text-base opacity-80 leading-relaxed`}
                  >
                    {t(card.descKey)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Why Choose EU Services Section */}
      <section>
        <Container>
          <h2 className="font-heading text-4xl sm:text-5xl uppercase mb-4 text-brand-green">
            {t("whyChooseTitle")}
          </h2>
          <p className="text-base sm:text-lg mb-10 max-w-2xl">
            {t("whyChooseDescription")}
          </p>

          <div className="grid gap-5 sm:gap-6 md:grid-cols-2 auto-rows-fr">
            {WHY_CHOOSE_CARDS.map((card, index) => (
              <div
                key={card.titleKey}
                className={`${card.bg} rounded-3xl overflow-hidden relative`}
              >
                {/* Decorative shape */}
                <div className="absolute top-3 right-3 w-20 h-20 sm:w-24 sm:h-24 opacity-20 pointer-events-none">
                  <Image
                    src={`/images/shapes/${card.shape}.svg`}
                    alt=""
                    fill
                    className="object-contain select-none animate-shape-float"
                    style={{
                      filter: card.shapeFilter,
                      animationDuration: `${6 + (index % 4) * 1.5}s`,
                      animationDelay: `${index * -1.5}s`,
                    }}
                    aria-hidden="true"
                    unoptimized
                  />
                </div>

                <div className="relative z-10 p-6 sm:p-8">
                  <h3
                    className={`${card.text} mb-3 font-bold text-lg sm:text-xl`}
                  >
                    {t(card.titleKey)}
                  </h3>
                  <p
                    className={`${card.text} text-sm sm:text-base opacity-80 leading-relaxed`}
                  >
                    {t(card.descKey)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>
    </div>
  );
}
