import { getTranslations } from "next-intl/server";
import { Container } from "@switch-to-eu/blocks/components/container";
import { SectionHeading } from "@switch-to-eu/blocks/components/section-heading";
import { RegionBadge } from "@switch-to-eu/ui/components/region-badge";
import { Link } from "@switch-to-eu/i18n/navigation";
import { CategoryFacts } from "@/components/category/CategoryFacts";
import { getCardColor } from "@/lib/quiet-palette";
import { serviceHref, type ResolvedPick } from "@/lib/buyers-guide";
import { getCategorySlug } from "@/lib/services";
import type { CompareColumn } from "@/lib/content/types";

const FOCUS =
  "focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-green";

/**
 * Editorial picks on a buyer's-guide category: one card per need, each with
 * its reason, its trade-off and two facts from the listing.
 */
export async function CategoryPicks({
  picks,
  compare,
}: {
  picks: ResolvedPick[];
  compare: CompareColumn[];
}) {
  const t = await getTranslations("services.buyersGuide");
  const columns = picks.length >= 3 ? "lg:grid-cols-3" : "md:grid-cols-2";

  return (
    <section>
      <Container noPaddingMobile>
        <SectionHeading>{t("picksTitle")}</SectionHeading>
        <div className={`grid grid-cols-1 gap-0 md:gap-5 ${columns}`}>
          {picks.map((pick, index) => {
            const service = pick.serviceDoc;
            const listing = serviceHref(service);
            const guideHref = pick.guide
              ? `/guides/${getCategorySlug(pick.guide.category)}/${pick.guide.slug}`
              : null;
            // The first two comparison facts this listing has a value for.
            const facts = compare
              .filter((c) => service.specs?.[c.key])
              .slice(0, 2)
              .map((c) => ({ label: c.label, value: service.specs![c.key]! }));

            return (
              <article
                key={pick.service}
                className="flex flex-col overflow-hidden bg-white text-[#1a1a1a] border-y md:border border-black/10 md:rounded-3xl"
              >
                <div aria-hidden="true" className={`h-1.5 ${getCardColor(index).strip}`} />
                <div className="flex flex-col flex-1 p-6 sm:p-7">
                  <p className="mb-3">
                    <span className="inline-flex items-center rounded-full bg-brand-green/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-brand-green">
                      {pick.label}
                    </span>
                  </p>
                  <h3 className="font-heading text-2xl leading-[1.08] text-brand-green mb-2">
                    {service.name}
                  </h3>
                  <p className="flex flex-wrap items-center gap-2 text-sm mb-4">
                    <RegionBadge region={service.region} />
                    <span>{service.headquarters || service.location}</span>
                  </p>

                  <p className="leading-relaxed mb-4">{pick.reason}</p>

                  <CategoryFacts facts={facts} className="mb-4" />

                  <p className="text-sm leading-relaxed border-t border-black/10 pt-4 mb-6">
                    <strong className="font-semibold">{t("worthKnowing")}</strong>{" "}
                    {pick.tradeoff}
                  </p>

                  <div className="mt-auto flex flex-wrap items-center gap-x-5 gap-y-3">
                    <Link
                      href={guideHref ?? listing}
                      className={`inline-block rounded-full bg-brand-green px-5 py-2.5 text-sm font-semibold text-white no-underline hover:opacity-90 transition-opacity ${FOCUS}`}
                    >
                      {guideHref ? t("readGuide") : t("fullReview")}
                    </Link>
                    {guideHref && (
                      <Link
                        href={listing}
                        className={`rounded-sm text-sm font-semibold text-brand-green underline underline-offset-2 ${FOCUS}`}
                      >
                        {t("fullReview")}
                      </Link>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
