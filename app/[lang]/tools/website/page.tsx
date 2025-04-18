"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Container } from "@/components/layout/container";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { defaultLanguage } from '@/lib/i18n/config';
import { getDictionary, getNestedValue } from '@/lib/i18n/dictionaries';
import { Metadata } from "next";

// More general type for dictionary
type Dictionary = Record<string, unknown>;

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
    title: String(getNestedValue(dict, 'tools.website.hero.title')) + " | switch-to.eu",
    description: String(getNestedValue(dict, 'tools.website.hero.description')),
    keywords: [
      "website analyzer",
      "EU compliance",
      "GDPR check",
      "data sovereignty",
      "EU service checker",
    ],
    alternates: {
      canonical: `https://switch-to.eu/${language}/tools/website`,
      languages: {
        'en': 'https://switch-to.eu/en/tools/website',
        'nl': 'https://switch-to.eu/nl/tools/website',
      },
    },
  };
}

export default function WebsiteAnalyzerPage() {
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();
  const params = useParams();
  const language = params?.lang || defaultLanguage;

  const [translations, setTranslations] = useState<Dictionary>({});

  useEffect(() => {
    async function loadTranslations() {
      const dict = await getDictionary(language as string);
      setTranslations(dict as Dictionary);
    }
    loadTranslations();
  }, [language]);

  // Helper function to get translated text
  const t = (path: string): string => {
    const value = getNestedValue(translations, path);
    return typeof value === 'string' ? value : path;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (!url.trim()) {
      setError(t('tools.website.error.empty_url'));
      return;
    }

    // Normalize URL
    let domain = url.trim();

    // Remove protocol if present
    domain = domain.replace(/^(https?:\/\/)?(www\.)?/, "");

    // Remove trailing slashes and everything after
    domain = domain.split("/")[0];

    if (!domain) {
      setError(t('tools.website.error.invalid_url'));
      return;
    }

    // Redirect to domain analysis page
    router.push(`/${language}/tools/domain/${encodeURIComponent(domain)}`);
  };

  return (
    <div className="flex flex-col gap-8 sm:gap-12 py-6 md:gap-20 md:py-12">
      {/* Hero Section */}
      <section className="relative">
        <Container className="flex flex-col items-center gap-6 sm:gap-8 py-4 sm:py-6">
          <div className="flex flex-col gap-4 sm:gap-6 text-center max-w-3xl">
            <h1 className="font-bold text-3xl sm:text-4xl md:text-5xl text-[#1a3c5a]">
              {t('tools.website.hero.title')}
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-[#334155]">
              {t('tools.website.hero.description')}
            </p>
          </div>

          {/* Website URL Input */}
          <div className="w-full max-w-2xl mt-4 sm:mt-6">
            <form
              onSubmit={handleSubmit}
              className="flex flex-col sm:flex-row gap-0"
            >
              <Input
                type="text"
                value={url}
                onChange={(e) => {
                  setUrl(e.target.value);
                  setError("");
                }}
                placeholder={t('tools.website.input.placeholder')}
                className="h-12 text-base bg-white border-2 focus-visible:border-primary sm:rounded-r-none sm:border-r-0"
              />
              <Button
                variant="default"
                size="lg"
                type="submit"
                className="sm:rounded-l-none sm:px-8"
              >
                {t('tools.website.input.button')}
              </Button>
            </form>
            {error ? (
              <p className="text-sm text-red-500 mt-2">{error}</p>
            ) : (
              <p className="text-sm text-muted-foreground mt-2">
                {t('tools.website.input.info')}
              </p>
            )}
          </div>

          {/* Results Placeholder (empty state) */}
          <div className="w-full max-w-2xl mt-8 rounded-xl border border-dashed border-gray-300 bg-gray-50 p-8 flex flex-col items-center justify-center text-center min-h-[300px]">
            <div className="relative w-20 h-20 mb-4">
              <Image
                src="/images/icon-01.svg"
                alt={t('tools.website.empty_state.image_alt')}
                fill
                className="object-contain opacity-50"
              />
            </div>
            <h3 className="text-xl font-semibold text-[#1a3c5a] mb-2">
              {t('tools.website.empty_state.title')}
            </h3>
            <p className="text-[#334155] max-w-md">
              {t('tools.website.empty_state.description')}
            </p>
          </div>
        </Container>
      </section>

      {/* How It Works Section */}
      <section className="bg-[#e9f4fd] py-12">
        <Container>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#1a3c5a] mb-8 text-center">
            {t('tools.website.how_it_works.title')}
          </h2>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-[#ff9d8a] flex items-center justify-center mb-4">
                  <span className="font-bold text-white">1</span>
                </div>
                <h3 className="mb-2 font-semibold text-lg">
                  {t('tools.website.how_it_works.step1.title')}
                </h3>
                <p className="text-[#334155] text-sm sm:text-base">
                  {t('tools.website.how_it_works.step1.description')}
                </p>
              </div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-[#ff9d8a] flex items-center justify-center mb-4">
                  <span className="font-bold text-white">2</span>
                </div>
                <h3 className="mb-2 font-semibold text-lg">
                  {t('tools.website.how_it_works.step2.title')}
                </h3>
                <p className="text-[#334155] text-sm sm:text-base">
                  {t('tools.website.how_it_works.step2.description')}
                </p>
              </div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-[#ff9d8a] flex items-center justify-center mb-4">
                  <span className="font-bold text-white">3</span>
                </div>
                <h3 className="mb-2 font-semibold text-lg">
                  {t('tools.website.how_it_works.step3.title')}
                </h3>
                <p className="text-[#334155] text-sm sm:text-base">
                  {t('tools.website.how_it_works.step3.description')}
                </p>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* FAQ Section */}
      <section>
        <Container>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#1a3c5a] mb-8 text-center">
            {t('tools.website.faq.title')}
          </h2>
          <div className="grid gap-4 sm:gap-6 max-w-3xl mx-auto">
            <div className="border rounded-lg p-5">
              <h3 className="font-semibold text-lg mb-2">
                {t('tools.website.faq.question1.title')}
              </h3>
              <p className="text-[#334155]">
                {t('tools.website.faq.question1.answer')}
              </p>
            </div>
            <div className="border rounded-lg p-5">
              <h3 className="font-semibold text-lg mb-2">
                {t('tools.website.faq.question2.title')}
              </h3>
              <p className="text-[#334155]">
                {t('tools.website.faq.question2.answer')}
              </p>
            </div>
            <div className="border rounded-lg p-5">
              <h3 className="font-semibold text-lg mb-2">
                {t('tools.website.faq.question3.title')}
              </h3>
              <p className="text-[#334155]">
                {t('tools.website.faq.question3.answer')}
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* CTA Section */}
      <section className="py-12">
        <Container>
          <div className="rounded-lg border bg-card p-8 text-center shadow-sm md:p-12 bg-[#fff9f5]">
            <h2 className="font-bold text-2xl sm:text-3xl text-[#1a3c5a]">
              {t('tools.website.cta.title')}
            </h2>
            <p className="mx-auto mt-4 max-w-[600px] text-[#334155]">
              {t('tools.website.cta.description')}
            </p>
            <Button variant="default" size="lg" className="mt-6">
              {t('tools.website.cta.button')}
            </Button>
          </div>
        </Container>
      </section>
    </div>
  );
}
