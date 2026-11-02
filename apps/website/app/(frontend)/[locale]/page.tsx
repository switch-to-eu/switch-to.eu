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
import { ArticlesSection } from "@/components/ArticlesSection";
import { getAllCategories, getAllGuides, getAllServices } from "@/lib/content/loader";
import type { Category, Guide, Service } from "@/lib/content/types";

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

function fetchHomepageGuides(
  locale: Locale
): { featured: Guide | null; others: Guide[] } {
  const guides = getAllGuides(locale);
  const flagged = guides.find((g) => g.featuredOnHomepage) ?? null;
  const recent = guides
    .filter((g) => g !== flagged)
    .sort((a, b) => (b.date ?? "").localeCompare(a.date ?? ""));

  if (flagged) {
    return { featured: flagged, others: recent.slice(0, 2) };
  }
  return {
    featured: recent[0] ?? null,
    others: recent.slice(1, 3),
  };
}

export type HomepagePick = {
  category: Category;
  pick: Service | null;
};

function fetchHomepagePicks(locale: Locale): HomepagePick[] {
  const categories = getAllCategories(locale).sort((a, b) =>
    a.title.localeCompare(b.title)
  );
  const services = getAllServices(locale)
    .filter((s) => s.region !== "non-eu")
    .sort((a, b) => Number(!!b.featured) - Number(!!a.featured));

  // First service per category; featured services sort first.
  const pickByCategory = new Map<string, Service>();
  for (const svc of services) {
    if (!pickByCategory.has(svc.category.slug)) {
      pickByCategory.set(svc.category.slug, svc);
    }
  }

  const picks: HomepagePick[] = [];
  for (const cat of categories) {
    const pick = pickByCategory.get(cat.slug);
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

export default async function Home() {
  const t = await getTranslations("home");
  const locale = (await getLocale()) as Locale;

  const { featured, others } = fetchHomepageGuides(locale);
  const picks = fetchHomepagePicks(locale);

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

      <ArticlesSection locale={locale} />

      <NewsletterCta />
    </PageLayout>
  );
}
