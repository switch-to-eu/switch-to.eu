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
import { Locale } from "next-intl";
import { RegionBadge } from "@switch-to-eu/ui/components/region-badge";
import { WarningCollapsible } from "@/components/guides/WarningCollapsible";
import { Container } from "@/components/layout/container";
import { PageLayout } from "@/components/layout/page-layout";
import { Banner } from "@switch-to-eu/blocks/components/banner";
import { DecorativeShape } from "@switch-to-eu/blocks/components/decorative-shape";
import { SectionHeading } from "@switch-to-eu/blocks/components/section-heading";

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
    <PageLayout>
      {/* Hero Banner — orange accent for non-EU */}
      <section>
        <Container noPaddingMobile overlapHeader>
          <Banner
            color="bg-brand-orange"
            className="py-10 sm:py-14"
            shapes={[
              { shape: "starburst", className: "-top-6 -right-6 w-32 h-32 sm:w-44 sm:h-44" },
            ]}
          >
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
          </Banner>
        </Container>
      </section>

      <section>
        <Container noPaddingMobile>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Recommended Alternative */}
            {recommendedAlternativeData && (
              <RecommendedAlternative
                service={recommendedAlternativeData}
                sourceService={frontmatter.name}
                migrationGuides={migrationGuides}
              />
            )}

            {/* Mobile Service Issues Section */}
            {frontmatter.issues && frontmatter.issues.length > 0 && (
              <div className="lg:hidden">
                <WarningCollapsible
                  items={frontmatter.issues}
                  title={t("whyProblematic", { service: frontmatter.name })}
                  variant="error"
                  iconType="alert-triangle"
                />
              </div>
            )}

            {/* Service Details */}
            {htmlContent && (
              <div className="px-3 md:px-0 mdx-content prose prose-slate prose-sm sm:prose max-w-none">
                <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
              </div>
            )}

            {/* Other EU Alternatives Section */}
            {otherAlternatives.length > 0 && (
              <div>
                <SectionHeading>
                  {t("otherAlternatives")}
                </SectionHeading>
                <p className="px-3 md:px-0 mb-6 text-muted-foreground">
                  {otherAlternatives.length > 1
                    ? t("otherEUAlternatives")
                    : t("oneMoreEUAlternative")}
                </p>
                <div className="grid gap-0 md:gap-5 auto-rows-fr grid-cols-1 md:grid-cols-2">
                  {otherAlternatives.map((service, index) => (
                    <ServiceCard
                      key={service.name}
                      service={service}
                      showCategory={false}
                      colorIndex={index}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {frontmatter.issues && frontmatter.issues.length > 0 ? (
              <div className="hidden lg:block sticky top-24">
                <WarningCollapsible
                  items={frontmatter.issues}
                  title={t("whyProblematic", { service: frontmatter.name })}
                  variant="error"
                  iconType="alert-triangle"
                />
              </div>
            ) : (
              <div className="hidden lg:block sticky top-24 rounded-3xl p-6 bg-brand-navy overflow-hidden relative">
                <DecorativeShape
                  shape="sunburst"
                  className="-top-4 -right-4 w-20 h-20"
                />
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
      </Container>
      </section>
    </PageLayout>
  );
}
