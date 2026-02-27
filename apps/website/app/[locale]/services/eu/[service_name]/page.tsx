import {
  getServiceBySlug,
  getServicesByCategory,
  getServiceSlugs,
} from "@switch-to-eu/content/services/services";

import { getGuidesByTargetService } from "@switch-to-eu/content/services/guides";
import { notFound } from "next/navigation";
import { RegionBadge } from "@switch-to-eu/ui/components/region-badge";
import { Link } from "@switch-to-eu/i18n/navigation";
import { parseMarkdown } from "@switch-to-eu/content/markdown";
import { Metadata } from "next";
import { ServiceCard } from "@/components/ui/ServiceCard";
import { ContributeCta } from "@/components/ContributeCta";
import { Button } from "@switch-to-eu/ui/components/button";

import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Locale } from "next-intl";

export function generateStaticParams() {
  const serviceNames = getServiceSlugs("eu");

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
    title: `${frontmatter.name} | EU Service | switch-to.eu`,
    description: frontmatter.description,
    keywords: [
      frontmatter.name,
      frontmatter.category,
      "EU service",
      "privacy-focused",
      "GDPR compliant",
      ...(frontmatter.tags || []),
    ],
    alternates: {
      canonical: `https://switch-to.eu/${locale}/services/eu/${service_name}`,
      languages: {
        en: `https://switch-to.eu/en/services/eu/${service_name}`,
        nl: `https://switch-to.eu/nl/services/eu/${service_name}`,
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
  const t = await getTranslations("services.detail");

  const slug = service_name.replace(/-/g, " ");
  const serviceData = getServiceBySlug(slug, locale);

  if (!serviceData) {
    notFound();
  }

  const { frontmatter, content } = serviceData;

  const relatedGuides = getGuidesByTargetService(frontmatter.name, locale);

  const similarServices = getServicesByCategory(
    frontmatter.category,
    "eu",
    locale
  )
    .filter((service) => service.name !== frontmatter.name)
    .sort((a, b) => {
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      return 0;
    })
    .slice(0, 4);

  const htmlContent = content ? parseMarkdown(content) : "";

  return (
    <main className="py-4 sm:py-6 md:py-8">
      {/* Hero Banner */}
      <div className="container max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 mb-8 sm:mb-12">
        <div className="bg-brand-navy rounded-3xl">
          <div className="relative px-6 sm:px-10 md:px-16 py-10 sm:py-14 overflow-hidden">
            <div className="absolute -top-6 -right-6 w-32 h-32 sm:w-44 sm:h-44 opacity-15 pointer-events-none">
              <Image
                src="/images/shapes/spark.svg"
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
                <h1 className="font-heading text-4xl sm:text-5xl uppercase text-brand-yellow">
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
              <p className="text-brand-sky text-base sm:text-lg mb-6 max-w-2xl">
                {frontmatter.description}
              </p>
              <div className="flex flex-wrap gap-4 mb-6 text-sm text-white/80">
                <div className="flex items-center">
                  <span className="font-semibold mr-2">{t("location")}:</span>
                  <span>{frontmatter.location}</span>
                </div>
                <div className="flex items-center">
                  <span className="font-semibold mr-2">
                    {t("freeOption")}:
                  </span>
                  <span>
                    {frontmatter.freeOption
                      ? t("freeOptionYes")
                      : t("freeOptionNo")}
                  </span>
                </div>
                {frontmatter.startingPrice && (
                  <div className="flex items-center">
                    <span className="font-semibold mr-2">
                      {t("startingPrice")}:
                    </span>
                    <span>{frontmatter.startingPrice}</span>
                  </div>
                )}
              </div>
              <Button
                variant="default"
                asChild
                className="bg-brand-yellow text-brand-navy hover:bg-brand-yellow/90 rounded-full px-8 font-semibold"
              >
                <Link href={frontmatter.url} target="_blank">
                  {t("visitWebsite")}
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-7xl lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Mobile Migration Guides */}
            {relatedGuides.length > 0 ? (
              <div className="lg:hidden mb-8 p-6 bg-brand-sage rounded-3xl">
                <h2 className="font-heading text-2xl uppercase text-brand-green mb-4">
                  {t("migrationGuides")}
                </h2>
                <p className="text-brand-green/80 mb-4">
                  {t("migrateHelp")} <b>{frontmatter.name}</b>
                </p>
                <div className="space-y-4">
                  {relatedGuides.map((guide) => (
                    <Link
                      key={`${guide.category}-${guide.slug}`}
                      href={`/guides/${guide.category}/${guide.slug}`}
                      className="block rounded-2xl bg-white/50 p-4 no-underline transition-colors hover:bg-white/80"
                    >
                      <h3 className="text-lg mb-1 text-brand-green font-semibold">
                        {guide.frontmatter.sourceService &&
                          `${guide.frontmatter.sourceService} → ${frontmatter.name}`}
                        {!guide.frontmatter.sourceService &&
                          guide.frontmatter.title}
                      </h3>
                      <p className="text-xs text-brand-green/70">
                        {guide.frontmatter.description}
                      </p>
                    </Link>
                  ))}
                </div>
                <div className="mt-6 pt-4 border-t border-brand-green/20">
                  <div className="flex justify-center">
                    <Link
                      href="/contribute"
                      className="inline-block px-6 py-2.5 bg-brand-green text-white rounded-full text-sm font-semibold no-underline hover:opacity-90 transition-opacity"
                    >
                      {t("writeAnotherGuide")}
                    </Link>
                  </div>
                </div>
              </div>
            ) : (
              <div className="lg:hidden mb-8 p-6 bg-brand-sage rounded-3xl">
                <h2 className="font-heading text-2xl uppercase text-brand-green mb-4">
                  {t("migrationGuides")}
                </h2>
                <p className="text-brand-green/80 mb-4">
                  {t("noGuides")} <b>{frontmatter.name}</b>.
                </p>
                <p className="text-brand-green/80 mb-6">{t("helpOthers")}</p>
                <div className="flex justify-center">
                  <Link
                    href="/contribute"
                    className="inline-block px-6 py-2.5 bg-brand-green text-white rounded-full text-sm font-semibold no-underline hover:opacity-90 transition-opacity"
                  >
                    {t("writeMigrationGuide")}
                  </Link>
                </div>
              </div>
            )}

            {/* Markdown Content */}
            {htmlContent && (
              <div className="mdx-content prose prose-sm sm:prose dark:prose-invert max-w-none mb-12">
                <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
              </div>
            )}

            {/* Similar Services */}
            {similarServices.length > 0 && (
              <div className="mb-12">
                <h2 className="font-heading text-3xl sm:text-4xl uppercase text-brand-green mb-6">
                  {t("similarServices")}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {similarServices.map((service) => (
                    <div key={service.name} className="relative">
                      <ServiceCard service={service} showCategory={false} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* CTA Section */}
            <ContributeCta />
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="hidden lg:block sticky top-24 bg-brand-sage rounded-3xl p-6 overflow-hidden">
              <div className="relative h-40 mb-6">
                <div className="absolute inset-0">
                  <Image
                    src="/images/shapes/squiggle.svg"
                    alt=""
                    fill
                    className="object-contain select-none animate-shape-float p-4"
                    style={{
                      filter: "brightness(0) saturate(100%) invert(20%) sepia(95%) saturate(750%) hue-rotate(127deg) brightness(93%) contrast(102%)",
                      opacity: 0.25,
                      animationDuration: "8s",
                    }}
                    aria-hidden="true"
                    unoptimized
                  />
                </div>
                <div className="absolute inset-6">
                  <Image
                    src="/images/shapes/arch.svg"
                    alt=""
                    fill
                    className="object-contain select-none animate-shape-float"
                    style={{
                      filter: "brightness(0) saturate(100%) invert(20%) sepia(95%) saturate(750%) hue-rotate(127deg) brightness(93%) contrast(102%)",
                      opacity: 0.4,
                      animationDuration: "6s",
                      animationDelay: "-2s",
                    }}
                    aria-hidden="true"
                    unoptimized
                  />
                </div>
              </div>
              <h2 className="font-heading text-xl uppercase text-brand-green text-center mb-4">
                {t("migrationGuides")}
              </h2>

              {relatedGuides.length > 0 ? (
                <>
                  <p className="text-brand-green/80 mb-4 text-sm">
                    {t("migrateHelp")} <b>{frontmatter.name}</b>
                  </p>
                  <div className="space-y-3">
                    {relatedGuides.map((guide) => (
                      <Link
                        key={`${guide.category}-${guide.slug}`}
                        href={`/guides/${guide.category}/${guide.slug}`}
                        className="block rounded-2xl bg-white/50 p-3 no-underline transition-colors hover:bg-white/80"
                      >
                        <h3 className="text-base mb-1 text-brand-green font-semibold">
                          {guide.frontmatter.sourceService &&
                            `${guide.frontmatter.sourceService} → ${frontmatter.name}`}
                          {!guide.frontmatter.sourceService &&
                            guide.frontmatter.title}
                        </h3>
                        <p className="text-xs text-brand-green/70">
                          {guide.frontmatter.description}
                        </p>
                      </Link>
                    ))}
                  </div>
                  <div className="mt-6 pt-4 border-t border-brand-green/20">
                    <p className="text-sm text-brand-green/70 mb-3 text-center">
                      {t("anotherServiceHelp")}
                    </p>
                    <div className="flex justify-center">
                      <Link
                        href="/contribute"
                        className="inline-block px-5 py-2 bg-brand-green text-white rounded-full text-sm font-semibold no-underline hover:opacity-90 transition-opacity"
                      >
                        {t("writeAnotherGuide")}
                      </Link>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <p className="text-brand-green/80 mb-4 text-sm">
                    {t("noGuides")} <b>{frontmatter.name}</b>.
                  </p>
                  <p className="text-brand-green/70 mb-6 text-sm">
                    {t("helpOthers")}
                  </p>
                  <div className="flex justify-center">
                    <Link
                      href="/contribute"
                      className="inline-block px-5 py-2 bg-brand-green text-white rounded-full text-sm font-semibold no-underline hover:opacity-90 transition-opacity"
                    >
                      {t("writeMigrationGuide")}
                    </Link>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
