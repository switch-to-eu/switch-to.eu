import { getGuide, getAllGuides } from "@/lib/content/services/guides";
import {
  extractMissingFeatures,
  extractMigrationSteps,
  processCompletionMarkers,
  extractStepsWithMeta,
} from "@/lib/content/utils";
import { notFound } from "next/navigation";
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
import { parseMarkdown } from "@/lib/markdown";

// Generate static params for all guide pages
export async function generateStaticParams() {
  const guides = await getAllGuides();

  return guides.map((guide) => ({
    category: guide.category,
    service: guide.slug,
  }));
}

// Generate metadata for SEO
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale; category: string; service: string }>;
}): Promise<Metadata> {
  // Await the params
  const { category, service, locale } = await params;

  // Get translations
  const t = await getTranslations("guides.service.meta");

  // Load guide data from MDX file
  const guideData = await getGuide(category, service, locale);

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
  const guideData = await getGuide(category, service, locale);

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
              <h1 className="text-3xl font-bold mb-2">{frontmatter.title}</h1>
              <div className="flex mt-4 space-x-4">
                <div
                  className={`px-3 py-1 rounded-full text-sm ${frontmatter.difficulty === "beginner"
                    ? "bg-green-100 text-green-800"
                    : frontmatter.difficulty === "intermediate"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-red-100 text-red-800"
                    }`}
                >
                  {serviceT("difficultyLabel", {
                    level:
                      frontmatter.difficulty.charAt(0).toUpperCase() +
                      frontmatter.difficulty.slice(1),
                  })}
                </div>
                <div className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm">
                  {frontmatter.timeRequired}
                </div>
              </div>
            </div>

            {/* Guide progress bar */}
            <div className="mb-8">
              <GuideProgress
                guideId={guideId}
                guideName={frontmatter.title}
                totalSteps={steps.filter(step => step.completionMarkers?.includes("[complete]")).length}
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

            <div className="mt-12 p-6 bg-gray-100 dark:bg-gray-800 rounded-lg">
              <h2 className="text-xl font-semibold mb-4">
                {serviceT("editGuide.title")}
              </h2>
              <p className="mb-4">{serviceT("editGuide.description")}</p>
              <a
                href="https://github.com/switch-to.eu/switch-to.eu"
                className="hover:underline"
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
