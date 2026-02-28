import { getGuide, getAllGuides } from "@switch-to-eu/content/services/guides";
import {
  extractMissingFeatures,
  extractMigrationSteps,
  processCompletionMarkers,
  extractStepsWithMeta,
} from "@switch-to-eu/content/utils";
import { Metadata } from "next";
import { GuideSidebar } from "@/components/guides/GuideSidebar";
import { MobileGuideSidebar } from "@/components/guides/MobileGuideSidebar";
import { WarningCollapsible } from "@/components/guides/WarningCollapsible";
import { getTranslations } from "next-intl/server";
import {
  GuideProgressWithI18n as GuideProgress,
  CompletionMarkerReplacerWithI18n as CompletionMarkerReplacer,
} from "@/components/guides/guide-progress";
import { GuideStep } from "@/components/guides/GuideStep";
import { Locale } from "next-intl";
import { parseMarkdown } from "@switch-to-eu/content/markdown";
import { notFound } from "next/navigation";
import { NewsletterCta } from "@/components/NewsletterCta";

// Generate static params for all guide pages
export function generateStaticParams() {
  const guides = getAllGuides();

  return guides.map((guide) => ({
    category: guide.category,
    service: guide.slug,
  }));
}

// Generate metadata for SEO
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; category: string; service: string }>;
}): Promise<Metadata> {
  // Await the params
  const { category, service, locale } = await params;

  // Get translations
  const t = await getTranslations("guides.service.meta");

  // Load guide data from MDX file
  const guideData = getGuide(category, service, locale as Locale);

  if (!guideData) {
    return {
      title: t("notFound"),
    };
  }

  const { frontmatter } = guideData;

  return {
    title: t("title", { title: frontmatter.title }),
    description: frontmatter.description,
    keywords: [
      `${frontmatter.sourceService}`,
      `${frontmatter.targetService}`,
      "migration guide",
      "EU alternatives",
      category,
    ],
    authors: frontmatter.author ? [{ name: frontmatter.author }] : undefined,
    alternates: {
      canonical: `https://switch-to.eu/${locale}/guides/${category}/${service}`,
      languages: {
        en: `https://switch-to.eu/en/guides/${category}/${service}`,
        nl: `https://switch-to.eu/nl/guides/${category}/${service}`,
      },
    },
  };
}

export default async function GuideServicePage({
  params,
}: {
  params: Promise<{ locale: Locale; category: string; service: string }>;
}) {
  // Await the params Promise
  const { category, service, locale } = await params;

  // Get translations
  const guidesT = await getTranslations("guides");
  const serviceT = await getTranslations("guides.service");

  // Load guide data from MD file
  const guideData = getGuide(category, service, locale);

  if (!guideData) {
    return notFound();
  }

  const { frontmatter, content, segments } = guideData;

  // Create a unique guide ID for storage and tracking
  const guideId = `${category}-${service}`;

  // Pass frontmatter and segments to extractMissingFeatures
  const missingFeatures = extractMissingFeatures(
    content,
    frontmatter,
    segments
  );
  const steps = extractMigrationSteps(content, segments);

  // Extract detailed step information if using new format
  const stepsWithContent =
    segments && segments.steps ? extractStepsWithMeta(segments.steps) : [];

  // Process content to replace [complete] markers with placeholders for client-side hydration
  const processedContent = processCompletionMarkers(content, guideId);

  // Function to render a segment or fall back to complete content
  const renderContent = () => {
    // If no segments or using legacy unsegmented format, render the whole content
    if (!segments || segments.unsegmented === content.trim()) {
      const processedHtml = parseMarkdown(processedContent);
      return <div dangerouslySetInnerHTML={{ __html: processedHtml }} />;
    }

    // Otherwise, render segmented content with section headings
    return (
      <>
        {segments.intro && (
          <section id="section-intro" className="mb-10">
            <div
              dangerouslySetInnerHTML={{
                __html: parseMarkdown(
                  processCompletionMarkers(segments.intro, guideId)
                ),
              }}
            />
          </section>
        )}

        {segments.before && (
          <section id="section-before" className="mb-10">
            <div
              dangerouslySetInnerHTML={{
                __html: parseMarkdown(
                  processCompletionMarkers(segments.before, guideId)
                ),
              }}
            />
          </section>
        )}

        {segments.steps && (
          <section id="section-steps" className="mb-10">
            {/* Render steps using either the new or legacy format */}
            {stepsWithContent.length > 0 ? (
              <div className="steps-container">
                {stepsWithContent.map((step, index) => (
                  <GuideStep
                    key={`step-${index}`}
                    guideId={guideId}
                    step={step}
                    stepNumber={index + 1}
                    category={category}
                    slug={service}
                  />
                ))}
              </div>
            ) : (
              <div
                dangerouslySetInnerHTML={{
                  __html: parseMarkdown(
                    processCompletionMarkers(segments.steps, guideId)
                  ),
                }}
              />
            )}
          </section>
        )}

        {segments.troubleshooting && (
          <section id="section-troubleshooting" className="mb-10">
            <div
              dangerouslySetInnerHTML={{
                __html: parseMarkdown(
                  processCompletionMarkers(segments.troubleshooting, guideId)
                ),
              }}
            />
          </section>
        )}

        {segments.outro && (
          <section id="section-outro" className="mb-10">
            <div
              dangerouslySetInnerHTML={{
                __html: parseMarkdown(
                  processCompletionMarkers(segments.outro, guideId)
                ),
              }}
            />
          </section>
        )}

        {/* Render any unsegmented content that doesn't fit in known segments */}
        {segments.unsegmented && (
          <section id="section-unsegmented">
            <div
              dangerouslySetInnerHTML={{
                __html: parseMarkdown(
                  processCompletionMarkers(segments.unsegmented, guideId)
                ),
              }}
            />
          </section>
        )}
      </>
    );
  };

  return (
    <>
      {/* Process completion markers client-side */}
      <CompletionMarkerReplacer guideId={guideId} />

      {/* Mobile sidebar drawer - Only visible on mobile */}
      <MobileGuideSidebar
        steps={steps}
        stepsToCompleteText={guidesT("stepsToComplete")}
        guideId={guideId}
      />

      {/* Two-column layout for entire page content and sidebar */}
      <main className="container mx-auto px-4 py-8 max-w-7xl lg:px-8">
        {/* Grid layout with sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main content - wider column */}
          <div className="lg:col-span-8">
            {/* Header - Full width */}
            <div className="mb-8">
              <h1 className="font-heading text-4xl sm:text-5xl uppercase text-brand-green mb-4">
                {frontmatter.title}
              </h1>
              <div className="flex mt-4 space-x-3">
                <div
                  className={`px-4 py-1.5 rounded-full text-sm font-semibold ${
                    frontmatter.difficulty === "beginner"
                      ? "bg-brand-sage text-brand-green"
                      : frontmatter.difficulty === "intermediate"
                        ? "bg-brand-yellow text-brand-green"
                        : "bg-brand-red text-white"
                  }`}
                >
                  {serviceT("difficultyLabel", {
                    level:
                      frontmatter.difficulty.charAt(0).toUpperCase() +
                      frontmatter.difficulty.slice(1),
                  })}
                </div>
                <div className="bg-brand-sky text-brand-green px-4 py-1.5 rounded-full text-sm font-semibold">
                  {frontmatter.timeRequired}
                </div>
              </div>
            </div>

            {/* Guide progress bar */}
            <div className="mb-8">
              <GuideProgress
                guideId={guideId}
                guideName={frontmatter.title}
                totalSteps={
                  steps.filter((step) =>
                    step.completionMarkers?.includes("[complete]")
                  ).length
                }
              />
            </div>

            {/* Guide content with styling applied */}
            <article className="mdx-content">{renderContent()}</article>

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
                steps={steps}
                stepsToCompleteText={guidesT("stepsToComplete")}
                guideId={guideId}
              />
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
