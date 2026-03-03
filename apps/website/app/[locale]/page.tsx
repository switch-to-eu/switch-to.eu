import Image from "next/image";
import { Container } from "@/components/layout/container";
import { PageLayout } from "@/components/layout/page-layout";
import { NewsletterCta } from "@/components/NewsletterCta";
import { Hero } from "@/components/Hero";
import { getTranslations, getLocale } from "next-intl/server";
import { generateLanguageAlternates } from "@switch-to-eu/i18n/utils";
import { BrandCard } from "@switch-to-eu/blocks/components/brand-card";
import { Banner } from "@switch-to-eu/blocks/components/banner";
import { AlternatingShowcase } from "@switch-to-eu/blocks/components/alternating-showcase";
import { SectionHeading } from "@switch-to-eu/blocks/components/section-heading";
import { getAllCategoriesMetadata } from "@switch-to-eu/content/services/categories";

import { FILTER_BRAND_GREEN, FILTER_WHITE } from "@switch-to-eu/ui/lib/shape-filters";

const CATEGORY_SHAPES = [
  "spark", "cloud", "tulip", "speech",
  "heart", "sunburst", "flower", "starburst",
];

const GUIDE_CARDS = [
  {
    href: "/guides/messaging/whatsapp-to-signal",
    image: "/images/guides/whatsapp-signal.png",
    titleKey: "whatsappToSignal.title",
    descKey: "whatsappToSignal.description",
    altKey: "whatsappToSignal.alt",
    shape: "/images/shapes/speech.svg",
    colorIndex: 0,
  },
  {
    href: "/guides/email/gmail-to-protonmail",
    image: "/images/guides/gmail-proton.png",
    titleKey: "gmailToProton.title",
    descKey: "gmailToProton.description",
    altKey: "gmailToProton.alt",
    shape: "/images/shapes/cloud.svg",
    colorIndex: 1,
  },
  {
    href: "/guides/storage/google-drive-to-pcloud",
    image: "/images/guides/drive-pcloud.png",
    titleKey: "driveToPcloud.title",
    descKey: "driveToPcloud.description",
    altKey: "driveToPcloud.alt",
    shape: "/images/shapes/star.svg",
    colorIndex: 2,
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
  const locale = await getLocale();
  const categories = getAllCategoriesMetadata(locale);

  return (
    <PageLayout>
      {/* Hero Section */}
      <Hero />

      {/* Categories Section */}
      <section id="categories">
        <Container noPaddingMobile>
          <SectionHeading>{t("categoriesSectionTitle")}</SectionHeading>
          <div className="grid gap-0 md:gap-5 auto-rows-fr grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {categories.map((category, index) => (
              <BrandCard
                key={category.slug}
                colorIndex={index}
                title={category.metadata.title}
                description={category.metadata.description}
                href={`/services/${category.slug}`}
                ctaText={t("exploreCategory")}
                shape={`/images/shapes/${CATEGORY_SHAPES[index % CATEGORY_SHAPES.length]}.svg`}
              />
            ))}
          </div>
        </Container>
      </section>

      {/* Migration Guides Section */}
      <section>
        <Container noPaddingMobile>
          <SectionHeading>{t("migrationGuidesTitle")}</SectionHeading>
          <div className="grid gap-0 md:gap-5 auto-rows-fr grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
            {GUIDE_CARDS.map((card) => (
              <BrandCard
                key={card.href}
                colorIndex={card.colorIndex}
                title={t(card.titleKey)}
                description={t(card.descKey)}
                href={card.href}
                ctaText={t("readGuide")}
                image={card.image}
                imageAlt={t(card.altKey)}
                shape={card.shape}
              />
            ))}
          </div>
        </Container>
      </section>

      {/* Features Section */}
      <section id="stand-for">
        <Container noPaddingMobile>
          <Banner
            color="bg-brand-green"
            className="overflow-hidden"
            shapes={[
              { shape: "blob", className: "-top-10 -right-10 w-44 h-44 sm:w-64 sm:h-64", opacity: 0.1, duration: "10s" },
              { shape: "pebble", className: "-bottom-8 -left-8 w-36 h-36 sm:w-48 sm:h-48", opacity: 0.1, duration: "9s", delay: "-4s" },
            ]}
          >
            <SectionHeading color="text-brand-yellow" className="text-center mb-8 sm:mb-10 px-0">
              {t("featuredTitle")}
            </SectionHeading>

            <AlternatingShowcase
              items={FEATURE_ITEMS.map((item, index) => ({
                visual: (
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
                ),
                title: t(item.titleKey),
                description: t(item.descKey),
              }))}
            />
          </Banner>
        </Container>
      </section>

      {/* Newsletter Section */}
      <NewsletterCta />
    </PageLayout>
  );
}
