import Image from "next/image";
import { Container } from "@/components/layout/container";
import FeedbackForm from "@/components/FeedbackForm";
import { Metadata } from "next";
import { getTranslations, getLocale } from "next-intl/server";
import { generateLanguageAlternates } from "@/lib/utils";

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
    <div className="flex flex-col gap-8 sm:gap-12 py-6 md:gap-20 md:py-12">
      {/* Hero Section */}
      <section>
        <Container>
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1">
              <h1 className="text-3xl sm:text-4xl font-bold mb-6">
                {t("hero.title")}
              </h1>
              <p className="text-base sm:text-lg mb-6">
                {t("hero.description1")}
              </p>
              <p className="text-base sm:text-lg mb-6">
                {t("hero.description2")}
              </p>
            </div>
            <div className="w-full max-w-[300px] h-[200px] relative flex-shrink-0">
              <Image
                src="/images/contribute.svg"
                alt={t("hero.imageAlt") || "Feedback illustration"}
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
          <FeedbackForm />
        </Container>
      </section>
    </div>
  );
}
