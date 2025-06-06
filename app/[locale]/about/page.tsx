import { Metadata } from "next";
import Image from "next/image";
import { Container } from "@/components/layout/container";
import { getLocale, getTranslations } from "next-intl/server";
import { generateLanguageAlternates } from "@/lib/utils";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("about");
  const locale = await getLocale();

  return {
    title: t("title"),
    description: t("description"),
    alternates: generateLanguageAlternates("about", locale),
  };
}

export default async function AboutPage() {
  const t = await getTranslations("about");
  const imageSize = 120;

  return (
    <div className="flex flex-col gap-8 sm:gap-12 py-6 md:gap-20 md:py-12">
      {/* Hero Section */}
      <section>
        <Container>
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1">
              <h2 className="text-3xl sm:text-4xl font-bold mb-6">
                {t("initiative.heading")}
              </h2>
              <p className="mb-4 text-base sm:text-lg">
                {t("initiative.intro")}
              </p>

              <h3 className="text-2xl font-bold mt-8 mb-4">
                {t("initiative.mission.title")}
              </h3>
              <p className="mb-4 text-base sm:text-lg">
                {t("initiative.mission.description1")}
              </p>
              <p className="mb-4 text-base sm:text-lg">
                {t("initiative.mission.description2")}
              </p>

              <h3 className="text-2xl font-bold mt-8 mb-4">
                {t("initiative.whatWeDo.title")}
              </h3>
              <p className="mb-4 text-base sm:text-lg">
                {t("initiative.whatWeDo.description")}
              </p>

              <h3 className="text-2xl font-bold mt-8 mb-4">
                {t("initiative.uniqueness.title")}
              </h3>
              <p className="mb-4 text-base sm:text-lg">
                {t("initiative.uniqueness.description1")}
              </p>
              <p className="mb-4 text-base sm:text-lg">
                {t("initiative.uniqueness.description2")}
              </p>
              <ul className="list-disc pl-6 space-y-2 mb-8 text-base sm:text-lg">
                {(t.raw("initiative.uniqueness.points") as Array<string>).map(
                  (point: string, index: number) => (
                    <li key={index}>{point}</li>
                  )
                )}
              </ul>

              <h3 className="text-2xl font-bold mt-8 mb-4">
                {t("initiative.callToAction.title")}
              </h3>
              <p className="mb-4 text-base sm:text-lg">
                {t("initiative.callToAction.description")}
              </p>
            </div>
            <div className="w-full max-w-[300px] h-[200px] relative flex-shrink-0 self-start mt-6 md:mt-0">
              <Image
                src="/images/europe.svg"
                alt="Europe map illustration"
                fill
                className="object-contain object-top"
                priority
              />
            </div>
          </div>
        </Container>
      </section>

      {/* Three Pillars Section */}
      <section>
        <Container>
          <h2 className="mb-8 text-center font-bold text-3xl">
            {t("pillarsTitle")}
          </h2>
          <div className="grid gap-4 sm:gap-6 md:grid-cols-3">
            <div className="bg-[var(--pop-1)] p-5 sm:p-8 rounded-xl sm:translate-y-[10px]">
              <div className="flex flex-col items-center text-center">
                <div className="mb-3 sm:mb-4">
                  <Image
                    src="/images/icon-01.svg"
                    alt="European Alternatives icon"
                    width={imageSize}
                    height={imageSize}
                    priority
                  />
                </div>
                <h3 className="mb-2 font-bold text-xl">
                  {t("pillars.pillar1.title")}
                </h3>
                <p className="text-sm sm:text-base">
                  {t("pillars.pillar1.description")}
                </p>
              </div>
            </div>
            <div className="bg-[var(--pop-2)] p-5 sm:p-8 rounded-xl sm:translate-y-[-20px]">
              <div className="flex flex-col items-center text-center">
                <div className="mb-3 sm:mb-4">
                  <Image
                    src="/images/icon-02.svg"
                    alt="Step-by-step Guides icon"
                    width={imageSize}
                    height={imageSize}
                    priority
                  />
                </div>
                <h3 className="mb-2 font-bold text-xl">
                  {t("pillars.pillar2.title")}
                </h3>
                <p className="text-sm sm:text-base">
                  {t("pillars.pillar2.description")}
                </p>
              </div>
            </div>
            <div className="bg-[var(--pop-3)] p-5 sm:p-8 rounded-xl">
              <div className="flex flex-col items-center text-center">
                <div className="mb-3 sm:mb-4">
                  <Image
                    src="/images/icon-03.svg"
                    alt="Community Driven icon"
                    width={imageSize}
                    height={imageSize}
                    priority
                  />
                </div>
                <h3 className="mb-2 font-bold text-xl">
                  {t("pillars.pillar3.title")}
                </h3>
                <p className="text-sm sm:text-base">
                  {t("pillars.pillar3.description")}
                </p>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Why Choose EU Services Section */}
      <section>
        <Container>
          <h2 className="mb-8 text-center font-bold text-3xl">
            {t("whyChooseTitle")}
          </h2>
          <p className="text-center mb-6">{t("whyChooseDescription")}</p>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
            <div className="bg-[var(--pop-4)] p-5 rounded-xl">
              <h3 className="mb-3 font-bold text-xl text-center">
                {t("whyChoosePoints.point1.title")}
              </h3>
              <p className="text-sm sm:text-base">
                {t("whyChoosePoints.point1.description")}
              </p>
            </div>

            <div className="bg-[var(--pop-1)] p-5 rounded-xl">
              <h3 className="mb-3 font-bold text-xl text-center">
                {t("whyChoosePoints.point2.title")}
              </h3>
              <p className="text-sm sm:text-base">
                {t("whyChoosePoints.point2.description")}
              </p>
            </div>

            <div className="bg-[var(--pop-2)] p-5 rounded-xl">
              <h3 className="mb-3 font-bold text-xl text-center">
                {t("whyChoosePoints.point3.title")}
              </h3>
              <p className="text-sm sm:text-base">
                {t("whyChoosePoints.point3.description")}
              </p>
            </div>

            <div className="bg-[var(--pop-3)] p-5 rounded-xl">
              <h3 className="mb-3 font-bold text-xl text-center">
                {t("whyChoosePoints.point4.title")}
              </h3>
              <p className="text-sm sm:text-base">
                {t("whyChoosePoints.point4.description")}
              </p>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}
