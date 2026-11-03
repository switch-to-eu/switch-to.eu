import { RegionBadge } from "@switch-to-eu/ui/components/region-badge";
import { getTranslations } from "next-intl/server";
import { MapPin } from "lucide-react";
import { Container } from "@switch-to-eu/blocks/components/container";
import { SectionHeading } from "@switch-to-eu/blocks/components/section-heading";
import { Link } from "@switch-to-eu/i18n/navigation";
import { getCardColor } from "@/lib/quiet-palette";

import type { HomepagePick } from "@/app/(frontend)/[locale]/page";

interface Props {
  picks: HomepagePick[];
}

export async function FeaturedPicksSection({ picks }: Props) {
  const t = await getTranslations("home");

  if (picks.length === 0) return null;

  return (
    <section id="picks">
      <Container noPaddingMobile>
        <SectionHeading>{t("picksSectionTitle")}</SectionHeading>

        <div className="grid gap-0 md:gap-5 sm:auto-rows-fr grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {picks.map((entry, index) => (
            <PickCard
              key={entry.category.slug}
              entry={entry}
              colorIndex={index}
              learnMoreLabel={t("picksLearnMoreCta")}
              moreInCategoryLabel={t("picksMoreInCategory", {
                category: entry.category.shortTitle,
              })}
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
  moreInCategoryLabel: string;
}

function PickCard({
  entry,
  colorIndex,
  learnMoreLabel,
  learnMoreAria,
  moreInCategoryLabel,
}: PickCardProps) {
  const { category, pick } = entry;
  const card = getCardColor(colorIndex);

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
        className={`${card.text} absolute inset-0 z-0 md:rounded-3xl focus-visible:outline-solid focus-visible:outline-4 focus-visible:-outline-offset-4 focus-visible:outline-current`}
      />

      <div className="relative z-10 pointer-events-none flex flex-col h-full">
        <div aria-hidden="true" className={`h-1.5 ${card.strip}`} />
        <div className="flex flex-col flex-1 px-5 pt-4 pb-5 sm:px-6 sm:pt-5 sm:pb-6">
          <h3
            className={`${card.text} font-heading font-bold leading-tight text-xl sm:text-2xl mb-2`}
          >
            {heading}
          </h3>

          {(location || pick) && (
            <div
              className={`${card.text} flex flex-wrap items-center gap-x-2 gap-y-1 mb-3 text-xs uppercase tracking-wider`}
            >
              {pick && <RegionBadge region={pick.region} showTooltip={false} />}
              {location && (
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" aria-hidden="true" />
                  {location}
                </span>
              )}
            </div>
          )}

          <p
            className={`${card.text} text-sm leading-relaxed line-clamp-3 mb-5`}
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
          {pick && (
            <Link
              href={categoryHref}
              className={`${card.text} pointer-events-auto relative self-start text-sm font-semibold hover:underline underline-offset-2 mt-3 py-1 rounded focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current`}
            >
              {moreInCategoryLabel} <span aria-hidden="true">→</span>
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}
