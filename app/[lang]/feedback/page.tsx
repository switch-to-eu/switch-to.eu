import { Metadata } from 'next';
import Image from "next/image";
import { Container } from "@/components/layout/container";
import FeedbackForm from "@/components/FeedbackForm";
import { defaultLanguage } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/dictionaries';
import { Locale } from '@/lib/i18n/dictionaries';

// Generate metadata with language alternates
export async function generateMetadata({
  params
}: {
  params: Promise<{ lang: string }>
}): Promise<Metadata> {
  // Await the params
  const { lang } = await params;
  const language = lang || defaultLanguage;
  const dict = await getDictionary(language as Locale);

  const defaultKeywords = ['feedback', 'github issues', 'bug report', 'feature request', 'switch-to.eu'];

  return {
    title: dict.feedback.meta.title,
    description: dict.feedback.meta.description,
    keywords: defaultKeywords,
    alternates: {
      canonical: `https://switch-to.eu/${language}/feedback`,
      languages: {
        'en': 'https://switch-to.eu/en/feedback',
        'nl': 'https://switch-to.eu/nl/feedback',
      },
    },
  };
}

export default async function FeedbackPage({
  params
}: {
  params: Promise<{ lang: string }>
}) {
  const { lang } = await params;
  const language = lang || defaultLanguage;
  const dict = await getDictionary(language);

  // Prepare the dictionary for the FeedbackForm
  const formDictionary = {
    title: dict.feedback.form.title,
    description: dict.feedback.form.description,
    titleLabel: dict.feedback.form.titleLabel,
    titlePlaceholder: dict.feedback.form.titlePlaceholder,
    descriptionLabel: dict.feedback.form.descriptionLabel,
    descriptionPlaceholder: dict.feedback.form.descriptionPlaceholder,
    categoryLabel: dict.feedback.form.categoryLabel,
    categoryPlaceholder: dict.feedback.form.categoryPlaceholder,
    bug: dict.feedback.form.bugCategory,
    feature: dict.feedback.form.featureCategory,
    feedback: dict.feedback.form.feedbackCategory,
    other: dict.feedback.form.otherCategory,
    contactInfoLabel: dict.feedback.form.contactInfoLabel,
    contactInfoPlaceholder: dict.feedback.form.contactInfoPlaceholder,
    submit: dict.feedback.form.submitButton,
    success: dict.feedback.form.successMessage,
    error: dict.feedback.form.errorMessage
  };

  return (
    <div className="flex flex-col gap-8 sm:gap-12 py-6 md:gap-20 md:py-12">
      {/* Hero Section */}
      <section>
        <Container>
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1">
              <h1 className="text-3xl sm:text-4xl font-bold mb-6">{dict.feedback.hero.title}</h1>
              <p className="text-base sm:text-lg mb-6">
                {dict.feedback.hero.description1}
              </p>
              <p className="text-base sm:text-lg mb-6">
                {dict.feedback.hero.description2}
              </p>
            </div>
            <div className="w-full max-w-[300px] h-[200px] relative flex-shrink-0">
              <Image
                src="/images/contribute.svg"
                alt={dict.feedback.hero.imageAlt || "Feedback illustration"}
                fill
                className="object-contain"
                priority
              />
            </div>
          </div>
        </Container>
      </section>

      {/* Feedback Form Section */}
      <section>
        <Container>
          <FeedbackForm dictionary={formDictionary} />
        </Container>
      </section>
    </div>
  );
}