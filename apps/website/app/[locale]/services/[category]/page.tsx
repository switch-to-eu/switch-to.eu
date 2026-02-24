import { getServicesByCategory } from "@switch-to-eu/content/services/services";
import {
  getCategoryContent,
  getAllCategoriesMetadata,
} from "@switch-to-eu/content/services/categories";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { ServiceCard } from "@/components/ui/ServiceCard";
import { Container } from "@/components/layout/container";
import { ContributeCta } from "@/components/ContributeCta";
import { RecommendedAlternative } from "@/components/ui/RecommendedAlternative";
import { getTranslations } from "next-intl/server";
import React from "react";
import { Locale } from "next-intl";
import { NewsletterCta } from "@/components/NewsletterCta";

// Generate metadata for SEO
export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string; locale: string }>;
}): Promise<Metadata> {
  // Await the params
  const { category, locale } = await params;

  const capitalizedCategory =
    category.charAt(0).toUpperCase() + category.slice(1);

  // Get category metadata
  const { metadata: categoryMetadata } = getCategoryContent(category, locale as Locale);

  // Use metadata title if available, otherwise fallback to capitalized category
  const pageTitle =
    categoryMetadata?.title || `${capitalizedCategory} Service Alternatives`;
  // Use metadata description if available
  const pageDescription =
    categoryMetadata?.description ||
    `EU-based alternatives for common ${category} services that prioritize privacy and data protection.`;

  return {
    title: `${pageTitle} | switch-to.eu`,
    description: pageDescription,
    keywords: [
      capitalizedCategory,
      "EU alternatives",
      "privacy-focused services",
      "GDPR compliant",
      category,
    ],
    alternates: {
      canonical: `https://switch-to.eu/${locale}/services/${category}`,
      languages: {
        en: `https://switch-to.eu/en/services/${category}`,
        nl: `https://switch-to.eu/nl/services/${category}`,
      },
    },
  };
}

export function generateStaticParams() {
  const categories = getAllCategoriesMetadata();

  return categories.map((category) => ({
    category: category.slug,
  }));
}

export default async function ServicesCategoryPage({
  params,
}: {
  params: Promise<{ category: string; locale: Locale }>;
}) {
  // Await the params Promise
  const { category, locale } = await params;

  // Get translations
  const t = await getTranslations("services");
  const commonT = await getTranslations("common");

  const capitalizedCategory =
    category.charAt(0).toUpperCase() + category.slice(1);

  // Load EU services for this category
  const euServices = getServicesByCategory(category, "eu", locale);
  const { metadata: categoryMetadata, content: categoryContent } =
    getCategoryContent(category, locale);

  if (euServices.length === 0) {
    notFound();
  }

  // Get featured services for this category
  const featuredServices = euServices.filter(
    (service) => service.featured === true
  );

  // Non-featured services
  const regularServices = euServices.filter((service) => !service.featured);

  // Use metadata title if available, otherwise fallback to capitalized category
  const pageTitle =
    categoryMetadata?.title || `${capitalizedCategory} Service Alternatives`;
  // Use metadata description if available
  const pageDescription =
    categoryMetadata?.description ||
    `EU-based alternatives for common ${category} services that prioritize privacy and data protection.`;

  return (
    <main className="flex flex-col gap-12 py-10">
      <Container>
        <h1 className="text-3xl font-bold mb-2">{pageTitle}</h1>
        <p className="text-lg mb-6 text-muted-foreground">{pageDescription}</p>

        {categoryContent && (
          <div className="mb-8 dark:bg-gray-800 rounded-lg">
            {categoryContent.split("\n\n").map((paragraph, index) => (
              <p key={index} className={`text-base ${index > 0 ? "mt-4" : ""}`}>
                {paragraph}
              </p>
            ))}
          </div>
        )}

        {/* Featured services as recommended alternatives */}
        {featuredServices.length > 0 && (
          <div className="mb-8">
            {featuredServices.map((service) => (
              <React.Suspense
                key={service.name}
                fallback={
                  <div className="mb-10 p-6 bg-green-50 dark:bg-green-900/20 rounded-lg relative">
                    <p className="text-center">{commonT("loading")}</p>
                  </div>
                }
              >
                <RecommendedAlternative
                  service={service}
                  sourceService={service.name}
                  migrationGuides={[]}
                />
              </React.Suspense>
            ))}
          </div>
        )}

        {/* Regular services grid */}
        <h2 className="text-2xl font-bold mb-6">
          {featuredServices.length > 0
            ? t("alternatives", { category: capitalizedCategory })
            : t("alternatives", { category: capitalizedCategory })}
        </h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 auto-rows-fr">
          {(regularServices.length > 0 ? regularServices : euServices).map(
            (service) => (
              <ServiceCard
                key={service.name}
                service={service}
                showCategory={false}
              />
            )
          )}
        </div>

        {/* Newsletter Section */}
        <section className="py-8">
          <NewsletterCta />
        </section>

      </Container>
      {/* CTA Section */}
      <section className="">
        <Container>
          <ContributeCta />
        </Container>
      </section>
    </main>
  );
}
