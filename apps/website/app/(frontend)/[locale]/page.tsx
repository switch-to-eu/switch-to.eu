import { Container } from "@switch-to-eu/blocks/components/container";
import { PageLayout } from "@switch-to-eu/blocks/components/page-layout";
import { BrandCard } from "@switch-to-eu/blocks/components/brand-card";
import { Banner } from "@switch-to-eu/blocks/components/banner";
import { AlternatingShowcase } from "@switch-to-eu/blocks/components/alternating-showcase";
import { SectionHeading } from "@switch-to-eu/blocks/components/section-heading";
import { shapes } from "@switch-to-eu/blocks/shapes";
import { getTranslations, getLocale } from "next-intl/server";
import { generateLanguageAlternates } from "@switch-to-eu/i18n/utils";

import { ArticlesSection } from "@/components/ArticlesSection";
import { CantFindIt } from "@/components/CantFindIt";
import { FeaturedGuideHero } from "@/components/FeaturedGuideHero";
import { NewsletterCta } from "@/components/NewsletterCta";
import { getPayload } from "@/lib/payload";
import type { Category, Guide } from "@/payload-types";

const CATEGORY_SHAPES = [
  "spark", "cloud", "tulip", "speech",
  "heart", "sunburst", "flower", "starburst",
];

const FEATURE_ITEMS = [
  {
    titleKey: "featuresEuropeanTitle",
    descKey: "featuresEuropeanDescription",
    shapeBg: "bg-brand-sky",
    shape: "spark",
    shapeColor: "text-brand-green",
  },
  {
    titleKey: "featuresGuidesTitle",
    descKey: "featuresGuidesDescription",
    shapeBg: "bg-brand-pink",
    shape: "squiggle",
    shapeColor: "text-white",
  },
  {
    titleKey: "featuresCommunityTitle",
    descKey: "featuresCommunityDescription",
    shapeBg: "bg-brand-yellow",
    shape: "flower",
    shapeColor: "text-brand-green",
  },
] as const;

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

type Locale = "en" | "nl";

async function loadFeaturedGuide(locale: Locale): Promise<Guide | null> {
  const payload = await getPayload();

  const flagged = await payload.find({
    collection: "guides",
    where: { featuredOnHomepage: { equals: true } },
    depth: 1,
    limit: 1,
    locale,
  });
  if (flagged.docs[0]) return flagged.docs[0];

  const recent = await payload.find({
    collection: "guides",
    sort: "-date",
    depth: 1,
    limit: 1,
    locale,
  });
  return recent.docs[0] ?? null;
}

async function loadRecommendedServiceByCategory(
  categoryIds: (string | number)[],
  locale: Locale
): Promise<Map<string, string>> {
  if (categoryIds.length === 0) return new Map();

  const payload = await getPayload();
  const { docs } = await payload.find({
    collection: "services",
    where: {
      and: [
        { featured: { equals: true } },
        { region: { equals: "eu" } },
        { category: { in: categoryIds } },
      ],
    },
    sort: "-createdAt",
    depth: 0,
    limit: 100,
    locale,
  });

  const map = new Map<string, string>();
  for (const doc of docs) {
    const categoryId =
      typeof doc.category === "object" && doc.category !== null
        ? String(doc.category.id)
        : String(doc.category);
    if (!map.has(categoryId) && doc.name) {
      map.set(categoryId, doc.name);
    }
  }
  return map;
}

export default async function Home() {
  const t = await getTranslations("home");
  const locale = (await getLocale()) as Locale;
  const payload = await getPayload();

  const [guide, categoriesResult] = await Promise.all([
    loadFeaturedGuide(locale),
    payload.find({
      collection: "categories",
      locale,
      limit: 100,
      sort: "title",
    }),
  ]);
  const categories = categoriesResult.docs as Category[];

  const categoryIds = categories.map((c) => c.id);
  const recommendedByCategory = await loadRecommendedServiceByCategory(
    categoryIds,
    locale
  );

  return (
    <PageLayout>
      <FeaturedGuideHero guide={guide} />

      <section id="categories">
        <Container noPaddingMobile>
          <SectionHeading>{t("categoriesSectionTitle")}</SectionHeading>
          <div className="grid gap-0 md:gap-5 auto-rows-fr grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {categories.map((category, index) => {
              const recommendedName = recommendedByCategory.get(String(category.id));
              return (
                <BrandCard
                  key={category.slug}
                  colorIndex={index}
                  title={category.title}
                  description={category.description}
                  href={`/services/${category.slug}`}
                  ctaText={t("exploreCategory")}
                  shape={CATEGORY_SHAPES[index % CATEGORY_SHAPES.length]}
                  recommendationLabel={
                    recommendedName
                      ? t("categoryRecommends", { name: recommendedName })
                      : undefined
                  }
                />
              );
            })}
          </div>
        </Container>
      </section>

      <ArticlesSection />

      <CantFindIt />

      <section>
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
              items={FEATURE_ITEMS.map((item, index) => {
                const shapeData = shapes[item.shape];
                return {
                  visual: (
                    <div
                      className={`${item.shapeBg} w-28 h-28 sm:w-36 sm:h-36 md:w-44 md:h-44 rounded-full relative flex items-center justify-center p-5 sm:p-7`}
                    >
                      {shapeData && (
                        <svg
                          viewBox={shapeData.viewBox}
                          className={`w-full h-full select-none animate-shape-float ${item.shapeColor}`}
                          style={{
                            animationDuration: `${6 + (index % 3) * 1.5}s`,
                            animationDelay: `${index * -1.5}s`,
                          }}
                          aria-hidden="true"
                        >
                          <path d={shapeData.d} fill="currentColor" />
                        </svg>
                      )}
                    </div>
                  ),
                  title: t(item.titleKey),
                  description: t(item.descKey),
                };
              })}
            />
          </Banner>
        </Container>
      </section>

      <NewsletterCta />
    </PageLayout>
  );
}
