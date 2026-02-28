import Image from "next/image";
import { Container } from "@/components/layout/container";
import { ContributeCta } from "@/components/ContributeCta";
import { NewsletterCta } from "@/components/NewsletterCta";
import { CategorySection } from "@/components/CategorySection";
import { Hero } from "@/components/Hero";
import { getTranslations, getLocale } from "next-intl/server";
import { Link } from "@switch-to-eu/i18n/navigation";
import { generateLanguageAlternates } from "@switch-to-eu/i18n/utils";

import { FILTER_BRAND_GREEN, FILTER_WHITE } from "@switch-to-eu/ui/lib/shape-filters";

const GUIDE_CARDS = [
  {
    href: "/guides/messaging/whatsapp-to-signal",
    image: "/images/guides/whatsapp-signal.png",
    titleKey: "whatsappToSignal.title",
    descKey: "whatsappToSignal.description",
    altKey: "whatsappToSignal.alt",
    bg: "bg-brand-sky",
    text: "text-brand-green",
    button: "bg-brand-green text-white",
    shape: "speech",
    shapeFilter: FILTER_BRAND_GREEN,
  },
  {
    href: "/guides/email/gmail-to-protonmail",
    image: "/images/guides/gmail-proton.png",
    titleKey: "gmailToProton.title",
    descKey: "gmailToProton.description",
    altKey: "gmailToProton.alt",
    bg: "bg-brand-orange",
    text: "text-white",
    button: "bg-white text-brand-orange",
    shape: "cloud",
    shapeFilter: FILTER_WHITE,
  },
  {
    href: "/guides/storage/google-drive-to-pcloud",
    image: "/images/guides/drive-pcloud.png",
    titleKey: "driveToPcloud.title",
    descKey: "driveToPcloud.description",
    altKey: "driveToPcloud.alt",
    bg: "bg-brand-yellow",
    text: "text-brand-green",
    button: "bg-brand-green text-white",
    shape: "star",
    shapeFilter: FILTER_BRAND_GREEN,
  },
] as const;

const FEATURE_ITEMS = [
  {
    titleKey: "featuresEuropeanTitle",
    descKey: "featuresEuropeanDescription",
    shapeBg: "bg-brand-sky",
    shape: "spark",
    shapeFilter: FILTER_BRAND_GREEN,
  },
  {
    titleKey: "featuresGuidesTitle",
    descKey: "featuresGuidesDescription",
    shapeBg: "bg-brand-pink",
    shape: "squiggle",
    shapeFilter: FILTER_WHITE,
  },
  {
    titleKey: "featuresCommunityTitle",
    descKey: "featuresCommunityDescription",
    shapeBg: "bg-brand-yellow",
    shape: "flower",
    shapeFilter: FILTER_BRAND_GREEN,
  },
] as const;

// Generate metadata with language alternates
export async function generateMetadata() {
  const t = await getTranslations("common");
  const locale = await getLocale();
  const title = `${t("title")} - ${t("subtitle")}`;
  const description = t("description");

  return {
    title,
    description,
    alternates: generateLanguageAlternates("", locale),
    openGraph: {
      title,
      description,
    },
  };
}

export default async function Home() {
  const t = await getTranslations("home");

  return (
    <div className="flex flex-col gap-8 sm:gap-12 md:gap-20">
      {/* Hero Section */}
      <Hero />

      {/* Migration Guides Section */}
      <section>
        <Container>
          <h2 className="font-heading text-4xl sm:text-5xl uppercase mb-10 text-brand-green">
            {t("migrationGuidesTitle")}
          </h2>

          <div className="grid gap-5 sm:gap-6 md:grid-cols-3 auto-rows-fr">
            {GUIDE_CARDS.map((card, index) => (
              <Link
                key={card.href}
                href={card.href}
                className="no-underline h-full group"
              >
                <div
                  className={`${card.bg} rounded-3xl h-full flex flex-col overflow-hidden transition-shadow duration-200 group-hover:shadow-md`}
                >
                  {/* Image area with decorative shape */}
                  <div className="relative h-44 sm:h-52">
                    <Image
                      src={card.image}
                      alt={t(card.altKey)}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                    <div className="absolute top-3 right-3 w-14 h-14 sm:w-16 sm:h-16 opacity-30 pointer-events-none">
                      <Image
                        src={`/images/shapes/${card.shape}.svg`}
                        alt=""
                        fill
                        className="object-contain select-none animate-shape-float"
                        style={{
                          filter: card.shapeFilter,
                          animationDuration: `${6 + (index % 3) * 1.5}s`,
                          animationDelay: `${index * -1.5}s`,
                        }}
                        aria-hidden="true"
                        unoptimized
                      />
                    </div>
                  </div>

                  {/* Content area */}
                  <div className="flex flex-col flex-1 px-5 pb-5 pt-4 sm:px-6 sm:pb-6">
                    <h3 className={`${card.text} mb-2 font-bold text-lg sm:text-xl`}>
                      {t(card.titleKey)}
                    </h3>
                    <p className={`${card.text} text-sm sm:text-base opacity-80 leading-relaxed line-clamp-3 mb-5`}>
                      {t(card.descKey)}
                    </p>
                    <div className="mt-auto">
                      <span className={`${card.button} inline-block px-5 py-2 rounded-full text-sm font-semibold`}>
                        {t("readGuide")}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      {/* Features Section */}
      <section>
        <div className="container max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="bg-brand-green rounded-3xl overflow-hidden">
            <div className="relative px-6 sm:px-10 md:px-16 py-12 sm:py-16 md:py-20">
              {/* Background decorative shapes */}
              <div className="absolute -top-10 -right-10 w-44 h-44 sm:w-64 sm:h-64 opacity-10 pointer-events-none">
                <Image
                  src="/images/shapes/blob.svg"
                  alt=""
                  fill
                  className="object-contain select-none animate-shape-float"
                  style={{ filter: FILTER_WHITE, animationDuration: "10s" }}
                  aria-hidden="true"
                  unoptimized
                />
              </div>
              <div className="absolute -bottom-8 -left-8 w-36 h-36 sm:w-48 sm:h-48 opacity-10 pointer-events-none">
                <Image
                  src="/images/shapes/pebble.svg"
                  alt=""
                  fill
                  className="object-contain select-none animate-shape-float"
                  style={{ filter: FILTER_WHITE, animationDuration: "9s", animationDelay: "-4s" }}
                  aria-hidden="true"
                  unoptimized
                />
              </div>

              <h2 className="relative z-10 font-heading text-4xl sm:text-5xl uppercase mb-12 sm:mb-16 text-brand-yellow text-center">
                {t("featuredTitle")}
              </h2>

              <div className="relative z-10 space-y-10 sm:space-y-14 md:space-y-16">
                {FEATURE_ITEMS.map((item, index) => (
                  <div
                    key={item.titleKey}
                    className={`flex flex-col items-center gap-6 sm:gap-8 md:gap-12 ${
                      index % 2 === 0
                        ? "md:flex-row"
                        : "md:flex-row-reverse"
                    }`}
                  >
                    {/* Shape circle */}
                    <div className="flex-shrink-0">
                      <div
                        className={`${item.shapeBg} w-28 h-28 sm:w-36 sm:h-36 md:w-44 md:h-44 rounded-full relative`}
                      >
                        <Image
                          src={`/images/shapes/${item.shape}.svg`}
                          alt=""
                          fill
                          className="object-contain p-5 sm:p-7 select-none animate-shape-float"
                          style={{
                            filter: item.shapeFilter,
                            animationDuration: `${6 + (index % 3) * 1.5}s`,
                            animationDelay: `${index * -1.5}s`,
                          }}
                          aria-hidden="true"
                          unoptimized
                        />
                      </div>
                    </div>

                    {/* Text content */}
                    <div className={`text-center ${index % 2 === 0 ? "md:text-left" : "md:text-right"}`}>
                      <h3 className="text-brand-yellow font-bold text-xl sm:text-2xl md:text-3xl mb-3">
                        {t(item.titleKey)}
                      </h3>
                      <p className="text-white/80 text-sm sm:text-base md:text-lg leading-relaxed max-w-lg">
                        {t(item.descKey)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <NewsletterCta />

      {/* Categories Section */}
      <CategorySection />

      {/* CTA Section */}
      <ContributeCta />
    </div>
  );
}
