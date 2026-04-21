import { getTranslations } from "next-intl/server";
import { Link } from "@switch-to-eu/i18n/navigation";
import { Banner } from "@switch-to-eu/blocks/components/banner";
import { Container } from "@switch-to-eu/blocks/components/container";

import type { Category, Guide, Service } from "@/payload-types";

type MaybePopulated<T> = T | number | null | undefined;

function populated<T extends { slug?: string | null }>(value: MaybePopulated<T>): T | null {
  return typeof value === "object" && value !== null ? value : null;
}

interface Props {
  guide: Guide | null;
}

export async function FeaturedGuideHero({ guide }: Props) {
  const t = await getTranslations("home");

  const source = populated<Service>(guide?.sourceService);
  const target = populated<Service>(guide?.targetService);
  const category = populated<Category>(guide?.category);
  const ready = guide && source?.name && target?.name && category?.slug;

  const heroShapes = [
    {
      shape: "sunburst",
      className:
        "-top-16 -right-10 sm:-right-14 w-44 h-44 sm:w-64 sm:h-64 md:w-80 md:h-80",
      opacity: 0.18,
      duration: "14s",
    },
    {
      shape: "spark",
      className:
        "top-1/3 -right-20 w-36 h-36 sm:w-48 sm:h-48 md:w-60 md:h-60 rotate-12",
      opacity: 0.12,
      duration: "11s",
      delay: "-3s",
    },
    {
      shape: "pebble",
      className:
        "-bottom-14 -left-12 w-44 h-44 sm:w-60 sm:h-60 md:w-72 md:h-72 -rotate-12",
      opacity: 0.14,
      duration: "16s",
      delay: "-6s",
    },
  ] as const;

  return (
    <section>
      <Container noPaddingMobile>
        <Banner color="bg-brand-green" shapes={[...heroShapes]}>
          <p className="font-heading uppercase tracking-[0.2em] text-brand-yellow/80 text-xs sm:text-sm mb-8 sm:mb-10">
            {t("heroFeaturedLabel")}
          </p>

          {ready ? (
            <GuidePoster
              sourceName={source.name}
              targetName={target.name}
              difficulty={guide.difficulty}
              timeRequired={guide.timeRequired}
              categoryTitle={category.title}
              href={`/guides/${category.slug}/${guide.slug}`}
              primaryCta={t("homeHeroPrimaryCta")}
              secondaryCta={t("homeHeroSecondaryCta")}
              difficultyLabels={{
                beginner: t("difficulty.beginner"),
                intermediate: t("difficulty.intermediate"),
                advanced: t("difficulty.advanced"),
              }}
            />
          ) : (
            <FallbackPoster
              headlineLines={[
                t("heroFallbackLine1"),
                t("heroFallbackLine2"),
                t("heroFallbackLine3"),
              ]}
              subtitle={t("heroFallbackSubtitle")}
              ctaLabel={t("homeHeroSecondaryCta")}
            />
          )}
        </Banner>
      </Container>
    </section>
  );
}

interface GuidePosterProps {
  sourceName: string;
  targetName: string;
  difficulty: Guide["difficulty"];
  timeRequired: string;
  categoryTitle: string;
  href: string;
  primaryCta: string;
  secondaryCta: string;
  difficultyLabels: Record<Guide["difficulty"], string>;
}

function GuidePoster({
  sourceName,
  targetName,
  difficulty,
  timeRequired,
  categoryTitle,
  href,
  primaryCta,
  secondaryCta,
  difficultyLabels,
}: GuidePosterProps) {
  return (
    <>
      <h1
        className="font-display text-brand-yellow uppercase"
        style={{
          fontFamily: "var(--font-anton)",
          fontWeight: 400,
          lineHeight: 0.88,
          letterSpacing: "-0.02em",
          fontSize: "clamp(2.75rem, 13vw, 11rem)",
          overflowWrap: "anywhere",
        }}
      >
        <span className="block">{sourceName}</span>
        <span
          className="block text-brand-sky"
          aria-hidden="true"
          style={{
            fontSize: "clamp(2rem, 9vw, 7rem)",
            lineHeight: 0.7,
            letterSpacing: "-0.04em",
            marginTop: "0.1em",
            marginBottom: "0.05em",
          }}
        >
          →
        </span>
        <span className="block">{targetName}</span>
      </h1>

      <div className="flex flex-wrap gap-2 sm:gap-3 mt-8 sm:mt-10 md:mt-12">
        <Badge>{difficultyLabels[difficulty]}</Badge>
        <Badge>{timeRequired}</Badge>
        <Badge>{categoryTitle}</Badge>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-10 sm:mt-12">
        <Link
          href={href}
          className="inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 bg-brand-yellow text-brand-green font-semibold rounded-full hover:opacity-90 transition-opacity text-sm sm:text-base"
        >
          {primaryCta}
          <span aria-hidden="true">→</span>
        </Link>
        <a
          href="#categories"
          className="inline-flex items-center justify-center px-6 sm:px-8 py-3 border border-brand-yellow text-brand-yellow font-semibold rounded-full hover:bg-brand-yellow hover:text-brand-green transition-colors text-sm sm:text-base"
        >
          {secondaryCta}
        </a>
      </div>
    </>
  );
}

interface FallbackPosterProps {
  headlineLines: [string, string, string];
  subtitle: string;
  ctaLabel: string;
}

function FallbackPoster({ headlineLines, subtitle, ctaLabel }: FallbackPosterProps) {
  return (
    <>
      <h1
        className="font-display text-brand-yellow uppercase"
        style={{
          fontFamily: "var(--font-anton)",
          fontWeight: 400,
          lineHeight: 0.88,
          letterSpacing: "-0.02em",
          fontSize: "clamp(2.75rem, 13vw, 11rem)",
        }}
      >
        {headlineLines.map((line, index) => (
          <span key={index} className="block">
            {line}
          </span>
        ))}
      </h1>

      <p className="text-brand-cream text-base sm:text-lg mt-8 sm:mt-10 max-w-xl">
        {subtitle}
      </p>

      <div className="mt-10 sm:mt-12">
        <a
          href="#categories"
          className="inline-flex items-center justify-center px-6 sm:px-8 py-3 bg-brand-yellow text-brand-green font-semibold rounded-full hover:opacity-90 transition-opacity text-sm sm:text-base"
        >
          {ctaLabel}
        </a>
      </div>
    </>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full bg-brand-yellow/15 text-brand-yellow px-4 py-1.5 text-xs sm:text-sm font-semibold uppercase tracking-wider">
      {children}
    </span>
  );
}
