import {
  getBusinessServiceBySlug,
  getBusinessServiceSlugs,
} from "@/lib/content/services/services";
import { notFound } from "next/navigation";
import { Container } from "@/components/layout/container";
import { RegionBadge } from "@/components/ui/region-badge";
import { MarkdownRenderer } from "@/components/ui/MarkdownRenderer"; // Assuming this exists
import { FeatureComparisonTable } from "@/components/ui/FeatureComparisonTable";
import { TestimonialsSection } from "@/components/ui/TestimonialsSection";
import { getTranslations, unstable_setRequestLocale } from "next-intl/server";
import { Locale } from "next-intl";
import { routing } from "@/i18n/routing"; // For generateStaticParams
import { ServiceFrontmatter } from "@/lib/content/schemas"; // For generateMetadata type
import { Link } from "@/i18n/navigation"; // For "Visit Website" button

interface BusinessServicePageProps {
  params: {
    locale: Locale;
    region: "eu" | "non-eu";
    slug: string;
  };
}

export async function generateStaticParams() {
  const params = [];
  for (const locale of routing.locales) {
    const euSlugs = await getBusinessServiceSlugs("eu", locale);
    for (const slug of euSlugs) {
      params.push({ locale, region: "eu", slug });
    }
    const nonEuSlugs = await getBusinessServiceSlugs("non-eu", locale);
    for (const slug of nonEuSlugs) {
      params.push({ locale, region: "non-eu", slug });
    }
  }
  return params;
}

export async function generateMetadata({
  params,
}: BusinessServicePageProps): Promise<{
  title: string;
  description?: string;
  keywords?: string[];
}> {
  unstable_setRequestLocale(params.locale);
  const serviceDetails = await getBusinessServiceBySlug(params.slug, params.locale);

  if (!serviceDetails || !serviceDetails.frontmatter) {
    return {
      title: "Service Not Found",
    };
  }

  const { frontmatter } = serviceDetails;
  // Reusing existing 'services.detail.meta' namespace if applicable, or a generic one
  // For now, directly using frontmatter fields.
  return {
    title: `${frontmatter.name} - Business Service | switch-to.eu`,
    description: frontmatter.summary || undefined,
    keywords: frontmatter.keywords || [],
  };
}

export default async function BusinessServicePage({
  params,
}: BusinessServicePageProps) {
  unstable_setRequestLocale(params.locale);
  const t = await getTranslations({ locale: params.locale, namespace: "services.detail" });
  const serviceDetails = await getBusinessServiceBySlug(params.slug, params.locale);

  if (!serviceDetails) {
    notFound();
  }

  const { frontmatter, content } = serviceDetails;

  return (
    <Container className="py-8">
      <article>
        <header className="mb-8">
          <h1 className="text-4xl font-bold mb-2">{frontmatter.name}</h1>
          {frontmatter.summary && (
            <p className="text-xl text-muted-foreground mb-4">
              {frontmatter.summary}
            </p>
          )}
          <div className="flex flex-wrap gap-4 items-center mb-4">
            {frontmatter.region && <RegionBadge region={frontmatter.region} />}
            {frontmatter.category && (
              <Link 
                href={`/business/services/${frontmatter.category}`} // Adjusted for business categories
                className="text-sm font-medium text-blue-600 hover:underline"
              >
                {frontmatter.category}
              </Link>
            )}
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <MarkdownRenderer content={content} />

            {frontmatter.featureComparison &&
              frontmatter.featureComparison.items &&
              frontmatter.featureComparison.items.length > 0 && (
                <section className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
                  <h2 className="text-2xl font-semibold mb-6">
                    {t("featureComparisonTitle")}
                  </h2>
                  <FeatureComparisonTable
                    euToolName={frontmatter.name}
                    comparisonData={frontmatter.featureComparison}
                  />
                </section>
              )}

            {frontmatter.testimonials &&
              frontmatter.testimonials.length > 0 && (
                <section className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
                  <h2 className="text-2xl font-semibold mb-6 text-center">
                    {t("testimonialsTitle")}
                  </h2>
                  <TestimonialsSection
                    testimonials={frontmatter.testimonials}
                  />
                </section>
              )}
          </div>
          <aside className="md:col-span-1 space-y-6">
            {frontmatter.website && (
              <Link
                href={frontmatter.website}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center w-full px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
              >
                {t("visitWebsite")}
              </Link>
            )}
            <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-4">{t("title")}</h3> {/* "Details" */}
              <ul className="space-y-2 text-sm">
                {frontmatter.location && (
                  <li>
                    <strong>{t("location")}:</strong> {frontmatter.location}
                  </li>
                )}
                <li>
                  <strong>{t("freeOption")}:</strong>{" "}
                  {frontmatter.freeOption ? t("freeOptionYes") : t("freeOptionNo")}
                </li>
                {frontmatter.startingPrice && (
                   <li>
                    <strong>{t("startingPrice")}:</strong> €{frontmatter.startingPrice}
                  </li>
                )}
                 {frontmatter.pricingLink && (
                  <li>
                    <Link href={frontmatter.pricingLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      View Pricing Details
                    </Link>
                  </li>
                )}
              </ul>
            </div>
            {/* ServiceIssues could be added here if relevant for business services */}
            {/* No migration guides or testimonials for now */}
          </aside>
        </div>
      </article>
    </Container>
  );
}
