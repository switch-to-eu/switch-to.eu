import { getLandingPage, getLandingPageSlugs } from "@switch-to-eu/content/services/landing-pages";
import { getServiceBySlug } from "@switch-to-eu/content/services/services";
import { parseMarkdown } from "@switch-to-eu/content/markdown";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { Locale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { generateLanguageAlternates } from "@switch-to-eu/i18n/utils";
import { RecommendedAlternative } from "@/components/ui/RecommendedAlternative";
import { Container } from "@switch-to-eu/blocks/components/container";
import { PageLayout } from "@switch-to-eu/blocks/components/page-layout";
import { NewsletterCta } from "@/components/NewsletterCta";
import { Banner } from "@switch-to-eu/blocks/components/banner";
import { SectionHeading } from "@switch-to-eu/blocks/components/section-heading";
import { Link } from "@switch-to-eu/i18n/navigation";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>;
}): Promise<Metadata> {
  const { slug, locale } = await params;
  const page = getLandingPage(slug, locale);

  if (!page) {
    return { title: "Not Found" };
  }

  const { frontmatter } = page;

  return {
    title: `${frontmatter.ogTitle || frontmatter.title} | switch-to.eu`,
    description: frontmatter.ogDescription || frontmatter.description,
    keywords: frontmatter.keywords,
    alternates: generateLanguageAlternates(`pages/${slug}`, locale as Locale),
    openGraph: {
      title: frontmatter.ogTitle || frontmatter.title,
      description: frontmatter.ogDescription || frontmatter.description,
      type: "article",
      publishedTime: frontmatter.date,
    },
  };
}

export function generateStaticParams() {
  const enSlugs = getLandingPageSlugs("en");
  const nlSlugs = getLandingPageSlugs("nl");

  const allSlugs = new Set([...enSlugs, ...nlSlugs]);
  return Array.from(allSlugs).map((slug) => ({ slug }));
}

export default async function LandingPage({
  params,
}: {
  params: Promise<{ slug: string; locale: Locale }>;
}) {
  const { slug, locale } = await params;
  const t = await getTranslations("landingPages");

  const page = getLandingPage(slug, locale);
  if (!page) {
    notFound();
  }

  const { frontmatter, content } = page;

  // Load recommended services
  const recommendedServices = (frontmatter.recommendedServices || [])
    .map((serviceSlug) => {
      const service = getServiceBySlug(serviceSlug, locale);
      return service ? service.frontmatter : null;
    })
    .filter(Boolean);

  // Load related (non-EU) service for issues display
  const relatedService = frontmatter.relatedService
    ? getServiceBySlug(frontmatter.relatedService, locale)
    : null;

  const htmlContent = parseMarkdown(content);

  return (
    <PageLayout>
      {/* Hero banner */}
      <section>
        <Container noPaddingMobile>
          <Banner
            color="bg-brand-navy"
            shapes={[
              { shape: "cloud", className: "-top-8 -right-8 w-36 h-36 sm:w-48 sm:h-48" },
              { shape: "sunburst", className: "bottom-6 right-16 hidden sm:block w-28 h-28 sm:w-36 sm:h-36", opacity: 0.1, duration: "8s", delay: "-2s" },
              { shape: "heart", className: "top-1/2 -left-6 hidden md:block w-20 h-20", opacity: 0.1, duration: "7s", delay: "-4s" },
            ]}
          >
            <div className="max-w-3xl">
              <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl lg:text-7xl uppercase text-brand-yellow mb-4">
                {frontmatter.title}
              </h1>
              <p className="text-brand-cream text-base sm:text-lg mb-6">
                {frontmatter.description}
              </p>
              {frontmatter.category && (
                <Link
                  href={`/services/${frontmatter.category}`}
                  className="inline-block py-2.5 px-6 bg-brand-yellow text-brand-navy rounded-full font-semibold text-sm hover:opacity-90 transition-opacity no-underline"
                >
                  {t("exploreAlternatives")}
                </Link>
              )}
            </div>
          </Banner>
        </Container>
      </section>

      {/* Main content */}
      <section>
        <Container>
          <div
            className="prose prose-lg max-w-3xl mx-auto
              prose-headings:font-heading prose-headings:uppercase prose-headings:text-brand-navy
              prose-h2:text-2xl prose-h2:sm:text-3xl prose-h2:mt-12 prose-h2:mb-6
              prose-p:text-gray-700 prose-p:leading-relaxed
              prose-li:text-gray-700
              prose-strong:text-brand-navy
              prose-a:text-brand-green prose-a:no-underline hover:prose-a:underline
              prose-table:w-full prose-th:text-left prose-th:text-brand-navy prose-th:text-sm
              prose-td:text-sm prose-td:py-2"
            dangerouslySetInnerHTML={{ __html: htmlContent }}
          />
        </Container>
      </section>

      {/* Related service issues */}
      {relatedService && relatedService.frontmatter.issues && relatedService.frontmatter.issues.length > 0 && (
        <section>
          <Container noPaddingMobile>
            <div className="bg-brand-red/5 md:rounded-3xl p-6 sm:p-8 md:p-10">
              <SectionHeading>{t("whySwitch")}</SectionHeading>
              <ul className="space-y-3 max-w-3xl">
                {relatedService.frontmatter.issues.map((issue, index) => (
                  <li key={index} className="flex items-start gap-3 text-gray-700">
                    <span className="text-brand-red mt-1 flex-shrink-0">&#9679;</span>
                    <span>{issue}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Container>
        </section>
      )}

      {/* Recommended alternatives */}
      {recommendedServices.length > 0 && (
        <section>
          <Container noPaddingMobile>
            <SectionHeading>{t("recommendedAlternatives")}</SectionHeading>
            <div className="flex flex-col gap-6">
              {recommendedServices.map((service) => (
                <RecommendedAlternative
                  key={service!.name}
                  service={service!}
                  sourceService={relatedService?.frontmatter.name || ""}
                  migrationGuides={[]}
                />
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* View all alternatives link */}
      {frontmatter.category && (
        <section>
          <Container>
            <div className="text-center">
              <Link
                href={`/services/${frontmatter.category}`}
                className="inline-block py-3 px-8 bg-brand-navy text-white rounded-full font-semibold text-base hover:opacity-90 transition-opacity no-underline"
              >
                {t("viewAllAlternatives")}
              </Link>
            </div>
          </Container>
        </section>
      )}

      {/* Newsletter CTA */}
      <NewsletterCta />
    </PageLayout>
  );
}
