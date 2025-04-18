import { Metadata } from 'next';
import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/layout/container";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { defaultLanguage } from '@/lib/i18n/config';
import { getDictionary, getNestedValue } from '@/lib/i18n/dictionaries';

// Generate metadata with language alternates
export async function generateMetadata({
  params
}: {
  params: Promise<{ lang: string }>
}): Promise<Metadata> {
  // Get the language
  const { lang } = await params;
  const dict = await getDictionary(lang);

  return {
    title: String(getNestedValue(dict, 'contribute.meta.title')),
    description: String(getNestedValue(dict, 'contribute.meta.description')),
    keywords: ['contribute', 'open source', 'EU alternatives', 'migration guides', 'community collaboration'],
    alternates: {
      canonical: `https://switch-to.eu/${lang}/contribute`,
      languages: {
        'en': 'https://switch-to.eu/en/contribute',
        'nl': 'https://switch-to.eu/nl/contribute',
      },
    },
  };
}

export default async function ContributePage({
  params
}: {
  params: Promise<{ lang: string }>
}) {
  // Get the language
  const { lang } = await params;
  const language = lang || defaultLanguage;
  const dict = await getDictionary(language);

  // Helper function to get translated text that ensures return value is a string
  const t = (path: string): string => {
    const value = getNestedValue(dict, path);
    return typeof value === 'string' ? value : path;
  };

  return (
    <div className="flex flex-col gap-8 sm:gap-12 py-6 md:gap-20 md:py-12">
      {/* Hero Section */}
      <section>
        <Container>
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1">
              <h1 className="text-3xl sm:text-4xl font-bold mb-6">{t('contribute.hero.title')}</h1>
              <p className="text-base sm:text-lg mb-6">
                {t('contribute.hero.description')}
              </p>
            </div>
            <div className="w-full max-w-[300px] h-[200px] relative flex-shrink-0">
              <Image
                src="/images/contribute.svg"
                alt="Contribution illustration"
                fill
                className="object-contain"
                priority
              />
            </div>
          </div>
        </Container>
      </section>

      {/* Contribution Cards Section */}
      <section>
        <Container>
          <h2 className="text-2xl sm:text-3xl font-bold mb-8 text-center">{t('contribute.helpSection.title')}</h2>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <div className="mb-4 flex justify-center">
                  <div className="bg-[var(--pop-1)] rounded-full p-4">
                    <Image
                      src="/images/icon-01.svg"
                      alt={t('contribute.cards.migration.title')}
                      width={60}
                      height={60}
                    />
                  </div>
                </div>
                <CardTitle className="text-xl text-center">{t('contribute.cards.migration.title')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-center">
                  {t('contribute.cards.migration.description')}
                </p>
              </CardContent>
              <CardFooter className="justify-center">
                <Link href="/contribute/guide" className="text-blue hover:underline">
                  {t('contribute.cards.migration.cta')} →
                </Link>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <div className="mb-4 flex justify-center">
                  <div className="bg-[var(--pop-2)] rounded-full p-4">
                    <Image
                      src="/images/icon-02.svg"
                      alt={t('contribute.cards.tester.title')}
                      width={60}
                      height={60}
                    />
                  </div>
                </div>
                <CardTitle className="text-xl text-center">{t('contribute.cards.tester.title')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-center">
                  {t('contribute.cards.tester.description')}
                </p>
              </CardContent>
              <CardFooter className="justify-center">
                <Link href="https://github.com/switch-to-eu/content/issues/new" target="_blank" className="text-blue hover:underline">
                  {t('contribute.cards.tester.cta')} →
                </Link>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <div className="mb-4 flex justify-center">
                  <div className="bg-[var(--pop-3)] rounded-full p-4">
                    <Image
                      src="/images/icon-03.svg"
                      alt={t('contribute.cards.discover.title')}
                      width={60}
                      height={60}
                    />
                  </div>
                </div>
                <CardTitle className="text-xl text-center">{t('contribute.cards.discover.title')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-center">
                  {t('contribute.cards.discover.description')}
                </p>
              </CardContent>
              <CardFooter className="justify-center">
                <Link href="https://github.com/switch-to-eu/content/issues/new" target="_blank" className="text-blue hover:underline">
                  {t('contribute.cards.discover.cta')} →
                </Link>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <div className="mb-4 flex justify-center">
                  <div className="bg-[var(--pop-4)] rounded-full p-4">
                    <Image
                      src="/images/icon-01.svg"
                      alt={t('contribute.cards.technical.title')}
                      width={60}
                      height={60}
                    />
                  </div>
                </div>
                <CardTitle className="text-xl text-center">{t('contribute.cards.technical.title')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-center">
                  {t('contribute.cards.technical.description')}
                </p>
              </CardContent>
              <CardFooter className="justify-center">
                <Link href="https://github.com/switch-to-eu/switch-to.eu/" target="_blank" rel="noopener noreferrer" className="text-blue hover:underline">
                  {t('contribute.cards.technical.cta')} →
                </Link>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <div className="mb-4 flex justify-center">
                  <div className="bg-[var(--pop-1)] rounded-full p-4">
                    <Image
                      src="/images/icon-02.svg"
                      alt={t('contribute.cards.ideas.title')}
                      width={60}
                      height={60}
                    />
                  </div>
                </div>
                <CardTitle className="text-xl text-center">{t('contribute.cards.ideas.title')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-center">
                  {t('contribute.cards.ideas.description')}
                </p>
              </CardContent>
              <CardFooter className="justify-center">
                <Link href="https://github.com/switch-to-eu/switch-to.eu/issues/new" target="_blank" rel="noopener noreferrer" className="text-blue hover:underline">
                  {t('contribute.cards.ideas.cta')} →
                </Link>
              </CardFooter>
            </Card>
          </div>
        </Container>
      </section>

      {/* Why Your Contribution Matters Section */}
      <section>
        <Container>
          <div className="bg-[#e8fff5] p-6 sm:p-10 rounded-xl text-center">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">{t('contribute.whyMatters.title')}</h2>
            <p className="text-base sm:text-lg max-w-[800px] mx-auto mb-6">
              {t('contribute.whyMatters.description')}
            </p>
          </div>
        </Container>
      </section>
    </div>
  );
}