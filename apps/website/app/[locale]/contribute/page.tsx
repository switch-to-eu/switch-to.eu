import Image from "next/image";
import { Container } from "@/components/layout/container";
import { getTranslations, getLocale } from "next-intl/server";
import { Link } from "@switch-to-eu/i18n/navigation";
import { generateLanguageAlternates } from "@switch-to-eu/i18n/utils";

import { FILTER_BRAND_GREEN, FILTER_WHITE } from "@switch-to-eu/ui/lib/shape-filters";

const CONTRIBUTION_CARDS = [
  {
    titleKey: "cards.migration.title",
    descKey: "cards.migration.description",
    ctaKey: "cards.migration.cta",
    href: "/contribute/guide",
    external: false,
    bg: "bg-brand-sky",
    text: "text-brand-green",
    button: "bg-brand-green text-white",
    shape: "spark",
    shapeFilter: FILTER_BRAND_GREEN,
  },
  {
    titleKey: "cards.tester.title",
    descKey: "cards.tester.description",
    ctaKey: "cards.tester.cta",
    href: "/feedback",
    external: false,
    bg: "bg-brand-orange",
    text: "text-white",
    button: "bg-white text-brand-orange",
    shape: "cloud",
    shapeFilter: FILTER_WHITE,
  },
  {
    titleKey: "cards.discover.title",
    descKey: "cards.discover.description",
    ctaKey: "cards.discover.cta",
    href: "/feedback",
    external: false,
    bg: "bg-brand-yellow",
    text: "text-brand-green",
    button: "bg-brand-green text-white",
    shape: "tulip",
    shapeFilter: FILTER_BRAND_GREEN,
  },
  {
    titleKey: "cards.technical.title",
    descKey: "cards.technical.description",
    ctaKey: "cards.technical.cta",
    href: "https://github.com/switch-to-eu/switch-to.eu/",
    external: true,
    bg: "bg-brand-green",
    text: "text-white",
    button: "bg-white text-brand-green",
    shape: "speech",
    shapeFilter: FILTER_WHITE,
  },
  {
    titleKey: "cards.ideas.title",
    descKey: "cards.ideas.description",
    ctaKey: "cards.ideas.cta",
    href: "/feedback",
    external: false,
    bg: "bg-brand-pink",
    text: "text-brand-green",
    button: "bg-brand-green text-white",
    shape: "heart",
    shapeFilter: FILTER_BRAND_GREEN,
  },
  {
    titleKey: "cards.translate.title",
    descKey: "cards.translate.description",
    ctaKey: "cards.translate.cta",
    href: "mailto:hi@switch-to.eu",
    external: true,
    bg: "bg-brand-navy",
    text: "text-white",
    button: "bg-white text-brand-navy",
    shape: "sunburst",
    shapeFilter: FILTER_WHITE,
  },
] as const;

// Generate metadata with language alternates
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
    <div className="flex flex-col gap-8 sm:gap-12 md:gap-20 py-4 sm:py-6 md:py-8">
      {/* Hero Section */}
      <section>
        <div className="container max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="bg-brand-green rounded-3xl">
            <div className="relative px-6 sm:px-10 md:px-16 py-12 sm:py-16 md:py-20 overflow-hidden">
              {/* Decorative shapes */}
              <div className="absolute -top-8 -right-8 w-36 h-36 sm:w-48 sm:h-48 opacity-15 pointer-events-none">
                <Image
                  src="/images/shapes/tulip.svg"
                  alt=""
                  fill
                  className="object-contain select-none animate-shape-float"
                  style={{ filter: FILTER_WHITE }}
                  aria-hidden="true"
                  unoptimized
                />
              </div>
              <div className="absolute -bottom-10 -left-10 w-40 h-40 sm:w-52 sm:h-52 opacity-10 pointer-events-none">
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
                    {t("hero.title")}
                  </h1>
                  <p className="text-white/90 text-base sm:text-lg">
                    {t("hero.description")}
                  </p>
                </div>
                <div className="w-48 h-48 sm:w-64 sm:h-64 relative flex-shrink-0">
                  <div className="absolute inset-0">
                    <Image
                      src="/images/shapes/wide-heart.svg"
                      alt=""
                      fill
                      className="object-contain select-none animate-shape-float"
                      style={{ filter: FILTER_WHITE, opacity: 0.3, animationDuration: "7s" }}
                      aria-hidden="true"
                      unoptimized
                    />
                  </div>
                  <div className="absolute inset-8">
                    <Image
                      src="/images/shapes/clover.svg"
                      alt=""
                      fill
                      className="object-contain select-none animate-shape-float"
                      style={{ filter: FILTER_WHITE, opacity: 0.5, animationDuration: "6s", animationDelay: "-2s" }}
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

      {/* Contribution Cards Section */}
      <section>
        <Container>
          <h2 className="font-heading text-4xl sm:text-5xl uppercase mb-10 text-brand-green">
            {t("helpSection.title")}
          </h2>

          <div className="grid gap-5 sm:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 auto-rows-fr">
            {CONTRIBUTION_CARDS.map((card, index) => {
              const content = (
                <div
                  className={`${card.bg} rounded-3xl h-full flex flex-col overflow-hidden transition-shadow duration-200 group-hover:shadow-md`}
                >
                  {/* Decorative shape area */}
                  <div className="relative h-36 sm:h-44 flex items-center justify-center">
                    <Image
                      src={`/images/shapes/${card.shape}.svg`}
                      alt=""
                      fill
                      className="object-contain p-4 sm:p-6 select-none animate-shape-float"
                      style={{
                        filter: card.shapeFilter,
                        animationDuration: `${6 + (index % 4) * 1.5}s`,
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
                      className={`${card.text} text-sm sm:text-base opacity-80 leading-relaxed mb-5`}
                    >
                      {t(card.descKey)}
                    </p>
                    <div className="mt-auto">
                      <span
                        className={`${card.button} inline-block px-5 py-2 rounded-full text-sm font-semibold`}
                      >
                        {t(card.ctaKey)}
                      </span>
                    </div>
                  </div>
                </div>
              );

              if (card.external) {
                return (
                  <a
                    key={card.titleKey}
                    href={card.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="no-underline h-full group"
                  >
                    {content}
                  </a>
                );
              }

              return (
                <Link
                  key={card.titleKey}
                  href={card.href}
                  className="no-underline h-full group"
                >
                  {content}
                </Link>
              );
            })}
          </div>
        </Container>
      </section>

      {/* Why Your Contribution Matters Section */}
      <section>
        <div className="container max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="bg-brand-navy rounded-3xl">
            <div className="relative px-6 sm:px-10 md:px-16 py-12 sm:py-16 md:py-20 overflow-hidden">
              <div className="absolute -top-6 -right-6 w-32 h-32 sm:w-44 sm:h-44 opacity-15 pointer-events-none">
                <Image
                  src="/images/shapes/starburst.svg"
                  alt=""
                  fill
                  className="object-contain select-none animate-shape-float"
                  style={{ filter: FILTER_WHITE }}
                  aria-hidden="true"
                  unoptimized
                />
              </div>
              <div className="relative z-10 text-center max-w-2xl mx-auto">
                <h2 className="font-heading text-4xl sm:text-5xl uppercase text-brand-yellow mb-4 sm:mb-6">
                  {t("whyMatters.title")}
                </h2>
                <p className="text-brand-sky text-base sm:text-lg">
                  {t("whyMatters.description")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
