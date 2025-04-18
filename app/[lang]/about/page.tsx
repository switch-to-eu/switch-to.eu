import { Metadata } from 'next';
import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/layout/container";
import { Button } from '@/components/ui/button';
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

  const defaultKeywords = ['about switch-to.eu', 'digital sovereignty', 'EU alternatives', 'community platform', 'data privacy'];

  return {
    title: String(getNestedValue(dict, 'about.title')),
    description: String(getNestedValue(dict, 'about.description')),
    keywords: defaultKeywords,
    alternates: {
      canonical: `https://switch-to.eu/${language}/about`,
      languages: {
        'en': 'https://switch-to.eu/en/about',
        'nl': 'https://switch-to.eu/nl/about',
      },
    },
  };
}

export default async function AboutPage({
  params
}: {
  params: Promise<{ lang: string }>
}) {
  // Await the params
  const { lang } = await params;
  const language = lang || defaultLanguage;
  const dict = await getDictionary(language);
  const imageSize = 120;

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
              <h1 className="text-3xl sm:text-4xl font-bold mb-6">{t('about.heroTitle')}</h1>
              <p className="text-base sm:text-lg mb-6">
                {t('about.heroDescription1')}
              </p>
              <p className="text-base sm:text-lg mb-6">
                {t('about.heroDescription2')}
              </p>
            </div>
            <div className="w-full max-w-[300px] h-[200px] relative flex-shrink-0">
              <Image
                src="/images/europe.svg"
                alt="Europe map illustration"
                fill
                className="object-contain"
                priority
              />
            </div>
          </div>
        </Container>
      </section>

      {/* Three Pillars Section */}
      <section>
        <Container>
          <h2 className="mb-8 text-center font-bold text-3xl">{t('about.pillarsTitle')}</h2>
          <div className="grid gap-4 sm:gap-6 md:grid-cols-3">
            <div className="bg-[var(--pop-1)] p-5 sm:p-8 rounded-xl sm:translate-y-[10px]">
              <div className="flex flex-col items-center text-center">
                <div className="mb-3 sm:mb-4">
                  <Image
                    src="/images/icon-01.svg"
                    alt="European Alternatives icon"
                    width={imageSize}
                    height={imageSize}
                    priority
                  />
                </div>
                <h3 className="mb-2 font-bold text-xl">{t('about.pillars.pillar1.title')}</h3>
                <p className="text-sm sm:text-base">
                  {t('about.pillars.pillar1.description')}
                </p>
              </div>
            </div>
            <div className="bg-[var(--pop-2)] p-5 sm:p-8 rounded-xl sm:translate-y-[-20px]">
              <div className="flex flex-col items-center text-center">
                <div className="mb-3 sm:mb-4">
                  <Image
                    src="/images/icon-02.svg"
                    alt="Step-by-step Guides icon"
                    width={imageSize}
                    height={imageSize}
                    priority
                  />
                </div>
                <h3 className="mb-2 font-bold text-xl">{t('about.pillars.pillar2.title')}</h3>
                <p className="text-sm sm:text-base">
                  {t('about.pillars.pillar2.description')}
                </p>
              </div>
            </div>
            <div className="bg-[var(--pop-3)] p-5 sm:p-8 rounded-xl">
              <div className="flex flex-col items-center text-center">
                <div className="mb-3 sm:mb-4">
                  <Image
                    src="/images/icon-03.svg"
                    alt="Community Driven icon"
                    width={imageSize}
                    height={imageSize}
                    priority
                  />
                </div>
                <h3 className="mb-2 font-bold text-xl">{t('about.pillars.pillar3.title')}</h3>
                <p className="text-sm sm:text-base">
                  {t('about.pillars.pillar3.description')}
                </p>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Why Choose EU Services Section */}
      <section>
        <Container>
          <h2 className="mb-8 text-center font-bold text-3xl">{t('about.whyChooseTitle')}</h2>
          <p className="text-center mb-6">{t('about.whyChooseDescription')}</p>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
            <div className="bg-[var(--pop-4)] p-5 rounded-xl">
              <h3 className="mb-3 font-bold text-xl text-center">{t('about.whyChoosePoints.point1.title')}</h3>
              <p className="text-sm sm:text-base">
                {t('about.whyChoosePoints.point1.description')}
              </p>
            </div>

            <div className="bg-[var(--pop-1)] p-5 rounded-xl">
              <h3 className="mb-3 font-bold text-xl text-center">{t('about.whyChoosePoints.point2.title')}</h3>
              <p className="text-sm sm:text-base">
                {t('about.whyChoosePoints.point2.description')}
              </p>
            </div>

            <div className="bg-[var(--pop-2)] p-5 rounded-xl">
              <h3 className="mb-3 font-bold text-xl text-center">{t('about.whyChoosePoints.point3.title')}</h3>
              <p className="text-sm sm:text-base">
                {t('about.whyChoosePoints.point3.description')}
              </p>
            </div>

            <div className="bg-[var(--pop-3)] p-5 rounded-xl">
              <h3 className="mb-3 font-bold text-xl text-center">{t('about.whyChoosePoints.point4.title')}</h3>
              <p className="text-sm sm:text-base">
                {t('about.whyChoosePoints.point4.description')}
              </p>
            </div>
          </div>
        </Container>
      </section>


      {/* Join Our Mission Section */}
      <section className="py-8">
        <Container>
          <div className="text-center max-w-[800px] mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold mb-6">{t('about.contributionTitle')}</h2>
            <p className="text-base sm:text-lg mb-4">
              {t('about.contributionDescription')}
            </p>
            <ul className="list-disc text-left pl-8 mb-6">
              <li className="mb-2">{t('about.contributionPoints.point1.description')}</li>
              <li className="mb-2">{t('about.contributionPoints.point2.description')}</li>
              <li className="mb-2">{t('about.contributionPoints.point3.description')}</li>
              <li className="mb-2">{t('about.contributionPoints.point4.description')}</li>
            </ul>
          </div>
        </Container>
      </section>

      {/* How You Can Contribute Section - Removing this section as it's redundant with the improved Join Mission section */}
      <section className="">
        <Container>
          <div className="flex justify-center mt-6">
            <Button variant="red" className="font-medium">
              <Link href="/contribute">
                {t('contribute.buttonText')}
              </Link>
            </Button>
          </div>
        </Container>
      </section>

    </div>
  );
}