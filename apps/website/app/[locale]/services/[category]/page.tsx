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
import { Link } from "@switch-to-eu/i18n/navigation";

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
  const homeT = await getTranslations("home");

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
  const allDisplayServices =
    regularServices.length > 0 ? regularServices : euServices;

  const pageTitle =
    categoryMetadata?.title || `${capitalizedCategory} Service Alternatives`;
  const pageDescription =
    categoryMetadata?.description ||
    `EU-based alternatives for common ${category} services that prioritize privacy and data protection.`;

  return (
    <main className="flex flex-col gap-8 sm:gap-12 md:gap-16 py-4 sm:py-6 md:py-8">
      {/* Hero — large navy block with title, description, and stats */}
      <section>
        <div className="container max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="bg-brand-navy rounded-3xl">
            <div className="relative px-6 sm:px-10 md:px-16 py-12 sm:py-16 md:py-20 overflow-hidden">
              {/* Decorative shapes */}
              <div className="absolute -top-8 -right-8 w-36 h-36 sm:w-48 sm:h-48 opacity-15 pointer-events-none">
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
              <div className="absolute bottom-6 right-16 hidden sm:block w-28 h-28 sm:w-36 sm:h-36 opacity-10 pointer-events-none">
                <Image
                  src="/images/shapes/sunburst.svg"
                  alt=""
                  fill
                  className="object-contain select-none animate-shape-float"
                  style={{
                    filter: "brightness(0) invert(1)",
                    animationDuration: "8s",
                    animationDelay: "-2s",
                  }}
                  aria-hidden="true"
                  unoptimized
                />
              </div>
              <div className="absolute top-1/2 -left-6 hidden md:block w-20 h-20 opacity-10 pointer-events-none">
                <Image
                  src="/images/shapes/heart.svg"
                  alt=""
                  fill
                  className="object-contain select-none animate-shape-float"
                  style={{
                    filter: "brightness(0) invert(1)",
                    animationDuration: "7s",
                    animationDelay: "-4s",
                  }}
                  aria-hidden="true"
                  unoptimized
                />
              </div>

              {/* Content */}
              <div className="relative z-10">
                <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 lg:gap-12">
                  <div className="flex-1">
                    <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl lg:text-7xl uppercase text-brand-yellow mb-4 lg:mb-6">
                      {pageTitle}
                    </h1>
                    <p className="text-brand-sky text-base sm:text-lg max-w-2xl">
                      {pageDescription}
                    </p>
                  </div>

                  {/* Stats pill */}
                  <div className="flex-shrink-0">
                    <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-full px-5 py-3 border border-white/10">
                      <span className="text-3xl sm:text-4xl font-bold text-brand-yellow">
                        {euServices.length}
                      </span>
                      <span className="text-brand-sky text-sm sm:text-base leading-tight">
                        EU
                        <br />
                        {t("alternatives", {
                          category: "",
                        }).trim()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Description integrated below */}
                {categoryContent && (
                  <div className="mt-8 pt-6 border-t border-white/10 max-w-3xl">
                    {categoryContent.split("\n\n").map((paragraph, index) => (
                      <p
                        key={index}
                        className={`text-white/70 text-sm sm:text-base leading-relaxed ${index > 0 ? "mt-3" : ""}`}
                      >
                        {paragraph}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured services — prominent horizontal cards */}
      {featuredServices.length > 0 && (
        <section>
          <div className="container max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
            <h2 className="font-heading text-3xl sm:text-4xl uppercase text-brand-green mb-6">
              {t("featuredAlternatives")}
            </h2>
            <div className="flex flex-col gap-6">
              {featuredServices.map((service, index) => (
                <React.Suspense
                  key={service.name}
                  fallback={
                    <div className="p-6 bg-brand-green rounded-3xl">
                      <p className="text-center text-white">
                        {commonT("loading")}
                      </p>
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
          </div>
        </section>
      )}

      {/* All services — colorful card grid */}
      <section>
        <div className="container max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-8">
            <h2 className="font-heading text-3xl sm:text-4xl uppercase text-brand-green">
              {t("alternatives", { category: capitalizedCategory })}
            </h2>
          </div>
          <div className="grid gap-5 sm:gap-6 grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 auto-rows-fr">
            {allDisplayServices.map((service, index) => (
              <ServiceCard
                key={service.name}
                service={service}
                showCategory={false}
                colorIndex={index}
              />
            ))}
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
