import { getEUServices } from "@/lib/content/services/services";
import { Container } from "@/components/layout/container";
import { Metadata } from 'next';
import { ContributeCta } from "@/components/ContributeCta";
import { CategorySection } from "@/components/CategorySection";
import { ServiceCard } from "@/components/ui/ServiceCard";
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

  const defaultKeywords = ['EU services', 'European alternatives', 'privacy-focused services', 'GDPR compliant', 'ethical tech'];

  return {
    title: `${String(getNestedValue(dict, 'services.title'))} | ${String(getNestedValue(dict, 'common.title'))}`,
    description: String(getNestedValue(dict, 'services.description')),
    keywords: defaultKeywords,
    alternates: {
      canonical: `https://switch-to.eu/${language}/services`,
      languages: {
        'en': 'https://switch-to.eu/en/services',
        'nl': 'https://switch-to.eu/nl/services',
      },
    },
  };
}

export default async function ServicesPage({
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

  // Get featured EU services
  const allEUServices = await getEUServices(language);
  const featuredEUServices = allEUServices
    .filter(service => service.featured === true)
    .map(service => ({
      service,
      category: service.category
    }));

  return (
    <main className="flex flex-col gap-16 py-10 md:gap-24 md:py-16">

      {/* Hero Section */}
      <section>
        <Container className="flex flex-col items-center gap-6 text-center">
          <h1 className="font-bold text-4xl md:text-5xl">{t('services.title')}</h1>
          <p className="max-w-[650px] text-lg text-muted-foreground md:text-xl">
            {t('services.description')}
          </p>
        </Container>
      </section>

      {/* Featured Alternatives */}
      {featuredEUServices.length > 0 && (
        <section>
          <Container>
            <h2 className="mb-8 text-center font-bold text-3xl">{t('services.featuredAlternatives')}</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 auto-rows-fr">
              {featuredEUServices.map((item) => (
                <ServiceCard key={item.service.name} service={item.service} lang={language} />
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* Categories Section */}
      <CategorySection lang={language} />

      {/* CTA Section */}
      <section className="py-8 md:py-12">
        <Container>
          <ContributeCta lang={language} />
        </Container>
      </section>
    </main>
  );
}