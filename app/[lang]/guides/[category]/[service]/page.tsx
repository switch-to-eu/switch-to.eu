import { getGuide, extractMissingFeatures, extractMigrationSteps, getAllGuides } from '@/lib/content';
import { notFound } from 'next/navigation';
import { marked } from 'marked';
import { Metadata } from 'next';
import Script from 'next/script';
import { GuideSidebar } from '@/components/guides/GuideSidebar';
import { WarningCollapsible } from '@/components/guides/WarningCollapsible';
import { defaultLanguage } from '@/lib/i18n/config';
import { getDictionary, getNestedValue } from '@/lib/i18n/dictionaries';

// Generate static params for all guide pages
export async function generateStaticParams() {
  const guides = await getAllGuides();

  return guides.map((guide) => ({
    category: guide.category,
    service: guide.slug,
  }));
}

// Define params as a Promise type
type Params = Promise<{
  category: string;
  service: string;
  lang: string;
}>;

interface GuideServicePageProps {
  params: Params;
}

// Generate metadata for SEO
export async function generateMetadata(props: GuideServicePageProps): Promise<Metadata> {
  const params = await props.params;
  const { category, service, lang } = params;
  const language = lang || defaultLanguage;
  const dict = await getDictionary(language);

  // Helper function to get translated text with replacements
  const t = (path: string, replacements?: Record<string, string>): string => {
    const value = getNestedValue(dict, path) as string | undefined;
    let translatedText = typeof value === 'string' ? value : path;

    // Replace placeholders with actual values if provided
    if (replacements && typeof translatedText === 'string') {
      Object.entries(replacements).forEach(([key, val]) => {
        translatedText = translatedText.replace(`{{${key}}}`, val);
      });
    }

    return translatedText;
  };

  // Load guide data from MDX file
  const guideData = await getGuide(category, service, language);

  if (!guideData) {
    return {
      title: t('guides.service.meta.notFound'),
    };
  }

  const { frontmatter } = guideData;

  return {
    title: t('guides.service.meta.title', { title: frontmatter.title }),
    description: frontmatter.description,
    keywords: [`${frontmatter.sourceService}`, `${frontmatter.targetService}`, 'migration guide', 'EU alternatives', category],
    authors: frontmatter.author ? [{ name: frontmatter.author }] : undefined,
    alternates: {
      canonical: `https://switch-to.eu/${language}/guides/${category}/${service}`,
      languages: {
        'en': `https://switch-to.eu/en/guides/${category}/${service}`,
        'nl': `https://switch-to.eu/nl/guides/${category}/${service}`,
      },
    },
  };
}

export default async function GuideServicePage({ params }: GuideServicePageProps) {
  // Await the params Promise
  const resolvedParams = await params;
  const { category, service, lang } = resolvedParams;
  const language = lang || defaultLanguage;
  const dict = await getDictionary(language);

  // Helper function to get translated text with replacements
  const t = (path: string, replacements?: Record<string, string>): string => {
    const value = getNestedValue(dict, path) as string | undefined;
    let translatedText = typeof value === 'string' ? value : path;

    // Replace placeholders with actual values if provided
    if (replacements && typeof translatedText === 'string') {
      Object.entries(replacements).forEach(([key, val]) => {
        translatedText = translatedText.replace(`{{${key}}}`, val);
      });
    }

    return translatedText;
  };

  // Load guide data from MDX file
  const guideData = await getGuide(category, service, language);

  if (!guideData) {
    return notFound();
  }

  const { frontmatter, content } = guideData;

  // Pass frontmatter to extractMissingFeatures
  const missingFeatures = extractMissingFeatures(content, frontmatter);
  const steps = extractMigrationSteps(content);

  // Set basic options for marked
  marked.setOptions({
    gfm: true,     // GitHub Flavored Markdown
    breaks: true,  // Translate line breaks to <br>
  });

  // Parse markdown content to HTML
  const htmlContent = marked.parse(content);

  // Create JSON-LD structured data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    'headline': frontmatter.title,
    'description': frontmatter.description,
    'author': frontmatter.author ? { '@type': 'Person', 'name': frontmatter.author } : undefined,
    'datePublished': frontmatter.date || new Date().toISOString().split('T')[0],
    'mainEntityOfPage': {
      '@type': 'WebPage',
      '@id': `https://switch-to.eu/${language}/guides/${category}/${service}`
    },
    'publisher': {
      '@type': 'Organization',
      'name': 'Switch-to.EU',
      'url': 'https://switch-to.eu'
    },
    'about': {
      '@type': 'SoftwareApplication',
      'name': frontmatter.targetService
    },
    'skillLevel': frontmatter.difficulty
  };

  return (
    <>
      <Script
        id="guide-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
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
              <p className="text-lg text-gray-600 dark:text-gray-300">
                {frontmatter.description}
              </p>
              <div className="flex mt-4 space-x-4">
                <div className={`px-3 py-1 rounded-full text-sm ${frontmatter.difficulty === 'beginner' ? 'bg-green-100 text-green-800' :
                  frontmatter.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                  {t('guides.service.difficultyLabel', {
                    level: frontmatter.difficulty.charAt(0).toUpperCase() + frontmatter.difficulty.slice(1)
                  })}
                </div>
                <div className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm">
                  {frontmatter.timeRequired}
                </div>
              </div>
            </div>

            {missingFeatures.length > 0 && (
              <div className="mb-0">
                <WarningCollapsible missingFeatures={missingFeatures} />
              </div>
            )}

            {/* Guide content with styling applied */}
            <article className="mdx-content">
              <div dangerouslySetInnerHTML={{ __html: htmlContent }}
              />
            </article>

            <div className="mt-12 p-6 bg-gray-100 dark:bg-gray-800 rounded-lg">
              <h2 className="text-xl font-semibold mb-4">{t('guides.service.editGuide.title')}</h2>
              <p className="mb-4">
                {t('guides.service.editGuide.description')}
              </p>
              <a href="https://github.com/switch-to.eu/switch-to.eu" className="hover:underline">
                {t('guides.service.editGuide.link')}
              </a>
            </div>
          </div>

          {/* Sidebar - narrower column */}
          <div className="lg:col-span-4">
            <div className="sticky top-24">
              <GuideSidebar
                missingFeatures={missingFeatures}
                steps={steps}
              />
            </div>
          </div>
        </div>
      </main>
    </>
  );
}