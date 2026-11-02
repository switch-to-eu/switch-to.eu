import { PageLayout } from "@switch-to-eu/blocks/components/page-layout";
import { getTranslations, getLocale } from "next-intl/server";
import { generateLanguageAlternates } from "@switch-to-eu/i18n/utils";

import { getToolById } from "@switch-to-eu/blocks/data/tools";

import { FeaturedGuideHero } from "@/components/FeaturedGuideHero";
import { FeaturedPicksSection } from "@/components/FeaturedPicksSection";
import { HighlightedToolSection } from "@/components/HighlightedToolSection";
import { NewsletterCta } from "@/components/NewsletterCta";
import { FrontPage } from "@/components/news/FrontPage";
import { HomeMasthead } from "@/components/home/HomeMasthead";
import { HowWeWork } from "@/components/home/HowWeWork";
import {
  getAllArticles,
  getAllCategories,
  getAllGuides,
  getAllServices,
} from "@/lib/content/loader";
import type { Category, Guide, Service } from "@/lib/content/types";

type Locale = "en" | "nl";


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
  const articles = getAllArticles(locale);

  const highlightedTool = getToolById("privnote");

  return (
    <PageLayout>
      <HomeMasthead locale={locale} latestDate={articles[0]?.date ?? null} />

      <FeaturedGuideHero featured={featured} others={others} />

      <FeaturedPicksSection picks={picks} />

      <FrontPage articles={articles} locale={locale} title={t("latestNews")} />

      <HowWeWork />

      {highlightedTool && (
        <HighlightedToolSection
          tool={highlightedTool}
          tagline={t("highlightedToolTaglinePrivnote")}
        />
      )}

      <NewsletterCta />
    </PageLayout>
  );
}
