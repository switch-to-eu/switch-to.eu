import { getAllCategories, getAllGuides } from "@/lib/content/loader";
import { CategoryPicks } from "@/components/category/CategoryPicks";
import { CategoryComparison } from "@/components/category/CategoryComparison";
import { CategoryGuides } from "@/components/category/CategoryGuides";
import {
  isBuyersGuide,
  resolvePicks,
  sortForComparison,
} from "@/lib/buyers-guide";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { ServiceCard } from "@/components/ui/ServiceCard";

import { RecommendedAlternative } from "@/components/ui/RecommendedAlternative";
import { SuggestServiceCard } from "@/components/ui/SuggestServiceCard";
import { Container } from "@switch-to-eu/blocks/components/container";
import { PageLayout } from "@switch-to-eu/blocks/components/page-layout";
import { getTranslations } from "next-intl/server";
import { Locale } from "next-intl";
import type { Locale as AppLocale } from "@switch-to-eu/i18n/routing";
import { generateLanguageAlternates } from "@switch-to-eu/i18n/utils";
import { NewsletterCta } from "@/components/NewsletterCta";
import { Banner } from "@switch-to-eu/blocks/components/banner";
import { SectionHeading } from "@switch-to-eu/blocks/components/section-heading";
import { RichText } from "@/components/rich-text";
import {
  getCategoryBySlug,
  getEuServicesByCategory,
} from "@/lib/services";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string; locale: string }>;
}): Promise<Metadata> {
  const { category, locale } = await params;

  const capitalizedCategory =
    category.charAt(0).toUpperCase() + category.slice(1);

  const categoryData = await getCategoryBySlug(category, locale);

  const pageTitle =
    categoryData?.title || `${capitalizedCategory} Service Alternatives`;
  const pageDescription =
    categoryData?.description ||
    `EU-based alternatives for common ${category} services that prioritize privacy and data protection.`;

  const title = categoryData?.metaTitle || `${pageTitle} | switch-to.eu`;
  const description = categoryData?.metaDescription || pageDescription;

  return {
    title,
    description,
    keywords: [
      capitalizedCategory,
      "EU alternatives",
      "privacy-focused services",
      "GDPR compliant",
      category,
    ],
    alternates: generateLanguageAlternates(`services/${category}`, locale as AppLocale),
    openGraph: {
      title,
      description,
    },
  };
}

export function generateStaticParams() {
  const docs = getAllCategories("en");
  const locales = ["en", "nl"];
  return locales.flatMap((locale) =>
    docs.map((cat) => ({ locale, category: cat.slug }))
  );
}

export default async function ServicesCategoryPage({
  params,
}: {
  params: Promise<{ category: string; locale: Locale }>;
}) {
  const { category, locale } = await params;

  const t = await getTranslations("services");

  const capitalizedCategory =
    category.charAt(0).toUpperCase() + category.slice(1);

  const categoryData = await getCategoryBySlug(category, locale);

  if (!categoryData) {
    notFound();
  }

  const euServices = await getEuServicesByCategory(
    categoryData.id,
    locale,
    100
  );

  if (euServices.length === 0) {
    notFound();
  }

  const featuredServices = euServices.filter((s) => s.featured === true);
  const regularServices = euServices.filter((s) => !s.featured);

  const pageTitle =
    categoryData?.title || `${capitalizedCategory} Service Alternatives`;
  const pageDescription =
    categoryData?.description ||
    `EU-based alternatives for common ${category} services that prioritize privacy and data protection.`;

  if (isBuyersGuide(categoryData)) {
    const tGuide = await getTranslations("services.buyersGuide");
    const guides = getAllGuides(locale).filter(
      (guide) => guide.category.slug === categoryData.slug
    );
    const picks = resolvePicks(categoryData, euServices, guides);
    const compare = categoryData.compare ?? [];
    const categoryName = categoryData.shortTitle;

    return (
      <PageLayout>
        <Container noPaddingMobile>
          <Banner color="bg-white border-y md:border border-black/10">
            <div className="max-w-3xl">
              <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl text-brand-green text-balance mb-4">
                {pageTitle}
              </h1>
              <p className="text-[#1a1a1a] text-base sm:text-lg">
                {pageDescription}
              </p>
            </div>
          </Banner>
        </Container>

        {picks.length > 0 && <CategoryPicks picks={picks} compare={compare} />}

        <CategoryComparison
          services={sortForComparison(euServices)}
          compare={compare}
          categoryName={categoryName}
        />

        {categoryData.content && (
          <section>
            <Container noPaddingMobile>
              <div className="bg-white border-y md:border border-black/10 md:rounded-3xl px-6 sm:px-10 md:px-14 py-10 sm:py-12">
                <div className="max-w-3xl">
                  <h2 className="font-heading text-3xl sm:text-4xl text-brand-green mb-2">
                    {tGuide("howToChoose")}
                  </h2>
                  <RichText
                    data={categoryData.content}
                    className="mdx-content text-[#1a1a1a] [&_h3]:text-brand-green"
                  />
                </div>
              </div>
            </Container>
          </section>
        )}

        {guides.length > 0 && <CategoryGuides guides={guides} />}

        <Container noPaddingMobile>
          <SectionHeading>
            {tGuide("allServices", { category: categoryName })}
          </SectionHeading>
          <div className="grid gap-0 md:gap-5 auto-rows-fr grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {euServices.map((service, index) => (
              <ServiceCard
                key={service.name}
                service={service}
                showCategory={false}
                colorIndex={index}
              />
            ))}
            <SuggestServiceCard colorIndex={euServices.length} />
          </div>
        </Container>

        <NewsletterCta />
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      {/* Hero — large navy block with title, description, and stats */}
        <Container noPaddingMobile>
          <Banner
            color="bg-white border-y md:border border-black/10"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12 items-start">
              {/* Left: Title + subtitle */}
              <div>
                <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl lg:text-5xl text-brand-green mb-4">
                  {pageTitle}
                </h1>
                <p className="text-[#1a1a1a] text-base sm:text-lg">
                  {pageDescription}
                </p>
              </div>

              {/* Right: Description */}
              {categoryData.content && (
                <div className="text-[#1a1a1a] text-sm sm:text-base leading-relaxed [&>p+p]:mt-3">
                  <RichText data={categoryData.content} />
                </div>
              )}
            </div>
          </Banner>
        </Container>

      {/* Featured services */}
      {featuredServices.length > 0 && (
          <Container noPaddingMobile>
            <div className="flex flex-col gap-6">
              {featuredServices.map((service) => (
                <RecommendedAlternative
                  key={service.name}
                  service={service}
                  sourceService={service.name}
                />
              ))}
            </div>
          </Container>
      )}

      {/* All services — colorful card grid */}
        <Container noPaddingMobile>
          <SectionHeading>
            {t("alternatives", { category: capitalizedCategory })}
          </SectionHeading>

          <div className="grid gap-0 md:gap-5 auto-rows-fr grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {regularServices.map((service, index) => (
              <ServiceCard
                key={service.name}
                service={service}
                showCategory={false}
                colorIndex={index}
              />
            ))}
            <SuggestServiceCard colorIndex={regularServices.length} />
          </div>
        </Container>

      {/* Newsletter Section */}
      <NewsletterCta />
    </PageLayout>
  );
}
