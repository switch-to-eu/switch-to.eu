import { getTranslations } from "next-intl/server";
import { Container } from "@switch-to-eu/blocks/components/container";
import { DecorativeShape } from "@switch-to-eu/blocks/components/decorative-shape";
import { RegionBadge } from "@switch-to-eu/ui/components/region-badge";
import { Link } from "@switch-to-eu/i18n/navigation";
import { CategoryFacts } from "@/components/category/CategoryFacts";
import { AffiliateDisclosure } from "@/components/ui/AffiliateDisclosure";
import { serviceHref, type ResolvedPick } from "@/lib/buyers-guide";
import { getOutboundUrl } from "@/lib/services";
import type { CompareColumn } from "@/lib/content/types";

const FOCUS =
  "focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-green";

/**
 * Header of a buyer's-guide category: the headline and intro on a green
 * anchor panel, with the top pick as a quick click-through. The full picks
 * follow below the header.
 */
export async function CategoryHeader({
  headline,
  description,
  topPick,
  compare,
}: {
  headline: string;
  description: string;
  topPick: ResolvedPick | null;
  compare: CompareColumn[];
}) {
  const t = await getTranslations("services.buyersGuide");
  const tDetail = await getTranslations("services.detail");
  const service = topPick?.serviceDoc;
  const facts = service
    ? compare
        .filter((c) => service.specs?.[c.key])
        .slice(0, 2)
        .map((c) => ({ label: c.label, value: service.specs![c.key]! }))
    : [];

  return (
    <section>
      <Container noPaddingMobile>
        <div className="relative overflow-hidden bg-brand-green md:rounded-3xl px-6 sm:px-10 md:px-14 py-9 sm:py-12">
          <DecorativeShape
            shape="sunburst"
            className="-top-16 -left-16 w-56 h-56 sm:w-72 sm:h-72"
            color="text-brand-sage"
            opacity={0.12}
            duration="14s"
          />
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            <div className="lg:col-span-7">
              <h1 className="font-heading text-brand-yellow text-4xl sm:text-5xl leading-[1.02] text-balance mb-4">
                {headline}
              </h1>
              <p className="text-white text-base sm:text-lg leading-relaxed max-w-xl">
                {description}
              </p>
            </div>

            {topPick && service && (
              <div className="lg:col-span-5 rounded-3xl bg-white p-6 sm:p-7 text-[#1a1a1a]">
                <p className="mb-3">
                  <span className="inline-flex items-center rounded-full bg-brand-green/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-brand-green">
                    {topPick.label}
                  </span>
                </p>
                <p className="flex flex-wrap items-center gap-x-3 gap-y-2 mb-1">
                  <span className="font-heading text-2xl leading-[1.08] text-brand-green">
                    {service.name}
                  </span>
                  <RegionBadge region={service.region} />
                </p>
                <p className="text-sm mb-4">{service.headquarters || service.location}</p>

                <CategoryFacts facts={facts} className="mb-5" />

                <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
                  <a
                    href={getOutboundUrl(service)}
                    target="_blank"
                    rel={service.affiliateUrl ? "sponsored noopener noreferrer" : "noopener noreferrer"}
                    className={`inline-block rounded-full bg-brand-green px-5 py-2.5 text-sm font-semibold text-white no-underline hover:opacity-90 transition-opacity ${FOCUS}`}
                  >
                    {tDetail("tryService", { service: service.name })} &rarr;
                  </a>
                  <Link
                    href={serviceHref(service)}
                    className={`rounded-sm text-sm font-semibold text-brand-green underline underline-offset-2 ${FOCUS}`}
                  >
                    {t("fullReview")}
                  </Link>
                </div>
                {service.affiliateUrl && (
                  <AffiliateDisclosure className="mt-3 text-[#1a1a1a] hover:text-[#1a1a1a] decoration-black/30" />
                )}
              </div>
            )}
          </div>
        </div>
      </Container>
    </section>
  );
}
