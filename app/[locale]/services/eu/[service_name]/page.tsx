import {
  getServiceBySlug,
  getServicesByCategory,
  getServiceSlugs,
} from "@/lib/content/services/services";
import { getGuidesByTargetService } from "@/lib/content/services/guides";
import { notFound } from "next/navigation";
import { RegionBadge } from "@/components/ui/region-badge";
import { Link } from "@/i18n/navigation";
import { parseMarkdown } from "@/lib/markdown";
import { Metadata } from "next";
import { ServiceCard } from "@/components/ui/ServiceCard";
import { ContributeCta } from "@/components/ContributeCta";
import { Button } from "@/components/ui/button";

import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Locale } from "next-intl";

// Generate static params for all EU services
export async function generateStaticParams() {
  const serviceNames = await getServiceSlugs("eu");

  return serviceNames.map((service_name) => ({
    service_name,
  }));
}

// Generate metadata for SEO
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale; service_name: string }>;
}): Promise<Metadata> {
  // Await the params
  const { service_name, locale } = await params;

  // Normalize slug (replace hyphens with spaces for lookup)
  const slug = service_name.replace(/-/g, " ");

  // Load service data
  const serviceData = await getServiceBySlug(slug, locale);

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
  // Await the params Promise
  const { service_name, locale } = await params;

  // Get translations
  const t = await getTranslations("services.detail");


  // Normalize slug (replace hyphens with spaces for lookup)
  // The conversion needs to be more flexible to handle special cases
  const slug = service_name.replace(/-/g, " ");

  // Load service data
  const serviceData = await getServiceBySlug(slug, locale);

  if (!serviceData) {
    notFound();
  }

  const { frontmatter, content } = serviceData;

  // Load related guides
  const relatedGuides = await getGuidesByTargetService(
    frontmatter.name,
    locale
  );

  // Load similar services from the same category
  const similarServices = (
    await getServicesByCategory(frontmatter.category, "eu", locale)
  )
    .filter((service) => service.name !== frontmatter.name)
    // Sort featured services to the top
    .sort((a, b) => {
      // If a is featured and b is not, a comes first
      if (a.featured && !b.featured) return -1;
      // If b is featured and a is not, b comes first
      if (!a.featured && b.featured) return 1;
      // Otherwise, keep original order
      return 0;
    })
    .slice(0, 4); // Limit to 4 similar services

  // Parse markdown content to HTML using our secure parseMarkdown function
  const htmlContent = content ? parseMarkdown(content) : "";

  return (
    <main className="container mx-auto px-4 py-8 max-w-7xl lg:px-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <div className="mb-8">
            <div className="flex justify-between items-start mb-2">
              <h1 className="text-3xl font-bold">{frontmatter.name}</h1>
              <RegionBadge region={(frontmatter.region as 'eu' | 'non-eu' | 'eu-friendly') || 'non-eu'} />
            </div>
            <p className="text-lg text-muted-foreground mb-4">
              {frontmatter.description}
            </p>
            <div className="flex flex-wrap gap-4 mb-6">
              <div className="flex items-center">
                <span className="font-semibold mr-2">{t("location")}:</span>
                <span>{frontmatter.location}</span>
              </div>

              <div className="flex items-center">
                <span className="font-semibold mr-2">{t("freeOption")}:</span>
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
            <Button variant="default" asChild>
              <Link href={frontmatter.url} target="_blank">
                {t("visitWebsite")}
              </Link>
            </Button>
          </div>

          {/* Mobile Migration Guides - Only visible on mobile */}
          {relatedGuides.length > 0 ? (
            <div className="lg:hidden mb-8 p-6 border rounded-lg bg-[var(--green-bg)]">
              <h2 className="text-xl font-bold mb-4">
                {t("migrationGuides")}
              </h2>
              <p className="text-muted-foreground mb-4">
                {t("migrateHelp")} <b>{frontmatter.name}</b>
              </p>
              <div className="space-y-4">
                {relatedGuides.map((guide) => (
                  <Link
                    key={`${guide.category}-${guide.slug}`}
                    href={`/guides/${guide.category}/${guide.slug}`}
                    className="block mb-4 mt-4 rounded-md transition-colors"
                  >
                    <h3 className="text-lg mb-1">
                      {guide.frontmatter.sourceService &&
                        `${guide.frontmatter.sourceService} → ${frontmatter.name}`}
                      {!guide.frontmatter.sourceService &&
                        guide.frontmatter.title}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {guide.frontmatter.description}
                    </p>
                  </Link>
                ))}
              </div>
              <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex justify-center">
                  <Button variant="red" size="sm" asChild>
                    <Link href={`/contribute`}>{t("writeAnotherGuide")}</Link>
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="lg:hidden mb-8 p-6 border rounded-lg bg-[var(--green-bg)]">
              <h2 className="text-xl font-bold mb-4">
                {t("migrationGuides")}
              </h2>
              <p className="text-muted-foreground mb-4">
                {t("noGuides")} <b>{frontmatter.name}</b>.
              </p>
              <p className="text-muted-foreground mb-6">{t("helpOthers")}</p>
              <div className="flex justify-center">
                <Button variant="red" asChild>
                  <Link href={`/contribute`}>{t("writeMigrationGuide")}</Link>
                </Button>
              </div>
            </div>
          )}

          {/* Markdown Content */}
          {htmlContent && (
            <div className="mdx-content prose prose-sm sm:prose dark:prose-invert max-w-none mb-12">
              <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
            </div>
          )}

          {/* Similar Services - Moved from sidebar to main content */}
          {similarServices.length > 0 && (
            <div className="mb-12">
              <h2 className="text-2xl font-bold mb-4">
                {t("similarServices")}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {similarServices.map((service) => (
                  <div key={service.name} className="relative">
                    <ServiceCard
                      service={service}
                      showCategory={false}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CTA Section */}
          <section className="py-8 md:py-12">
            <ContributeCta />
          </section>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 ">
          {/* Migration Guides - Desktop only */}
          <div className="hidden lg:block sticky top-24 border rounded-lg p-6 bg-[var(--green-bg)]">
            <div className="relative h-40 mb-6">
              <Image
                src="/images/migrate.svg"
                alt="Migration guides illustration"
                fill
                className="object-contain"
              />
            </div>
            <h2 className="text-xl text-center font-bold mb-4">
              {t("migrationGuides")}
            </h2>

            {relatedGuides.length > 0 ? (
              <>
                <p className="text-muted-foreground mb-4">
                  {t("migrateHelp")} <b>{frontmatter.name}</b>
                </p>
                <div className="space-y-4">
                  {relatedGuides.map((guide) => (
                    <Link
                      key={`${guide.category}-${guide.slug}`}
                      href={`/guides/${guide.category}/${guide.slug}`}
                      className="block mb-4 mt-4 rounded-md transition-colors"
                    >
                      <h3 className="text-lg mb-1">
                        {guide.frontmatter.sourceService &&
                          `${guide.frontmatter.sourceService} → ${frontmatter.name}`}
                        {!guide.frontmatter.sourceService &&
                          guide.frontmatter.title}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {guide.frontmatter.description}
                      </p>
                    </Link>
                  ))}
                </div>
                <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-sm text-muted-foreground mb-4 text-center">
                    {t("anotherServiceHelp")}
                  </p>
                  <div className="flex justify-center">
                    <Button variant="red" size="sm" asChild>
                      <Link href={`/contribute`}>{t("writeAnotherGuide")}</Link>
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <p className="text-muted-foreground mb-4">
                  {t("noGuides")} <b>{frontmatter.name}</b>.
                </p>
                <p className="text-muted-foreground mb-6">{t("helpOthers")}</p>
                <div className="flex justify-center">
                  <Button variant="red" asChild>
                    <Link href={`/contribute`}>{t("writeMigrationGuide")}</Link>
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
