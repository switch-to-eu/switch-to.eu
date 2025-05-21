import React from "react";
import Image from "next/image";
import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { generateLanguageAlternates } from "@/lib/utils";

export async function generateMetadata() {
  const t = await getTranslations("contribute");

  return {
    title: t("title"),
    description: t("description"),
    alternates: generateLanguageAlternates("contribute/guide"),
  };
}

export default async function ContributeGuidePage() {
  const t = await getTranslations("contribute");

  // Modified renderPoints implementation that creates static bullet points
  // based on the keys we know exist in the translations
  const getKnownPoints = (path: string): React.ReactNode => {
    // Let's just hardcode our lists since we know the structure
    if (path === "guide.whatYouCanContribute.points") {
      return (
        <ul className="space-y-1">
          <li className="space-y-1">
            {t("guide.whatYouCanContribute.points.0")}
          </li>
          <li className="space-y-1">
            {t("guide.whatYouCanContribute.points.1")}
          </li>
          <li className="space-y-1">
            {t("guide.whatYouCanContribute.points.2")}
          </li>
          <li className="space-y-1">
            {t("guide.whatYouCanContribute.points.3")}
          </li>
        </ul>
      );
    } else if (path === "guide.contributionProcess.step1.points") {
      return (
        <ul className="space-y-1">
          <li className="space-y-1">
            {t("guide.contributionProcess.step1.points.0")}
          </li>
          <li className="space-y-1">
            {t("guide.contributionProcess.step1.points.1")}
          </li>
          <li className="space-y-1">
            {t("guide.contributionProcess.step1.points.2")}
          </li>
        </ul>
      );
    } else if (path === "guide.contributionProcess.step3.optionAPoints") {
      return (
        <ul className="space-y-1">
          <li className="space-y-1">
            {t("guide.contributionProcess.step3.optionAPoints.0")}
          </li>
          <li className="space-y-1">
            {t("guide.contributionProcess.step3.optionAPoints.1")}
          </li>
          <li className="space-y-1">
            {t("guide.contributionProcess.step3.optionAPoints.2")}
          </li>
        </ul>
      );
    } else if (path === "guide.contributionProcess.step3.optionBPoints") {
      return (
        <ul className="space-y-1">
          <li className="space-y-1">
            {t("guide.contributionProcess.step3.optionBPoints.0")}
          </li>
          <li className="space-y-1">
            {t("guide.contributionProcess.step3.optionBPoints.1")}
          </li>
          <li className="space-y-1">
            {t("guide.contributionProcess.step3.optionBPoints.2")}
          </li>
        </ul>
      );
    } else if (path === "guide.contributionProcess.step4.points") {
      return (
        <ul className="space-y-1">
          <li className="space-y-1">
            {t("guide.contributionProcess.step4.points.0")}
          </li>
          <li className="space-y-1">
            {t("guide.contributionProcess.step4.points.1")}
          </li>
          <li className="space-y-1">
            {t("guide.contributionProcess.step4.points.2")}
          </li>
        </ul>
      );
    } else if (path === "guide.contributionProcess.step5.points") {
      return (
        <ul className="space-y-1">
          <li className="space-y-1">
            {t("guide.contributionProcess.step5.points.0")}
          </li>
          <li className="space-y-1">
            {t("guide.contributionProcess.step5.points.1")}
          </li>
          <li className="space-y-1">
            {t("guide.contributionProcess.step5.points.2")}
          </li>
          <li className="space-y-1">
            {t("guide.contributionProcess.step5.points.3")}
          </li>
        </ul>
      );
    } else if (path === "guide.contentGuidelines.formatting.points") {
      return (
        <ul className="space-y-1">
          <li className="space-y-1">
            {t("guide.contentGuidelines.formatting.points.0")}
          </li>
          <li className="space-y-1">
            {t("guide.contentGuidelines.formatting.points.1")}
          </li>
          <li className="space-y-1">
            {t("guide.contentGuidelines.formatting.points.2")}
          </li>
          <li className="space-y-1">
            {t("guide.contentGuidelines.formatting.points.3")}
          </li>
        </ul>
      );
    } else if (path === "guide.contentGuidelines.writingStyle.points") {
      return (
        <ul className="space-y-1">
          <li className="space-y-1">
            {t("guide.contentGuidelines.writingStyle.points.0")}
          </li>
          <li className="space-y-1">
            {t("guide.contentGuidelines.writingStyle.points.1")}
          </li>
          <li className="space-y-1">
            {t("guide.contentGuidelines.writingStyle.points.2")}
          </li>
          <li className="space-y-1">
            {t("guide.contentGuidelines.writingStyle.points.3")}
          </li>
          <li className="space-y-1">
            {t("guide.contentGuidelines.writingStyle.points.4")}
          </li>
        </ul>
      );
    } else if (
      path === "guide.contentGuidelines.migrationGuidesStructure.points"
    ) {
      return (
        <ul className="space-y-1">
          <li className="space-y-1">
            {t("guide.contentGuidelines.migrationGuidesStructure.points.0")}
          </li>
          <li className="space-y-1">
            {t("guide.contentGuidelines.migrationGuidesStructure.points.1")}
          </li>
          <li className="space-y-1">
            {t("guide.contentGuidelines.migrationGuidesStructure.points.2")}
          </li>
          <li className="space-y-1">
            {t("guide.contentGuidelines.migrationGuidesStructure.points.3")}
          </li>
          <li className="space-y-1">
            {t("guide.contentGuidelines.migrationGuidesStructure.points.4")}
          </li>
        </ul>
      );
    } else if (path === "guide.reviewProcess.points") {
      return (
        <ul className="space-y-1">
          <li className="space-y-1">{t("guide.reviewProcess.points.0")}</li>
          <li className="space-y-1">{t("guide.reviewProcess.points.1")}</li>
          <li className="space-y-1">{t("guide.reviewProcess.points.2")}</li>
        </ul>
      );
    } else if (path === "guide.questionsAndSupport.points") {
      return (
        <ul className="space-y-1">
          <li className="space-y-1">
            {t("guide.questionsAndSupport.points.0")}
          </li>
          <li className="space-y-1">
            {t("guide.questionsAndSupport.points.1")}
          </li>
        </ul>
      );
    }

    // Return empty ul as fallback
    return <ul></ul>;
  };

  return (
    <div className="flex flex-col gap-8 sm:gap-12 py-6 md:py-12">
      <section>
        <Container>
          <div className="flex flex-col md:flex-row items-start gap-8">
            <div className="flex-1">
              <h1 className="text-3xl sm:text-4xl font-bold mb-6">
                {t("guide.hero.title")}
              </h1>
              <p className="text-base sm:text-lg mb-6">
                {t("guide.hero.description")}
              </p>
            </div>
            <div className="w-full max-w-[250px] h-[150px] relative flex-shrink-0">
              <Image
                src="/images/contribute.svg"
                alt="GitHub Contribution illustration"
                fill
                className="object-contain"
                priority
              />
            </div>
          </div>
        </Container>
      </section>

      <section>
        <Container>
          <div className="prose prose-slate max-w-none lg:prose-lg dark:prose-invert">
            <h2 className="text-2xl font-bold mt-8">
              {t("guide.repositoryOverview.title")}
            </h2>
            <p>{t("guide.repositoryOverview.description")}</p>

            <h2 className="text-2xl font-bold mt-8">
              {t("guide.whatYouCanContribute.title")}
            </h2>
            {getKnownPoints("guide.whatYouCanContribute.points")}

            <h2 className="text-2xl font-bold mt-8">
              {t("guide.contributionProcess.title")}
            </h2>

            <h3 className="text-xl font-bold mt-6">
              {t("guide.contributionProcess.step1.title")}
            </h3>
            {getKnownPoints("guide.contributionProcess.step1.points")}

            <h3 className="text-xl font-bold mt-6">
              {t("guide.contributionProcess.step2.title")}
            </h3>
            <p>{t("guide.contributionProcess.step2.description")}</p>
            <div className="bg-slate-800 rounded-md p-4 overflow-x-auto my-4">
              <pre className="text-sm text-white whitespace-pre">
                <code>
                  git clone https://github.com/switch-to-eu/content.git cd
                  content
                </code>
              </pre>
            </div>

            <h3 className="text-xl font-bold mt-6">
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

            <h3 className="text-xl font-bold mt-6">
              {t("guide.contributionProcess.step4.title")}
            </h3>
            <p>{t("guide.contributionProcess.step4.description")}</p>
            {getKnownPoints("guide.contributionProcess.step4.points")}

            <h3 className="text-xl font-bold mt-6">
              {t("guide.contributionProcess.step5.title")}
            </h3>
            {getKnownPoints("guide.contributionProcess.step5.points")}

            <h2 className="text-2xl font-bold mt-8">
              {t("guide.contentGuidelines.title")}
            </h2>

            <h3 className="text-xl font-bold mt-6">
              {t("guide.contentGuidelines.formatting.title")}
            </h3>
            {getKnownPoints("guide.contentGuidelines.formatting.points")}

            <h3 className="text-xl font-bold mt-6">
              {t("guide.contentGuidelines.writingStyle.title")}
            </h3>
            {getKnownPoints("guide.contentGuidelines.writingStyle.points")}

            <h3 className="text-xl font-bold mt-6">
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

            <h2 className="text-2xl font-bold mt-8">
              {t("guide.reviewProcess.title")}
            </h2>
            <p>{t("guide.reviewProcess.description")}</p>
            {getKnownPoints("guide.reviewProcess.points")}

            <h2 className="text-2xl font-bold mt-8">
              {t("guide.questionsAndSupport.title")}
            </h2>
            {getKnownPoints("guide.questionsAndSupport.points")}
          </div>
        </Container>
      </section>

      <section>
        <Container>
          <div className="bg-[#e8fff5] p-6 sm:p-10 rounded-xl text-center mt-8">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">
              {t("guide.callToAction.title")}
            </h2>
            <p className="text-base sm:text-lg max-w-[800px] mx-auto mb-6">
              {t("guide.callToAction.description")}
            </p>
            <Button variant="red" asChild className="mx-auto">
              <Link
                href="https://github.com/switch-to-eu/content"
                target="_blank"
                rel="noopener noreferrer"
              >
                {t("guide.callToAction.buttonText")}
              </Link>
            </Button>
          </div>
        </Container>
      </section>
    </div>
  );
}
