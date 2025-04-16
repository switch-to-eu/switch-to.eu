import Link from 'next/link';
import { getGuidesByCategory, getGuideCategories } from '@/lib/content';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';

// Generate static params for all guide category pages
export async function generateStaticParams() {
  const categories = await getGuideCategories();

  return categories.map((category) => ({
    category,
  }));
}

// Define params as a Promise type
type Params = Promise<{
  category: string;
}>;

interface GuideCategoryPageProps {
  params: Params;
}

// Generate metadata for SEO
export async function generateMetadata(props: GuideCategoryPageProps): Promise<Metadata> {
  const params = await props.params;
  const { category } = params;
  const capitalizedCategory = category.charAt(0).toUpperCase() + category.slice(1);

  return {
    title: `${capitalizedCategory} Migration Guides | switch-to.eu`,
    description: `Step-by-step guides to help you migrate from common ${category} services to EU-based alternatives.`,
    keywords: [capitalizedCategory, 'migration guides', 'EU alternatives', 'migration', category],
  };
}

export default async function GuideCategoryPage(props: GuideCategoryPageProps) {
  // Await the params Promise
  const params = await props.params;
  const { category } = params;
  const capitalizedCategory = category.charAt(0).toUpperCase() + category.slice(1);

  // Load guides from MDX files
  const guides = await getGuidesByCategory(category);

  if (!guides || guides.length === 0) {
    notFound();
  }

  return (
    <main className="container mx-auto px-4 py-8 max-w-6xl">

      <h1 className="text-3xl font-bold mb-2">{capitalizedCategory} Migration Guides</h1>
      <p className="text-lg mb-8">
        Step-by-step guides to help you migrate from common {category} services to EU-based alternatives.
      </p>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {guides.map((guide) => (
          <div key={guide.slug} className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <span className={`px-4 py-1 text-xs rounded-full ${guide.frontmatter.difficulty === 'beginner' ? 'bg-green-100 text-green-800' :
                  guide.frontmatter.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                  {guide.frontmatter.difficulty.charAt(0).toUpperCase() + guide.frontmatter.difficulty.slice(1)}
                </span>
                <span className="text-sm text-gray-500">{guide.frontmatter.timeRequired}</span>
              </div>

              <h2 className="text-xl font-semibold mb-2">{guide.frontmatter.title}</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">{guide.frontmatter.description}</p>

              <div className="flex items-center text-sm text-gray-500 mb-4">
                <span>From: <strong>{guide.frontmatter.sourceService}</strong></span>
                <span className="mx-2">→</span>
                <span>To: <strong>{guide.frontmatter.targetService}</strong></span>
              </div>

              <Link
                href={`/guides/${category}/${guide.slug}`}
                className=" hover:underline inline-block mt-2"
              >
                View Migration Guide →
              </Link>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12 p-6 bg-gray-100 dark:bg-gray-800 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Looking for {capitalizedCategory} Alternatives?</h2>
        <p className="mb-4">
          Check out our comprehensive list of EU-based {category} alternatives with feature comparisons.
        </p>
        <Link href={`/services/${category}`} className=" hover:underline">
          View {capitalizedCategory} Alternatives →
        </Link>
      </div>
    </main>
  );
}