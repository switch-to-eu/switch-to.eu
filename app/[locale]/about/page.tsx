import { Metadata } from "next";
import Image from "next/image";
import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

// Generate metadata with language alternates
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  // Await the params
  const { locale } = await params;
  const t = await getTranslations("about");

  const defaultKeywords = [
    "about switch-to.eu",
    "digital sovereignty",
    "EU alternatives",
    "community platform",
    "data privacy",
  ];

  return {
    title: t("title"),
    description: t("description"),
    keywords: defaultKeywords,
    alternates: {
      canonical: `https://switch-to.eu/${locale}/about`,
      languages: {
        en: "https://switch-to.eu/en/about",
        nl: "https://switch-to.eu/nl/about",
      },
    },
  };
}

export default async function AboutPage() {
  const t = await getTranslations("about");
  const contributeT = await getTranslations("contribute");
  const imageSize = 120;

  return (
    <div className="flex flex-col gap-8 sm:gap-12 py-6 md:gap-20 md:py-12">
      {/* Hero Section */}
      <section>
        <Container>
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1">
              <h1 className="text-3xl sm:text-4xl font-bold mb-6">
                {t("heroTitle")}
              </h1>
              <p className="text-base sm:text-lg mb-6">
                {t("heroDescription1")}
              </p>
              <p className="text-base sm:text-lg mb-6">
                {t("heroDescription2")}
              </p>
            </div>
            <div className="w-full max-w-[300px] h-[200px] relative flex-shrink-0">
              <Image
                src="/images/europe.svg"
                alt="Europe map illustration"
                fill
                className="object-contain"
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

      {/* Join Our Mission Section */}
      <section className="py-8">
        <Container>
          <div className="text-center max-w-[800px] mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold mb-6">
              {t("contributionTitle")}
            </h2>
            <p className="text-base sm:text-lg mb-4">
              {t("contributionDescription")}
            </p>
            <ul className="list-disc text-left pl-8 mb-6">
              <li className="mb-2">
                {t("contributionPoints.point1.description")}
              </li>
              <li className="mb-2">
                {t("contributionPoints.point2.description")}
              </li>
              <li className="mb-2">
                {t("contributionPoints.point3.description")}
              </li>
              <li className="mb-2">
                {t("contributionPoints.point4.description")}
              </li>
            </ul>
          </div>
        </Container>
      </section>

      {/* How You Can Contribute Section - Removing this section as it's redundant with the improved Join Mission section */}
      <section className="">
        <Container>
          <div className="flex justify-center mt-6">
            <Button variant="red" className="font-medium" asChild>
              <Link href="/contribute">{contributeT("buttonText")}</Link>
            </Button>
          </div>
        </Container>
      </section>
    </div>
  );
}
