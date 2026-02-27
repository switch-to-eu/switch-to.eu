import {
  getServiceBySlug,
  getServicesByCategory,
  getRecommendedAlternative,
  getServiceSlugs,
} from "@switch-to-eu/content/services/services";
import { notFound, redirect } from "next/navigation";
import { parseMarkdown } from "@switch-to-eu/content/markdown";
import { getAllGuides } from "@switch-to-eu/content/services/guides";
import { RecommendedAlternative } from "@/components/ui/RecommendedAlternative";
import { ServiceCard } from "@/components/ui/ServiceCard";
import { getTranslations } from "next-intl/server";
import { Metadata } from "next";
import React from "react";
import { Locale } from "next-intl";
import { RegionBadge } from "@switch-to-eu/ui/components/region-badge";
import { WarningCollapsible } from "@/components/guides/WarningCollapsible";
import Image from "next/image";

export function generateStaticParams() {
  const serviceNames = getServiceSlugs("non-eu");

  return serviceNames.map((service_name) => ({
    service_name,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; service_name: string }>;
}): Promise<Metadata> {
  const { service_name, locale } = await params;
  const slug = service_name.replace(/-/g, " ");
  const serviceData = getServiceBySlug(slug, locale as Locale);

  if (!serviceData) {
    return {
      title: "Service Not Found",
    };
  }

  const { frontmatter } = serviceData;

  return {
    title: `${frontmatter.name} | Non-EU Service | switch-to.eu`,
    description: frontmatter.description,
    keywords: [
      frontmatter.name,
      frontmatter.category,
      "non-EU service",
      "service migration",
      "EU alternatives",
      ...(frontmatter.tags || []),
    ],
    alternates: {
      canonical: `https://switch-to.eu/${locale}/services/non-eu/${service_name}`,
      languages: {
        en: `https://switch-to.eu/en/services/non-eu/${service_name}`,
        nl: `https://switch-to.eu/nl/services/non-eu/${service_name}`,
      },
    },
  };
}

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ locale: Locale; service_name: string }>;
}) {
  const { service_name, locale } = await params;
  const t = await getTranslations("services.detail.nonEu");
  const commonT = await getTranslations("common");

  const originalSlug = service_name;
  const slug = service_name.replace(/-/g, " ");
  const serviceData = getServiceBySlug(slug, locale);

  if (!serviceData) {
    notFound();
  }

  const { frontmatter, content } = serviceData;

  if (frontmatter.region !== "non-eu") {
    redirect(`/${locale}/services/eu/${originalSlug}`);
  }

  const recommendedAlternativeData = frontmatter.recommendedAlternative
    ? getRecommendedAlternative(slug, locale)
    : null;

  const migrationGuides =
    frontmatter.recommendedAlternative && recommendedAlternativeData
      ? getAllGuides({
          sourceService: frontmatter.name,
          targetService: recommendedAlternativeData.name,
          lang: locale,
        })
      : [];

  const htmlContent = content ? parseMarkdown(content) : "";

  const euAlternatives = getServicesByCategory(
    frontmatter.category,
    "eu",
    locale
  );

  const otherAlternatives = recommendedAlternativeData
    ? euAlternatives.filter(
        (alt) => alt.name !== recommendedAlternativeData.name
      )
    : euAlternatives;

  return (
    <main className="py-4 sm:py-6 md:py-8">
      {/* Hero Banner — orange/red accent for non-EU */}
      <div className="container max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 mb-8 sm:mb-12">
        <div className="bg-brand-orange rounded-3xl">
          <div className="relative px-6 sm:px-10 md:px-16 py-10 sm:py-14 overflow-hidden">
            <div className="absolute -top-6 -right-6 w-32 h-32 sm:w-44 sm:h-44 opacity-15 pointer-events-none">
              <Image
                src="/images/shapes/starburst.svg"
                alt=""
                fill
                className="object-contain select-none animate-shape-float"
                style={{ filter: "brightness(0) invert(1)" }}
                aria-hidden="true"
                unoptimized
              />
            </div>
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-4">
                <h1 className="font-heading text-4xl sm:text-5xl uppercase text-white">
                  {frontmatter.name}
                </h1>
                <RegionBadge
                  region={
                    (frontmatter.region as
                      | "eu"
                      | "non-eu"
                      | "eu-friendly") || "non-eu"
                  }
                />
              </div>
              <p className="text-white/90 text-base sm:text-lg max-w-2xl">
                {frontmatter.description}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-7xl lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Recommended Alternative */}
            {recommendedAlternativeData && (
              <React.Suspense
                fallback={
                  <div className="mb-10 p-6 bg-brand-sage rounded-3xl">
                    <p className="text-center">{commonT("loading")}</p>
                  </div>
                }
              >
                <RecommendedAlternative
                  service={recommendedAlternativeData}
                  sourceService={frontmatter.name}
                  migrationGuides={migrationGuides}
                />
              </React.Suspense>
            )}

            {/* Mobile Service Issues Section */}
            {frontmatter.issues && frontmatter.issues.length > 0 && (
              <div className="mb-8 lg:hidden">
                <WarningCollapsible
                  items={frontmatter.issues}
                  title={t("whyProblematic", { service: frontmatter.name })}
                  variant="error"
                  iconType="alert-triangle"
                  className="rounded-3xl border"
                />
              </div>
            )}

            {/* Service Details */}
            <div className="mb-12">
              {htmlContent && (
                <div className="mdx-content prose prose-slate prose-sm sm:prose dark:prose-invert max-w-none">
                  <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
                </div>
              )}
            </div>

            {/* Other EU Alternatives Section */}
            {otherAlternatives.length > 0 && (
              <div className="mb-12">
                <h2 className="font-heading text-3xl sm:text-4xl uppercase text-brand-green mb-4">
                  {t("otherAlternatives")}
                </h2>
                <p className="mb-6 text-slate-600 dark:text-slate-300">
                  {otherAlternatives.length > 1
                    ? t("otherEUAlternatives")
                    : t("oneMoreEUAlternative")}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {otherAlternatives.map((service) => (
                    <ServiceCard
                      key={service.name}
                      service={service}
                      showCategory={false}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {frontmatter.issues && frontmatter.issues.length > 0 ? (
              <div className="hidden lg:block sticky top-24 bg-brand-red/10 rounded-3xl overflow-hidden border border-brand-red/20">
                <div className="p-5 bg-brand-red/20 border-b border-brand-red/20">
                  <h2 className="font-heading text-xl uppercase text-brand-red">
                    {t("whyProblematic", { service: frontmatter.name })}
                  </h2>
                </div>

                <div className="p-5 space-y-4">
                  {frontmatter.issues.map((issue: string, index: number) => (
                    <div key={index} className="flex items-start">
                      <span className="mr-3 text-brand-red mt-0.5 flex-shrink-0">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <circle cx="12" cy="12" r="10" />
                          <line x1="15" y1="9" x2="9" y2="15" />
                          <line x1="9" y1="9" x2="15" y2="15" />
                        </svg>
                      </span>
                      <p className="text-slate-700 dark:text-slate-300 text-sm">
                        {issue}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="hidden lg:block sticky top-24 rounded-3xl p-6 bg-brand-navy overflow-hidden">
                <div className="absolute -top-4 -right-4 w-20 h-20 opacity-15 pointer-events-none">
                  <Image
                    src="/images/shapes/sunburst.svg"
                    alt=""
                    fill
                    className="object-contain select-none animate-shape-float"
                    style={{ filter: "brightness(0) invert(1)" }}
                    aria-hidden="true"
                    unoptimized
                  />
                </div>
                <h2 className="font-heading text-xl uppercase text-brand-yellow mb-4 relative z-10">
                  {t("whySwitchTitle")}
                </h2>
                <div className="space-y-3 relative z-10">
                  <div className="p-3 rounded-2xl bg-white/10">
                    <h3 className="font-medium mb-1 text-white text-sm">
                      {t("dataSovereignty.title")}
                    </h3>
                    <p className="text-xs text-brand-sky/80">
                      {t("dataSovereignty.description")}
                    </p>
                  </div>
                  <div className="p-3 rounded-2xl bg-white/10">
                    <h3 className="font-medium mb-1 text-white text-sm">
                      {t("gdprCompliance.title")}
                    </h3>
                    <p className="text-xs text-brand-sky/80">
                      {t("gdprCompliance.description")}
                    </p>
                  </div>
                  <div className="p-3 rounded-2xl bg-white/10">
                    <h3 className="font-medium mb-1 text-white text-sm">
                      {t("legalRecourse.title")}
                    </h3>
                    <p className="text-xs text-brand-sky/80">
                      {t("legalRecourse.description")}
                    </p>
                  </div>
                  <div className="p-3 rounded-2xl bg-white/10">
                    <h3 className="font-medium mb-1 text-white text-sm">
                      {t("supportEUDigital.title")}
                    </h3>
                    <p className="text-xs text-brand-sky/80">
                      {t("supportEUDigital.description")}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
