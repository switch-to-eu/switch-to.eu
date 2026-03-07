import { getServicesByCategory } from "@switch-to-eu/content/services/services";
import {
  getCategoryContent,
  getAllCategoriesMetadata,
} from "@switch-to-eu/content/services/categories";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { ServiceCard } from "@/components/ui/ServiceCard";

import { RecommendedAlternative } from "@/components/ui/RecommendedAlternative";
import { SuggestServiceCard } from "@/components/ui/SuggestServiceCard";
import { Container } from "@/components/layout/container";
import { PageLayout } from "@/components/layout/page-layout";
import { getTranslations } from "next-intl/server";
import { Locale } from "next-intl";
import { NewsletterCta } from "@/components/NewsletterCta";
import { Banner } from "@switch-to-eu/blocks/components/banner";
import { SectionHeading } from "@switch-to-eu/blocks/components/section-heading";

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
    <PageLayout>
      {/* Hero — large navy block with title, description, and stats */}
      <section>
        <Container noPaddingMobile overlapHeader>
          <Banner
            color="bg-brand-navy"
            shapes={[
              { shape: "cloud", className: "-top-8 -right-8 w-36 h-36 sm:w-48 sm:h-48" },
              { shape: "sunburst", className: "bottom-6 right-16 hidden sm:block w-28 h-28 sm:w-36 sm:h-36", opacity: 0.1, duration: "8s", delay: "-2s" },
              { shape: "heart", className: "top-1/2 -left-6 hidden md:block w-20 h-20", opacity: 0.1, duration: "7s", delay: "-4s" },
            ]}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12 items-start">
              {/* Left: Title + subtitle */}
              <div>
                <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl lg:text-7xl uppercase text-brand-yellow mb-4">
                  {pageTitle}
                </h1>
                <p className="text-brand-sky text-base sm:text-lg">
                  {pageDescription}
                </p>
              </div>

              {/* Right: Description */}
              {categoryContent && (
                <div>
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
          </Banner>
        </Container>
      </section>

      {/* Featured services */}
      {featuredServices.length > 0 && (
        <section>
          <Container noPaddingMobile>
            <div className="flex flex-col gap-6">
              {featuredServices.map((service) => (
                <RecommendedAlternative
                  key={service.name}
                  service={service}
                  sourceService={service.name}
                  migrationGuides={[]}
                />
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* All services — colorful card grid */}
      <section>
        <Container noPaddingMobile>
          <SectionHeading>
            {t("alternatives", { category: capitalizedCategory })}
          </SectionHeading>
          <div className="grid gap-0 md:gap-5 auto-rows-fr grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {allDisplayServices.map((service, index) => (
              <ServiceCard
                key={service.name}
                service={service}
                showCategory={false}
                colorIndex={index}
              />
            ))}
            <SuggestServiceCard colorIndex={allDisplayServices.length} />
          </div>
        </Container>
      </section>

      {/* Newsletter Section */}
      <NewsletterCta />
    </PageLayout>
  );
}
