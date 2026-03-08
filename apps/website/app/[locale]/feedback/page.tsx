import FeedbackForm from "@/components/FeedbackForm";
import { Container } from "@switch-to-eu/blocks/components/container";
import { PageLayout } from "@switch-to-eu/blocks/components/page-layout";
import { Metadata } from "next";
import { getTranslations, getLocale } from "next-intl/server";
import { generateLanguageAlternates } from "@switch-to-eu/i18n/utils";
import Image from "next/image";

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
    <PageLayout paddingTopMobile paddingBottomMobile>
      {/* Hero Section */}
      <section>
        <Container>
          <div className="bg-brand-pink rounded-3xl">
            <div className="relative px-6 sm:px-10 md:px-16 py-12 sm:py-16 md:py-20 overflow-hidden">
              {/* Decorative shapes */}
              <div className="absolute -top-6 -right-6 w-36 h-36 sm:w-48 sm:h-48 opacity-15 pointer-events-none">
                <Image
                  src="/images/shapes/spark.svg"
                  alt=""
                  fill
                  className="object-contain select-none animate-shape-float"
                  style={{ animationDuration: "7s", filter: "brightness(0) invert(1)" }}
                  aria-hidden="true"
                  unoptimized
                />
              </div>
              <div className="absolute -bottom-8 -left-8 w-32 h-32 sm:w-44 sm:h-44 opacity-10 pointer-events-none">
                <Image
                  src="/images/shapes/blob.svg"
                  alt=""
                  fill
                  className="object-contain select-none animate-shape-float"
                  style={{ animationDuration: "9s", animationDelay: "1.5s", filter: "brightness(0) invert(1)" }}
                  aria-hidden="true"
                  unoptimized
                />
              </div>

              <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
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
                  <div className="absolute inset-0">
                    <Image
                      src="/images/shapes/speech.svg"
                      alt=""
                      fill
                      className="object-contain select-none animate-shape-float"
                      style={{ filter: "brightness(0) invert(1)", opacity: 0.35, animationDuration: "7s" }}
                      aria-hidden="true"
                      unoptimized
                    />
                  </div>
                  <div className="absolute inset-8">
                    <Image
                      src="/images/shapes/spark.svg"
                      alt=""
                      fill
                      className="object-contain select-none animate-shape-float"
                      style={{ filter: "brightness(0) invert(1)", opacity: 0.5, animationDuration: "6s", animationDelay: "-2s" }}
                      aria-hidden="true"
                      unoptimized
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Feedback Form Section */}
      <section>
        <Container>
          <FeedbackForm />
        </Container>
      </section>
    </PageLayout>
  );
}
