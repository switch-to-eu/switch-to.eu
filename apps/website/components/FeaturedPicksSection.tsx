import { getTranslations } from "next-intl/server";
import { MapPin } from "lucide-react";
import { Container } from "@switch-to-eu/blocks/components/container";
import { SectionHeading } from "@switch-to-eu/blocks/components/section-heading";
import { shapes } from "@switch-to-eu/blocks/shapes";
import { Link } from "@switch-to-eu/i18n/navigation";
import { getCardColor } from "@switch-to-eu/ui/lib/brand-palette";

import type { HomepagePick } from "@/app/(frontend)/[locale]/page";

const PICK_SHAPES = [
  "spark",
  "cloud",
  "tulip",
  "pebble",
  "heart",
  "sunburst",
  "flower",
  "starburst",
];

interface Props {
  picks: HomepagePick[];
}

export async function FeaturedPicksSection({ picks }: Props) {
  const t = await getTranslations("home");

  if (picks.length === 0) return null;

  return (
    <section id="picks">
      <Container noPaddingMobile>
        <SectionHeading className="mb-2 sm:mb-3">
          {t("picksSectionTitle")}
        </SectionHeading>
        <p className="text-brand-green/75 text-base sm:text-lg max-w-xl mb-6 sm:mb-8 px-3 md:px-0">
          {t("picksSectionSubtitle")}
        </p>

        <div className="grid gap-0 md:gap-5 auto-rows-fr grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {picks.map((entry, index) => (
            <PickCard
              key={entry.category.slug}
              entry={entry}
              colorIndex={index}
              learnMoreLabel={t("picksLearnMoreCta")}
              learnMoreAria={
                entry.pick
                  ? t("picksLearnMoreAria", { name: entry.pick.name })
                  : entry.category.title
              }
            />
          ))}
        </div>
      </Container>
    </section>
  );
}

interface PickCardProps {
  entry: HomepagePick;
  colorIndex: number;
  learnMoreLabel: string;
  learnMoreAria: string;
}

function PickCard({
  entry,
  colorIndex,
  learnMoreLabel,
  learnMoreAria,
}: PickCardProps) {
  const { category, pick } = entry;
  const card = getCardColor(colorIndex);
  const shapeName = PICK_SHAPES[colorIndex % PICK_SHAPES.length]!;
  const shapeData = shapes[shapeName];

  const categoryHref = `/services/${category.slug}`;
  const primaryHref = pick ? `/services/eu/${pick.slug}` : categoryHref;

  // Lead with the service (the actual pick); category is context, not the subject.
  const heading = pick?.name ?? category.title;
  const description = pick?.description ?? category.description;
  const location = pick?.location;

  return (
    <article
      className={`${card.bg} relative flex flex-col h-full md:rounded-3xl overflow-hidden group`}
    >
      {/* Stretched primary link — whole card clicks through to the service page. */}
      <Link
        href={primaryHref}
        aria-label={learnMoreAria}
        className="absolute inset-0 z-0 md:rounded-3xl focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-brand-green"
      />

      <div className="relative z-10 pointer-events-none flex flex-col h-full">
        {shapeData && (
          <div className="relative h-28 sm:h-32 md:h-36 flex items-center justify-center p-5 sm:p-6">
            <svg
              viewBox={shapeData.viewBox}
              className={`w-full h-full select-none animate-shape-float ${card.shapeColor}`}
              style={{
                animationDuration: `${6 + (colorIndex % 4) * 1.5}s`,
                animationDelay: `${(colorIndex % 4) * -1.5}s`,
              }}
              aria-hidden="true"
            >
              <path d={shapeData.d} fill="currentColor" />
            </svg>
          </div>
        )}

        <div className="flex flex-col flex-1 px-5 pb-5 sm:px-6 sm:pb-6">
          {pick && (
            <Link
              href={categoryHref}
              className={`${card.text} pointer-events-auto relative self-start font-heading uppercase tracking-[0.14em] text-xs opacity-70 hover:opacity-100 mb-2 inline-flex items-center gap-1 transition-opacity focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-green rounded`}
            >
              {category.title}
              <span aria-hidden="true">→</span>
            </Link>
          )}

          <h3
            className={`${card.text} font-heading uppercase font-bold leading-tight text-xl sm:text-2xl mb-2`}
          >
            {heading}
          </h3>

          {location && (
            <div
              className={`${card.text} inline-flex items-center gap-1.5 mb-3 text-xs uppercase tracking-wider`}
            >
              <MapPin className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{location}</span>
            </div>
          )}

          <p
            className={`${card.text} text-sm opacity-80 leading-relaxed line-clamp-3 mb-4`}
          >
            {description}
          </p>

          <span
            className={`${card.button} mt-auto self-start inline-flex items-center gap-2 px-5 py-2 rounded-full text-sm font-semibold`}
          >
            {learnMoreLabel}
            <span
              aria-hidden="true"
              className="group-hover:translate-x-0.5 transition-transform"
            >
              →
            </span>
          </span>
        </div>
      </div>
    </article>
  );
}
