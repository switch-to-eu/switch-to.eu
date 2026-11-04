import { getLocale, getTranslations } from "next-intl/server";
import { Banner } from "@switch-to-eu/blocks/components/banner";
import { Container } from "@switch-to-eu/blocks/components/container";
import { getToolIcon } from "@switch-to-eu/blocks/data/tool-icons";
import { getToolUrl, type Tool } from "@switch-to-eu/blocks/data/tools";
import { BRAND_COLORS, TOOL_SCHEMES } from "@switch-to-eu/ui/lib/tool-colors";

interface Props {
  tool: Tool;
  /** Optional tagline override — falls back to tool.description */
  tagline?: string;
}

export async function HighlightedToolSection({ tool, tagline }: Props) {
  const t = await getTranslations("home");
  const locale = await getLocale();
  const toolHref = getToolUrl(tool, locale);

  const scheme = TOOL_SCHEMES[tool.id];
  const primary = scheme ? BRAND_COLORS[scheme.primary] : BRAND_COLORS.green;
  // The tool's own world: its surface colour as the panel, its primary as a
  // tone-on-tone shape, brand green for the heading and the action. The
  // composed bg-/text-brand-* classes are emitted because every brand colour
  // is written out literally in lib/quiet-palette.ts.
  const surface = scheme ? BRAND_COLORS[scheme.surface] : BRAND_COLORS.yellow;
  const card = {
    text: "text-[#1a1a1a]",
    button: "bg-brand-green text-white",
  };

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
          color={`bg-${surface.tw}`}
          className="group"
          shapes={[
            {
              shape: "sunburst",
              className: "-right-16 -bottom-24 w-72 h-72 sm:w-96 sm:h-96",
              color: `text-${primary.tw}`,
              opacity: 0.22,
              duration: "14s",
            },
          ]}
        >
          {isActive && (
            <a
              href={toolHref}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={ariaLabel}
              className="absolute inset-0 z-0 md:rounded-3xl focus-visible:outline-solid focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-brand-green"
            />
          )}

          <div className="pointer-events-none relative z-10 grid gap-7 sm:gap-8 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <div className="mb-5 inline-flex items-center gap-3">
                <span
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white sm:h-14 sm:w-14"
                  style={{ color: primary.value }}
                >
                  <Icon className="h-6 w-6 sm:h-7 sm:w-7" aria-hidden="true" />
                </span>
              </div>

              <h2 className="font-heading text-4xl leading-[1.02] sm:text-5xl md:text-6xl mb-4 text-brand-green">
                {tool.name}
              </h2>

              <p
                className={`max-w-xl text-lg sm:text-xl leading-relaxed ${card.text}`}
              >
                {description}
              </p>
            </div>

            <div className="flex flex-col items-start gap-3 justify-self-start md:items-end md:justify-self-end">
              {isActive ? (
                <>
                  <span
                    className={`inline-flex items-center gap-3 rounded-full px-7 py-3 text-base font-semibold transition-transform duration-200 ease-out group-hover:scale-105 group-active:scale-95 motion-reduce:group-hover:scale-100 motion-reduce:group-active:scale-100 sm:px-8 sm:py-3.5 ${card.button}`}
                  >
                    {ctaLabel}
                  </span>
                  {hostHint && (
                    <span
                      className={`font-heading text-[0.65rem] tracking-[0.2em] sm:text-xs ${card.text}`}
                    >
                      {hostHint}
                    </span>
                  )}
                </>
              ) : (
                <span
                  className={`inline-flex items-center rounded-full px-5 py-2 text-xs font-medium italic ${card.text} bg-black/5`}
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
