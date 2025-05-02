import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/layout/container";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getTranslations } from "next-intl/server";
import { Locale } from "next-intl";

// Generate metadata with language alternates
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const t = await getTranslations("contribute");
  // Await the params
  const { locale } = await params;

  const title = `${t("title")} - ${t("description")}`;
  const description = t("description");

  return {
    title,
    description,
    keywords: [
      "contribute",
      "open source",
      "EU alternatives",
      "migration guides",
      "community collaboration",
    ],
    alternates: {
      canonical: `https://switch-to.eu/${locale}/contribute`,
      languages: {
        en: "https://switch-to.eu/en/contribute",
        nl: "https://switch-to.eu/nl/contribute",
      },
    },
  };
}

export default async function ContributePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const t = await getTranslations("contribute");
  const { locale } = await params;

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
                {t("hero.description")}
              </p>
            </div>
            <div className="w-full max-w-[300px] h-[200px] relative flex-shrink-0">
              <Image
                src="/images/contribute.svg"
                alt="Contribution illustration"
                fill
                className="object-contain"
                priority
              />
            </div>
          </div>
        </Container>
      </section>

      {/* Contribution Cards Section */}
      <section>
        <Container>
          <h2 className="text-2xl sm:text-3xl font-bold mb-8 text-center">
            {t("helpSection.title")}
          </h2>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <div className="mb-4 flex justify-center">
                  <div className="bg-[var(--pop-1)] rounded-full p-4">
                    <Image
                      src="/images/icon-01.svg"
                      alt={t("cards.migration.title")}
                      width={60}
                      height={60}
                    />
                  </div>
                </div>
                <CardTitle className="text-xl text-center">
                  {t("cards.migration.title")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-center">
                  {t("cards.migration.description")}
                </p>
              </CardContent>
              <CardFooter className="justify-center">
                <Link
                  href="/contribute/guide"
                  className="text-blue hover:underline"
                >
                  {t("cards.migration.cta")} →
                </Link>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <div className="mb-4 flex justify-center">
                  <div className="bg-[var(--pop-2)] rounded-full p-4">
                    <Image
                      src="/images/icon-02.svg"
                      alt={t("cards.tester.title")}
                      width={60}
                      height={60}
                    />
                  </div>
                </div>
                <CardTitle className="text-xl text-center">
                  {t("cards.tester.title")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-center">{t("cards.tester.description")}</p>
              </CardContent>
              <CardFooter className="justify-center">
                <Link
                  href="https://github.com/switch-to-eu/content/issues/new"
                  target="_blank"
                  className="text-blue hover:underline"
                >
                  {t("cards.tester.cta")} →
                </Link>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <div className="mb-4 flex justify-center">
                  <div className="bg-[var(--pop-3)] rounded-full p-4">
                    <Image
                      src="/images/icon-03.svg"
                      alt={t("cards.discover.title")}
                      width={60}
                      height={60}
                    />
                  </div>
                </div>
                <CardTitle className="text-xl text-center">
                  {t("cards.discover.title")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-center">{t("cards.discover.description")}</p>
              </CardContent>
              <CardFooter className="justify-center">
                <Link
                  href="https://github.com/switch-to-eu/content/issues/new"
                  target="_blank"
                  className="text-blue hover:underline"
                >
                  {t("cards.discover.cta")} →
                </Link>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <div className="mb-4 flex justify-center">
                  <div className="bg-[var(--pop-4)] rounded-full p-4">
                    <Image
                      src="/images/icon-01.svg"
                      alt={t("cards.technical.title")}
                      width={60}
                      height={60}
                    />
                  </div>
                </div>
                <CardTitle className="text-xl text-center">
                  {t("cards.technical.title")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-center">
                  {t("cards.technical.description")}
                </p>
              </CardContent>
              <CardFooter className="justify-center">
                <Link
                  href="https://github.com/switch-to-eu/switch-to.eu/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue hover:underline"
                >
                  {t("cards.technical.cta")} →
                </Link>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <div className="mb-4 flex justify-center">
                  <div className="bg-[var(--pop-1)] rounded-full p-4">
                    <Image
                      src="/images/icon-02.svg"
                      alt={t("cards.ideas.title")}
                      width={60}
                      height={60}
                    />
                  </div>
                </div>
                <CardTitle className="text-xl text-center">
                  {t("cards.ideas.title")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-center">{t("cards.ideas.description")}</p>
              </CardContent>
              <CardFooter className="justify-center">
                <Link
                  href={`/${locale}/feedback`}
                  className="text-blue hover:underline"
                >
                  {t("cards.ideas.cta")} →
                </Link>
              </CardFooter>
            </Card>
          </div>
        </Container>
      </section>

      {/* Why Your Contribution Matters Section */}
      <section>
        <Container>
          <div className="bg-[#e8fff5] p-6 sm:p-10 rounded-xl text-center">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">
              {t("whyMatters.title")}
            </h2>
            <p className="text-base sm:text-lg max-w-[800px] mx-auto mb-6">
              {t("whyMatters.description")}
            </p>
          </div>
        </Container>
      </section>
    </div>
  );
}
