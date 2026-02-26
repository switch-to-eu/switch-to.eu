import { Metadata } from "next";
import { Container } from "@/components/layout/container";
import { getLocale, getTranslations } from "next-intl/server";
import { generateLanguageAlternates } from "@switch-to-eu/i18n/utils";
import { tools } from "@/lib/tools-config";
import { ArrowUpRightIcon } from "lucide-react";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("tools");
  const locale = await getLocale();

  return {
    title: t("title"),
    description: t("description"),
    alternates: generateLanguageAlternates("tools", locale),
  };
}

export default async function ToolsPage() {
  const t = await getTranslations("tools");

  return (
    <div className="flex flex-col gap-8 sm:gap-12 py-6 md:gap-20 md:py-12">
      <section>
        <Container>
          <div className="flex flex-col items-center text-center mb-8 sm:mb-12">
            <h1 className="text-3xl sm:text-4xl font-bold mb-4">
              {t("title")}
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl">
              {t("description")}
            </p>
          </div>

          <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
            {tools.map((tool, index) => (
              <a
                key={tool.id}
                href={tool.href}
                target="_blank"
                rel="noopener noreferrer"
                className={`group p-5 sm:p-8 rounded-xl transition-shadow hover:shadow-lg ${
                  ["bg-[var(--pop-1)]", "bg-[var(--pop-2)]", "bg-[var(--pop-3)]", "bg-[var(--pop-4)]"][index % 4]
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold mb-2">
                      {t(`items.${tool.i18nKey}.title`)}
                    </h2>
                    <p className="text-sm sm:text-base">
                      {t(`items.${tool.i18nKey}.description`)}
                    </p>
                  </div>
                  <ArrowUpRightIcon className="w-5 h-5 flex-shrink-0 mt-1 opacity-60 group-hover:opacity-100 transition-opacity" />
                </div>
              </a>
            ))}
          </div>
        </Container>
      </section>

      <section>
        <Container>
          <h2 className="mb-8 text-center font-bold text-2xl sm:text-3xl">
            {t("whyUseTools")}
          </h2>
          <div className="grid gap-4 sm:gap-6 md:grid-cols-3">
            <div className="bg-[var(--pop-1)] p-5 sm:p-8 rounded-xl">
              <div className="flex flex-col items-center text-center">
                <h3 className="mb-2 font-bold text-xl">
                  {t("features.dataSovereignty.title")}
                </h3>
                <p className="text-sm sm:text-base">
                  {t("features.dataSovereignty.description")}
                </p>
              </div>
            </div>
            <div className="bg-[var(--pop-2)] p-5 sm:p-8 rounded-xl">
              <div className="flex flex-col items-center text-center">
                <h3 className="mb-2 font-bold text-xl">
                  {t("features.freeSimple.title")}
                </h3>
                <p className="text-sm sm:text-base">
                  {t("features.freeSimple.description")}
                </p>
              </div>
            </div>
            <div className="bg-[var(--pop-3)] p-5 sm:p-8 rounded-xl">
              <div className="flex flex-col items-center text-center">
                <h3 className="mb-2 font-bold text-xl">
                  {t("features.euAlternatives.title")}
                </h3>
                <p className="text-sm sm:text-base">
                  {t("features.euAlternatives.description")}
                </p>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}
