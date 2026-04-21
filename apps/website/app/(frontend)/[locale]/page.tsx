import { Container } from "@switch-to-eu/blocks/components/container";
import { PageLayout } from "@switch-to-eu/blocks/components/page-layout";
import { Banner } from "@switch-to-eu/blocks/components/banner";
import { AlternatingShowcase } from "@switch-to-eu/blocks/components/alternating-showcase";
import { SectionHeading } from "@switch-to-eu/blocks/components/section-heading";
import { shapes } from "@switch-to-eu/blocks/shapes";
import { getTranslations, getLocale } from "next-intl/server";
import { generateLanguageAlternates } from "@switch-to-eu/i18n/utils";

import { CantFindIt } from "@/components/CantFindIt";
import { FeaturedGuideHero } from "@/components/FeaturedGuideHero";
import { FeaturedPicksSection } from "@/components/FeaturedPicksSection";
import { NewsletterCta } from "@/components/NewsletterCta";
import { getPayload } from "@/lib/payload";
import type { Category, Guide, Service } from "@/payload-types";

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

async function loadHomepageGuides(
  locale: Locale
): Promise<{ featured: Guide | null; others: Guide[] }> {
  const payload = await getPayload();

  const flagged = await payload.find({
    collection: "guides",
    where: { featuredOnHomepage: { equals: true } },
    depth: 1,
    limit: 1,
    locale,
  });
  const flaggedDoc = flagged.docs[0] ?? null;

  const recent = await payload.find({
    collection: "guides",
    sort: "-date",
    depth: 1,
    limit: 3,
    locale,
    ...(flaggedDoc
      ? { where: { id: { not_equals: flaggedDoc.id } } }
      : {}),
  });

  if (flaggedDoc) {
    return { featured: flaggedDoc, others: recent.docs.slice(0, 2) };
  }
  return {
    featured: recent.docs[0] ?? null,
    others: recent.docs.slice(1, 3),
  };
}

export type HomepagePick = {
  category: Category;
  pick: Service | null;
  totalCount: number;
};

async function loadHomepagePicks(locale: Locale): Promise<HomepagePick[]> {
  const payload = await getPayload();

  const [categoriesResult, servicesResult] = await Promise.all([
    payload.find({
      collection: "categories",
      locale,
      limit: 100,
      sort: "title",
    }),
    payload.find({
      collection: "services",
      where: { region: { in: ["eu", "eu-friendly"] } },
      // Featured first, then most recent.
      sort: ["-featured", "-createdAt"],
      depth: 0,
      limit: 500,
      locale,
    }),
  ]);

  const categories = categoriesResult.docs as Category[];
  const services = servicesResult.docs as Service[];

  const byCategory = new Map<string, Service[]>();
  for (const svc of services) {
    const categoryId =
      typeof svc.category === "object" && svc.category !== null
        ? String((svc.category as Category).id)
        : String(svc.category);
    const list = byCategory.get(categoryId) ?? [];
    list.push(svc);
    byCategory.set(categoryId, list);
  }

  const picks: HomepagePick[] = [];
  for (const cat of categories) {
    const list = byCategory.get(String(cat.id)) ?? [];
    if (list.length === 0) continue;
    picks.push({
      category: cat,
      pick: list[0] ?? null,
      totalCount: list.length,
    });
  }

  picks.sort((a, b) => {
    const aFeatured = a.pick?.featured ? 1 : 0;
    const bFeatured = b.pick?.featured ? 1 : 0;
    return bFeatured - aFeatured;
  });

  return picks;
}

export default async function Home() {
  const t = await getTranslations("home");
  const locale = (await getLocale()) as Locale;

  const [{ featured, others }, picks] = await Promise.all([
    loadHomepageGuides(locale),
    loadHomepagePicks(locale),
  ]);

  return (
    <PageLayout>
      <FeaturedGuideHero featured={featured} others={others} />

      <FeaturedPicksSection picks={picks} />

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
