import { getServicesByCategory } from "@switch-to-eu/content/services/services";
import {
  getCategoryContent,
  getAllCategoriesMetadata,
} from "@switch-to-eu/content/services/categories";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { ServiceCard } from "@/components/ui/ServiceCard";
import { ContributeCta } from "@/components/ContributeCta";
import { RecommendedAlternative } from "@/components/ui/RecommendedAlternative";
import { getTranslations } from "next-intl/server";
import React from "react";
import { Locale } from "next-intl";
import { NewsletterCta } from "@/components/NewsletterCta";
import Image from "next/image";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string; locale: string }>;
}): Promise<Metadata> {
  const { category, locale } = await params;

  const capitalizedCategory =
    category.charAt(0).toUpperCase() + category.slice(1);

  const { metadata: categoryMetadata } = getCategoryContent(
    category,
    locale as Locale
  );

  const pageTitle =
    categoryMetadata?.title || `${capitalizedCategory} Service Alternatives`;
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
  const { category, locale } = await params;

  const t = await getTranslations("services");
  const commonT = await getTranslations("common");

  const capitalizedCategory =
    category.charAt(0).toUpperCase() + category.slice(1);

  const euServices = getServicesByCategory(category, "eu", locale);
  const { metadata: categoryMetadata, content: categoryContent } =
    getCategoryContent(category, locale);

  if (euServices.length === 0) {
    notFound();
  }

  const featuredServices = euServices.filter(
    (service) => service.featured === true
  );

  const regularServices = euServices.filter((service) => !service.featured);

  const pageTitle =
    categoryMetadata?.title || `${capitalizedCategory} Service Alternatives`;
  const pageDescription =
    categoryMetadata?.description ||
    `EU-based alternatives for common ${category} services that prioritize privacy and data protection.`;

  return (
    <main className="flex flex-col gap-8 sm:gap-12 md:gap-20 py-4 sm:py-6 md:py-8">
      {/* Hero */}
      <section>
        <div className="container max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="bg-brand-navy rounded-3xl">
            <div className="relative px-6 sm:px-10 md:px-16 py-10 sm:py-14 overflow-hidden">
              <div className="absolute -top-6 -right-6 w-32 h-32 sm:w-44 sm:h-44 opacity-15 pointer-events-none">
                <Image
                  src="/images/shapes/cloud.svg"
                  alt=""
                  fill
                  className="object-contain select-none animate-shape-float"
                  style={{ filter: "brightness(0) invert(1)" }}
                  aria-hidden="true"
                  unoptimized
                />
              </div>
              <div className="relative z-10">
                <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl uppercase text-brand-yellow mb-4">
                  {pageTitle}
                </h1>
                <p className="text-brand-sky text-base sm:text-lg max-w-2xl">
                  {pageDescription}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Category description */}
      {categoryContent && (
        <section>
          <div className="container max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
            <div className="max-w-3xl">
              {categoryContent.split("\n\n").map((paragraph, index) => (
                <p
                  key={index}
                  className={`text-base sm:text-lg ${index > 0 ? "mt-4" : ""}`}
                >
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured services as recommended alternatives */}
      {featuredServices.length > 0 && (
        <section>
          <div className="container max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
            {featuredServices.map((service) => (
              <React.Suspense
                key={service.name}
                fallback={
                  <div className="mb-6 p-6 bg-brand-sage rounded-3xl">
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
        </section>
      )}

      {/* Regular services grid */}
      <section>
        <div className="container max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <h2 className="font-heading text-3xl sm:text-4xl uppercase text-brand-green mb-8">
            {t("alternatives", { category: capitalizedCategory })}
          </h2>
          <div className="grid gap-5 sm:gap-6 md:grid-cols-2 lg:grid-cols-3 auto-rows-fr">
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
        </div>
      </section>

      {/* Newsletter Section */}
      <NewsletterCta />

      {/* CTA Section */}
      <ContributeCta />
    </main>
  );
}
