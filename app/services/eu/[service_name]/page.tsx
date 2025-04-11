import { getServiceBySlug, getGuidesByTargetService, getServicesByCategory } from '@/lib/content';
import { notFound } from 'next/navigation';
import { RegionBadge } from '@/components/ui/region-badge';
import Link from 'next/link';
import { marked } from 'marked';
import { Metadata } from 'next';
import { ServiceCard } from '@/components/ui/ServiceCard';
import { ContributeCta } from '@/components/ContributeCta';
import { Button } from '@/components/ui/button';

import Image from "next/image";

// Define params as a Promise type
type Params = Promise<{
  service_name: string;
}>;

interface ServiceDetailPageProps {
  params: Params;
}

// Generate metadata for SEO
export async function generateMetadata(props: ServiceDetailPageProps): Promise<Metadata> {
  const params = await props.params;
  const { service_name } = params;

  // Normalize slug (replace hyphens with spaces for lookup)
  const slug = service_name.replace(/-/g, ' ');

  // Load service data
  const serviceData = await getServiceBySlug(slug);

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
  };
}

export default async function ServiceDetailPage(props: ServiceDetailPageProps) {
  // Await the params Promise
  const params = await props.params;
  const { service_name } = params;

  // Keep the original URL slug for redirects
  const originalSlug = service_name;

  // Normalize slug (replace hyphens with spaces for lookup)
  // The conversion needs to be more flexible to handle special cases
  const slug = service_name.replace(/-/g, ' ');

  // Load service data
  const serviceData = await getServiceBySlug(slug);

  if (!serviceData) {
    notFound();
  }

  const { frontmatter, content } = serviceData;

  // Verify this is an EU service
  if (frontmatter.region !== 'eu') {
    // Redirect to the non-EU version
    return {
      redirect: {
        destination: `/services/non-eu/${originalSlug}`,
        permanent: false,
      },
    };
  }

  // Load related guides
  const relatedGuides = await getGuidesByTargetService(frontmatter.name);

  // Load similar services from the same category
  const similarServices = (await getServicesByCategory(frontmatter.category, 'eu'))
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
                <span className="font-semibold mr-2">Location:</span>
                <span>{frontmatter.location}</span>
              </div>
              <div className="flex items-center">
                <span className="font-semibold mr-2">Privacy Rating:</span>
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className={`text-lg ${i < frontmatter.privacyRating ? 'text-yellow-500' : 'text-gray-300'}`}>★</span>
                  ))}
                </div>
              </div>
              <div className="flex items-center">
                <span className="font-semibold mr-2">Free Option:</span>
                <span>{frontmatter.freeOption ? '✅ Yes' : '❌ No'}</span>
              </div>
              <div className="flex items-center">
                <span className="font-semibold mr-2">Starting Price:</span>
                <span>{frontmatter.startingPrice}</span>
              </div>
            </div>
            <Button variant="default" asChild>
              <Link href={frontmatter.url} target="_blank">Visit website</Link>
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
              <h2 className="text-2xl font-bold mb-4">Similar Services</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {similarServices.map((service) => (
                  <ServiceCard
                    key={service.name}
                    service={service}
                    showCategory={false}
                  />
                ))}
              </div>
            </div>
          )}

          {/* CTA Section */}
          <section className="py-8 md:py-12">
            <ContributeCta />
          </section>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          {/* Migration Guides - Always show the sidebar, with CTA if no guides */}
          <div className="sticky top-24 border rounded-lg p-6 bg-[var(--pop-3)] dark:bg-gray-800">
            <div className="relative h-40 mb-6">
              <Image
                src="/images/migrate.svg"
                alt="Migration guides illustration"
                fill
                className="object-contain"
              />
            </div>
            <h2 className="text-xl text-center font-bold mb-4">Migration Guides</h2>

            {relatedGuides.length > 0 ? (
              <>
                <p className="text-muted-foreground mb-4">Here are some guides to help you migrate to <b>{frontmatter.name}</b></p>
                <div className="space-y-4">
                  {relatedGuides.map((guide) => (
                    <Link
                      key={`${guide.category}-${guide.slug}`}
                      href={`/guides/${guide.category}/${guide.slug}`}
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
                  <p className="text-sm text-muted-foreground mb-4 text-center">Know another service to migrate from? Help write a guide!</p>
                  <div className="flex justify-center">
                    <Button variant="red" size="sm" asChild>
                      <Link href="/contribute">
                        Write Another Guide
                      </Link>
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <p className="text-muted-foreground mb-4">No migration guides exist yet for <b>{frontmatter.name}</b>.</p>
                <p className="text-muted-foreground mb-6">Help others switch by creating the first guide!</p>
                <div className="flex justify-center">
                  <Button variant="red" asChild>
                    <Link href="/contribute">
                      Write a Migration Guide
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