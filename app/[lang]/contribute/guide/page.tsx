import { Metadata } from 'next';
import React from 'react';
import Link from "next/link";
import Image from "next/image";
import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { defaultLanguage } from '@/lib/i18n/config';
import { getDictionary, getNestedValue } from '@/lib/i18n/dictionaries';

export async function generateMetadata({
  params
}: {
  params: Promise<{ lang: string }>
}): Promise<Metadata> {
  // Await the params
  const { lang } = await params;
  const language = lang || defaultLanguage;
  const dict = await getDictionary(language);

  return {
    title: String(getNestedValue(dict, 'contribute.guide.meta.title')),
    description: String(getNestedValue(dict, 'contribute.guide.meta.description')),
    keywords: ['github contribution', 'open source', 'EU alternatives', 'migration guides', 'pull request', 'fork repository'],
    alternates: {
      canonical: `https://switch-to.eu/${language}/contribute/guide`,
      languages: {
        'en': 'https://switch-to.eu/en/contribute/guide',
        'nl': 'https://switch-to.eu/nl/contribute/guide',
      },
    },
  };
}

export default async function ContributeGuidePage({
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

  // Helper function to render a list of points
  const renderPoints = (path: string): React.ReactNode[] => {
    const points = getNestedValue(dict, path);
    if (Array.isArray(points)) {
      return points.map((point, index) => (
        <li key={index} className="space-y-1">{point}</li>
      ));
    }
    return [];
  };

  return (
    <div className="flex flex-col gap-8 sm:gap-12 py-6 md:py-12">
      <section>
        <Container>
          <div className="flex flex-col md:flex-row items-start gap-8">
            <div className="flex-1">
              <h1 className="text-3xl sm:text-4xl font-bold mb-6">{t('contribute.guide.hero.title')}</h1>
              <p className="text-base sm:text-lg mb-6">
                {t('contribute.guide.hero.description')}
              </p>
            </div>
            <div className="w-full max-w-[250px] h-[150px] relative flex-shrink-0">
              <Image
                src="/images/contribute.svg"
                alt="GitHub Contribution illustration"
                fill
                className="object-contain"
                priority
              />
            </div>
          </div>
        </Container>
      </section>

      <section>
        <Container>
          <div className="prose prose-slate max-w-none lg:prose-lg dark:prose-invert">
            <h2 className="text-2xl font-bold mt-8">{t('contribute.guide.repositoryOverview.title')}</h2>
            <p>
              {t('contribute.guide.repositoryOverview.description')}
            </p>

            <h2 className="text-2xl font-bold mt-8">{t('contribute.guide.whatYouCanContribute.title')}</h2>
            <ul className="space-y-1">
              {renderPoints('contribute.guide.whatYouCanContribute.points')}
            </ul>

            <h2 className="text-2xl font-bold mt-8">{t('contribute.guide.contributionProcess.title')}</h2>

            <h3 className="text-xl font-bold mt-6">{t('contribute.guide.contributionProcess.step1.title')}</h3>
            <ul className="space-y-1">
              {renderPoints('contribute.guide.contributionProcess.step1.points')}
            </ul>

            <h3 className="text-xl font-bold mt-6">{t('contribute.guide.contributionProcess.step2.title')}</h3>
            <p>{t('contribute.guide.contributionProcess.step2.description')}</p>
            <div className="bg-slate-800 rounded-md p-4 overflow-x-auto my-4">
              <pre className="text-sm text-white whitespace-pre"><code>git clone https://github.com/switch-to-eu/content.git
                cd content</code></pre>
            </div>

            <h3 className="text-xl font-bold mt-6">{t('contribute.guide.contributionProcess.step3.title')}</h3>
            <p><strong>{t('contribute.guide.contributionProcess.step3.optionA')}</strong></p>
            <ul className="space-y-1">
              {renderPoints('contribute.guide.contributionProcess.step3.optionAPoints')}
            </ul>

            <p className="mt-4"><strong>{t('contribute.guide.contributionProcess.step3.optionB')}</strong></p>
            <ul className="space-y-1">
              {renderPoints('contribute.guide.contributionProcess.step3.optionBPoints')}
            </ul>

            <h3 className="text-xl font-bold mt-6">{t('contribute.guide.contributionProcess.step4.title')}</h3>
            <p>{t('contribute.guide.contributionProcess.step4.description')}</p>
            <ul className="space-y-1">
              {renderPoints('contribute.guide.contributionProcess.step4.points')}
            </ul>

            <h3 className="text-xl font-bold mt-6">{t('contribute.guide.contributionProcess.step5.title')}</h3>
            <ul className="space-y-1">
              {renderPoints('contribute.guide.contributionProcess.step5.points')}
            </ul>

            <h2 className="text-2xl font-bold mt-8">{t('contribute.guide.contentGuidelines.title')}</h2>

            <h3 className="text-xl font-bold mt-6">{t('contribute.guide.contentGuidelines.formatting.title')}</h3>
            <ul className="space-y-1">
              {renderPoints('contribute.guide.contentGuidelines.formatting.points')}
            </ul>

            <h3 className="text-xl font-bold mt-6">{t('contribute.guide.contentGuidelines.writingStyle.title')}</h3>
            <ul className="space-y-1">
              {renderPoints('contribute.guide.contentGuidelines.writingStyle.points')}
            </ul>

            <h3 className="text-xl font-bold mt-6">{t('contribute.guide.contentGuidelines.migrationGuidesStructure.title')}</h3>
            <p>{t('contribute.guide.contentGuidelines.migrationGuidesStructure.description')}</p>
            <ul className="space-y-1">
              {renderPoints('contribute.guide.contentGuidelines.migrationGuidesStructure.points')}
            </ul>

            <h2 className="text-2xl font-bold mt-8">{t('contribute.guide.reviewProcess.title')}</h2>
            <p>{t('contribute.guide.reviewProcess.description')}</p>
            <ul className="space-y-1">
              {renderPoints('contribute.guide.reviewProcess.points')}
            </ul>

            <h2 className="text-2xl font-bold mt-8">{t('contribute.guide.questionsAndSupport.title')}</h2>
            <ul className="space-y-1">
              {renderPoints('contribute.guide.questionsAndSupport.points')}
            </ul>
          </div>
        </Container>
      </section>

      <section>
        <Container>
          <div className="bg-[#e8fff5] p-6 sm:p-10 rounded-xl text-center mt-8">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">{t('contribute.guide.callToAction.title')}</h2>
            <p className="text-base sm:text-lg max-w-[800px] mx-auto mb-6">
              {t('contribute.guide.callToAction.description')}
            </p>
            <Button variant="red" asChild className="mx-auto">
              <Link href="https://github.com/switch-to-eu/content" target="_blank" rel="noopener noreferrer">
                {t('contribute.guide.callToAction.buttonText')}
              </Link>
            </Button>
          </div>
        </Container>
      </section>
    </div>
  );
}