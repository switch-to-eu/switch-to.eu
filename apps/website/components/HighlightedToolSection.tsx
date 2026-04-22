import { getTranslations } from "next-intl/server";
import { ArrowUpRightIcon } from "lucide-react";
import { Banner } from "@switch-to-eu/blocks/components/banner";
import { Container } from "@switch-to-eu/blocks/components/container";
import { getToolIcon } from "@switch-to-eu/blocks/data/tool-icons";
import type { Tool } from "@switch-to-eu/blocks/data/tools";
import {
  BRAND_COLORS,
  TOOL_SCHEMES,
  getToolCardColor,
} from "@switch-to-eu/ui/lib/tool-colors";

interface Props {
  tool: Tool;
  /** Optional tagline override — falls back to tool.description */
  tagline?: string;
}

export async function HighlightedToolSection({ tool, tagline }: Props) {
  const t = await getTranslations("home");

  const scheme = TOOL_SCHEMES[tool.id];
  const card = getToolCardColor(tool.id);
  const accent = scheme ? BRAND_COLORS[scheme.accent] : BRAND_COLORS.yellow;
  const primary = scheme ? BRAND_COLORS[scheme.primary] : BRAND_COLORS.green;

  let hostHint: string | null = null;
  try {
    hostHint = new URL(tool.url).host.replace(/^www\./, "");
  } catch {
    hostHint = null;
  }

  const Icon = getToolIcon(tool.icon);
  const description = tagline ?? tool.description;
  const isActive = tool.status === "active";

  const ctaLabel = t("highlightedToolCta", { tool: tool.name });
  const ariaLabel = t("highlightedToolAria", { tool: tool.name });

  return (
    <section>
      <Container noPaddingMobile>
        <Banner
          color={card.bg}
          className="group"
          shapes={[
            {
              shape: "pebble",
              className:
                "-top-8 -right-6 w-28 h-28 sm:w-32 sm:h-32 md:w-36 md:h-36",
              color: card.shapeColor,
              opacity: 0.22,
              duration: "11s",
            },
            {
              shape: "spark",
              className:
                "-bottom-6 -left-4 w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24",
              color: card.shapeColor,
              opacity: 0.25,
              duration: "9s",
              delay: "-3s",
            },
          ]}
        >
          {isActive && (
            <a
              href={tool.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={ariaLabel}
              className="absolute inset-0 z-0 md:rounded-3xl focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-white"
            />
          )}

          <div className="pointer-events-none relative grid gap-7 sm:gap-8 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <div className="mb-5 inline-flex items-center gap-3">
                <span
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full sm:h-12 sm:w-12"
                  style={{
                    backgroundColor: accent.value,
                    color: primary.value,
                  }}
                >
                  <Icon className="h-5 w-5 sm:h-6 sm:w-6" aria-hidden="true" />
                </span>
                <span
                  className={`font-heading text-xs uppercase tracking-[0.18em] sm:text-sm ${card.text} opacity-80`}
                >
                  {t("highlightedToolKicker")}
                </span>
              </div>

              <h2
                className={`font-heading text-3xl uppercase leading-[1.05] sm:text-4xl md:text-5xl mb-3 ${card.text}`}
              >
                {tool.name}
              </h2>

              <p
                className={`max-w-xl text-base sm:text-lg ${card.text} opacity-85`}
              >
                {description}
              </p>
            </div>

            <div className="flex flex-col items-start gap-3 justify-self-start md:items-end md:justify-self-end">
              {isActive ? (
                <>
                  <span
                    className={`inline-flex items-center gap-3 rounded-full px-9 py-4 font-heading text-base uppercase tracking-[0.12em] transition-transform duration-200 ease-out group-hover:scale-105 group-active:scale-95 motion-reduce:group-hover:scale-100 motion-reduce:group-active:scale-100 sm:px-10 sm:py-5 sm:text-lg ${card.button}`}
                  >
                    {ctaLabel}
                    <ArrowUpRightIcon
                      className="h-5 w-5 transition-transform duration-200 ease-out group-hover:translate-x-0.5 group-hover:-translate-y-0.5 motion-reduce:group-hover:translate-x-0 motion-reduce:group-hover:translate-y-0 sm:h-6 sm:w-6"
                      aria-hidden="true"
                    />
                  </span>
                  {hostHint && (
                    <span
                      className={`font-heading text-[0.65rem] uppercase tracking-[0.2em] sm:text-xs ${card.text} opacity-70`}
                    >
                      {hostHint}
                    </span>
                  )}
                </>
              ) : (
                <span
                  className={`inline-flex items-center rounded-full px-5 py-2 text-xs font-medium italic ${card.text} bg-white/15`}
                >
                  {t("highlightedToolComingSoon")}
                </span>
              )}
            </div>
          </div>
        </Banner>
      </Container>
    </section>
  );
}
