import Link from 'next/link';
import { getAllGuides, getGuideCategories } from '@/lib/content';
import { Container } from '@/components/layout/container';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Migration Guides | switch-to.eu',
  description: 'Step-by-step instructions to help you move from common services to privacy-focused EU alternatives.',
  keywords: ['migration guides', 'EU alternatives', 'data migration', 'service switching', 'step-by-step guides'],
};

export default async function GuidesPage() {
  // Load all guides
  const guides = await getAllGuides();
  const categories = await getGuideCategories();

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
          <h1 className="font-bold text-4xl md:text-5xl">Migration Guides</h1>
          <p className="max-w-[650px] text-lg text-muted-foreground md:text-xl">
            Step-by-step instructions to help you move from common services to privacy-focused EU alternatives.
          </p>
        </Container>
      </section>

      {/* Featured Guides Section */}
      <section>
        <Container>
          <h2 className="mb-8 text-center font-bold text-3xl">Popular Migration Guides</h2>
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
                    <span>From: <strong>{guide.frontmatter.sourceService}</strong></span>
                    <span className="mx-2">→</span>
                    <span>To: <strong>{guide.frontmatter.targetService}</strong></span>
                  </div>
                </CardContent>
                <CardFooter>
                  <Link
                    href={`/guides/${guide.category}/${guide.slug}`}
                    className="text-blue-600 hover:underline"
                  >
                    View Migration Guide →
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
              <h2 className="font-bold text-2xl md:text-3xl capitalize">{group.category} Guides</h2>
              <Link
                href={`/guides/${group.category}`}
                className="text-blue-600 hover:underline"
              >
                View All {group.category} Guides →
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
                      <span>From: <strong>{guide.frontmatter.sourceService}</strong></span>
                      <span className="mx-2">→</span>
                      <span>To: <strong>{guide.frontmatter.targetService}</strong></span>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Link
                      href={`/guides/${guide.category}/${guide.slug}`}
                      className="text-blue-600 hover:underline"
                    >
                      View Migration Guide →
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
            <h2 className="font-bold text-3xl">Can&apos;t Find What You Need?</h2>
            <p className="mx-auto mt-4 max-w-[600px] text-muted-foreground">
              We&apos;re constantly adding new guides. If you don&apos;t see the migration guide you&apos;re looking for,
              consider contributing to the project or reach out to suggest new guides.
            </p>
            <div className="mt-6">
              <Link href="/contribute" className="text-blue-600 hover:underline">
                Contribute a Guide →
              </Link>
            </div>
          </div>
        </Container>
      </section>
    </main>
  );
}