import { getServiceBySlug, getServiceSlugs } from '@/lib/content/services';
import { getGuidesByTargetService } from '@/lib/content/guides';
import { getServicesByCategory } from '@/lib/content/services';
import { notFound } from 'next/navigation';
import { RegionBadge } from '@/components/ui/region-badge';
import Link from 'next/link';
import { marked } from 'marked';
import { Metadata } from 'next';
import { ServiceCard } from '@/components/ui/ServiceCard';
import { ContributeCta } from '@/components/ContributeCta';
import { Button } from '@/components/ui/button';
import { defaultLanguage } from '@/lib/i18n/config';
import { getDictionary, getNestedValue } from '@/lib/i18n/dictionaries';

import Image from "next/image";

// Define params as a Promise type
type Params = Promise<{
  service_name: string;
  lang: string;
}>;

interface ServiceDetailPageProps {
  params: Params;
}

// Generate static params for all EU services
export async function generateStaticParams() {
  const serviceNames = await getServiceSlugs('eu');

  return serviceNames.map((service_name) => ({
    service_name,
  }));
}

// Generate metadata for SEO
export async function generateMetadata(props: ServiceDetailPageProps): Promise<Metadata> {
  const params = await props.params;
  const { service_name, lang } = params;
  const language = lang || defaultLanguage;

  // Normalize slug (replace hyphens with spaces for lookup)
  const slug = service_name.replace(/-/g, ' ');

  // Load service data
  const serviceData = await getServiceBySlug(slug, language);

  if (!serviceData) {
    return {
      title: 'Service Not Found',
    };
  }

  const { frontmatter } = serviceData;

  return {
    title: `${frontmatter.name} | EU Service | switch-to.eu`,
    description: frontmatter.description,
    keywords: [frontmatter.name, frontmatter.category, 'EU service', 'privacy-focused', 'GDPR compliant', ...(frontmatter.tags || [])],
    alternates: {
      canonical: `https://switch-to.eu/${language}/services/eu/${service_name}`,
      languages: {
        'en': `https://switch-to.eu/en/services/eu/${service_name}`,
        'nl': `https://switch-to.eu/nl/services/eu/${service_name}`,
      },
    },
  };
}

export default async function ServiceDetailPage(props: ServiceDetailPageProps) {
  // Await the params Promise
  const params = await props.params;
  const { service_name, lang } = params;
  const language = lang || defaultLanguage;
  const dict = await getDictionary(language);

  // Helper function to get translated text
  const t = (path: string): string => {
    const value = getNestedValue(dict, path);
    return typeof value === 'string' ? value : path;
  };

  // Keep the original URL slug for redirects
  const originalSlug = service_name;

  // Normalize slug (replace hyphens with spaces for lookup)
  // The conversion needs to be more flexible to handle special cases
  const slug = service_name.replace(/-/g, ' ');

  // Load service data
  const serviceData = await getServiceBySlug(slug, language);

  if (!serviceData) {
    notFound();
  }

  const { frontmatter, content } = serviceData;

  // Verify this is an EU service
  if (frontmatter.region !== 'eu') {
    // Redirect to the non-EU version
    return {
      redirect: {
        destination: `/${language}/services/non-eu/${originalSlug}`,
        permanent: false,
      },
    };
  }

  // Load related guides
  const relatedGuides = await getGuidesByTargetService(frontmatter.name, language);

  // Load similar services from the same category
  const similarServices = (await getServicesByCategory(frontmatter.category, 'eu', language))
    .filter(service => service.name !== frontmatter.name)
    .slice(0, 4); // Limit to 4 similar services

  // Set basic options for marked
  marked.setOptions({
    gfm: true,     // GitHub Flavored Markdown
    breaks: true,  // Translate line breaks to <br>
  });

  // Parse markdown content to HTML
  const htmlContent = content ? marked.parse(content) : '';


  return (
    <main className="container mx-auto px-4 py-8 max-w-7xl lg:px-8">

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <div className="mb-8">
            <div className="flex justify-between items-start mb-2">
              <h1 className="text-3xl font-bold">{frontmatter.name}</h1>
              <RegionBadge region="eu" />
            </div>
            <p className="text-lg text-muted-foreground mb-4">
              {frontmatter.description}
            </p>
            <div className="flex flex-wrap gap-4 mb-6">
              <div className="flex items-center">
                <span className="font-semibold mr-2">{t('services.detail.location')}:</span>
                <span>{frontmatter.location}</span>
              </div>
              <div className="flex items-center">
                <span className="font-semibold mr-2">{t('services.detail.privacyRating')}:</span>
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className={`text-lg ${i < frontmatter.privacyRating ? 'text-yellow-500' : 'text-gray-300'}`}>★</span>
                  ))}
                </div>
              </div>
              <div className="flex items-center">
                <span className="font-semibold mr-2">{t('services.detail.freeOption')}:</span>
                <span>{frontmatter.freeOption ? t('services.detail.freeOptionYes') : t('services.detail.freeOptionNo')}</span>
              </div>
              <div className="flex items-center">
                <span className="font-semibold mr-2">{t('services.detail.startingPrice')}:</span>
                <span>{frontmatter.startingPrice}</span>
              </div>
            </div>
            <Button variant="default" asChild>
              <Link href={frontmatter.url} target="_blank">{t('services.detail.visitWebsite')}</Link>
            </Button>
          </div>

          {/* Markdown Content */}
          {htmlContent && (
            <div className="mdx-content prose prose-sm sm:prose dark:prose-invert max-w-none mb-12">
              <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
            </div>
          )}

          {/* Similar Services - Moved from sidebar to main content */}
          {similarServices.length > 0 && (
            <div className="mb-12">
              <h2 className="text-2xl font-bold mb-4">{t('services.detail.similarServices')}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {similarServices.map((service) => (
                  <ServiceCard
                    key={service.name}
                    service={service}
                    showCategory={false}
                    lang={language}
                  />
                ))}
              </div>
            </div>
          )}

          {/* CTA Section */}
          <section className="py-8 md:py-12">
            <ContributeCta lang={language} />
          </section>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 ">
          {/* Migration Guides - Always show the sidebar, with CTA if no guides */}
          <div className="sticky top-24 border rounded-lg p-6 bg-[var(--green-bg)]">
            <div className="relative h-40 mb-6">
              <Image
                src="/images/migrate.svg"
                alt="Migration guides illustration"
                fill
                className="object-contain"
              />
            </div>
            <h2 className="text-xl text-center font-bold mb-4">{t('services.detail.migrationGuides')}</h2>

            {relatedGuides.length > 0 ? (
              <>
                <p className="text-muted-foreground mb-4">{t('services.detail.migrateHelp')} <b>{frontmatter.name}</b></p>
                <div className="space-y-4">
                  {relatedGuides.map((guide) => (
                    <Link
                      key={`${guide.category}-${guide.slug}`}
                      href={`/${language}/guides/${guide.category}/${guide.slug}`}
                      className="block mb-4 mt-4 rounded-md transition-colors"
                    >
                      <h3 className="text-lg mb-1">
                        {guide.frontmatter.sourceService &&
                          `${guide.frontmatter.sourceService} → ${frontmatter.name}`}
                        {!guide.frontmatter.sourceService && guide.frontmatter.title}
                      </h3>
                      <p className="text-xs text-muted-foreground">{guide.frontmatter.description}</p>
                    </Link>
                  ))}
                </div>
                <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-sm text-muted-foreground mb-4 text-center">{t('services.detail.anotherServiceHelp')}</p>
                  <div className="flex justify-center">
                    <Button variant="red" size="sm" asChild>
                      <Link href={`/${language}/contribute`}>
                        {t('services.detail.writeAnotherGuide')}
                      </Link>
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <p className="text-muted-foreground mb-4">{t('services.detail.noGuides')} <b>{frontmatter.name}</b>.</p>
                <p className="text-muted-foreground mb-6">{t('services.detail.helpOthers')}</p>
                <div className="flex justify-center">
                  <Button variant="red" asChild>
                    <Link href={`/${language}/contribute`}>
                      {t('services.detail.writeMigrationGuide')}
                    </Link>
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}