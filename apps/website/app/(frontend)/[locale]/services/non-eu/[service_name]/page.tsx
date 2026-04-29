import { getPayload, isPreview, publishedWhere } from "@/lib/payload";
import {
  convertLexicalToHTML,
  defaultHTMLConverters,
} from "@payloadcms/richtext-lexical/html";
import { notFound, redirect } from "next/navigation";
import { RecommendedAlternative } from "@/components/ui/RecommendedAlternative";
import { ServiceCard } from "@/components/ui/ServiceCard";
import { TrustStrip } from "@/components/non-eu/TrustStrip";
import { GainLosePanel } from "@/components/non-eu/GainLosePanel";
import { WhereYourDataGoes } from "@/components/non-eu/WhereYourDataGoes";
import { RecentNews } from "@/components/non-eu/RecentNews";
import { WhatPeopleSay } from "@/components/non-eu/WhatPeopleSay";
import { FaqAccordion } from "@/components/non-eu/FaqAccordion";
import { Sources } from "@/components/non-eu/Sources";

import { getTranslations } from "next-intl/server";
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
import type { SerializedEditorState } from "@payloadcms/richtext-lexical/lexical";
import type { Service, Category, Guide } from "@/payload-types";
import {
  getCategorySlug,
  getResolvedRelation,
} from "@/lib/services";

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
  const resolvedAlternative = getResolvedRelation<Service>(
    service.recommendedAlternative
  );

  // Find migration guides between this service and its recommended alternative
  let migrationGuides: Guide[] = [];
  if (resolvedAlternative) {
    const { docs: guideDocs } = await payload.find({
      collection: "guides",
      where: await publishedWhere({
        sourceService: { equals: service.id },
        targetService: { equals: resolvedAlternative.id },
      }),
      draft: await isPreview(),
      locale,
      depth: 1,
      limit: 10,
    }) as { docs: Guide[] };
    migrationGuides = guideDocs;
  }

  // Get the category slug for fetching EU alternatives
  const categorySlug = getCategorySlug(service.category);

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

  return (
    <PageLayout>
      {/* 1. HERO */}
      <Container noPaddingMobile>
        <Banner
          color="bg-brand-orange"
          className="py-10 sm:py-14"
          shapes={[
            {
              shape: "starburst",
              className: "-top-6 -right-6 w-32 h-32 sm:w-44 sm:h-44",
            },
          ]}
        >
          <div className="flex justify-between items-start gap-4 mb-4">
            <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl uppercase text-white">
              {t("redesign.h1Template", { name: service.name })}
            </h1>
            <RegionBadge region={service.region} />
          </div>
          <p className="text-white/90 text-base sm:text-lg max-w-2xl">
            {service.oneLineProblem || service.description}
          </p>
        </Banner>
      </Container>

      {/* 2. TRUST STRIP */}
      <Container noPaddingMobile>
        <TrustStrip service={service} />
      </Container>

      {/* 3. RECOMMENDED ALTERNATIVE */}
      {resolvedAlternative && (
        <Container noPaddingMobile>
          <RecommendedAlternative
            service={resolvedAlternative}
            sourceService={service.name}
            migrationGuides={migrationGuides}
          />
        </Container>
      )}

      {/* 4. GAIN / LOSE PANEL */}
      {resolvedAlternative && (
        <Container noPaddingMobile>
          <GainLosePanel
            service={service}
            recommendedName={resolvedAlternative.name}
          />
        </Container>
      )}

      {/* 5. OTHER EU ALTERNATIVES */}
      {otherAlternatives.length > 0 && (
        <Container noPaddingMobile>
          <SectionHeading>{t("redesign.otherAlternatives")}</SectionHeading>
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

      {/* 6. WHY PEOPLE ARE SWITCHING */}
      {(issues.length > 0 || htmlContent) && (
        <Container noPaddingMobile>
          <section className="rounded-3xl bg-white border border-black/5 p-6 sm:p-8 md:p-10">
            <h2 className="font-heading uppercase text-2xl sm:text-3xl mb-5">
              {t("redesign.whyPeopleSwitch", { name: service.name })}
            </h2>
            {issues.length > 0 && (
              <ul className="space-y-2 mb-6">
                {issues.map((issue, i) => (
                  <li key={i} className="flex gap-3 text-sm sm:text-base">
                    <span aria-hidden className="text-brand-orange shrink-0">
                      ⚠
                    </span>
                    <span>{issue}</span>
                  </li>
                ))}
              </ul>
            )}
            {htmlContent && (
              <div
                className="mdx-content prose prose-slate prose-sm sm:prose max-w-none"
                dangerouslySetInnerHTML={{ __html: htmlContent }}
              />
            )}
          </section>
        </Container>
      )}

      {/* 7. WHERE YOUR DATA GOES */}
      <Container noPaddingMobile>
        <WhereYourDataGoes service={service} />
      </Container>

      {/* 8. RECENT NEWS */}
      <Container noPaddingMobile>
        <RecentNews service={service} />
      </Container>

      {/* 9. WHAT PEOPLE SAY */}
      <Container noPaddingMobile>
        <WhatPeopleSay service={service} />
      </Container>

      {/* 10. FAQ */}
      <Container noPaddingMobile>
        <FaqAccordion service={service} />
      </Container>

      {/* 11. SOURCES */}
      <Container noPaddingMobile>
        <Sources service={service} />
      </Container>
    </PageLayout>
  );
}
