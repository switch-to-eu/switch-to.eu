import FeedbackForm from "@/components/FeedbackForm";
import { Container } from "@switch-to-eu/blocks/components/container";
import { PageLayout } from "@switch-to-eu/blocks/components/page-layout";
import { Banner } from "@switch-to-eu/blocks/components/banner";
import { Metadata } from "next";
import { getTranslations, getLocale } from "next-intl/server";
import { generateLanguageAlternates } from "@switch-to-eu/i18n/utils";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("feedback");
  const locale = await getLocale();

  return {
    title: `${t("meta.title")} - ${t("meta.description")}`,
    description: t("meta.description"),
    alternates: generateLanguageAlternates("feedback", locale),
  };
}

export default async function FeedbackPage() {
  const t = await getTranslations("feedback");

  return (
    <PageLayout gapMobile paddingBottomMobile>
      {/* Hero Section */}
        <Container noPaddingMobile>
          <Banner
            color="bg-white border-y md:border border-black/10"
          >
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="flex-1">
                <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl text-[#1a1a1a] mb-4">
                  {t("hero.title")}
                </h1>
                <p className="text-[#1a1a1a] text-base sm:text-lg mb-3">
                  {t("hero.description1")}
                </p>
                <p className="text-[#1a1a1a] text-base sm:text-lg">
                  {t("hero.description2")}
                </p>
              </div>
            </div>
          </Banner>
        </Container>

      {/* Feedback Form Section */}
        <Container>
          <FeedbackForm />
        </Container>
    </PageLayout>
  );
}
