import { getPayload } from "@/lib/payload";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { ServiceCard } from "@/components/ui/ServiceCard";

import { RecommendedAlternative } from "@/components/ui/RecommendedAlternative";
import { SuggestServiceCard } from "@/components/ui/SuggestServiceCard";
import { Container } from "@switch-to-eu/blocks/components/container";
import { PageLayout } from "@switch-to-eu/blocks/components/page-layout";
import { getTranslations } from "next-intl/server";
import { Locale } from "next-intl";
import { NewsletterCta } from "@/components/NewsletterCta";
import { Banner } from "@switch-to-eu/blocks/components/banner";
import { SectionHeading } from "@switch-to-eu/blocks/components/section-heading";
import { RichText } from "@payloadcms/richtext-lexical/react";
import type { Category, Service } from "@/payload-types";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string; locale: string }>;
}): Promise<Metadata> {
  const { category, locale } = await params;

  const capitalizedCategory =
    category.charAt(0).toUpperCase() + category.slice(1);

  const payload = await getPayload();
  const { docs } = await payload.find({
    collection: "categories",
    where: { slug: { equals: category } },
    locale: locale as 'en' | 'nl',
    limit: 1,
  });
  const categoryData = docs[0] as Category | undefined;

  const pageTitle =
    categoryData?.title || `${capitalizedCategory} Service Alternatives`;
  const pageDescription =
    categoryData?.description ||
    `EU-based alternatives for common ${category} services that prioritize privacy and data protection.`;

  const siteUrl = process.env.NEXT_PUBLIC_URL || "https://www.switch-to.eu";
  const path = `/services/${category}`;
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
    alternates: {
      canonical: `${siteUrl}/${locale}${path}`,
      languages: {
        en: `${siteUrl}/en${path}`,
        nl: `${siteUrl}/nl${path}`,
      },
    },
    openGraph: {
      title,
      description,
    },
  };
}

export const dynamicParams = false;

export async function generateStaticParams() {
  const payload = await getPayload();
  const { docs } = await payload.find({ collection: "categories", limit: 100 });
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

  const payload = await getPayload();

  const capitalizedCategory =
    category.charAt(0).toUpperCase() + category.slice(1);

  // Fetch category data
  const { docs: categoryDocs } = await payload.find({
    collection: "categories",
    where: { slug: { equals: category } },
    locale: locale as 'en' | 'nl',
    limit: 1,
  });
  const categoryData = categoryDocs[0] as Category | undefined;

  if (!categoryData) {
    notFound();
  }

  // Fetch EU services for this category
  const { docs: euServices } = await payload.find({
    collection: "services",
    where: {
      category: { equals: categoryData.id },
      region: { in: ["eu", "eu-friendly"] },
    },
    locale: locale as 'en' | 'nl',
    limit: 100,
  }) as { docs: Service[] };

  if (euServices.length === 0) {
    notFound();
  }

  // Map Payload services to match ServiceFrontmatter shape for existing components
  const mappedServices = euServices.map((service) => ({
    ...service,
    category: category,
    freeOption: service.freeOption ?? false,
    featured: service.featured ?? false,
    screenshot:
      typeof service.screenshot === "object" && service.screenshot
        ? service.screenshot.url ?? undefined
        : undefined,
    features: Array.isArray(service.features)
      ? service.features.map((f) => f.feature)
      : [],
    tags: Array.isArray(service.tags)
      ? service.tags.map((t) => t.tag)
      : [],
  }));

  const featuredServices = mappedServices.filter(
    (service) => service.featured === true
  );

  const regularServices = mappedServices.filter((service) => !service.featured);
  const allDisplayServices =
    regularServices.length > 0 ? regularServices : mappedServices;

  const pageTitle =
    categoryData?.title || `${capitalizedCategory} Service Alternatives`;
  const pageDescription =
    categoryData?.description ||
    `EU-based alternatives for common ${category} services that prioritize privacy and data protection.`;

  return (
    <PageLayout>
      {/* Hero — large navy block with title, description, and stats */}
        <Container noPaddingMobile>
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
                <p className="text-brand-cream text-base sm:text-lg">
                  {pageDescription}
                </p>
              </div>

              {/* Right: Description */}
              {categoryData.content && (
                <div className="text-white/70 text-sm sm:text-base leading-relaxed [&>p+p]:mt-3">
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
                  migrationGuides={[]}
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

      {/* Newsletter Section */}
      <NewsletterCta />
    </PageLayout>
  );
}
