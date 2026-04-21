import { getTranslations } from "next-intl/server";
import { Container } from "@switch-to-eu/blocks/components/container";
import { SectionHeading } from "@switch-to-eu/blocks/components/section-heading";
import { shapes } from "@switch-to-eu/blocks/shapes";

const PLACEHOLDER_SHAPES = ["petal", "scallop", "wave"] as const;

export async function ArticlesSection() {
  const t = await getTranslations("home");

  return (
    <section>
      <Container noPaddingMobile>
        <SectionHeading>{t("articlesSectionTitle")}</SectionHeading>
        <p className="px-3 md:px-0 max-w-2xl text-brand-green/70 text-base sm:text-lg leading-relaxed mb-8 sm:mb-10">
          {t("articlesSectionIntro")}
        </p>
        <div
          className="grid gap-0 md:gap-5 auto-rows-fr grid-cols-1 sm:grid-cols-2 md:grid-cols-3"
          role="list"
        >
          {PLACEHOLDER_SHAPES.map((shapeName, index) => (
            <ArticlePlaceholder
              key={shapeName}
              shape={shapeName}
              index={index}
              comingSoonLabel={t("articlesComingSoon")}
              placeholderTitle={t("articlesPlaceholderTitle")}
              placeholderBody={t("articlesPlaceholderBody")}
            />
          ))}
        </div>
      </Container>
    </section>
  );
}

interface ArticlePlaceholderProps {
  shape: string;
  index: number;
  comingSoonLabel: string;
  placeholderTitle: string;
  placeholderBody: string;
}

function ArticlePlaceholder({
  shape,
  index,
  comingSoonLabel,
  placeholderTitle,
  placeholderBody,
}: ArticlePlaceholderProps) {
  const shapeData = shapes[shape];
  return (
    <div
      role="listitem"
      aria-disabled="true"
      className="h-full flex flex-col overflow-hidden bg-brand-cream md:rounded-3xl border border-brand-green/10"
    >
      <div className="relative h-40 sm:h-48 flex items-center justify-center p-4 sm:p-6 text-brand-green/30">
        {shapeData && (
          <svg
            viewBox={shapeData.viewBox}
            className="w-full h-full select-none animate-shape-float"
            style={{
              animationDuration: `${7 + (index % 3) * 1.5}s`,
              animationDelay: `${index * -1.8}s`,
            }}
            aria-hidden="true"
          >
            <path d={shapeData.d} fill="currentColor" />
          </svg>
        )}
      </div>
      <div className="flex flex-col flex-1 px-5 pb-5 sm:px-6 sm:pb-6">
        <span className="inline-flex self-start items-center rounded-full bg-brand-green/10 text-brand-green px-3 py-1 text-xs font-semibold uppercase tracking-wider mb-3">
          {comingSoonLabel}
        </span>
        <h3 className="text-brand-green mb-2 font-bold text-lg sm:text-xl">
          {placeholderTitle}
        </h3>
        <p className="text-brand-green/70 text-sm sm:text-base leading-relaxed">
          {placeholderBody}
        </p>
      </div>
    </div>
  );
}
