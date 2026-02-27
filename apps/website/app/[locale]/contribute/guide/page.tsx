import React from "react";
import Image from "next/image";
import { Container } from "@/components/layout/container";
import { Button } from "@switch-to-eu/ui/components/button";
import { getTranslations, getLocale } from "next-intl/server";
import { Link } from "@switch-to-eu/i18n/navigation";
import { generateLanguageAlternates } from "@switch-to-eu/i18n/utils";
import { Metadata } from "next";

const FILTER_WHITE = "brightness(0) invert(1)";
const FILTER_BRAND_GREEN =
  "brightness(0) saturate(100%) invert(20%) sepia(95%) saturate(750%) hue-rotate(127deg) brightness(93%) contrast(102%)";

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
    <div className="flex flex-col gap-8 sm:gap-12 md:gap-20 py-4 sm:py-6 md:py-8">
      {/* Hero Section */}
      <section>
        <div className="container max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="bg-brand-green rounded-3xl">
            <div className="relative px-6 sm:px-10 md:px-16 py-12 sm:py-16 md:py-20 overflow-hidden">
              <div className="absolute -top-8 -right-8 w-36 h-36 sm:w-48 sm:h-48 opacity-15 pointer-events-none">
                <Image
                  src="/images/shapes/cloud.svg"
                  alt=""
                  fill
                  className="object-contain select-none animate-shape-float"
                  style={{ filter: FILTER_WHITE }}
                  aria-hidden="true"
                  unoptimized
                />
              </div>
              <div className="absolute -bottom-10 -left-10 w-40 h-40 sm:w-52 sm:h-52 opacity-10 pointer-events-none">
                <Image
                  src="/images/shapes/star.svg"
                  alt=""
                  fill
                  className="object-contain select-none animate-shape-float"
                  style={{ filter: FILTER_WHITE, animationDelay: "-3s" }}
                  aria-hidden="true"
                  unoptimized
                />
              </div>

              <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 md:gap-12">
                <div className="flex-1">
                  <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl uppercase text-brand-yellow mb-6">
                    {t("guide.hero.title")}
                  </h1>
                  <p className="text-white/90 text-base sm:text-lg">
                    {t("guide.hero.description")}
                  </p>
                </div>
                <div className="w-40 h-40 sm:w-56 sm:h-56 relative flex-shrink-0">
                  <div className="absolute inset-0">
                    <Image
                      src="/images/shapes/cross.svg"
                      alt=""
                      fill
                      className="object-contain select-none animate-shape-float"
                      style={{ filter: FILTER_WHITE, opacity: 0.3, animationDuration: "7s" }}
                      aria-hidden="true"
                      unoptimized
                    />
                  </div>
                  <div className="absolute inset-8">
                    <Image
                      src="/images/shapes/diamond-4.svg"
                      alt=""
                      fill
                      className="object-contain select-none animate-shape-float"
                      style={{ filter: FILTER_WHITE, opacity: 0.5, animationDuration: "6s", animationDelay: "-2s" }}
                      aria-hidden="true"
                      unoptimized
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Guide Content */}
      <section>
        <Container>
          <div className="prose prose-slate max-w-3xl mx-auto lg:prose-lg dark:prose-invert">
            <h2 className="font-heading text-3xl sm:text-4xl uppercase text-brand-green mt-0">
              {t("guide.repositoryOverview.title")}
            </h2>
            <p>{t("guide.repositoryOverview.description")}</p>

            <h2 className="font-heading text-3xl sm:text-4xl uppercase text-brand-green">
              {t("guide.whatYouCanContribute.title")}
            </h2>
            {getKnownPoints("guide.whatYouCanContribute.points")}

            <h2 className="font-heading text-3xl sm:text-4xl uppercase text-brand-green">
              {t("guide.contributionProcess.title")}
            </h2>

            <h3 className="font-heading text-2xl uppercase text-brand-green">
              {t("guide.contributionProcess.step1.title")}
            </h3>
            {getKnownPoints("guide.contributionProcess.step1.points")}

            <h3 className="font-heading text-2xl uppercase text-brand-green">
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

            <h3 className="font-heading text-2xl uppercase text-brand-green">
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

            <h3 className="font-heading text-2xl uppercase text-brand-green">
              {t("guide.contributionProcess.step4.title")}
            </h3>
            <p>{t("guide.contributionProcess.step4.description")}</p>
            {getKnownPoints("guide.contributionProcess.step4.points")}

            <h3 className="font-heading text-2xl uppercase text-brand-green">
              {t("guide.contributionProcess.step5.title")}
            </h3>
            {getKnownPoints("guide.contributionProcess.step5.points")}

            <h2 className="font-heading text-3xl sm:text-4xl uppercase text-brand-green">
              {t("guide.contentGuidelines.title")}
            </h2>

            <h3 className="font-heading text-2xl uppercase text-brand-green">
              {t("guide.contentGuidelines.formatting.title")}
            </h3>
            {getKnownPoints("guide.contentGuidelines.formatting.points")}

            <h3 className="font-heading text-2xl uppercase text-brand-green">
              {t("guide.contentGuidelines.writingStyle.title")}
            </h3>
            {getKnownPoints("guide.contentGuidelines.writingStyle.points")}

            <h3 className="font-heading text-2xl uppercase text-brand-green">
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

            <h2 className="font-heading text-3xl sm:text-4xl uppercase text-brand-green">
              {t("guide.reviewProcess.title")}
            </h2>
            <p>{t("guide.reviewProcess.description")}</p>
            {getKnownPoints("guide.reviewProcess.points")}

            <h2 className="font-heading text-3xl sm:text-4xl uppercase text-brand-green">
              {t("guide.questionsAndSupport.title")}
            </h2>
            {getKnownPoints("guide.questionsAndSupport.points")}
          </div>
        </Container>
      </section>

      {/* CTA Section */}
      <section>
        <div className="container max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="bg-brand-navy rounded-3xl">
            <div className="relative px-6 sm:px-10 md:px-16 py-12 sm:py-16 md:py-20 overflow-hidden">
              <div className="absolute -top-6 -right-6 w-32 h-32 sm:w-44 sm:h-44 opacity-15 pointer-events-none">
                <Image
                  src="/images/shapes/starburst.svg"
                  alt=""
                  fill
                  className="object-contain select-none animate-shape-float"
                  style={{ filter: FILTER_WHITE }}
                  aria-hidden="true"
                  unoptimized
                />
              </div>
              <div className="relative z-10 text-center max-w-2xl mx-auto">
                <h2 className="font-heading text-4xl sm:text-5xl uppercase text-brand-yellow mb-4 sm:mb-6">
                  {t("guide.callToAction.title")}
                </h2>
                <p className="text-brand-sky text-base sm:text-lg mb-8">
                  {t("guide.callToAction.description")}
                </p>
                <Button
                  variant="red"
                  asChild
                  className="bg-brand-yellow text-brand-navy hover:bg-brand-yellow/90 rounded-full px-8 py-3 font-semibold"
                >
                  <Link
                    href="https://github.com/switch-to-eu/content"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {t("guide.callToAction.buttonText")}
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
