import { Container } from "@/components/layout/container";
import { Metadata } from 'next';
import { defaultLanguage } from '@/lib/i18n/config';
import { getDictionary, getNestedValue, Locale } from '@/lib/i18n/dictionaries';
import { getMarkdownContent } from "@/lib/markdown";

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

  return {
    title: `CMS Content - ${String(getNestedValue(dict, 'common.title'))}`,
    description: String(getNestedValue(dict, 'common.description')),
    alternates: {
      canonical: `https://switch-to.eu/${language}/cms`,
      languages: {
        'en': 'https://switch-to.eu/en/cms',
        'nl': 'https://switch-to.eu/nl/cms',
      },
    },
  };
}

export default async function CMSPage({
  params
}: {
  params: Promise<{ lang: string }>
}) {
  // Await the params
  const { lang } = await params;
  const language = (lang || defaultLanguage) as Locale;

  // Load CMS content
  const content = await getMarkdownContent(language, 'home.md');

  if (!content) {
    return (
      <Container className="py-10">
        <h1 className="text-3xl font-bold mb-6">CMS Content</h1>
        <div className="prose max-w-none">
          <p>No content found. Please make sure you&apos;ve created the content file.</p>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-10">
      <h1 className="text-3xl font-bold mb-6">{content.data.title as string}</h1>
      <div
        className="prose max-w-none"
        dangerouslySetInnerHTML={{ __html: content.contentHtml }}
      />
    </Container>
  );
}