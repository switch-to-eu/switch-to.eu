import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/layout/container";
import { InlineSearchInput } from "@/components/InlineSearchInput";
import { Metadata } from 'next';
import { ContributeCta } from "@/components/ContributeCta";
import { CategorySection } from "@/components/CategorySection";
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

  const defaultKeywords = ['EU alternatives', 'European digital services', 'privacy', 'GDPR', 'digital migration', 'data protection', 'EU tech'];
  const title = `${String(getNestedValue(dict, 'common.title'))} - ${String(getNestedValue(dict, 'common.subtitle'))}`;
  const description = String(getNestedValue(dict, 'common.description'));

  return {
    title,
    description,
    keywords: defaultKeywords,
    alternates: {
      canonical: `https://switch-to.eu/${language}`,
      languages: {
        'en': 'https://switch-to.eu/en',
        'nl': 'https://switch-to.eu/nl',
      },
    },
    openGraph: {
      images: [
        {
          url: "/images/share.png",
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      type: "website",
      siteName: String(getNestedValue(dict, 'common.title')),
      title,
      description,
      locale: language,
    },
    twitter: {
      card: "summary_large_image",
      images: ["/images/share.png"],
      title,
      description,
    },
  };
}

export default async function Home({
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
      <section className="relative">
        <Container className="flex flex-col md:mt-6 md:mb-6 md:flex-row items-center gap-6 sm:gap-8 py-4 sm:py-6">
          <div className="flex flex-col gap-4 sm:gap-6">
            <h1 className="font-bold text-3xl sm:text-4xl md:text-5xl lg:text-6xl ">
              {t('home.heroTitle')}
            </h1>
            <p className="text-base sm:text-lg md:text-xl mt-4 sm:mt-6"
              dangerouslySetInnerHTML={{ __html: t('home.heroSubtitle') }}
            />
            <p className="text-base sm:text-lg md:text-xl max-w-[500px]"
              dangerouslySetInnerHTML={{ __html: t('home.heroDescription') }}
            />

            {/* Search CTA */}
            <div className="w-full ">
              <InlineSearchInput
                filterRegion="non-eu"
                showOnlyServices={true}
                lang={language}
              />
            </div>
            <p className="text-base sm:text-lg md:text-xl mb -2 sm:mb-3 max-w-[500px]">
              {t('home.exampleLabel')} <Link href={`/${language}/services/non-eu/whatsapp`} className="text-blue underline">WhatsApp</Link>,&nbsp;
              <Link href={`/${language}/services/non-eu/gmail`} className="text-blue underline">Gmail</Link> or&nbsp;
              <Link href={`/${language}/services/non-eu/google-drive`} className="text-blue underline">Google Drive</Link>
            </p>
          </div>

          <div className="relative w-full max-w-[300px] sm:max-w-[400px] h-[250px] sm:h-[300px] mt-4 sm:mt-0">
            <Image
              src="/images/europe.svg"
              alt="Europe map illustration"
              fill
              className="object-contain"
              priority
            />
          </div>
        </Container>
      </section>

      {/* Features Section */}
      <section>
        <Container>
          <div className="grid gap-4 sm:gap-6 md:grid-cols-3">
            <div className="bg-[var(--pop-1)] p-5 sm:p-8 rounded-xl sm:translate-y-[10px]">
              <div className="flex flex-col items-center text-center">
                <div className="mb-3 sm:mb-4">
                  <Image
                    src="/images/icon-01.svg"
                    alt="Europe map illustration"
                    width={imageSize}
                    height={imageSize}
                    priority
                  />
                </div>
                <h3 className="mb-2 font-bold text-xl">{t('home.featuresEuropeanTitle')}</h3>
                <p className="text-sm sm:text-base">
                  {t('home.featuresEuropeanDescription')}
                </p>
              </div>
            </div>
            <div className="bg-[var(--pop-2)] p-5 sm:p-8 rounded-xl sm:translate-y-[-20px]">
              <div className="flex flex-col items-center text-center">
                <div className="mb-3 sm:mb-4">
                  <Image
                    src="/images/icon-02.svg"
                    alt="Europe map illustration"
                    width={imageSize}
                    height={imageSize}
                    priority
                  />
                </div>
                <h3 className="mb-2 font-bold text-xl">{t('home.featuresGuidesTitle')}</h3>
                <p className="text-sm sm:text-base">
                  {t('home.featuresGuidesDescription')}
                </p>
              </div>
            </div>
            <div className="bg-[var(--pop-3)] p-5 sm:p-8 rounded-xl">
              <div className="flex flex-col items-center text-center">
                <div className="mb-3 sm:mb-4">
                  <Image
                    src="/images/icon-03.svg"
                    alt="Europe map illustration"
                    width={imageSize}
                    height={imageSize}
                    priority
                  />
                </div>
                <h3 className="mb-2 font-bold text-xl">{t('home.featuresCommunityTitle')}</h3>
                <p className="text-sm sm:text-base">
                  {t('home.featuresCommunityDescription')}
                </p>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Why Switch Section */}
      <section className="py-16">
        <Container>
          <h2 className="mb-6 text-center font-bold text-3xl ">{t('home.whySwitchTitle')}</h2>
          <p className="text-center text-lg max-w-[800px] mx-auto mb-4 ">
            {t('home.whySwitchDescription1')}
          </p>
          <p className="text-center text-lg max-w-[800px] mx-auto ">
            {t('home.whySwitchDescription2')}
          </p>
          <div className="mt-8 text-center">
            <Button variant="red" asChild className="mx-auto">
              <Link href={`/${language}/about`}>{t('home.knowMoreButton')}</Link>
            </Button>
          </div>
        </Container>
      </section>

      {/* Categories Section */}
      <CategorySection lang={language} />
      <div className="text-center mt-[-2em]">
        <Button asChild>
          <Link href={`/${language}/services`}>{t('home.viewAll')}</Link>
        </Button>
      </div>

      {/* CTA Section */}
      <section className="py-8 md:py-12">
        <Container>
          <ContributeCta lang={language} />
        </Container>
      </section>
    </div>
  );
}