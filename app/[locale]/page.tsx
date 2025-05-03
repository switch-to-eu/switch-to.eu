import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/layout/container";
import { InlineSearchInput } from "@/components/InlineSearchInput";
import { ContributeCta } from "@/components/ContributeCta";
import { CategorySection } from "@/components/CategorySection";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Locale } from "next-intl";

// Generate metadata with language alternates
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const t = await getTranslations("common");
  // Await the params
  const { locale } = await params;

  const defaultKeywords = [
    "EU alternatives",
    "European digital services",
    "privacy",
    "GDPR",
    "digital migration",
    "data protection",
    "EU tech",
  ];
  const title = `${t("title")} - ${t("subtitle")}`;
  const description = t("description");

  return {
    title,
    description,
    keywords: defaultKeywords,
    alternates: {
      canonical: `https://switch-to.eu/${locale}`,
      languages: {
        en: "https://switch-to.eu/en",
        nl: "https://switch-to.eu/nl",
      },
    },
    openGraph: {
      images: [
        {
          url: "/images/share.png",
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      type: "website",
      siteName: t("title"),
      title,
      description,
      locale: locale,
    },
    twitter: {
      card: "summary_large_image",
      images: ["/images/share.png"],
      title,
      description,
    },
  };
}

export default async function Home({ }: {
  params: Promise<{ locale: Locale }>;
}) {
  const t = await getTranslations("home");

  const imageSize = 120;

  return (
    <div className="flex flex-col gap-8 sm:gap-12 py-6 md:gap-20 md:py-12">
      {/* Hero Section */}
      <section className="relative">
        <Container className="flex flex-col md:mt-6 md:mb-6 md:flex-row items-center gap-6 sm:gap-8 py-4 sm:py-6">
          <div className="flex flex-col gap-4 sm:gap-6">
            <h1 className="font-bold text-3xl sm:text-4xl md:text-5xl lg:text-6xl ">
              {t("heroTitle")}
            </h1>
            <p
              className="text-base sm:text-lg md:text-xl mt-4 sm:mt-6"
              dangerouslySetInnerHTML={{
                __html: t.markup("heroSubtitle", {
                  b: (chunks) => `<b>${chunks}</b>`,
                }),
              }}
            />
            <p
              className="text-base sm:text-lg md:text-xl max-w-[500px]"
              dangerouslySetInnerHTML={{
                __html: t.markup("heroDescription", {
                  b: (chunks) => `<b>${chunks}</b>`,
                }),
              }}
            />

            {/* Search CTA */}
            <div className="w-full ">
              <InlineSearchInput
                filterRegion="non-eu"
                showOnlyServices={true}
              />
            </div>

            <p className="text-base sm:text-lg md:text-xl mb -2 sm:mb-3 max-w-[500px]">
              {t("exampleLabel")}{" "}
              <Link
                href={`/services/non-eu/whatsapp`}
                className="text-blue underline"
              >
                WhatsApp
              </Link>
              ,&nbsp;
              <Link
                href={`/services/non-eu/gmail`}
                className="text-blue underline"
              >
                Gmail
              </Link>{" "}
              or&nbsp;
              <Link
                href={`/services/non-eu/google-drive`}
                className="text-blue underline"
              >
                Google Drive
              </Link>
            </p>
          </div>

          <div className="relative w-full max-w-[300px] sm:max-w-[400px] h-[250px] sm:h-[300px] mt-4 sm:mt-0">
            <Image
              src="/images/europe.svg"
              alt="Europe map illustration"
              fill
              className="object-contain"
              priority
            />
          </div>
        </Container>
      </section>

      {/* Migration Guides Section */}
      <section>
        <Container>
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8">
            {t("migrationGuidesTitle")}
          </h2>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden">
              <Link href="/guides/messaging/whatsapp-to-signal" className="block">
                <div className="relative w-full h-40">
                  <Image
                    src="/images/guides/gmail-to-proton.jpg"
                    alt={t("gmailToProton.alt")}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-semibold mb-2">{t("gmailToProton.title")}</h3>
                  <p className="text-sm text-gray-600">
                    {t("gmailToProton.description")}
                  </p>
                </div>
              </Link>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden">
              <Link href="/guides/messaging/whatsapp-to-signal" className="block">
                <div className="relative w-full h-40">
                  <Image
                    src="/images/guides/drive-to-nextcloud.jpg"
                    alt={t("driveToNextcloud.alt")}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-semibold mb-2">{t("driveToNextcloud.title")}</h3>
                  <p className="text-sm text-gray-600">
                    {t("driveToNextcloud.description")}
                  </p>
                </div>
              </Link>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden">
              <Link href="/guides/messaging/whatsapp-to-signal" className="block">
                <div className="relative w-full h-40">
                  <Image
                    src="/images/guides/whatsapp-to-signal.jpg"
                    alt={t("whatsappToSignal.alt")}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-semibold mb-2">{t("whatsappToSignal.title")}</h3>
                  <p className="text-sm text-gray-600">
                    {t("whatsappToSignal.description")}
                  </p>
                </div>
              </Link>
            </div>
          </div>
        </Container>
      </section>

      {/* Features Section */}
      <section>
        <Container>
          <div className="grid gap-4 sm:gap-6 md:grid-cols-3">
            <div className="bg-[var(--pop-1)] p-5 sm:p-8 rounded-xl sm:translate-y-[10px]">
              <div className="flex flex-col items-center text-center">
                <div className="mb-3 sm:mb-4">
                  <Image
                    src="/images/icon-01.svg"
                    alt="Europe map illustration"
                    width={imageSize}
                    height={imageSize}
                    priority
                  />
                </div>
                <h3 className="mb-2 font-bold text-xl">
                  {t("featuresEuropeanTitle")}
                </h3>
                <p className="text-sm sm:text-base">
                  {t("featuresEuropeanDescription")}
                </p>
              </div>
            </div>
            <div className="bg-[var(--pop-2)] p-5 sm:p-8 rounded-xl sm:translate-y-[-20px]">
              <div className="flex flex-col items-center text-center">
                <div className="mb-3 sm:mb-4">
                  <Image
                    src="/images/icon-02.svg"
                    alt="Europe map illustration"
                    width={imageSize}
                    height={imageSize}
                    priority
                  />
                </div>
                <h3 className="mb-2 font-bold text-xl">
                  {t("featuresGuidesTitle")}
                </h3>
                <p className="text-sm sm:text-base">
                  {t("featuresGuidesDescription")}
                </p>
              </div>
            </div>
            <div className="bg-[var(--pop-3)] p-5 sm:p-8 rounded-xl">
              <div className="flex flex-col items-center text-center">
                <div className="mb-3 sm:mb-4">
                  <Image
                    src="/images/icon-03.svg"
                    alt="Europe map illustration"
                    width={imageSize}
                    height={imageSize}
                    priority
                  />
                </div>
                <h3 className="mb-2 font-bold text-xl">
                  {t("featuresCommunityTitle")}
                </h3>
                <p className="text-sm sm:text-base">
                  {t("featuresCommunityDescription")}
                </p>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Why Switch Section */}
      <section className="py-16">
        <Container>
          <h2 className="mb-6 text-center font-bold text-3xl ">
            {t("whySwitchTitle")}
          </h2>
          <p className="text-center text-lg max-w-[800px] mx-auto mb-4 ">
            {t("whySwitchDescription1")}
          </p>
          <p className="text-center text-lg max-w-[800px] mx-auto ">
            {t("whySwitchDescription2")}
          </p>
          <div className="mt-8 text-center">
            <Button variant="red" asChild className="mx-auto">
              <Link href={`/about`}>{t("knowMoreButton")}</Link>
            </Button>
          </div>
        </Container>
      </section>

      {/* Categories Section */}
      <CategorySection />

      {/* CTA Section */}
      <section className="py-8 md:py-12">
        <Container>
          <ContributeCta />
        </Container>
      </section>
    </div>
  );
}
