import { getPayload } from "@/lib/payload";
import {
  convertLexicalToHTML,
  defaultHTMLConverters,
} from "@payloadcms/richtext-lexical/html";
import { Metadata } from "next";
import { GuideSidebar } from "@/components/guides/GuideSidebar";
import { MobileGuideSidebar } from "@/components/guides/MobileGuideSidebar";
import { WarningCollapsible } from "@/components/guides/WarningCollapsible";
import { getTranslations } from "next-intl/server";
import { GuideProgressWithI18n as GuideProgress } from "@/components/guides/guide-progress";
import { GuideStep } from "@/components/guides/GuideStep";
import { Locale } from "next-intl";
import { notFound } from "next/navigation";
import { Container } from "@switch-to-eu/blocks/components/container";
import { PageLayout } from "@switch-to-eu/blocks/components/page-layout";
import { NewsletterCta } from "@/components/NewsletterCta";
import type { SerializedEditorState } from "@payloadcms/richtext-lexical/lexical";
import type { Guide } from "@/payload-types";

/**
 * Convert a Payload Lexical rich text field value to an HTML string.
 * Returns an empty string if the data is null/undefined.
 */
function lexicalToHtml(data: SerializedEditorState | null | undefined): string {
  if (!data) return "";
  return convertLexicalToHTML({
    converters: defaultHTMLConverters,
    data,
    disableContainer: true,
  });
}

// Generate static params for all guide pages
export async function generateStaticParams() {
  const payload = await getPayload();
  const { docs } = await payload.find({
    collection: "guides",
    depth: 1,
    limit: 100,
  });
  const locales = ["en", "nl"];
  return locales.flatMap((locale) =>
    docs.map((g: Guide) => ({
      locale,
      category:
        typeof g.category === "object" && g.category !== null
          ? g.category.slug
          : "",
      service: g.slug,
    }))
  );
}

// Generate metadata for SEO
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; category: string; service: string }>;
}): Promise<Metadata> {
  const { category, service, locale } = await params;

  const t = await getTranslations("guides.service.meta");

  const payload = await getPayload();
  const { docs } = await payload.find({
    collection: "guides",
    where: { slug: { equals: service } },
    locale: locale as 'en' | 'nl',
    depth: 2,
    limit: 1,
  });
  const guide = docs[0] as Guide | undefined;

  if (!guide) {
    return {
      title: t("notFound"),
    };
  }

  // Resolve service names from relationships
  const sourceServiceName =
    typeof guide.sourceService === "object" && guide.sourceService !== null
      ? guide.sourceService.name
      : String(guide.sourceService ?? "");
  const targetServiceName =
    typeof guide.targetService === "object" && guide.targetService !== null
      ? guide.targetService.name
      : String(guide.targetService ?? "");

  const siteUrl = process.env.NEXT_PUBLIC_URL || "https://switch-to.eu";
  const path = `/guides/${category}/${service}`;
  const title = guide.metaTitle || t("title", { title: guide.title });
  const description = guide.metaDescription || guide.description;

  return {
    title,
    description,
    keywords: [
      sourceServiceName,
      targetServiceName,
      "migration guide",
      "EU alternatives",
      category,
    ],
    authors: guide.author ? [{ name: guide.author }] : undefined,
    alternates: {
      canonical: `${siteUrl}/${locale}${path}`,
      languages: {
        "x-default": `${siteUrl}/en${path}`,
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

export default async function GuideServicePage({
  params,
}: {
  params: Promise<{ locale: Locale; category: string; service: string }>;
}) {
  const { category, service, locale } = await params;

  const guidesT = await getTranslations("guides");
  const serviceT = await getTranslations("guides.service");

  // Fetch guide data from Payload CMS
  const payload = await getPayload();
  const { docs } = await payload.find({
    collection: "guides",
    where: { slug: { equals: service } },
    locale: locale as 'en' | 'nl',
    depth: 2,
    limit: 1,
  });
  const guide = docs[0] as Guide | undefined;

  if (!guide) {
    return notFound();
  }

  // Create a unique guide ID for storage and tracking
  const guideId = `${category}-${service}`;

  // Extract missing features from the structured array
  const missingFeatures = (guide.missingFeatures ?? []).map(
    (mf) => mf.feature
  );

  // Build steps data for the sidebar and progress tracking.
  // Each step gets a stable ID based on its index and title.
  const guideSteps = (guide.steps ?? []) as Array<{
    title: string;
    content: SerializedEditorState | null;
    video?: { url?: string | null } | number | null;
    videoOrientation?: string | null;
    complete?: boolean | null;
    id?: string | null;
  }>;

  const sidebarSteps = guideSteps.map((step, index) => ({
    title: step.title,
    id: step.id ?? `step-${index + 1}-${step.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 30)}`,
  }));

  // Pre-render step content from Lexical JSON to HTML on the server.
  // This is necessary because GuideStep is a client component and cannot
  // use the server-only <RichText> component from Payload.
  const stepsWithHtml = guideSteps.map((step, index) => {
    // Resolve video URL from the media upload relationship
    const videoUrl =
      step.video && typeof step.video === "object" && "url" in step.video
        ? (step.video.url ?? null)
        : null;

    return {
      title: step.title,
      id: sidebarSteps[index]!.id,
      complete: step.complete ?? false,
      video: videoUrl,
      videoOrientation: step.videoOrientation ?? null,
      contentHtml: lexicalToHtml(step.content),
    };
  });

  // Count steps that have the "complete" flag for progress tracking
  const completableStepCount = guideSteps.filter((s) => s.complete).length;

  // Pre-render rich text sections to HTML
  const introHtml = lexicalToHtml(guide.intro as SerializedEditorState | null);
  const beforeHtml = lexicalToHtml(
    guide.beforeYouStart as SerializedEditorState | null
  );
  const troubleshootingHtml = lexicalToHtml(
    guide.troubleshooting as SerializedEditorState | null
  );
  const outroHtml = lexicalToHtml(guide.outro as SerializedEditorState | null);

  // HowTo JSON-LD structured data
  const siteUrl = process.env.NEXT_PUBLIC_URL || "https://switch-to.eu";
  const howToJsonLd = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: guide.title,
    description: guide.description,
    totalTime: guide.timeRequired,
    ...(guide.difficulty === "beginner"
      ? { educationalLevel: "Beginner" }
      : guide.difficulty === "intermediate"
        ? { educationalLevel: "Intermediate" }
        : { educationalLevel: "Advanced" }),
    step: stepsWithHtml.map((step, index) => ({
      "@type": "HowToStep",
      position: index + 1,
      name: step.title,
      url: `${siteUrl}/${locale}/guides/${category}/${service}#${step.id}`,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToJsonLd) }}
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
                <h1 className="font-heading text-4xl sm:text-5xl uppercase text-brand-green mb-4">
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
                {introHtml && (
                  <section id="section-intro" className="mb-10">
                    <div
                      dangerouslySetInnerHTML={{ __html: introHtml }}
                    />
                  </section>
                )}

                {beforeHtml && (
                  <section id="section-before" className="mb-10">
                    <div
                      dangerouslySetInnerHTML={{ __html: beforeHtml }}
                    />
                  </section>
                )}

                {stepsWithHtml.length > 0 && (
                  <section id="section-steps" className="mb-10">
                    <div className="steps-container">
                      {stepsWithHtml.map((step, index) => (
                        <GuideStep
                          key={`step-${index}`}
                          guideId={guideId}
                          step={step}
                          stepNumber={index + 1}
                        />
                      ))}
                    </div>
                  </section>
                )}

                {troubleshootingHtml && (
                  <section id="section-troubleshooting" className="mb-10">
                    <div
                      dangerouslySetInnerHTML={{
                        __html: troubleshootingHtml,
                      }}
                    />
                  </section>
                )}

                {outroHtml && (
                  <section id="section-outro" className="mb-10">
                    <div
                      dangerouslySetInnerHTML={{ __html: outroHtml }}
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

              <div className="mt-12 p-6 sm:p-8 bg-brand-sage/30 rounded-3xl">
                <h2 className="font-heading text-xl uppercase text-brand-green mb-4">
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
