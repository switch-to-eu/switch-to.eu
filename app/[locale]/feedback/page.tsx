import Image from "next/image";
import { Container } from "@/components/layout/container";
import FeedbackForm from "@/components/FeedbackForm";
import { getTranslations } from 'next-intl/server';

// Generate metadata with language alternates
export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>
}) {
  const t = await getTranslations("feedback");
  // Await the params
  const { locale } = await params;

  const title = `${t("meta.title")} - ${t("meta.description")}`;
  const description = t("meta.description");

  const defaultKeywords = ['feedback', 'github issues', 'bug report', 'feature request', 'switch-to.eu'];

  return {
    title,
    description,
    keywords: defaultKeywords,
    alternates: {
      canonical: `https://switch-to.eu/${locale}/feedback`,
      languages: {
        'en': 'https://switch-to.eu/en/feedback',
        'nl': 'https://switch-to.eu/nl/feedback',
      },
    },
  };
}

export default async function FeedbackPage({ }: {
  params: Promise<{ locale: string }>
}) {
  const t = await getTranslations("feedback");

  // Prepare the dictionary for the FeedbackForm
  const formDictionary = {
    title: t('form.title'),
    description: t('form.description'),
    titleLabel: t('form.titleLabel'),
    titlePlaceholder: t('form.titlePlaceholder'),
    descriptionLabel: t('form.descriptionLabel'),
    descriptionPlaceholder: t('form.descriptionPlaceholder'),
    categoryLabel: t('form.categoryLabel'),
    categoryPlaceholder: t('form.categoryPlaceholder'),
    bug: t('form.bugCategory'),
    feature: t('form.featureCategory'),
    feedback: t('form.feedbackCategory'),
    other: t('form.otherCategory'),
    contactInfoLabel: t('form.contactInfoLabel'),
    contactInfoPlaceholder: t('form.contactInfoPlaceholder'),
    submit: t('form.submitButton'),
    submitting: t('form.submitting'),
    success: t('form.successMessage'),
    error: t('form.errorMessage'),
    viewIssue: t('form.viewIssue'),
    validation: {
      titleMinLength: t('form.validation.titleMinLength'),
      titleNoHtml: t('form.validation.titleNoHtml'),
      descriptionMinLength: t('form.validation.descriptionMinLength'),
      descriptionNoHtml: t('form.validation.descriptionNoHtml'),
      categoryRequired: t('form.validation.categoryRequired'),
      invalidEmail: t('form.validation.invalidEmail')
    }
  };

  return (
    <div className="flex flex-col gap-8 sm:gap-12 py-6 md:gap-20 md:py-12">
      {/* Hero Section */}
      <section>
        <Container>
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1">
              <h1 className="text-3xl sm:text-4xl font-bold mb-6">{t('hero.title')}</h1>
              <p className="text-base sm:text-lg mb-6">
                {t('hero.description1')}
              </p>
              <p className="text-base sm:text-lg mb-6">
                {t('hero.description2')}
              </p>
            </div>
            <div className="w-full max-w-[300px] h-[200px] relative flex-shrink-0">
              <Image
                src="/images/contribute.svg"
                alt={t('hero.imageAlt') || "Feedback illustration"}
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