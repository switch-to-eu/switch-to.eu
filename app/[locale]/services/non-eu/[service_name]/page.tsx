import { getServiceBySlug, getServicesByCategory, getRecommendedAlternative, getServiceSlugs } from '@/lib/content/services/services';
import { getGuidesByTargetService } from '@/lib/content/services/guides';
import { notFound } from 'next/navigation';
import { marked } from 'marked';
import path from 'path';
import fs from 'fs';
import matter from 'gray-matter';
import { RecommendedAlternative } from '@/components/ui/RecommendedAlternative';
import { ServiceCard } from '@/components/ui/ServiceCard';
import { getTranslations } from "next-intl/server";
import { Metadata } from "next";
import { routing } from '@/i18n/routing';

import React from 'react';

type Locale = typeof routing.locales[number];

// Generate static params for all non-EU services
export async function generateStaticParams() {
  const serviceNames = await getServiceSlugs('non-eu');

  return serviceNames.map((service_name) => ({
    service_name,
  }));
}


// Generate metadata for SEO
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string, service_name: string }>;
}): Promise<Metadata> {
  // Await the params
  const { service_name, locale } = await params;

  // Normalize slug (replace hyphens with spaces for lookup)
  const slug = service_name.replace(/-/g, ' ');

  // Load service data
  const serviceData = await getServiceBySlug(slug, locale as Locale);

  if (!serviceData) {
    return {
      title: 'Service Not Found',
    };
  }

  const { frontmatter } = serviceData;

  return {
    title: `${frontmatter.name} | Non-EU Service | switch-to.eu`,
    description: frontmatter.description,
    keywords: [frontmatter.name, frontmatter.category, 'non-EU service', 'service migration', 'EU alternatives', ...(frontmatter.tags || [])],
    alternates: {
      canonical: `https://switch-to.eu/${locale}/services/non-eu/${service_name}`,
      languages: {
        'en': `https://switch-to.eu/en/services/non-eu/${service_name}`,
        'nl': `https://switch-to.eu/nl/services/non-eu/${service_name}`,
      },
    },
  };
}

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ locale: string, service_name: string }>;
}) {
  // Await the params Promise
  const { service_name, locale } = await params;

  // Get translations
  const t = await getTranslations("services.detail.nonEu");
  const commonT = await getTranslations("common");

  // Keep the original URL slug for redirects
  const originalSlug = service_name;

  // Normalize slug (replace hyphens with spaces for lookup)
  // The conversion needs to be more flexible to handle special cases
  const slug = service_name.replace(/-/g, ' ');

  // Load service data
  const serviceData = await getServiceBySlug(slug, locale as Locale);

  if (!serviceData) {
    notFound();
  }

  const { frontmatter, content } = serviceData;

  // Verify this is a non-EU service
  if (frontmatter.region !== 'non-eu') {
    // Redirect to the EU version
    return {
      redirect: {
        destination: `/${locale}/services/eu/${originalSlug}`,
        permanent: false,
      },
    };
  }

  // Load related guides
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const relatedGuides = await getGuidesByTargetService(frontmatter.name, locale as Locale);

  // Get recommended alternative if specified
  const recommendedAlternativeData = frontmatter.recommendedAlternative
    ? await getRecommendedAlternative(slug, locale as Locale)
    : null;

  // We need to get migration guides where:
  // - sourceService is the current service (Gmail)
  // - targetService is the recommended alternative (ProtonMail)
  // This is different than just getting guides targeting the current service
  // eslint-disable-next-line prefer-const, @typescript-eslint/no-explicit-any
  let migrationGuides: any[] = [];

  if (frontmatter.recommendedAlternative && recommendedAlternativeData) {
    // Get all guides from guide directories
    const contentRoot = path.join(process.cwd(), '/content');
    const guidesDir = path.join(contentRoot, locale, 'guides');

    // If language directory doesn't exist, fallback to default 'en'
    const contentDir = fs.existsSync(guidesDir) ? guidesDir : path.join(contentRoot, 'guides');

    if (fs.existsSync(contentDir)) {
      // Get all category directories
      const categories = fs.readdirSync(contentDir)
        .filter(file =>
          fs.statSync(path.join(contentDir, file)).isDirectory() &&
          !file.startsWith('.')
        );

      // Look through categories and guides
      for (const category of categories) {
        const categoryDir = path.join(contentDir, category);
        const guides = fs.readdirSync(categoryDir)
          .filter(dir =>
            fs.statSync(path.join(categoryDir, dir)).isDirectory() &&
            !dir.startsWith('.')
          );

        // Process each guide
        for (const guideSlug of guides) {
          const mdFile = path.join(categoryDir, guideSlug, 'index.md');

          // Skip if MDX file doesn't exist
          if (!fs.existsSync(mdFile)) {
            continue;
          }

          const fileContent = fs.readFileSync(mdFile, 'utf8');
          const { data } = matter(fileContent);

          // Check if this is a migration guide for current service → recommended alternative
          if (
            data.sourceService &&
            data.targetService &&
            data.sourceService.toLowerCase() === frontmatter.name.toLowerCase() &&
            data.targetService.toLowerCase() === recommendedAlternativeData.name.toLowerCase()
          ) {
            // Found a matching migration guide
            migrationGuides.push({
              slug: guideSlug,
              frontmatter: data,
              category
            });
          }
        }
      }
    }
  }

  // Set basic options for marked
  marked.setOptions({
    gfm: true,     // GitHub Flavored Markdown
    breaks: true,  // Translate line breaks to <br>
  });

  // Parse markdown content to HTML
  const htmlContent = content ? marked.parse(content) : '';


  // Load EU alternatives from the same category
  const euAlternatives = await getServicesByCategory(frontmatter.category, 'eu', locale as Locale);

  // Filter out recommended alternative from alternatives list if it exists
  const otherAlternatives = recommendedAlternativeData
    ? euAlternatives.filter(alt => alt.name !== recommendedAlternativeData.name)
    : euAlternatives;

  return (
    <main className="container mx-auto px-4 py-8 max-w-7xl lg:px-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Service Header */}
          <h1 className="text-4xl font-bold text-slate-800 dark:text-slate-100 mb-2">{frontmatter.name}</h1>
          <p className="text-xl text-slate-600 dark:text-slate-300 mb-8">
            {frontmatter.description}
          </p>

          {/* Recommended Alternative */}
          {recommendedAlternativeData && (
            <React.Suspense fallback={<div className="mb-10 p-6 bg-green-50 dark:bg-green-900/20 rounded-lg relative">
              <p className="text-center">{commonT("loading")}</p>
            </div>}>
              <RecommendedAlternative
                service={recommendedAlternativeData}
                sourceService={frontmatter.name}
                migrationGuides={migrationGuides}
              />
            </React.Suspense>
          )}

          {/* Service Details */}
          <div className="mb-12">
            {htmlContent && (
              <div className="mdx-content prose prose-slate prose-sm sm:prose dark:prose-invert max-w-none">
                <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
              </div>
            )}
          </div>


          {/* Other EU Alternatives Section */}
          {otherAlternatives.length > 0 && (
            <div className="mb-12">
              <h2 className="text-2xl font-bold mb-4">{t("otherAlternatives")}</h2>
              <p className="mb-4 text-slate-600 dark:text-slate-300">
                {otherAlternatives.length > 1
                  ? t("otherEUAlternatives")
                  : t("oneMoreEUAlternative")
                }
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {otherAlternatives.map((service) => (
                  <ServiceCard
                    key={service.name}
                    service={service}
                    showCategory={false}
                  />
                ))}
              </div>
            </div>
          )}
        </div>



        {/* Sidebar */}
        <div className="lg:col-span-1">
          {/* Service Issues Section */}
          {frontmatter.issues && frontmatter.issues.length > 0 ? (
            <div className="sticky top-24 bg-red-50 dark:bg-red-900/10 rounded-lg overflow-hidden border border-red-100 dark:border-red-900/30">
              <div className="p-5 bg-red-100 dark:bg-red-900/20 border-b border-red-200 dark:border-red-900/30">
                <h2 className="text-xl font-bold text-red-800 dark:text-red-300">
                  {t("whyProblematic", { service: frontmatter.name })}
                </h2>
              </div>

              <div className="p-5 space-y-4">
                {frontmatter.issues.map((issue: string, index: number) => (
                  <div key={index} className="flex items-start">
                    <span className="mr-3 text-red-500 mt-0.5">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="15" y1="9" x2="9" y2="15" />
                        <line x1="9" y1="9" x2="15" y2="15" />
                      </svg>
                    </span>
                    <p className="text-slate-700 dark:text-slate-300">{issue}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="sticky top-24 rounded-lg p-6 bg-gray-50 dark:bg-gray-800 mb-6 border border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold mb-4">{t("whySwitchTitle")}</h2>
              <div className="space-y-4">
                <div className="p-3 rounded-md bg-white dark:bg-gray-700 border border-gray-100 dark:border-gray-600">
                  <h3 className="font-medium mb-1">{t("dataSovereignty.title")}</h3>
                  <p className="text-sm text-muted-foreground">{t("dataSovereignty.description")}</p>
                </div>
                <div className="p-3 rounded-md bg-white dark:bg-gray-700 border border-gray-100 dark:border-gray-600">
                  <h3 className="font-medium mb-1">{t("gdprCompliance.title")}</h3>
                  <p className="text-sm text-muted-foreground">{t("gdprCompliance.description")}</p>
                </div>
                <div className="p-3 rounded-md bg-white dark:bg-gray-700 border border-gray-100 dark:border-gray-600">
                  <h3 className="font-medium mb-1">{t("legalRecourse.title")}</h3>
                  <p className="text-sm text-muted-foreground">{t("legalRecourse.description")}</p>
                </div>
                <div className="p-3 rounded-md bg-white dark:bg-gray-700 border border-gray-100 dark:border-gray-600">
                  <h3 className="font-medium mb-1">{t("supportEUDigital.title")}</h3>
                  <p className="text-sm text-muted-foreground">{t("supportEUDigital.description")}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}