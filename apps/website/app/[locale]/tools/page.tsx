import { Metadata } from "next";
import Image from "next/image";
import { getLocale, getTranslations } from "next-intl/server";
import { generateLanguageAlternates } from "@switch-to-eu/i18n/utils";
import { getAllToolsSorted } from "@switch-to-eu/blocks/data/tools";
import { getCardColor } from "@switch-to-eu/ui/lib/brand-palette";
import {
  ArrowUpRightIcon,
  GlobeIcon,
  CalendarIcon,
  ListChecksIcon,
  TargetIcon,
  FileLock2Icon,
  BrainIcon,
  KanbanSquareIcon,
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
  "kanban-square": KanbanSquareIcon,
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
  const tools = getAllToolsSorted();

  return (
    <div className="flex flex-col gap-8 sm:gap-12 py-6 md:gap-20 md:py-12">
      <section>
        <div className="container max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="flex flex-col items-center text-center mb-8 sm:mb-12">
            <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl uppercase text-brand-green mb-4">
              {t("title")}
            </h1>
            <p className="text-base sm:text-lg text-brand-green/60 max-w-2xl">
              {t("description")}
            </p>
          </div>

          <div className="grid gap-5 sm:gap-6 md:grid-cols-2">
            {tools.map((tool, index) => {
              const Icon = tool.icon ? iconMap[tool.icon] : undefined;
              const isActive = tool.status === "active";
              const Wrapper = isActive ? "a" : "div";
              const wrapperProps = isActive
                ? {
                    href: tool.url,
                    target: "_blank" as const,
                    rel: "noopener noreferrer",
                  }
                : {};
              const card = getCardColor(index);
              const shape = TOOL_SHAPES[index % TOOL_SHAPES.length]!;

              return (
                <Wrapper
                  key={tool.id}
                  {...wrapperProps}
                  className={`group ${card.bg} rounded-3xl overflow-hidden transition-all duration-200 ${
                    isActive
                      ? "hover:shadow-lg hover:scale-[1.02] cursor-pointer"
                      : "opacity-60"
                  }`}
                >
                  {/* Decorative shape area */}
                  <div className="relative h-32 sm:h-36 flex items-center justify-center">
                    <Image
                      src={`/images/shapes/${shape}.svg`}
                      alt=""
                      fill
                      className="object-contain p-8 sm:p-10 select-none animate-shape-float"
                      style={{
                        filter: card.shapeFilter,
                        animationDuration: `${6 + (index % 4) * 1.5}s`,
                        animationDelay: `${(index % 4) * -1.5}s`,
                      }}
                      aria-hidden="true"
                      unoptimized
                    />
                    {/* Icon badge */}
                    {Icon && (
                      <div className="absolute top-4 left-4">
                        <div
                          className={`${card.button} w-10 h-10 rounded-full flex items-center justify-center`}
                        >
                          <Icon className="w-5 h-5" />
                        </div>
                      </div>
                    )}
                    {!isActive && (
                      <div className="absolute top-4 right-4">
                        <span
                          className={`${card.text} text-xs font-medium italic opacity-70 bg-white/20 px-3 py-1 rounded-full`}
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
                          className={`${card.text} text-xl sm:text-2xl font-bold mb-2`}
                        >
                          {t(
                            `items.${i18nKeyMap[tool.id] ?? tool.id}.title`
                          )}
                        </h2>
                        <p
                          className={`${card.text} text-sm sm:text-base opacity-80 leading-relaxed`}
                        >
                          {t(
                            `items.${i18nKeyMap[tool.id] ?? tool.id}.description`
                          )}
                        </p>
                      </div>
                      {isActive && (
                        <ArrowUpRightIcon
                          className={`${card.text} w-5 h-5 flex-shrink-0 mt-1 opacity-50 group-hover:opacity-100 transition-opacity`}
                        />
                      )}
                    </div>
                  </div>
                </Wrapper>
              );
            })}
          </div>
        </div>
      </section>

      <section>
        <div className="container max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl uppercase text-brand-green mb-8 text-center">
            {t("whyUseTools")}
          </h2>
          <div className="grid gap-5 sm:gap-6 md:grid-cols-3">
            {(
              [
                { key: "dataSovereignty", colorIdx: 0, shape: "cloud" },
                { key: "freeSimple", colorIdx: 2, shape: "star" },
                { key: "euAlternatives", colorIdx: 4, shape: "spark" },
              ] as const
            ).map((feature) => {
              const card = getCardColor(feature.colorIdx);
              return (
                <div
                  key={feature.key}
                  className={`${card.bg} rounded-3xl overflow-hidden`}
                >
                  <div className="relative h-28 flex items-center justify-center">
                    <Image
                      src={`/images/shapes/${feature.shape}.svg`}
                      alt=""
                      fill
                      className="object-contain p-6 select-none animate-shape-float"
                      style={{
                        filter: card.shapeFilter,
                        animationDuration: "8s",
                      }}
                      aria-hidden="true"
                      unoptimized
                    />
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
        </div>
      </section>
    </div>
  );
}
