import { getTranslations } from "next-intl/server";
import { Link } from "@switch-to-eu/i18n/navigation";
import { Container } from "@switch-to-eu/blocks/components/container";
import { DecorativeShape } from "@switch-to-eu/blocks/components/decorative-shape";

import type { Category, Guide, Service } from "@/lib/content/types";

type MaybePopulated<T> = T | number | null | undefined;

function populated<T extends { slug?: string | null }>(
  value: MaybePopulated<T>
): T | null {
  return typeof value === "object" && value !== null ? value : null;
}

interface Props {
  featured: Guide | null;
  others: Guide[];
}

type ResolvedGuide = {
  slug: string;
  href: string;
  sourceName: string;
  targetName: string;
  difficulty: Guide["difficulty"];
  timeRequired: string;
  categoryTitle: string;
};

type DifficultyLabels = Record<Guide["difficulty"], string>;

function resolveGuide(guide: Guide | null): ResolvedGuide | null {
  if (!guide) return null;
  const source = populated<Service>(guide.sourceService);
  const target = populated<Service>(guide.targetService);
  const category = populated<Category>(guide.category);
  if (!source?.name || !target?.name || !category?.slug) return null;
  return {
    slug: guide.slug,
    href: `/guides/${category.slug}/${guide.slug}`,
    sourceName: source.name,
    targetName: target.name,
    difficulty: guide.difficulty,
    timeRequired: guide.timeRequired,
    categoryTitle: category.title,
  };
}

export async function FeaturedGuideHero({ featured, others }: Props) {
  const t = await getTranslations("home");

  const resolvedFeatured = resolveGuide(featured);
  const resolvedOthers = others
    .map(resolveGuide)
    .filter((g): g is ResolvedGuide => g !== null);

  const difficultyLabels: DifficultyLabels = {
    beginner: t("difficulty.beginner"),
    intermediate: t("difficulty.intermediate"),
    advanced: t("difficulty.advanced"),
  };

  return (
    <section>
      <Container noPaddingMobile>
        <div className="md:rounded-3xl overflow-hidden grid grid-cols-1 md:grid-cols-12">
          <OrientationColumn
            title={t("guidesBand.title")}
            body={t("guidesBand.body")}
            ctaLabel={t("masthead.picksLink")}
          />

          <GuidesColumn
            featured={resolvedFeatured}
            others={resolvedOthers}
            moreMigrationsLabel={t("heroMoreMigrationsLabel")}
            primaryCta={t("homeHeroPrimaryCta")}
            fallbackTitle={t("heroFallbackTitle")}
            fallbackSubtitle={t("heroFallbackSubtitle")}
            difficultyLabels={difficultyLabels}
          />
        </div>
      </Container>
    </section>
  );
}

interface OrientationColumnProps {
  title: string;
  body: string;
  ctaLabel: string;
}

/** Intro panel for the guides band (the masthead above owns the page h1). */
function OrientationColumn({ title, body, ctaLabel }: OrientationColumnProps) {
  return (
    <div className="relative bg-brand-red overflow-hidden px-6 sm:px-10 md:px-12 py-10 sm:py-12 md:py-14 md:col-span-7">
      <DecorativeShape
        shape="sunburst"
        className="-top-14 -left-10 w-40 h-40 sm:w-52 sm:h-52 md:w-60 md:h-60"
        color="text-brand-yellow"
        opacity={0.2}
        duration="13s"
      />
      <DecorativeShape
        shape="pebble"
        className="-bottom-12 -right-10 w-36 h-36 sm:w-48 sm:h-48 rotate-12"
        color="text-white"
        opacity={0.12}
        duration="15s"
        delay="-4s"
      />

      <div className="relative z-10 flex flex-col h-full">
        <h2 className="font-heading uppercase text-white leading-none text-5xl sm:text-6xl md:text-7xl">
          {title}
        </h2>

        <p className="text-white text-base sm:text-lg md:text-xl mt-5 sm:mt-6 max-w-xl leading-snug">
          {body}
        </p>

        <div className="mt-auto pt-6 sm:pt-8">
          <a
            href="#picks"
            className="inline-flex items-center gap-2 px-6 sm:px-8 py-3 bg-white text-brand-red font-semibold rounded-full hover:opacity-90 transition-opacity text-sm sm:text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-brand-red"
          >
            {ctaLabel}
            <span aria-hidden="true">→</span>
          </a>
        </div>
      </div>
    </div>
  );
}

interface GuidesColumnProps {
  featured: ResolvedGuide | null;
  others: ResolvedGuide[];
  moreMigrationsLabel: string;
  primaryCta: string;
  fallbackTitle: string;
  fallbackSubtitle: string;
  difficultyLabels: DifficultyLabels;
}

function GuidesColumn({
  featured,
  others,
  moreMigrationsLabel,
  primaryCta,
  fallbackTitle,
  fallbackSubtitle,
  difficultyLabels,
}: GuidesColumnProps) {
  return (
    <div className="relative bg-brand-sky overflow-hidden px-6 sm:px-10 md:px-12 py-8 sm:py-10 md:py-12 md:col-span-5">
      <DecorativeShape
        shape="spark"
        className="-top-10 -right-8 w-32 h-32 sm:w-44 sm:h-44"
        color="text-brand-green"
        opacity={0.1}
        duration="12s"
      />
      <DecorativeShape
        shape="blob"
        className="-bottom-16 -left-14 w-44 h-44 sm:w-56 sm:h-56"
        color="text-brand-green"
        opacity={0.08}
        duration="16s"
        delay="-6s"
      />

      <div className="relative z-10">
        {featured ? (
          <FeaturedPoster
            guide={featured}
            primaryCta={primaryCta}
            difficultyLabels={difficultyLabels}
          />
        ) : (
          <FallbackPoster title={fallbackTitle} subtitle={fallbackSubtitle} />
        )}

        {others.length > 0 && (
          <div className="mt-6 sm:mt-8 pt-5 sm:pt-6 border-t border-brand-green/15">
            <h3 className="font-heading uppercase text-brand-green text-xl sm:text-2xl mb-2 sm:mb-3">
              {moreMigrationsLabel}
            </h3>
            <ul className="flex flex-col gap-0.5">
              {others.map((guide) => (
                <li key={guide.slug}>
                  <GuideRow
                    guide={guide}
                    difficultyLabels={difficultyLabels}
                  />
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

interface FeaturedPosterProps {
  guide: ResolvedGuide;
  primaryCta: string;
  difficultyLabels: DifficultyLabels;
}

function FeaturedPoster({
  guide,
  primaryCta,
  difficultyLabels,
}: FeaturedPosterProps) {
  return (
    <div>
      <h3
        className="font-display text-brand-green uppercase"
        style={{
          fontFamily: "var(--font-anton)",
          fontWeight: 400,
          lineHeight: 0.95,
          letterSpacing: "-0.015em",
          fontSize: "clamp(1.5rem, 3.2vw, 2.75rem)",
          overflowWrap: "break-word",
        }}
      >
        {guide.sourceName}
        <span
          className="text-brand-pink mx-2 sm:mx-3 inline-block"
          aria-hidden="true"
          style={{
            fontSize: "0.75em",
            letterSpacing: "-0.03em",
            verticalAlign: "0.05em",
          }}
        >
          →
        </span>
        {guide.targetName}
      </h3>

      <div className="flex flex-wrap gap-2 mt-5 sm:mt-6">
        <Badge>{difficultyLabels[guide.difficulty]}</Badge>
        <Badge>{guide.timeRequired}</Badge>
        <Badge>{guide.categoryTitle}</Badge>
      </div>

      <div className="mt-5 sm:mt-6">
        <Link
          href={guide.href}
          className="inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 bg-brand-green text-brand-yellow font-semibold rounded-full hover:opacity-90 transition-opacity text-sm sm:text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green focus-visible:ring-offset-2 focus-visible:ring-offset-brand-sky"
        >
          {primaryCta}
          <span aria-hidden="true">→</span>
        </Link>
      </div>
    </div>
  );
}

interface GuideRowProps {
  guide: ResolvedGuide;
  difficultyLabels: DifficultyLabels;
}

function GuideRow({ guide, difficultyLabels }: GuideRowProps) {
  return (
    <Link
      href={guide.href}
      className="group flex items-center gap-3 sm:gap-4 py-3 -mx-2 px-2 sm:-mx-3 sm:px-3 rounded-xl hover:bg-brand-green/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green focus-visible:ring-offset-2 focus-visible:ring-offset-brand-sky"
    >
      <span className="flex-1 min-w-0">
        <span className="block font-heading uppercase text-brand-green font-bold text-base sm:text-lg leading-tight">
          {guide.sourceName}{" "}
          <span className="text-brand-green/50" aria-hidden="true">
            →
          </span>{" "}
          {guide.targetName}
        </span>
        <span className="block text-brand-green text-xs sm:text-sm mt-1">
          {difficultyLabels[guide.difficulty]} · {guide.timeRequired}
        </span>
      </span>
      <span
        className="text-brand-green/80 group-hover:translate-x-1 transition-transform text-lg shrink-0"
        aria-hidden="true"
      >
        →
      </span>
    </Link>
  );
}

interface FallbackPosterProps {
  title: string;
  subtitle: string;
}

function FallbackPoster({ title, subtitle }: FallbackPosterProps) {
  return (
    <div>
      <h3
        className="font-display text-brand-green uppercase"
        style={{
          fontFamily: "var(--font-anton)",
          fontWeight: 400,
          lineHeight: 0.9,
          letterSpacing: "-0.02em",
          fontSize: "clamp(2rem, 5vw, 3.5rem)",
        }}
      >
        {title}
      </h3>
      <p className="text-brand-green text-base sm:text-lg mt-6 max-w-lg leading-relaxed">
        {subtitle}
      </p>
    </div>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full bg-brand-green/10 text-brand-green px-3 py-1 text-xs sm:text-sm font-semibold uppercase tracking-wider">
      {children}
    </span>
  );
}
