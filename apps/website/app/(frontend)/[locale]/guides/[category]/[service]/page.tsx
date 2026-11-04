import { getAllGuides } from "@/lib/content/loader";
import { RichText } from "@/components/rich-text";
import type { Metadata, ResolvingMetadata } from "next";
import { GuideSidebar } from "@/components/guides/GuideSidebar";
import { MobileGuideSidebar } from "@/components/guides/MobileGuideSidebar";
import { WarningCollapsible } from "@/components/guides/WarningCollapsible";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { GuideProgressWithI18n as GuideProgress } from "@/components/guides/guide-progress";
import { GuideStep } from "@/components/guides/GuideStep";
import { Locale } from "next-intl";
import { pageMetadata } from "@/lib/seo";
import { JsonLd } from "@/components/JsonLd";
import { articleJsonLd, breadcrumbJsonLd, isoDuration } from "@/lib/structured-data";
import { notFound } from "next/navigation";
import { Container } from "@switch-to-eu/blocks/components/container";
import { PageLayout } from "@switch-to-eu/blocks/components/page-layout";
import { NewsletterCta } from "@/components/NewsletterCta";
import type { Guide } from "@/lib/content/types";
import {
  getCategorySlug,
  getGuideBySlug,
  getGuideSourceService,
  getGuideTargetService,
} from "@/lib/services";

// Generate static params for all guide pages
export function generateStaticParams() {
  const docs = getAllGuides("en");
  const locales = ["en", "nl"];
  return locales.flatMap((locale) =>
    docs.map((g: Guide) => ({
      locale,
      category: getCategorySlug(g.category),
      service: g.slug,
    }))
  );
}

// Generate metadata for SEO
export async function generateMetadata(
  {
    params,
  }: {
    params: Promise<{ locale: string; category: string; service: string }>;
  },
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { category, service, locale } = await params;
  setRequestLocale(locale as Locale);

  const t = await getTranslations("guides.service.meta");

  const guide = await getGuideBySlug(service, locale);

  if (!guide) {
    return {
      title: t("notFound"),
    };
  }

  // Resolve service names from relationships (depth: 2 guarantees population)
  const sourceServiceName = getGuideSourceService(guide)?.name ?? "";
  const targetServiceName = getGuideTargetService(guide)?.name ?? "";

  const title = guide.metaTitle || t("title", { title: guide.title });
  const description = guide.metaDescription || guide.description;

  const metadata = await pageMetadata({
    parent,
    path: `guides/${category}/${service}`,
    locale,
    title,
    description,
  });

  return {
    ...metadata,
    keywords: [
      sourceServiceName,
      targetServiceName,
      "migration guide",
      "EU alternatives",
      category,
    ],
    authors: guide.author ? [{ name: guide.author }] : undefined,
    openGraph: { ...metadata.openGraph, type: "article" },
  };
}

export default async function GuideServicePage({
  params,
}: {
  params: Promise<{ locale: Locale; category: string; service: string }>;
}) {
  const { category, service, locale } = await params;
  setRequestLocale(locale);

  const guidesT = await getTranslations("guides");
  const serviceT = await getTranslations("guides.service");

  const guide = await getGuideBySlug(service, locale);

  if (!guide) {
    return notFound();
  }

  // Create a unique guide ID for storage and tracking
  const guideId = `${category}-${service}`;

  // Extract missing features from the structured array
  const missingFeatures = guide.missingFeatures ?? [];

  // Build steps data for the sidebar and progress tracking.
  const guideSteps = guide.steps;

  const sidebarSteps = guideSteps.map((step) => ({
    title: step.title,
    id: step.id,
  }));

  const stepsForRender = guideSteps.map((step) => {
    const videoUrl = step.video ?? null;

    return {
      title: step.title,
      id: step.id,
      complete: step.complete ?? false,
      video: videoUrl,
      videoOrientation: step.videoOrientation ?? null,
      content: step.content,
    };
  });

  // Count steps that have the "complete" flag for progress tracking
  const completableStepCount = guideSteps.filter((s) => s.complete).length;

  const navT = await getTranslations("navigation");
  const guidePath = `guides/${category}/${service}`;

  // HowTo JSON-LD structured data
  const siteUrl = process.env.NEXT_PUBLIC_URL || "https://www.switch-to.eu";
  const totalTime = isoDuration(guide.timeRequired);
  const howToJsonLd = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: guide.title,
    description: guide.description,
    ...(totalTime ? { totalTime } : {}),
    ...(guide.difficulty === "beginner"
      ? { educationalLevel: "Beginner" }
      : guide.difficulty === "intermediate"
        ? { educationalLevel: "Intermediate" }
        : { educationalLevel: "Advanced" }),
    step: stepsForRender.map((step, index) => ({
      "@type": "HowToStep",
      position: index + 1,
      name: step.title,
      url: `${siteUrl}/${locale}/guides/${category}/${service}#${step.id}`,
    })),
  };

  return (
    <>
      <JsonLd data={howToJsonLd} />
      <JsonLd
        data={articleJsonLd({
          locale,
          path: guidePath,
          headline: guide.title,
          description: guide.description,
          datePublished: guide.date,
          dateModified: guide.updatedAt,
        })}
      />
      <JsonLd
        data={breadcrumbJsonLd(locale, [
          { name: navT("home"), path: "" },
          { name: guide.category.title, path: `services/${category}` },
          { name: guide.title, path: guidePath },
        ])}
      />
      {/* Mobile sidebar drawer - Only visible on mobile */}
      <MobileGuideSidebar
        steps={sidebarSteps}
        stepsToCompleteText={guidesT("stepsToComplete")}
        guideId={guideId}
      />

      {/* Two-column layout for entire page content and sidebar */}
      <PageLayout paddingTopMobile paddingBottomMobile>
        <Container>
          {/* Grid layout with sidebar */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Main content - wider column */}
            <div className="lg:col-span-8">
              {/* Header - Full width */}
              <div className="mb-8">
                <h1 className="font-heading text-3xl sm:text-4xl text-brand-green mb-4">
                  {guide.title}
                </h1>
                <div className="flex mt-4 space-x-3">
                  <div
                    className={`px-4 py-1.5 rounded-full text-sm font-semibold ${
                      guide.difficulty === "beginner"
                        ? "bg-brand-sage text-brand-green"
                        : guide.difficulty === "intermediate"
                          ? "bg-brand-yellow text-brand-green"
                          : "bg-brand-red text-white"
                    }`}
                  >
                    {serviceT("difficultyLabel", {
                      level:
                        guide.difficulty.charAt(0).toUpperCase() +
                        guide.difficulty.slice(1),
                    })}
                  </div>
                  <div className="bg-brand-sky text-brand-green px-4 py-1.5 rounded-full text-sm font-semibold">
                    {guide.timeRequired}
                  </div>
                </div>
              </div>

              {/* Guide progress bar */}
              <div className="mb-8">
                <GuideProgress
                  guideId={guideId}
                  guideName={guide.title}
                  totalSteps={completableStepCount}
                />
              </div>

              {/* Guide content with styling applied */}
              <article className="mdx-content">
                {guide.intro && (
                  <section id="section-intro" className="mb-10 max-w-[38rem]">
                    <RichText
                      data={guide.intro}
                      disableContainer
                    />
                  </section>
                )}

                {guide.beforeYouStart && (
                  <section id="section-before" className="mb-10 max-w-[38rem]">
                    <RichText
                      data={guide.beforeYouStart}
                      disableContainer
                    />
                  </section>
                )}

                {stepsForRender.length > 0 && (
                  <section id="section-steps" className="mb-10">
                    <div className="steps-container">
                      {stepsForRender.map((step, index) => (
                        <GuideStep
                          key={`step-${index}`}
                          guideId={guideId}
                          step={{
                            title: step.title,
                            id: step.id,
                            complete: step.complete,
                            video: step.video,
                            videoOrientation: step.videoOrientation,
                          }}
                          stepNumber={index + 1}
                          content={
                            step.content ? (
                              <RichText data={step.content} disableContainer />
                            ) : null
                          }
                        />
                      ))}
                    </div>
                  </section>
                )}

                {guide.troubleshooting && (
                  <section id="section-troubleshooting" className="mb-10 max-w-[38rem]">
                    <RichText
                      data={guide.troubleshooting}
                      disableContainer
                    />
                  </section>
                )}

                {guide.outro && (
                  <section id="section-outro" className="mb-10 max-w-[38rem]">
                    <RichText
                      data={guide.outro}
                      disableContainer
                    />
                  </section>
                )}
              </article>

              {missingFeatures.length > 0 && (
                <div className="mb-0">
                  <WarningCollapsible
                    items={missingFeatures}
                    title={serviceT("missingFeaturesTitle")}
                  />
                </div>
              )}

              {/* Newsletter Section */}
              <div className="mb-0 mt-12">
                <NewsletterCta contained={false} />
              </div>

              <div className="mt-12 p-6 sm:p-8 bg-white border border-black/10 rounded-3xl">
                <h2 className="font-heading text-xl text-brand-green mb-4 text-balance">
                  {serviceT("editGuide.title")}
                </h2>
                <p className="mb-4 text-brand-green/80">
                  {serviceT("editGuide.description")}
                </p>
                <a
                  href="https://github.com/switch-to-eu/switch-to.eu"
                  className="inline-block px-5 py-2 bg-brand-green text-white rounded-full text-sm font-semibold no-underline hover:opacity-90 transition-opacity"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {serviceT("editGuide.link")}
                </a>
              </div>
            </div>

            {/* Sidebar - narrower column - Only visible on desktop */}
            <div className="hidden lg:block lg:col-span-4">
              <div className="sticky top-24">
                <GuideSidebar
                  steps={sidebarSteps}
                  stepsToCompleteText={guidesT("stepsToComplete")}
                  guideId={guideId}
                />
              </div>
            </div>
          </div>
        </Container>
      </PageLayout>
    </>
  );
}
