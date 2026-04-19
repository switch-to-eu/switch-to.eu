import { getPayload } from "@/lib/payload";
import {
  convertLexicalToHTML,
  defaultHTMLConverters,
} from "@payloadcms/richtext-lexical/html";
import { notFound, redirect } from "next/navigation";
import { RecommendedAlternative } from "@/components/ui/RecommendedAlternative";
import { ServiceCard } from "@/components/ui/ServiceCard";

import { getTranslations } from "next-intl/server";
import { Metadata } from "next";
import { Locale } from "next-intl";
import type { Locale as AppLocale } from "@switch-to-eu/i18n/routing";
import { generateLanguageAlternates } from "@switch-to-eu/i18n/utils";
import { RegionBadge } from "@switch-to-eu/ui/components/region-badge";
import { WarningCollapsible } from "@/components/guides/WarningCollapsible";
import { Container } from "@switch-to-eu/blocks/components/container";
import { PageLayout } from "@switch-to-eu/blocks/components/page-layout";
import { Banner } from "@switch-to-eu/blocks/components/banner";
import { DecorativeShape } from "@switch-to-eu/blocks/components/decorative-shape";
import { SectionHeading } from "@switch-to-eu/blocks/components/section-heading";
import { SuggestServiceCard } from "@/components/ui/SuggestServiceCard";
import type { SerializedEditorState } from "@payloadcms/richtext-lexical/lexical";
import type { Service, Category, Guide } from "@/payload-types";

export const dynamicParams = false;

export async function generateStaticParams() {
  const payload = await getPayload();
  const { docs } = await payload.find({
    collection: "services",
    where: { region: { equals: "non-eu" } },
    depth: 0,
    limit: 200,
  });

  return docs.map((service) => ({
    service_name: service.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; service_name: string }>;
}): Promise<Metadata> {
  const { service_name, locale } = await params;

  const payload = await getPayload();
  const { docs } = await payload.find({
    collection: "services",
    where: { slug: { equals: service_name } },
    locale: locale as 'en' | 'nl',
    depth: 1,
    limit: 1,
  });
  const service = docs[0] as Service | undefined;

  if (!service) {
    return {
      title: "Service Not Found",
    };
  }

  const categorySlug =
    typeof service.category === "object" && service.category !== null
      ? service.category.slug
      : String(service.category ?? "");

  const tags = (service.tags ?? []).map((t) => t.tag);

  const title = service.metaTitle || `${service.name} | switch-to.eu`;
  const description = service.metaDescription || service.description;

  return {
    title,
    description,
    keywords: [
      service.name,
      categorySlug,
      "non-EU service",
      "service migration",
      "EU alternatives",
      ...tags,
    ],
    alternates: generateLanguageAlternates(`services/non-eu/${service_name}`, locale as AppLocale),
    openGraph: {
      title,
      description,
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

  const payload = await getPayload();
  const { docs } = await payload.find({
    collection: "services",
    where: { slug: { equals: service_name } },
    locale: locale as 'en' | 'nl',
    depth: 2,
    limit: 1,
  });
  const service = docs[0] as Service | undefined;

  if (!service) {
    notFound();
  }

  if (service.region !== "non-eu") {
    redirect(`/${locale}/services/eu/${service_name}`);
  }

  // Convert rich text content to HTML
  const htmlContent = service.content
    ? convertLexicalToHTML({
        converters: defaultHTMLConverters,
        data: service.content as SerializedEditorState,
        disableContainer: true,
      })
    : "";

  // Extract issues from the structured array
  const issues = (service.issues ?? []).map((i) => i.issue);

  // Resolve recommended alternative (already populated via depth: 2)
  const resolvedAlternative =
    typeof service.recommendedAlternative === "object" &&
    service.recommendedAlternative !== null
      ? (service.recommendedAlternative as Service)
      : null;

  // Find migration guides between this service and its recommended alternative
  let migrationGuides: Array<{ category: string; slug: string }> = [];
  if (resolvedAlternative) {
    const { docs: guideDocs } = await payload.find({
      collection: "guides",
      where: {
        sourceService: { equals: service.id },
        targetService: {
          equals:
            typeof service.recommendedAlternative === "object" &&
            service.recommendedAlternative !== null
              ? (service.recommendedAlternative as Service).id
              : service.recommendedAlternative,
        },
      },
      locale: locale as 'en' | 'nl',
      depth: 1,
      limit: 10,
    }) as { docs: Guide[] };
    migrationGuides = guideDocs.map((g) => ({
      category:
        typeof g.category === "object" && g.category !== null
          ? g.category.slug
          : "",
      slug: g.slug,
    }));
  }

  // Get the category slug for fetching EU alternatives
  const categorySlug =
    typeof service.category === "object" && service.category !== null
      ? service.category.slug
      : "";

  // Fetch EU alternatives in the same category
  const { docs: categoryDocs } = await payload.find({
    collection: "categories",
    where: { slug: { equals: categorySlug } },
    depth: 0,
    limit: 1,
  });
  const categoryDoc = categoryDocs[0] as Category | undefined;

  let euAlternatives: Service[] = [];

  if (categoryDoc) {
    const { docs: euDocs } = await payload.find({
      collection: "services",
      where: {
        category: { equals: categoryDoc.id },
        region: { equals: "eu" },
      },
      locale: locale as 'en' | 'nl',
      depth: 1,
      limit: 50,
    }) as { docs: Service[] };
    euAlternatives = euDocs;
  }

  const otherAlternatives = resolvedAlternative
    ? euAlternatives.filter((alt) => alt.id !== resolvedAlternative.id)
    : euAlternatives;

  return (
    <PageLayout>
      <Container noPaddingMobile>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Banner -- orange accent for non-EU */}
            <Banner
              color="bg-brand-orange"
              className="py-10 sm:py-14"
              shapes={[
                {
                  shape: "starburst",
                  className:
                    "-top-6 -right-6 w-32 h-32 sm:w-44 sm:h-44",
                },
              ]}
            >
              <div className="flex justify-between items-start mb-4">
                <h1 className="font-heading text-4xl sm:text-5xl uppercase text-white">
                  {service.name}
                </h1>
                <RegionBadge
                  region={
                    (service.region as
                      | "eu"
                      | "non-eu"
                      | "eu-friendly") || "non-eu"
                  }
                />
              </div>
              <p className="text-white/90 text-base sm:text-lg max-w-2xl">
                {service.description}
              </p>
            </Banner>

            {/* Mobile Service Issues Section */}
            {issues.length > 0 && (
              <div className="lg:hidden">
                <WarningCollapsible
                  items={issues}
                  title={t("whyProblematic", { service: service.name })}
                  variant="error"
                  iconType="alert-triangle"
                  defaultOpen
                />
              </div>
            )}

            {/* Service Details */}
            {htmlContent && (
              <div className="px-3 md:px-0 mdx-content prose prose-slate prose-sm sm:prose max-w-none">
                <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 relative">
            {issues.length > 0 ? (
              <div className="hidden lg:block sticky top-0">
                <WarningCollapsible
                  items={issues}
                  title={t("whyProblematic", { service: service.name })}
                  variant="error"
                  iconType="alert-triangle"
                  defaultOpen
                />
              </div>
            ) : (
              <div className="hidden lg:block sticky top-24 rounded-3xl p-6 bg-brand-navy overflow-hidden">
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
                    <p className="text-xs text-brand-cream/80">
                      {t("dataSovereignty.description")}
                    </p>
                  </div>
                  <div className="p-3 rounded-2xl bg-white/10">
                    <h3 className="font-medium mb-1 text-white text-sm">
                      {t("gdprCompliance.title")}
                    </h3>
                    <p className="text-xs text-brand-cream/80">
                      {t("gdprCompliance.description")}
                    </p>
                  </div>
                  <div className="p-3 rounded-2xl bg-white/10">
                    <h3 className="font-medium mb-1 text-white text-sm">
                      {t("legalRecourse.title")}
                    </h3>
                    <p className="text-xs text-brand-cream/80">
                      {t("legalRecourse.description")}
                    </p>
                  </div>
                  <div className="p-3 rounded-2xl bg-white/10">
                    <h3 className="font-medium mb-1 text-white text-sm">
                      {t("supportEUDigital.title")}
                    </h3>
                    <p className="text-xs text-brand-cream/80">
                      {t("supportEUDigital.description")}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </Container>

      <Container noPaddingMobile>
        {/* Recommended Alternative -- below body text */}
        {resolvedAlternative && (
          <RecommendedAlternative
            service={resolvedAlternative}
            sourceService={service.name}
            migrationGuides={migrationGuides}
          />
        )}
      </Container>

      <Container noPaddingMobile>
        {/* Other EU Alternatives Section */}
        {otherAlternatives.length > 0 && (
          <div>
            <SectionHeading>{t("otherAlternatives")}</SectionHeading>

            <div className="grid gap-0 md:gap-5 auto-rows-fr grid-cols-2 md:grid-cols-4">
              {otherAlternatives.map((alt, index) => (
                <ServiceCard
                  key={alt.name}
                  service={alt}
                  showCategory={false}
                  colorIndex={index}
                />
              ))}
              <SuggestServiceCard colorIndex={otherAlternatives.length} />
            </div>
          </div>
        )}
      </Container>
    </PageLayout>
  );
}
