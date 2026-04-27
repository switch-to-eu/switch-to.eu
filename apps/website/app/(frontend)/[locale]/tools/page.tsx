import { Metadata } from "next";
import { Container } from "@switch-to-eu/blocks/components/container";
import { PageLayout } from "@switch-to-eu/blocks/components/page-layout";
import { getLocale, getTranslations } from "next-intl/server";
import { generateLanguageAlternates } from "@switch-to-eu/i18n/utils";
import { getAllToolsSorted, getToolUrl } from "@switch-to-eu/blocks/data/tools";
import { getCardColor } from "@switch-to-eu/ui/lib/brand-palette";
import { TOOL_SCHEMES, BRAND_COLORS } from "@switch-to-eu/ui/lib/tool-colors";
import { SectionHeading } from "@switch-to-eu/blocks/components/section-heading";
import { shapes } from "@switch-to-eu/blocks/shapes";
import {
  ArrowUpRightIcon,
  GlobeIcon,
  CalendarIcon,
  ListChecksIcon,
  TargetIcon,
  FileLock2Icon,
  BrainIcon,
  type LucideIcon,
} from "lucide-react";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("tools");
  const locale = await getLocale();

  return {
    title: t("title"),
    description: t("description"),
    alternates: generateLanguageAlternates("tools", locale),
  };
}

const i18nKeyMap: Record<string, string> = {
  "eu-scan": "euScan",
};

const iconMap: Record<string, LucideIcon> = {
  globe: GlobeIcon,
  calendar: CalendarIcon,
  "list-checks": ListChecksIcon,
  target: TargetIcon,
  "file-lock": FileLock2Icon,
  brain: BrainIcon,
};

const TOOL_SHAPES = [
  "sunburst",
  "cloud",
  "star",
  "pebble",
  "heart",
  "spark",
  "flower",
  "coral",
];

export default async function ToolsPage() {
  const t = await getTranslations("tools");
  const locale = await getLocale();
  const tools = getAllToolsSorted();

  return (
    <PageLayout paddingTopMobile>
      <section>
        <Container noPaddingMobile>
          <div className="flex flex-col items-center text-center mb-8 sm:mb-12 px-3 md:px-0">
            <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl uppercase text-brand-navy mb-4">
              {t("title")}
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl">
              {t("description")}
            </p>
          </div>

          <div className="grid gap-0 md:gap-5 md:grid-cols-2">
            {tools.map((tool, index) => {
              const Icon = tool.icon ? iconMap[tool.icon] : undefined;
              const isActive = tool.status === "active";
              const Wrapper = isActive ? "a" : "div";
              const wrapperProps = isActive
                ? {
                    href: getToolUrl(tool, locale),
                    target: "_blank" as const,
                    rel: "noopener noreferrer",
                  }
                : {};
              const scheme = TOOL_SCHEMES[tool.id];
              const primaryHex = scheme ? BRAND_COLORS[scheme.primary].value : "#0D492C";
              const accentHex = scheme ? BRAND_COLORS[scheme.accent].value : "#B0D8B0";
              const shapeName = TOOL_SHAPES[index % TOOL_SHAPES.length]!;
              const shapeData = shapes[shapeName];

              return (
                <Wrapper
                  key={tool.id}
                  {...wrapperProps}
                  className={`group bg-white md:rounded-3xl overflow-hidden transition-all duration-200 ${
                    isActive
                      ? "hover:shadow-lg hover:scale-[1.02] cursor-pointer"
                      : "opacity-60"
                  }`}
                  style={{ borderWidth: 1, borderColor: primaryHex }}
                >
                  {/* Decorative shape area */}
                  <div className="relative h-32 sm:h-36 flex items-center justify-center p-8 sm:p-10">
                    {shapeData && (
                      <svg
                        viewBox={shapeData.viewBox}
                        className="w-full h-full select-none animate-shape-float"
                        style={{
                          color: accentHex,
                          animationDuration: `${6 + (index % 4) * 1.5}s`,
                          animationDelay: `${(index % 4) * -1.5}s`,
                        }}
                        aria-hidden="true"
                      >
                        <path d={shapeData.d} fill="currentColor" />
                      </svg>
                    )}
                    {/* Icon badge */}
                    {Icon && (
                      <div className="absolute top-4 left-4">
                        <div
                          className="text-white w-10 h-10 rounded-full flex items-center justify-center"
                          style={{ backgroundColor: primaryHex }}
                        >
                          <Icon className="w-5 h-5" />
                        </div>
                      </div>
                    )}
                    {!isActive && (
                      <div className="absolute top-4 right-4">
                        <span
                          className="text-xs font-medium italic opacity-70 px-3 py-1 rounded-full"
                          style={{ color: primaryHex, backgroundColor: `${accentHex}33` }}
                        >
                          {t("comingSoon")}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Content area */}
                  <div className="px-5 pb-5 sm:px-6 sm:pb-6">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h2
                          className="text-xl sm:text-2xl font-bold mb-2"
                          style={{ color: primaryHex }}
                        >
                          {t(
                            `items.${i18nKeyMap[tool.id] ?? tool.id}.title`
                          )}
                        </h2>
                        <p
                          className="text-muted-foreground text-sm sm:text-base leading-relaxed"
                        >
                          {t(
                            `items.${i18nKeyMap[tool.id] ?? tool.id}.description`
                          )}
                        </p>
                      </div>
                      {isActive && (
                        <ArrowUpRightIcon
                          className="w-5 h-5 flex-shrink-0 mt-1 opacity-50 group-hover:opacity-100 transition-opacity"
                          style={{ color: primaryHex }}
                        />
                      )}
                    </div>
                  </div>
                </Wrapper>
              );
            })}
          </div>
        </Container>
      </section>

      <section>
        <Container noPaddingMobile>
          <SectionHeading className="text-center">
            {t("whyUseTools")}
          </SectionHeading>
          <div className="grid gap-0 md:gap-5 md:grid-cols-3">
            {(
              [
                { key: "dataSovereignty", colorIdx: 0, shape: "cloud" },
                { key: "freeSimple", colorIdx: 2, shape: "star" },
                { key: "euAlternatives", colorIdx: 4, shape: "spark" },
              ] as const
            ).map((feature) => {
              const card = getCardColor(feature.colorIdx);
              const shapeData = shapes[feature.shape];
              return (
                <div
                  key={feature.key}
                  className={`${card.bg} md:rounded-3xl overflow-hidden`}
                >
                  <div className="relative h-28 flex items-center justify-center p-6">
                    {shapeData && (
                      <svg
                        viewBox={shapeData.viewBox}
                        className={`w-full h-full select-none animate-shape-float ${card.shapeColor}`}
                        style={{ animationDuration: "8s" }}
                        aria-hidden="true"
                      >
                        <path d={shapeData.d} fill="currentColor" />
                      </svg>
                    )}
                  </div>
                  <div className="px-5 pb-5 sm:px-6 sm:pb-6 text-center">
                    <h3
                      className={`${card.text} mb-2 font-bold text-xl`}
                    >
                      {t(`features.${feature.key}.title`)}
                    </h3>
                    <p
                      className={`${card.text} text-sm sm:text-base opacity-80`}
                    >
                      {t(`features.${feature.key}.description`)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </Container>
      </section>
    </PageLayout>
  );
}
