import Link from 'next/link';
import { getGuidesByCategory, getGuideCategories } from '@/lib/content/services/guides';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { defaultLanguage } from '@/lib/i18n/config';
import { getDictionary, getNestedValue } from '@/lib/i18n/dictionaries';

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
  lang: string;
}>;

interface GuideCategoryPageProps {
  params: Params;
}

// Generate metadata for SEO
export async function generateMetadata(props: GuideCategoryPageProps): Promise<Metadata> {
  const params = await props.params;
  const { category, lang } = params;
  const language = lang || defaultLanguage;
  const dict = await getDictionary(language);

  const capitalizedCategory = category.charAt(0).toUpperCase() + category.slice(1);

  // Get the translation with the category filled in
  let title = getNestedValue(dict, 'guides.category.meta.title') as string | undefined;
  let description = getNestedValue(dict, 'guides.category.meta.description') as string | undefined;

  if (typeof title === 'string') {
    title = title.replace('{{category}}', capitalizedCategory);
  } else {
    title = `${capitalizedCategory} Migration Guides | switch-to.eu`;
  }

  if (typeof description === 'string') {
    description = description.replace('{{category}}', category);
  } else {
    description = `Step-by-step guides to help you migrate from common ${category} services to EU-based alternatives.`;
  }

  return {
    title,
    description,
    keywords: [capitalizedCategory, 'migration guides', 'EU alternatives', 'migration', category],
    alternates: {
      canonical: `https://switch-to.eu/${language}/guides/${category}`,
      languages: {
        'en': `https://switch-to.eu/en/guides/${category}`,
        'nl': `https://switch-to.eu/nl/guides/${category}`,
      },
    },
  };
}

export default async function GuideCategoryPage(props: GuideCategoryPageProps) {
  // Await the params Promise
  const params = await props.params;
  const { category, lang } = params;
  const language = lang || defaultLanguage;
  const dict = await getDictionary(language);

  // Helper function to get translated text with replacements
  const t = (path: string, replacements?: Record<string, string>): string => {
    const value = getNestedValue(dict, path);
    let translatedText = typeof value === 'string' ? value : path;

    // Replace placeholders with actual values if provided
    if (replacements && typeof translatedText === 'string') {
      Object.entries(replacements).forEach(([key, val]) => {
        translatedText = translatedText.replace(`{{${key}}}`, val);
      });
    }

    return translatedText;
  };

  const capitalizedCategory = category.charAt(0).toUpperCase() + category.slice(1);

  // Load guides from MDX files
  const guides = await getGuidesByCategory(category, language);

  if (!guides || guides.length === 0) {
    notFound();
  }

  return (
    <main className="container mx-auto px-4 py-8 max-w-6xl">

      <h1 className="text-3xl font-bold mb-2">
        {t('guides.category.pageTitle', { category: capitalizedCategory })}
      </h1>
      <p className="text-lg mb-8">
        {t('guides.category.pageDescription', { category })}
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
                  {t(`guides.category.difficulty.${guide.frontmatter.difficulty}`)}
                </span>
                <span className="text-sm text-gray-500">{guide.frontmatter.timeRequired}</span>
              </div>

              <h2 className="text-xl font-semibold mb-2">{guide.frontmatter.title}</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">{guide.frontmatter.description}</p>

              <div className="flex items-center text-sm text-gray-500 mb-4">
                <span>{t('guides.category.from')} <strong>{guide.frontmatter.sourceService}</strong></span>
                <span className="mx-2">→</span>
                <span>{t('guides.category.to')} <strong>{guide.frontmatter.targetService}</strong></span>
              </div>

              <Link
                href={`/${language}/guides/${category}/${guide.slug}`}
                className="hover:underline inline-block mt-2"
              >
                {t('guides.category.viewGuide')}
              </Link>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12 p-6 bg-gray-100 dark:bg-gray-800 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">
          {t('guides.category.lookingForAlternatives', { category: capitalizedCategory })}
        </h2>
        <p className="mb-4">
          {t('guides.category.checkAlternatives', { category })}
        </p>
        <Link
          href={`/${language}/services/${category}`}
          className="hover:underline"
        >
          {t('guides.category.viewAlternatives', { category: capitalizedCategory })}
        </Link>
      </div>
    </main>
  );
}