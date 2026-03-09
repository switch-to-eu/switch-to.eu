import FeedbackForm from "@/components/FeedbackForm";
import { Container } from "@switch-to-eu/blocks/components/container";
import { PageLayout } from "@switch-to-eu/blocks/components/page-layout";
import { Banner } from "@switch-to-eu/blocks/components/banner";
import { DecorativeShape } from "@switch-to-eu/blocks/components/decorative-shape";
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
            color="bg-brand-pink"
            shapes={[
              { shape: "spark", className: "-top-6 -right-6 w-36 h-36 sm:w-48 sm:h-48", duration: "7s" },
              { shape: "blob", className: "-bottom-8 -left-8 w-32 h-32 sm:w-44 sm:h-44", opacity: 0.1, duration: "9s", delay: "1.5s" },
            ]}
          >
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="flex-1">
                <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl uppercase text-white mb-4">
                  {t("hero.title")}
                </h1>
                <p className="text-white/90 text-base sm:text-lg mb-3">
                  {t("hero.description1")}
                </p>
                <p className="text-white/80 text-base sm:text-lg">
                  {t("hero.description2")}
                </p>
              </div>
              <div className="w-full max-w-[240px] h-[180px] relative flex-shrink-0">
                <DecorativeShape
                  shape="speech"
                  className="inset-0"
                  opacity={0.35}
                  duration="7s"
                />
                <DecorativeShape
                  shape="spark"
                  className="inset-8"
                  opacity={0.5}
                  duration="6s"
                  delay="-2s"
                />
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
