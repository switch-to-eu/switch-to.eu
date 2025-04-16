import { getServicesByCategory, getCategoryContent, getAllCategoriesMetadata } from '@/lib/content';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { ServiceCard } from '@/components/ui/ServiceCard';
import { Container } from '@/components/layout/container';
import { ContributeCta } from '@/components/ContributeCta';
import { RecommendedAlternative } from '@/components/ui/RecommendedAlternative';

// Define params as a Promise type
type Params = Promise<{
  category: string;
}>;

interface ServicesCategoryPageProps {
  params: Params;
}

// Generate metadata for SEO
export async function generateMetadata(props: ServicesCategoryPageProps): Promise<Metadata> {
  const params = await props.params;
  const { category } = params;
  const capitalizedCategory = category.charAt(0).toUpperCase() + category.slice(1);

  // Get category metadata
  const { metadata: categoryMetadata } = getCategoryContent(category);

  // Use metadata title if available, otherwise fallback to capitalized category
  const pageTitle = categoryMetadata?.title || `${capitalizedCategory} Service Alternatives`;
  // Use metadata description if available
  const pageDescription = categoryMetadata?.description || `EU-based alternatives for common ${category} services that prioritize privacy and data protection.`;

  return {
    title: `${pageTitle} | switch-to.eu`,
    description: pageDescription,
    keywords: [capitalizedCategory, 'EU alternatives', 'privacy-focused services', 'GDPR compliant', category],
  };
}

export async function generateStaticParams() {
  const categories = getAllCategoriesMetadata();

  return categories.map((catgory) => ({
    category: catgory.slug,
  }))
}


export default async function ServicesCategoryPage(props: ServicesCategoryPageProps) {
  // Await the params Promise
  const params = await props.params;
  const { category } = params;
  const capitalizedCategory = category.charAt(0).toUpperCase() + category.slice(1);

  // Load EU services for this category
  const euServices = await getServicesByCategory(category, 'eu');
  const { metadata: categoryMetadata, content: categoryContent } = getCategoryContent(category);

  if (euServices.length === 0) {
    notFound();
  }

  // Get featured services for this category
  const featuredServices = euServices.filter(service => service.featured === true);

  // Non-featured services
  const regularServices = euServices.filter(service => !service.featured);

  // Use metadata title if available, otherwise fallback to capitalized category
  const pageTitle = categoryMetadata?.title || `${capitalizedCategory} Service Alternatives`;
  // Use metadata description if available
  const pageDescription = categoryMetadata?.description || `EU-based alternatives for common ${category} services that prioritize privacy and data protection.`;

  return (
    <main className="flex flex-col gap-12 py-10">
      <Container>
        <h1 className="text-3xl font-bold mb-2">{pageTitle}</h1>
        <p className="text-lg mb-6 text-muted-foreground">
          {pageDescription}
        </p>

        {categoryContent && (
          <div className="mb-8 dark:bg-gray-800 rounded-lg">
            {categoryContent.split('\n\n').map((paragraph, index) => (
              <p key={index} className={`text-base ${index > 0 ? 'mt-4' : ''}`}>
                {paragraph}
              </p>
            ))}
          </div>
        )}

        {/* Featured services as recommended alternatives */}
        {featuredServices.length > 0 && (
          <div className="mb-8">
            {featuredServices.map((service) => (
              <RecommendedAlternative
                key={service.name}
                service={service}
              />
            ))}
          </div>
        )}

        {/* Regular services grid */}
        <h2 className="text-2xl font-bold mb-6">{featuredServices.length > 0 ? 'More' : 'All'} {capitalizedCategory} Alternatives</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 auto-rows-fr">
          {(regularServices.length > 0 ? regularServices : euServices).map((service) => (
            <ServiceCard
              key={service.name}
              service={service}
              showCategory={false}
            />
          ))}
        </div>
      </Container>
      {/* CTA Section */}
      <section className="py-8 md:py-12">
        <Container>
          <ContributeCta />
        </Container>
      </section>
    </main>
  );
}