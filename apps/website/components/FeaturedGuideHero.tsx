import { DecorativeShape } from "@switch-to-eu/blocks/components/decorative-shape";
import { getTranslations } from "next-intl/server";
import { Link } from "@switch-to-eu/i18n/navigation";
import { Container } from "@switch-to-eu/blocks/components/container";

import type { Category, Guide, Service } from "@/lib/content/types";

type MaybePopulated<T> = T | number | null | undefined;

function populated<T extends { slug?: string | null }>(
  value: MaybePopulated<T>,
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
        <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2 px-3 md:px-0 pt-10 md:pt-0 mb-6 sm:mb-8">
          <h2 className="font-heading text-brand-green text-3xl sm:text-4xl">
            {t("guidesBand.title")}
          </h2>
          <a
            href="#picks"
            className="inline-block py-1 text-sm font-semibold text-brand-green underline underline-offset-2 hover:no-underline rounded-sm focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-green"
          >
            {t("masthead.picksLink")} →
          </a>
        </div>
        <div className="relative bg-brand-sky md:rounded-3xl overflow-hidden">
          <DecorativeShape
            shape="starburst"
            className="-top-14 -right-14 w-48 h-48 sm:w-60 sm:h-60"
            color="text-brand-green"
            opacity={0.08}
            duration="13s"
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
    <div className="relative z-10 px-6 sm:px-10 md:px-12 py-8 sm:py-10">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-y-6 md:gap-x-12">
        <div className="md:col-span-6">
          {featured ? (
            <FeaturedPoster
              guide={featured}
              primaryCta={primaryCta}
              difficultyLabels={difficultyLabels}
            />
          ) : (
            <FallbackPoster title={fallbackTitle} subtitle={fallbackSubtitle} />
          )}
        </div>

        {others.length > 0 && (
          <div className="md:col-span-6 pt-5 md:pt-0 border-t md:border-t-0 md:border-l border-brand-green/20 md:pl-12">
            <h3 className="font-heading text-brand-green text-xl sm:text-2xl mb-2 sm:mb-3">
              {moreMigrationsLabel}
            </h3>
            <ul className="flex flex-col gap-0.5">
              {others.map((guide) => (
                <li key={guide.slug}>
                  <GuideRow guide={guide} difficultyLabels={difficultyLabels} />
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
      <h3 className="font-heading text-brand-green text-3xl sm:text-4xl leading-[1.05] break-words text-balance">
        {guide.sourceName}
        <span
          className="text-brand-green/70 mx-2 sm:mx-3 inline-block"
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
          className="inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 bg-brand-green text-white font-semibold rounded-full hover:opacity-90 transition-opacity text-sm sm:text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green focus-visible:ring-offset-2 focus-visible:ring-offset-brand-sky"
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
      className="group flex items-center gap-3 sm:gap-4 py-3 -mx-2 px-2 sm:-mx-3 sm:px-3 rounded-xl hover:bg-white/40 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green focus-visible:ring-offset-2 focus-visible:ring-offset-brand-sky"
    >
      <span className="flex-1 min-w-0">
        <span className="block font-heading text-brand-green font-bold text-base sm:text-lg leading-tight">
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
      <h3 className="font-heading text-brand-green text-3xl sm:text-4xl leading-[1.05] text-balance">
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
