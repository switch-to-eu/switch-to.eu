import { getPayload, isPreview, publishedWhere } from "@/lib/payload";
import { notFound, redirect } from "next/navigation";
import { Link } from "@switch-to-eu/i18n/navigation";
import { RecommendedAlternative } from "@/components/ui/RecommendedAlternative";
import { ServiceCard } from "@/components/ui/ServiceCard";
import { ServiceSubNav } from "@/components/ui/ServiceSubNav";
import { TabsContent } from "@switch-to-eu/ui/components/tabs";
import { GainLosePanel } from "@/components/non-eu/GainLosePanel";
import { WhereYourDataGoes } from "@/components/non-eu/WhereYourDataGoes";
import { RecentNews } from "@/components/non-eu/RecentNews";
import { WhatPeopleSay } from "@/components/non-eu/WhatPeopleSay";
import { FaqAccordion } from "@/components/non-eu/FaqAccordion";
import { Sources } from "@/components/non-eu/Sources";
import { RichText } from "@/components/rich-text";

import { getTranslations, getFormatter } from "next-intl/server";
import { Metadata } from "next";
import { Locale } from "next-intl";
import type { Locale as AppLocale } from "@switch-to-eu/i18n/routing";
import { generateLanguageAlternates } from "@switch-to-eu/i18n/utils";
import { RegionBadge } from "@switch-to-eu/ui/components/region-badge";
import { Container } from "@switch-to-eu/blocks/components/container";
import { PageLayout } from "@switch-to-eu/blocks/components/page-layout";
import { Banner } from "@switch-to-eu/blocks/components/banner";
import { SectionHeading } from "@switch-to-eu/blocks/components/section-heading";
import { SuggestServiceCard } from "@/components/ui/SuggestServiceCard";
import type { Service, Category, Guide } from "@/payload-types";
import { getCategorySlug, getResolvedRelation } from "@/lib/services";

const OVERVIEW_KEY = "overview";

interface TabSpec {
  key: string;
  label: string;
}

// eslint-disable-next-line no-unused-vars
type Translator = (key: string, values?: Record<string, string>) => string;

function buildTabs(service: Service, t: Translator): TabSpec[] {
  const tabs: TabSpec[] = [
    { key: OVERVIEW_KEY, label: t("redesign.tabs.overview") },
  ];

  const hasPrivacy =
    !!service.parentCompany ||
    !!service.headquarters ||
    (service.dataStorageLocations?.length ?? 0) > 0 ||
    typeof service.openSource === "boolean" ||
    (service.recentNews?.length ?? 0) > 0;
  if (hasPrivacy) {
    tabs.push({ key: "privacy", label: t("redesign.tabs.privacy") });
  }

  const hasFaq = (service.faqs?.length ?? 0) > 0;
  if (hasFaq) {
    tabs.push({ key: "faq", label: t("redesign.tabs.faq") });
  }

  const hasSources = (service.sourceUrls?.length ?? 0) > 0;
  if (hasSources) {
    tabs.push({ key: "sources", label: t("redesign.tabs.sources") });
  }

  return tabs;
}

export async function generateStaticParams() {
  const payload = await getPayload();
  const { docs } = await payload.find({
    collection: "services",
    where: {
      and: [
        { _status: { equals: "published" } },
        { region: { equals: "non-eu" } },
      ],
    },
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
    where: await publishedWhere({ slug: { equals: service_name } }),
    draft: await isPreview(),
    locale: locale as "en" | "nl",
    depth: 1,
    limit: 1,
  });
  const service = docs[0] as Service | undefined;

  if (!service) {
    return {
      title: "Service Not Found",
    };
  }

  const categorySlug = getCategorySlug(service.category);

  const tags = (service.tags ?? []).map((t) => t.tag);

  const title =
    service.metaTitle || `EU Alternatives to ${service.name} | switch-to.eu`;
  const description =
    service.metaDescription || service.oneLineProblem || service.description;

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
    alternates: generateLanguageAlternates(
      `services/non-eu/${service_name}`,
      locale as AppLocale
    ),
    openGraph: {
      title,
      description,
    },
  };
}

export default async function ServiceDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: Locale; service_name: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const { service_name, locale } = await params;
  // Awaited to opt the page into per-request rendering, so direct hits to
  // a `?tab=X` URL render the right TabsContent on the server.
  await searchParams;
  const t = await getTranslations("services.detail.nonEu");
  const format = await getFormatter();

  const payload = await getPayload();
  const { docs } = await payload.find({
    collection: "services",
    where: await publishedWhere({ slug: { equals: service_name } }),
    draft: await isPreview(),
    locale,
    depth: 2,
    limit: 1,
  });
  const service = docs[0];

  if (!service) {
    notFound();
  }

  if (service.region !== "non-eu") {
    redirect(`/${locale}/services/eu/${service_name}`);
  }

  const issues = (service.issues ?? []).map((i) => i.issue);

  const resolvedAlternative = getResolvedRelation<Service>(
    service.recommendedAlternative
  );

  let migrationGuides: Guide[] = [];
  if (resolvedAlternative) {
    const { docs: guideDocs } = (await payload.find({
      collection: "guides",
      where: await publishedWhere({
        sourceService: { equals: service.id },
        targetService: { equals: resolvedAlternative.id },
      }),
      draft: await isPreview(),
      locale,
      depth: 1,
      limit: 10,
    })) as { docs: Guide[] };
    migrationGuides = guideDocs;
  }

  const categorySlug = getCategorySlug(service.category);
  const categoryFormatted =
    categorySlug.charAt(0).toUpperCase() + categorySlug.slice(1);

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
      where: await publishedWhere({
        category: { equals: categoryDoc.id },
        region: { equals: "eu" },
      }),
      draft: await isPreview(),
      locale,
      depth: 1,
      limit: 50,
    });
    euAlternatives = euDocs;
  }

  const otherAlternatives = resolvedAlternative
    ? euAlternatives.filter((alt) => alt.id !== resolvedAlternative.id)
    : euAlternatives;

  const tabs = buildTabs(service, t);

  const gdpr = service.gdprCompliance ?? "unknown";
  const gdprDotClass =
    gdpr === "compliant"
      ? "bg-brand-green"
      : gdpr === "partial"
        ? "bg-brand-yellow"
        : gdpr === "non-compliant"
          ? "bg-brand-cream"
          : "bg-white/40";

  const lastReviewedLabel = service.lastResearchedAt
    ? format.dateTime(new Date(service.lastResearchedAt), {
        year: "numeric",
        month: "long",
      })
    : null;

  return (
    <>
      {/* Hero */}
      <Container noPaddingMobile>
        <Link
          href={`/services/${categorySlug}`}
          className="inline-flex items-center gap-1.5 text-brand-orange/70 text-sm mb-3 px-4 sm:px-0 pt-2 no-underline hover:text-brand-orange transition-colors"
        >
          <span aria-hidden>&larr;</span>
          <span>
            {t("redesign.heroBack", { category: categoryFormatted })}
          </span>
        </Link>

        <Banner
          color="bg-brand-orange"
          className="[&>div]:py-8 [&>div]:sm:py-10"
          shapes={[
            {
              shape: "starburst",
              className: "-top-8 -right-8 w-36 h-36 sm:w-48 sm:h-48",
            },
            {
              shape: "blob",
              className: "bottom-4 right-20 hidden sm:block w-28 h-28",
              opacity: 0.1,
              duration: "9s",
              delay: "-3s",
            },
          ]}
        >
          <div className="max-w-3xl">
            <div className="flex items-start gap-3 mb-3">
              <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl uppercase text-white">
                {t("redesign.h1Template", { name: service.name })}
              </h1>
              <div className="flex-shrink-0 mt-2">
                <RegionBadge region={service.region} />
              </div>
            </div>

            <p className="text-white/90 text-base sm:text-lg mb-5 max-w-2xl leading-relaxed">
              {service.oneLineProblem || service.description}
            </p>

            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-2 bg-white/10 text-white/90 rounded-full px-3 py-1 text-sm">
                <span
                  aria-hidden
                  className={`w-2 h-2 rounded-full ${gdprDotClass}`}
                />
                {t(`redesign.gdprBadge.${gdpr}`)}
              </span>
              {service.headquarters && (
                <span className="inline-flex items-center bg-white/10 text-white/90 rounded-full px-3 py-1 text-sm">
                  {service.headquarters}
                </span>
              )}
              {lastReviewedLabel && (
                <span className="inline-flex items-center bg-white/10 text-white/90 rounded-full px-3 py-1 text-sm">
                  {t("redesign.trustStrip.lastReviewed", {
                    date: lastReviewedLabel,
                  })}
                </span>
              )}
              {(service.sourceUrls?.length ?? 0) > 0 && (
                <a
                  href="?tab=sources"
                  className="inline-flex items-center bg-white/10 text-white/90 rounded-full px-3 py-1 text-sm no-underline hover:bg-white/20 transition-colors"
                >
                  {t("redesign.trustStrip.sourcesCount", {
                    count: service.sourceUrls?.length ?? 0,
                  })}{" "}
                  &rarr;
                </a>
              )}
            </div>
          </div>
        </Banner>
      </Container>

      <ServiceSubNav tabs={tabs}>
        <PageLayout
          paddingTopMobile
          paddingBottomMobile
          className="md:gap-12 md:pt-10 md:pb-16"
        >
          <TabsContent
            value={OVERVIEW_KEY}
            className="space-y-8 sm:space-y-10 md:space-y-12"
          >
            {/* Recommended alternative */}
            {resolvedAlternative && (
              <Container noPaddingMobile>
                <RecommendedAlternative
                  service={resolvedAlternative}
                  sourceService={service.name}
                  migrationGuides={migrationGuides}
                />
              </Container>
            )}

            {/* Gain / Lose */}
            {resolvedAlternative && (
              <Container>
                <GainLosePanel
                  service={service}
                  recommendedName={resolvedAlternative.name}
                />
              </Container>
            )}

            {/* What people say */}
            <Container>
              <WhatPeopleSay service={service} />
            </Container>

            {/* Why people switch — issues + body content */}
            {(issues.length > 0 || service.content) && (
              <Container>
                <section className="max-w-3xl">
                  <h2 className="font-heading uppercase text-2xl sm:text-3xl text-brand-navy mb-5">
                    {t("redesign.whyPeopleSwitch", { name: service.name })}
                  </h2>
                  {issues.length > 0 && (
                    <ul className="space-y-2 mb-6">
                      {issues.map((issue, i) => (
                        <li
                          key={i}
                          className="flex gap-2.5 text-sm sm:text-base text-brand-navy"
                        >
                          <span
                            aria-hidden
                            className="text-brand-orange shrink-0 mt-0.5"
                          >
                            &#9888;
                          </span>
                          <span>{issue}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                  {service.content && (
                    <div className="mdx-content prose prose-sm sm:prose max-w-none text-brand-navy/85">
                      <RichText data={service.content} />
                    </div>
                  )}
                </section>
              </Container>
            )}

            {/* Other EU alternatives */}
            {otherAlternatives.length > 0 && (
              <Container noPaddingMobile>
                <SectionHeading>
                  {t("redesign.otherAlternatives")}
                </SectionHeading>
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
              </Container>
            )}
          </TabsContent>

          {tabs.some((tab) => tab.key === "privacy") && (
            <TabsContent
              value="privacy"
              className="space-y-8 sm:space-y-10 md:space-y-12"
            >
              <Container>
                <WhereYourDataGoes service={service} />
              </Container>
              <Container>
                <RecentNews service={service} />
              </Container>
            </TabsContent>
          )}

          {tabs.some((tab) => tab.key === "faq") && (
            <TabsContent value="faq">
              <Container>
                <FaqAccordion service={service} />
              </Container>
            </TabsContent>
          )}

          {tabs.some((tab) => tab.key === "sources") && (
            <TabsContent value="sources">
              <Container>
                <Sources service={service} />
              </Container>
            </TabsContent>
          )}
        </PageLayout>
      </ServiceSubNav>
    </>
  );
}
