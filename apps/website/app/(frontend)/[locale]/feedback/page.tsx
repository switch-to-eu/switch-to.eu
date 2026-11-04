import FeedbackForm from "@/components/FeedbackForm";
import { Container } from "@switch-to-eu/blocks/components/container";
import { PageLayout } from "@switch-to-eu/blocks/components/page-layout";
import { Banner } from "@switch-to-eu/blocks/components/banner";
import type { Metadata, ResolvingMetadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "next-intl";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata(
  { params }: { params: Promise<{ locale: Locale }> },
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("feedback");

  return pageMetadata({
    parent,
    path: "feedback",
    locale,
    title: t("meta.title"),
    description: t("meta.description"),
  });
}

export default async function FeedbackPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
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
