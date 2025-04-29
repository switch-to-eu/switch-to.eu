import Link from 'next/link';
import { getAllGuides, getGuideCategories } from '@/lib/content/services/guides';
import { Container } from '@/components/layout/container';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Metadata } from 'next';
import { defaultLanguage } from '@/lib/i18n/config';
import { getDictionary, getNestedValue } from '@/lib/i18n/dictionaries';

// Generate metadata with language alternates
export async function generateMetadata({
  params
}: {
  params: Promise<{ lang: string }>
}): Promise<Metadata> {
  // Await the params
  const { lang } = await params;
  const language = lang || defaultLanguage;
  const dict = await getDictionary(language);

  const defaultKeywords = ['migration guides', 'EU alternatives', 'data migration', 'service switching', 'step-by-step guides'];

  return {
    title: String(getNestedValue(dict, 'guides.meta.title')) || 'Migration Guides | switch-to.eu',
    description: String(getNestedValue(dict, 'guides.meta.description')) ||
      'Step-by-step instructions to help you move from common services to privacy-focused EU alternatives.',
    keywords: defaultKeywords,
    alternates: {
      canonical: `https://switch-to.eu/${language}/guides`,
      languages: {
        'en': 'https://switch-to.eu/en/guides',
        'nl': 'https://switch-to.eu/nl/guides',
      },
    },
  };
}

export default async function GuidesPage({
  params
}: {
  params: Promise<{ lang: string }>
}) {
  // Await the params
  const { lang } = await params;
  const language = lang || defaultLanguage;
  const dict = await getDictionary(language);

  // Helper function to get translated text that ensures return value is a string
  const t = (path: string): string => {
    const value = getNestedValue(dict, path);
    return typeof value === 'string' ? value : path;
  };

  // Load all guides
  const guides = await getAllGuides({ lang: language });
  const categories = await getGuideCategories(language);

  // Group guides by category
  const guidesByCategory = categories.map(category => {
    const categoryGuides = guides.filter(guide => guide.category === category);
    return {
      category,
      guides: categoryGuides,
    };
  }).filter(group => group.guides.length > 0);

  // Get difficulty badge color
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100';
      case 'advanced':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100';
    }
  };

  return (
    <main className="flex flex-col gap-16 py-10 md:gap-24 md:py-16">
      {/* Hero Section */}
      <section>
        <Container className="flex flex-col items-center gap-6 text-center">
          <h1 className="font-bold text-4xl md:text-5xl">{t('guides.hero.title') || 'Migration Guides'}</h1>
          <p className="max-w-[650px] text-lg text-muted-foreground md:text-xl">
            {t('guides.hero.description') || 'Step-by-step instructions to help you move from common services to privacy-focused EU alternatives.'}
          </p>
        </Container>
      </section>

      {/* Featured Guides Section */}
      <section>
        <Container>
          <h2 className="mb-8 text-center font-bold text-3xl">{t('guides.featured.title') || 'Popular Migration Guides'}</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {guides.filter(guide =>
              (guide.frontmatter.sourceService === 'Gmail' && guide.frontmatter.targetService === 'Proton Mail') ||
              (guide.frontmatter.sourceService === 'Google Drive' && guide.frontmatter.targetService === 'Nextcloud') ||
              (guide.frontmatter.sourceService === 'WhatsApp' && guide.frontmatter.targetService === 'Signal')
            ).map(guide => (
              <Card key={`${guide.category}-${guide.slug}`} className="flex flex-col h-full hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-center mb-2">
                    <span className={`px-4 py-1 text-xs rounded-full ${getDifficultyColor(guide.frontmatter.difficulty)}`}>
                      {guide.frontmatter.difficulty.charAt(0).toUpperCase() + guide.frontmatter.difficulty.slice(1)}
                    </span>
                    <span className="text-sm text-muted-foreground">{guide.frontmatter.timeRequired}</span>
                  </div>
                  <CardTitle>{guide.frontmatter.title}</CardTitle>
                  <CardDescription>{guide.frontmatter.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <span>{t('guides.card.from') || 'From:'} <strong>{guide.frontmatter.sourceService}</strong></span>
                    <span className="mx-2">→</span>
                    <span>{t('guides.card.to') || 'To:'} <strong>{guide.frontmatter.targetService}</strong></span>
                  </div>
                </CardContent>
                <CardFooter>
                  <Link
                    href={`/${language}/guides/${guide.category}/${guide.slug}`}
                    className=" hover:underline"
                  >
                    {t('guides.card.view_button') || 'View Migration Guide'} →
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      {/* Categories Section */}
      {guidesByCategory.map(group => (
        <section key={group.category}>
          <Container>
            <div className="flex justify-between items-center mb-8">
              <h2 className="font-bold text-2xl md:text-3xl capitalize">{group.category} {t('guides.category.title') || 'Guides'}</h2>
              <Link
                href={`/${language}/guides/${group.category}`}
                className=" hover:underline"
              >
                {t('guides.category.view_all') || 'View All'} {group.category} {t('guides.category.title') || 'Guides'} →
              </Link>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {group.guides.slice(0, 3).map(guide => (
                <Card key={`${guide.category}-${guide.slug}`} className="flex flex-col h-full hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-center mb-2">
                      <span className={`px-4 py-1 text-xs rounded-full ${getDifficultyColor(guide.frontmatter.difficulty)}`}>
                        {guide.frontmatter.difficulty.charAt(0).toUpperCase() + guide.frontmatter.difficulty.slice(1)}
                      </span>
                      <span className="text-sm text-muted-foreground">{guide.frontmatter.timeRequired}</span>
                    </div>
                    <CardTitle>{guide.frontmatter.title}</CardTitle>
                    <CardDescription>{guide.frontmatter.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <span>{t('guides.card.from') || 'From:'} <strong>{guide.frontmatter.sourceService}</strong></span>
                      <span className="mx-2">→</span>
                      <span>{t('guides.card.to') || 'To:'} <strong>{guide.frontmatter.targetService}</strong></span>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Link
                      href={`/${language}/guides/${guide.category}/${guide.slug}`}
                      className=" hover:underline"
                    >
                      {t('guides.card.view_button') || 'View Migration Guide'} →
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </Container>
        </section>
      ))}

      {/* CTA Section */}
      <section>
        <Container>
          <div className="rounded-lg border bg-card p-8 text-center shadow-sm md:p-12">
            <h2 className="font-bold text-3xl">{t('guides.cta.title') || 'Can\'t Find What You Need?'}</h2>
            <p className="mx-auto mt-4 max-w-[600px] text-muted-foreground">
              {t('guides.cta.description') || 'We\'re constantly adding new guides. If you don\'t see the migration guide you\'re looking for, consider contributing to the project or reach out to suggest new guides.'}
            </p>
            <div className="mt-6">
              <Link href={`/${language}/contribute`} className=" hover:underline">
                {t('guides.cta.button') || 'Contribute a Guide'} →
              </Link>
            </div>
          </div>
        </Container>
      </section>
    </main>
  );
}