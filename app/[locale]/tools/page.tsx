import Image from "next/image";
import { Container } from "@/components/layout/container";
import { Metadata } from "next";
import { ContributeCta } from "@/components/ContributeCta";
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
  const t = await getTranslations("tools");

  return {
    title: `${t("title")} | switch-to.eu`,
    description: t("description"),
    keywords: [
      "EU tools",
      "GDPR compliance",
      "data sovereignty",
      "website analyzer",
      "EU service checker",
    ],
    alternates: {
      canonical: `https://switch-to.eu/${locale}/tools`,
      languages: {
        en: "https://switch-to.eu/en/tools",
        nl: "https://switch-to.eu/nl/tools",
      },
    },
  };
}

interface Tool {
  name: string;
  slug: string;
  description: string;
  icon: string;
  color: number;
}

export default async function ToolsPage() {
  // Await the params
  const t = await getTranslations("tools");

  // List of available tools
  const tools: Tool[] = [
    {
      name: t("websiteTool.title"),
      slug: "website",
      description: t("websiteTool.description"),
      icon: "/images/tools/website-analyzer.svg",
      color: 1,
    },
    // More tools can be added here in the future
  ];

  return (
    <main className="flex flex-col gap-16 py-10 md:gap-24 md:py-16">
      {/* Hero Section */}
      <section>
        <Container className="flex flex-col items-center gap-6 text-center">
          <h1 className="font-bold text-4xl md:text-5xl">{t("title")}</h1>
          <p className="max-w-[650px] text-lg text-muted-foreground md:text-xl">
            {t("description")}
          </p>
        </Container>
      </section>

      {/* Tools Section */}
      <section>
        <Container>
          <h2 className="mb-8 text-center font-bold text-3xl">
            {t("availableTools")}
          </h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 auto-rows-fr">
            {tools.map((tool) => (
              <Link
                key={tool.slug}
                href={`/tools/${tool.slug}`}
                className="no-underline h-full"
              >
                <div
                  className={`bg-[var(--pop-${tool.color})] p-5 sm:p-8 rounded-xl h-full flex flex-col`}
                >
                  <div className="flex flex-col items-center text-center h-full justify-between">
                    <div className="mb-3 sm:mb-4">
                      <div className="w-24 h-24 relative">
                        <Image
                          src={tool.icon}
                          alt={`${tool.name} icon`}
                          fill
                          className="object-contain"
                          priority
                        />
                      </div>
                    </div>
                    <div>
                      <h3 className="mb-2 font-bold text-xl">{tool.name}</h3>
                      <p className="text-sm sm:text-base">{tool.description}</p>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      {/* Features Section */}
      <section>
        <Container>
          <h2 className="mb-8 text-center font-bold text-3xl">
            {t("whyUseTools")}
          </h2>
          <div className="grid gap-8 md:grid-cols-3">
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 rounded-full bg-blue-100 p-3">
                <svg
                  className="h-6 w-6 text-blue-600"
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
                </svg>
              </div>
              <h3 className="mb-2 text-xl font-semibold">
                {t("features.dataSovereignty.title")}
              </h3>
              <p className="text-muted-foreground">
                {t("features.dataSovereignty.description")}
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 rounded-full bg-blue-100 p-3">
                <svg
                  className="h-6 w-6 text-blue-600"
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
                </svg>
              </div>
              <h3 className="mb-2 text-xl font-semibold">
                {t("features.freeSimple.title")}
              </h3>
              <p className="text-muted-foreground">
                {t("features.freeSimple.description")}
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 rounded-full bg-blue-100 p-3">
                <svg
                  className="h-6 w-6 text-blue-600"
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <h3 className="mb-2 text-xl font-semibold">
                {t("features.euAlternatives.title")}
              </h3>
              <p className="text-muted-foreground">
                {t("features.euAlternatives.description")}
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* CTA Section */}
      <section className="py-8 md:py-12">
        <Container>
          <ContributeCta />
        </Container>
      </section>
    </main>
  );
}
