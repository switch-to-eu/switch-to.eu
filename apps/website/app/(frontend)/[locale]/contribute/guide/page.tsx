import React from "react";
import { Container } from "@switch-to-eu/blocks/components/container";
import { PageLayout } from "@switch-to-eu/blocks/components/page-layout";
import { Button } from "@switch-to-eu/ui/components/button";
import { getTranslations, getLocale } from "next-intl/server";
import { Link } from "@switch-to-eu/i18n/navigation";
import { generateLanguageAlternates } from "@switch-to-eu/i18n/utils";
import { Metadata } from "next";
import { Banner } from "@switch-to-eu/blocks/components/banner";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("contribute");
  const locale = await getLocale();

  return {
    title: t("title"),
    description: t("description"),
    alternates: generateLanguageAlternates("contribute/guide", locale),
  };
}

export default async function ContributeGuidePage() {
  const t = await getTranslations("contribute");

  const getKnownPoints = (path: string): React.ReactNode => {
    if (path === "guide.whatYouCanContribute.points") {
      return (
        <ul className="space-y-2">
          <li>{t("guide.whatYouCanContribute.points.0")}</li>
          <li>{t("guide.whatYouCanContribute.points.1")}</li>
          <li>{t("guide.whatYouCanContribute.points.2")}</li>
          <li>{t("guide.whatYouCanContribute.points.3")}</li>
        </ul>
      );
    } else if (path === "guide.contributionProcess.step1.points") {
      return (
        <ul className="space-y-2">
          <li>{t("guide.contributionProcess.step1.points.0")}</li>
          <li>{t("guide.contributionProcess.step1.points.1")}</li>
          <li>{t("guide.contributionProcess.step1.points.2")}</li>
        </ul>
      );
    } else if (path === "guide.contributionProcess.step3.optionAPoints") {
      return (
        <ul className="space-y-2">
          <li>{t("guide.contributionProcess.step3.optionAPoints.0")}</li>
          <li>{t("guide.contributionProcess.step3.optionAPoints.1")}</li>
          <li>{t("guide.contributionProcess.step3.optionAPoints.2")}</li>
        </ul>
      );
    } else if (path === "guide.contributionProcess.step3.optionBPoints") {
      return (
        <ul className="space-y-2">
          <li>{t("guide.contributionProcess.step3.optionBPoints.0")}</li>
          <li>{t("guide.contributionProcess.step3.optionBPoints.1")}</li>
          <li>{t("guide.contributionProcess.step3.optionBPoints.2")}</li>
        </ul>
      );
    } else if (path === "guide.contributionProcess.step4.points") {
      return (
        <ul className="space-y-2">
          <li>{t("guide.contributionProcess.step4.points.0")}</li>
          <li>{t("guide.contributionProcess.step4.points.1")}</li>
          <li>{t("guide.contributionProcess.step4.points.2")}</li>
        </ul>
      );
    } else if (path === "guide.contributionProcess.step5.points") {
      return (
        <ul className="space-y-2">
          <li>{t("guide.contributionProcess.step5.points.0")}</li>
          <li>{t("guide.contributionProcess.step5.points.1")}</li>
          <li>{t("guide.contributionProcess.step5.points.2")}</li>
          <li>{t("guide.contributionProcess.step5.points.3")}</li>
        </ul>
      );
    } else if (path === "guide.contentGuidelines.formatting.points") {
      return (
        <ul className="space-y-2">
          <li>{t("guide.contentGuidelines.formatting.points.0")}</li>
          <li>{t("guide.contentGuidelines.formatting.points.1")}</li>
          <li>{t("guide.contentGuidelines.formatting.points.2")}</li>
          <li>{t("guide.contentGuidelines.formatting.points.3")}</li>
        </ul>
      );
    } else if (path === "guide.contentGuidelines.writingStyle.points") {
      return (
        <ul className="space-y-2">
          <li>{t("guide.contentGuidelines.writingStyle.points.0")}</li>
          <li>{t("guide.contentGuidelines.writingStyle.points.1")}</li>
          <li>{t("guide.contentGuidelines.writingStyle.points.2")}</li>
          <li>{t("guide.contentGuidelines.writingStyle.points.3")}</li>
          <li>{t("guide.contentGuidelines.writingStyle.points.4")}</li>
        </ul>
      );
    } else if (
      path === "guide.contentGuidelines.migrationGuidesStructure.points"
    ) {
      return (
        <ul className="space-y-2">
          <li>
            {t("guide.contentGuidelines.migrationGuidesStructure.points.0")}
          </li>
          <li>
            {t("guide.contentGuidelines.migrationGuidesStructure.points.1")}
          </li>
          <li>
            {t("guide.contentGuidelines.migrationGuidesStructure.points.2")}
          </li>
          <li>
            {t("guide.contentGuidelines.migrationGuidesStructure.points.3")}
          </li>
          <li>
            {t("guide.contentGuidelines.migrationGuidesStructure.points.4")}
          </li>
        </ul>
      );
    } else if (path === "guide.reviewProcess.points") {
      return (
        <ul className="space-y-2">
          <li>{t("guide.reviewProcess.points.0")}</li>
          <li>{t("guide.reviewProcess.points.1")}</li>
          <li>{t("guide.reviewProcess.points.2")}</li>
        </ul>
      );
    } else if (path === "guide.questionsAndSupport.points") {
      return (
        <ul className="space-y-2">
          <li>{t("guide.questionsAndSupport.points.0")}</li>
          <li>{t("guide.questionsAndSupport.points.1")}</li>
        </ul>
      );
    }

    return <ul></ul>;
  };

  return (
    <PageLayout paddingTopMobile paddingBottomMobile>
      {/* Hero Section */}
      <section>
        <Container>
          <Banner
            color="bg-white border-y md:border border-black/10"
          >
            <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
              <div className="flex-1">
                <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl text-brand-green mb-6">
                  {t("guide.hero.title")}
                </h1>
                <p className="text-[#1a1a1a] text-base sm:text-lg">
                  {t("guide.hero.description")}
                </p>
              </div>
            </div>
          </Banner>
        </Container>
      </section>

      {/* Guide Content */}
      <section>
        <Container>
          <div className="prose prose-slate max-w-3xl mx-auto lg:prose-lg">
            <h2 className="font-heading text-3xl text-brand-green mt-0">
              {t("guide.repositoryOverview.title")}
            </h2>
            <p>{t("guide.repositoryOverview.description")}</p>

            <h2 className="font-heading text-3xl text-brand-green">
              {t("guide.whatYouCanContribute.title")}
            </h2>
            {getKnownPoints("guide.whatYouCanContribute.points")}

            <h2 className="font-heading text-3xl text-brand-green">
              {t("guide.contributionProcess.title")}
            </h2>

            <h3 className="font-heading text-2xl text-brand-green">
              {t("guide.contributionProcess.step1.title")}
            </h3>
            {getKnownPoints("guide.contributionProcess.step1.points")}

            <h3 className="font-heading text-2xl text-brand-green">
              {t("guide.contributionProcess.step2.title")}
            </h3>
            <p>{t("guide.contributionProcess.step2.description")}</p>
            <div className="bg-brand-navy rounded-2xl p-4 overflow-x-auto my-4">
              <pre className="text-sm text-brand-sky whitespace-pre">
                <code>
                  git clone https://github.com/switch-to-eu/content.git cd
                  content
                </code>
              </pre>
            </div>

            <h3 className="font-heading text-2xl text-brand-green">
              {t("guide.contributionProcess.step3.title")}
            </h3>
            <p>
              <strong>{t("guide.contributionProcess.step3.optionA")}</strong>
            </p>
            {getKnownPoints("guide.contributionProcess.step3.optionAPoints")}

            <p className="mt-4">
              <strong>{t("guide.contributionProcess.step3.optionB")}</strong>
            </p>
            {getKnownPoints("guide.contributionProcess.step3.optionBPoints")}

            <h3 className="font-heading text-2xl text-brand-green">
              {t("guide.contributionProcess.step4.title")}
            </h3>
            <p>{t("guide.contributionProcess.step4.description")}</p>
            {getKnownPoints("guide.contributionProcess.step4.points")}

            <h3 className="font-heading text-2xl text-brand-green">
              {t("guide.contributionProcess.step5.title")}
            </h3>
            {getKnownPoints("guide.contributionProcess.step5.points")}

            <h2 className="font-heading text-3xl text-brand-green">
              {t("guide.contentGuidelines.title")}
            </h2>

            <h3 className="font-heading text-2xl text-brand-green">
              {t("guide.contentGuidelines.formatting.title")}
            </h3>
            {getKnownPoints("guide.contentGuidelines.formatting.points")}

            <h3 className="font-heading text-2xl text-brand-green">
              {t("guide.contentGuidelines.writingStyle.title")}
            </h3>
            {getKnownPoints("guide.contentGuidelines.writingStyle.points")}

            <h3 className="font-heading text-2xl text-brand-green">
              {t("guide.contentGuidelines.migrationGuidesStructure.title")}
            </h3>
            <p>
              {t(
                "guide.contentGuidelines.migrationGuidesStructure.description"
              )}
            </p>
            {getKnownPoints(
              "guide.contentGuidelines.migrationGuidesStructure.points"
            )}

            <h2 className="font-heading text-3xl text-brand-green">
              {t("guide.reviewProcess.title")}
            </h2>
            <p>{t("guide.reviewProcess.description")}</p>
            {getKnownPoints("guide.reviewProcess.points")}

            <h2 className="font-heading text-3xl text-brand-green">
              {t("guide.questionsAndSupport.title")}
            </h2>
            {getKnownPoints("guide.questionsAndSupport.points")}
          </div>
        </Container>
      </section>

      {/* CTA Section */}
      <section>
        <Container>
          <Banner
            color="bg-white border-y md:border border-black/10"
            contentClassName="text-center max-w-2xl mx-auto"
          >
            <h2 className="font-heading text-3xl sm:text-4xl text-brand-green mb-4 sm:mb-6">
              {t("guide.callToAction.title")}
            </h2>
            <p className="text-[#1a1a1a] text-base sm:text-lg mb-8">
              {t("guide.callToAction.description")}
            </p>
            <Button
              variant="red"
              asChild
              className="bg-brand-green text-white hover:bg-brand-green/90 rounded-full px-8 py-3 font-semibold"
            >
              <Link
                href="https://github.com/switch-to-eu/content"
                target="_blank"
                rel="noopener noreferrer"
              >
                {t("guide.callToAction.buttonText")}
              </Link>
            </Button>
          </Banner>
        </Container>
      </section>
    </PageLayout>
  );
}
