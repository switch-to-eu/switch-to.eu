import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Link } from "@switch-to-eu/i18n/navigation";
import { RegionBadge } from "@switch-to-eu/ui/components/region-badge";
import { Container } from "@switch-to-eu/blocks/components/container";
import { Banner } from "@switch-to-eu/blocks/components/banner";
import type { Service, Guide } from "@/payload-types";
import { SectionHeading } from "@switch-to-eu/blocks/components/section-heading";
import { ServiceSubNav } from "@/components/ui/ServiceSubNav";
import { ServiceCta } from "@/components/ui/ServiceCta";
import { ServiceCard } from "@/components/ui/ServiceCard";
import { AffiliateDisclosure } from "@/components/ui/AffiliateDisclosure";
import { SuggestServiceCard } from "@/components/ui/SuggestServiceCard";
import {
  getServiceBySlug,
  getRelatedGuides,
  getSimilarServices,
  getCategorySlug,
  getCategoryId,
  getScreenshotUrl,
  getOutboundUrl,
} from "@/lib/services";

function getAvailableTabs(
  service: Service,
  guides: Guide[],
  basePath: string
) {
  const tabs: {
    key: string;
    href: string;
    label: string;
    isComparison?: boolean;
    compareName?: string;
  }[] = [];

  tabs.push({ key: "overview", href: basePath, label: "overview" });

  if (service.pricingDetails || service.startingPrice) {
    tabs.push({
      key: "pricing",
      href: `${basePath}/pricing`,
      label: "pricing",
    });
  }

  if (
    service.gdprCompliance ||
    service.certifications?.length ||
    service.dataStorageLocations?.length
  ) {
    tabs.push({
      key: "security",
      href: `${basePath}/security`,
      label: "security",
    });
  }

  for (const guide of guides) {
    const sourceService =
      typeof guide.sourceService === "object" ? guide.sourceService : null;
    if (sourceService) {
      tabs.push({
        key: `vs-${sourceService.slug}`,
        href: `${basePath}/vs-${sourceService.slug}`,
        label: "compare",
        isComparison: true,
        compareName: sourceService.name,
      });
    }
  }

  return tabs;
}

export default async function ServiceLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string; service_name: string }>;
}) {
  const { service_name, locale } = await params;
  const t = await getTranslations("services.detail");

  const service = await getServiceBySlug(service_name, locale);

  if (!service) {
    notFound();
  }

  const categorySlug = getCategorySlug(service.category);
  const categoryFormatted =
    categorySlug.charAt(0).toUpperCase() + categorySlug.slice(1);

  const screenshotUrl = getScreenshotUrl(service.screenshot);

  const relatedGuides = await getRelatedGuides(service.id, locale);

  // Get first guide for hero CTA
  const firstGuide = relatedGuides[0] ?? null;
  const firstGuideCategory =
    firstGuide && typeof firstGuide.category === "object"
      ? firstGuide.category.slug
      : null;
  const firstSourceName =
    firstGuide && typeof firstGuide.sourceService === "object"
      ? firstGuide.sourceService.name
      : null;

  // Fetch similar services
  const categoryId = getCategoryId(service.category);
  const similarServices = await getSimilarServices(
    categoryId,
    service.id,
    locale
  );

  const basePath = `/services/eu/${service_name}`;
  const tabs = getAvailableTabs(service, relatedGuides, basePath);

  const translatedTabs = tabs.map((tab) => ({
    key: tab.key,
    href: tab.href,
    label: tab.isComparison
      ? `${service.name} vs ${tab.compareName}`
      : (t(`tabs.${tab.label}` as Parameters<typeof t>[0]) as string),
  }));

  const hasSubpages = translatedTabs.length > 1;

  return (
    <>
      {/* Hero - shared across all subpages */}
      <Container noPaddingMobile>
        <Link
          href={`/services/${categorySlug}`}
          className="inline-flex items-center gap-1.5 text-brand-green/60 text-sm mb-3 px-4 sm:px-0 pt-2 no-underline hover:text-brand-green transition-colors"
        >
          <span>&larr;</span>
          <span>{categoryFormatted}</span>
        </Link>

        <Banner
          color="bg-brand-navy"
          {...(!screenshotUrl && { className: "[&>div]:py-8 [&>div]:sm:py-10" })}
          shapes={[
            {
              shape: "spark",
              className: "-top-8 -right-8 w-36 h-36 sm:w-48 sm:h-48",
            },
            {
              shape: "blob",
              className: "bottom-4 right-20 hidden sm:block w-28 h-28",
              opacity: 0.1,
              duration: "9s",
              delay: "-3s",
            },
            {
              shape: "diamond-4",
              className: "top-1/3 -left-4 hidden md:block w-16 h-16",
              opacity: 0.1,
              duration: "7s",
              delay: "-5s",
            },
          ]}
        >
          <div className={`grid gap-8 items-center ${screenshotUrl ? "grid-cols-1 md:grid-cols-2 md:gap-16" : "grid-cols-1 max-w-3xl"}`}>
            <div>
              <div className="flex items-start gap-3 mb-3">
                <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl uppercase text-brand-yellow">
                  {service.name}
                </h1>
                <div className="flex-shrink-0 mt-2">
                  <RegionBadge
                    region={
                      (service.region as "eu" | "non-eu" | "eu-friendly") ||
                      "eu"
                    }
                  />
                </div>
              </div>

              <p className="text-brand-cream text-base sm:text-lg mb-4 max-w-2xl leading-relaxed">
                {service.description}
              </p>

              <div className="flex flex-wrap gap-2 mb-4">
                <span className="inline-flex items-center gap-1.5 bg-white/10 text-white/90 rounded-full px-3 py-1 text-sm">
                  {service.location}
                </span>
                {service.freeOption && (
                  <span className="inline-flex items-center gap-1.5 bg-white/10 text-white/90 rounded-full px-3 py-1 text-sm">
                    {t("freePlanPill")}
                  </span>
                )}
                {service.startingPrice && (
                  <span className="inline-flex items-center gap-1.5 bg-white/10 text-white/90 rounded-full px-3 py-1 text-sm">
                    {t("fromPrice", { price: service.startingPrice })}
                  </span>
                )}
              </div>

              <div className="flex flex-row gap-2">
                <a
                  href={getOutboundUrl(service)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block px-4 sm:px-6 py-2 bg-brand-yellow text-brand-navy font-semibold rounded-full hover:opacity-90 transition-opacity text-xs sm:text-sm no-underline whitespace-nowrap"
                >
                  {t("tryService", { service: service.name })} &rarr;
                </a>
                {firstGuide && firstGuideCategory && (
                  <Link
                    href={`/guides/${firstGuideCategory}/${firstGuide.slug}`}
                    className="inline-block px-4 sm:px-6 py-2 border-2 border-brand-yellow text-brand-yellow font-semibold rounded-full hover:bg-brand-yellow hover:text-brand-navy transition-colors text-xs sm:text-sm no-underline whitespace-nowrap"
                  >
                    {t("switchFrom", { service: firstSourceName ?? "" })}
                  </Link>
                )}
              </div>
              <AffiliateDisclosure className="mt-2 text-brand-cream/30 hover:text-brand-cream/50 decoration-brand-cream/20" />
            </div>
            {screenshotUrl && (
              <div className="flex justify-center md:justify-end">
                <div className="relative w-full">
                  <img
                    src={screenshotUrl}
                    alt={service.name}
                    className="w-full h-auto object-cover rounded-2xl"
                  />
                  {service.featured && (
                    <div className="absolute -top-6 -right-6 sm:-top-8 sm:-right-8 flex items-center justify-center">
                      <svg
                        viewBox="0 0 362.94 366"
                        className="w-28 h-28 sm:w-32 sm:h-32 text-brand-green drop-shadow-lg"
                        aria-hidden="true"
                      >
                        <path
                          d="M166.52,360.05c-19.36-8.03-41.21-5.87-62.05-8.18-20.83-2.31-43.84-11.92-49.96-31.97-5.04-16.53,3.15-34.97-2.06-51.44-7.81-24.66-41.25-33.37-50.23-57.63-5.76-15.55.46-33.1,9.58-46.95,9.12-13.85,21.14-25.78,28.87-40.45,9.68-18.35,11.97-39.62,18.8-59.21,6.84-19.59,20.83-39.25,41.35-42.33,16.4-2.46,32.59,6.32,49.17,5.87,18.39-.5,34.31-12.06,50.84-20.14,16.53-8.08,38.34-12.16,51.86.32,10.92,10.08,12.24,27.37,22.51,38.11,10.86,11.35,28.27,12.28,43.85,14.26,15.58,1.98,33.43,7.89,38.23,22.84,3.89,12.1-2.62,24.95-9.81,35.44-7.19,10.48-15.61,21.27-16.03,33.97-.48,14.6,9.66,27.06,18.34,38.81,8.68,11.75,16.7,26.67,11.52,40.33-4.55,12-17.57,18.24-29.7,22.43-12.13,4.19-25.41,8.09-33.15,18.33-7.32,9.68-7.87,22.65-10.36,34.53-2.49,11.88-9.05,24.89-20.98,27.1-9.14,1.69-18.26-3.67-27.54-3.14-9.6.55-17.69,7.25-24.25,14.28-6.56,7.04-12.63,14.95-21.2,19.33-8.56,4.38-17.86-2.34-27.61-4.49"
                          fill="currentColor"
                        />
                      </svg>
                      <span className="absolute text-white text-[9px] sm:text-[11px] font-bold uppercase leading-tight text-center px-2">
                        {t("recommended")}
                        <br />
                        {t("recommendedBy")}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </Banner>
      </Container>

      {/* Tab navigation - below hero */}
      {hasSubpages && (
        <ServiceSubNav tabs={translatedTabs} />
      )}

      {/* Page content - add top spacing below sticky tab nav */}
      <div className={hasSubpages ? "pt-2 sm:pt-4" : ""}>
        {children}
      </div>

      {/* Shared CTA - appears on every subpage */}
      <ServiceCta
        serviceName={service.name}
        serviceUrl={getOutboundUrl(service)}
        guideHref={
          firstGuide && firstGuideCategory
            ? `/guides/${firstGuideCategory}/${firstGuide.slug}`
            : null
        }
        sourceServiceName={firstSourceName}
      />

      {/* Similar services - shared across all subpages */}
      {similarServices.length > 0 && (
        <Container noPaddingMobile className="sm:py-8 md:py-12">
          <SectionHeading>{t("similarServices")}</SectionHeading>
          <div className="grid gap-0 md:gap-5 auto-rows-fr grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {similarServices.map((s, index) => (
              <ServiceCard
                key={s.name}
                service={s}
                showCategory={false}
                colorIndex={index}
              />
            ))}
            <SuggestServiceCard colorIndex={similarServices.length} />
          </div>
        </Container>
      )}
    </>
  );
}
