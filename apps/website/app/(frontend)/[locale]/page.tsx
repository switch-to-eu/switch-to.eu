import { unstable_cache } from "next/cache";
import { Container } from "@switch-to-eu/blocks/components/container";
import { PageLayout } from "@switch-to-eu/blocks/components/page-layout";
import { Banner } from "@switch-to-eu/blocks/components/banner";
import { AlternatingShowcase } from "@switch-to-eu/blocks/components/alternating-showcase";
import { SectionHeading } from "@switch-to-eu/blocks/components/section-heading";
import { shapes } from "@switch-to-eu/blocks/shapes";
import { getTranslations, getLocale } from "next-intl/server";
import { generateLanguageAlternates } from "@switch-to-eu/i18n/utils";

import { getToolById } from "@switch-to-eu/blocks/data/tools";

import { CantFindIt } from "@/components/CantFindIt";
import { FeaturedGuideHero } from "@/components/FeaturedGuideHero";
import { FeaturedPicksSection } from "@/components/FeaturedPicksSection";
import { HighlightedToolSection } from "@/components/HighlightedToolSection";
import { NewsletterCta } from "@/components/NewsletterCta";
import { getPayload } from "@/lib/payload";
import type { Category, Guide, Service } from "@/payload-types";

type Locale = "en" | "nl";

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

// Only the fields the homepage components actually render. Trims the Postgres
// row-fanout from ~37k rows/hit to a handful by skipping every services_*
// child table (pricingTiers, features, issues, faqs, redditMentions, etc.).
const PICK_SERVICE_SELECT = {
  name: true,
  slug: true,
  description: true,
  location: true,
  featured: true,
  category: true,
} as const;

const HOMEPAGE_GUIDE_SELECT = {
  slug: true,
  difficulty: true,
  timeRequired: true,
  sourceService: true,
  targetService: true,
  category: true,
  featuredOnHomepage: true,
  date: true,
  // Below are required by the Guide type but unused by the homepage hero.
  // They're plain scalars on the guides table (no array-table JOINs).
  title: true,
  description: true,
  updatedAt: true,
  createdAt: true,
} as const;

const HOMEPAGE_CATEGORY_SELECT = {
  slug: true,
  title: true,
  description: true,
} as const;

async function fetchHomepageGuides(
  locale: Locale
): Promise<{ featured: Guide | null; others: Guide[] }> {
  const payload = await getPayload();

  const flagged = await payload.find({
    collection: "guides",
    where: { featuredOnHomepage: { equals: true } },
    depth: 1,
    limit: 1,
    locale,
    select: HOMEPAGE_GUIDE_SELECT,
  });
  const flaggedDoc = flagged.docs[0] ?? null;

  const recent = await payload.find({
    collection: "guides",
    sort: "-date",
    depth: 1,
    limit: 3,
    locale,
    select: HOMEPAGE_GUIDE_SELECT,
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
};

async function fetchHomepagePicks(locale: Locale): Promise<HomepagePick[]> {
  const payload = await getPayload();

  // Fetch only the *first* service per category by capping at 50 — we have ~70
  // services total and only render one per category. The sort guarantees the
  // featured pick lands first when there is one.
  const [categoriesResult, servicesResult] = await Promise.all([
    payload.find({
      collection: "categories",
      locale,
      limit: 100,
      sort: "title",
      select: HOMEPAGE_CATEGORY_SELECT,
    }),
    payload.find({
      collection: "services",
      where: {
        and: [
          { _status: { equals: "published" } },
          { region: { in: ["eu", "eu-friendly"] } },
        ],
      },
      sort: ["-featured", "-createdAt"],
      depth: 0,
      limit: 50,
      locale,
      select: PICK_SERVICE_SELECT,
    }),
  ]);

  const categories = categoriesResult.docs as Category[];
  const services = servicesResult.docs as Service[];

  // Take the first service per category encountered (sort already ranks them).
  const pickByCategory = new Map<string, Service>();
  for (const svc of services) {
    const categoryId =
      typeof svc.category === "object" && svc.category !== null
        ? String((svc.category as Category).id)
        : String(svc.category);
    if (!pickByCategory.has(categoryId)) pickByCategory.set(categoryId, svc);
  }

  const picks: HomepagePick[] = [];
  for (const cat of categories) {
    const pick = pickByCategory.get(String(cat.id));
    if (!pick) continue;
    picks.push({ category: cat, pick });
  }

  picks.sort((a, b) => {
    const aFeatured = a.pick?.featured ? 1 : 0;
    const bFeatured = b.pick?.featured ? 1 : 0;
    return bFeatured - aFeatured;
  });

  return picks;
}

// Both helpers wrapped in unstable_cache. Invalidated via revalidateTag
// in the afterChange hooks on Services/Guides/Categories collections.
const loadHomepageGuides = (locale: Locale) =>
  unstable_cache(() => fetchHomepageGuides(locale), [`homepage-guides-${locale}`], {
    tags: ["guides", "services"],
  })();

const loadHomepagePicks = (locale: Locale) =>
  unstable_cache(() => fetchHomepagePicks(locale), [`homepage-picks-${locale}`], {
    tags: ["services", "categories"],
  })();

export default async function Home() {
  const t = await getTranslations("home");
  const locale = (await getLocale()) as Locale;

  const [{ featured, others }, picks] = await Promise.all([
    loadHomepageGuides(locale),
    loadHomepagePicks(locale),
  ]);

  const highlightedTool = getToolById("privnote");

  return (
    <PageLayout>
      <FeaturedGuideHero featured={featured} others={others} />

      <FeaturedPicksSection picks={picks} />

      <CantFindIt />

      {highlightedTool && (
        <HighlightedToolSection
          tool={highlightedTool}
          tagline={t("highlightedToolTaglinePrivnote")}
        />
      )}

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
