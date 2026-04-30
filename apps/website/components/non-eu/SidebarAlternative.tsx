import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@switch-to-eu/i18n/navigation";
import { DecorativeShape } from "@switch-to-eu/blocks/components/decorative-shape";
import { AffiliateDisclosure } from "@/components/ui/AffiliateDisclosure";
import {
  getCategorySlug,
  getOutboundUrl,
  getScreenshotUrl,
} from "@/lib/services";
import type { Guide, Service } from "@/payload-types";

type CompactService = Pick<
  Service,
  | "id"
  | "name"
  | "slug"
  | "region"
  | "location"
  | "freeOption"
  | "startingPrice"
  | "description"
  | "url"
  | "affiliateUrl"
  | "screenshot"
  | "gdprCompliance"
>;

type CompactGuide = Pick<Guide, "slug" | "category">;

export async function SidebarAlternative({
  service,
  sourceService,
  migrationGuides = [],
  otherAlternatives = [],
  categoryTitle,
  categorySlug,
}: {
  service: CompactService;
  sourceService: string;
  migrationGuides?: CompactGuide[];
  otherAlternatives?: CompactService[];
  categoryTitle?: string;
  categorySlug?: string;
}) {
  const t = await getTranslations("services.detail.nonEu.redesign.sidebar");
  const tDetail = await getTranslations("services.detail");

  const outboundUrl = getOutboundUrl(service);
  const screenshotUrl = getScreenshotUrl(service.screenshot);

  const firstGuide = migrationGuides[0];
  const firstGuideCategory = firstGuide
    ? getCategorySlug(firstGuide.category)
    : null;

  return (
    <aside className="lg:sticky lg:top-24 lg:self-start">
      <div className="bg-brand-green rounded-3xl overflow-hidden relative">
        <DecorativeShape
          shape="swirl"
          className="-top-6 -right-6 w-28 h-28"
          opacity={0.12}
          duration="11s"
          delay="-2s"
        />
        <DecorativeShape
          shape="blob"
          className="-bottom-8 -left-8 w-24 h-24"
          opacity={0.1}
          duration="14s"
          delay="-4s"
        />

        <div className="relative px-5 sm:px-6 pt-5 sm:pt-6 pb-5 sm:pb-6">
          <span className="text-brand-cream/60 text-[11px] font-semibold uppercase tracking-widest mb-2 block">
            {t("featured")}
          </span>

          <h2 className="font-heading text-2xl sm:text-3xl uppercase text-brand-yellow leading-[1.05] mb-4">
            {service.name}
          </h2>

          {screenshotUrl && (
            <div className="rounded-2xl overflow-hidden mb-4 bg-brand-cream/5">
              <Image
                src={screenshotUrl}
                alt={service.name}
                width={0}
                height={0}
                sizes="(max-width: 1024px) 100vw, 320px"
                className="w-full h-auto object-cover"
              />
            </div>
          )}

          <p className="text-brand-cream/85 text-sm mb-4 leading-relaxed">
            {service.description}
          </p>

          <div className="flex flex-wrap gap-1.5 mb-5">
            {service.location && (
              <span className="inline-flex items-center bg-white/10 text-brand-cream/90 rounded-full px-2.5 py-0.5 text-xs">
                {service.location}
              </span>
            )}
            {service.gdprCompliance === "compliant" && (
              <span className="inline-flex items-center gap-1.5 bg-white/10 text-brand-cream/90 rounded-full px-2.5 py-0.5 text-xs">
                <span aria-hidden className="w-1.5 h-1.5 rounded-full bg-brand-yellow" />
                GDPR
              </span>
            )}
            {service.freeOption && (
              <span className="inline-flex items-center bg-white/10 text-brand-cream/90 rounded-full px-2.5 py-0.5 text-xs">
                {tDetail("freeOption") || "Free plan"}
              </span>
            )}
            {service.startingPrice && (
              <span className="inline-flex items-center bg-white/10 text-brand-cream/90 rounded-full px-2.5 py-0.5 text-xs">
                {service.startingPrice}
              </span>
            )}
          </div>

          <div className="flex flex-col gap-2">
            {outboundUrl && (
              <a
                href={outboundUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center px-4 py-2.5 bg-brand-yellow text-brand-green rounded-full font-semibold text-sm hover:opacity-90 transition-opacity no-underline"
              >
                {t("tryService", { name: service.name })}{" "}
                <span aria-hidden className="ml-1.5">&rarr;</span>
              </a>
            )}

            {firstGuide && firstGuideCategory && (
              <Link
                href={`/guides/${firstGuideCategory}/${firstGuide.slug}`}
                className="inline-flex items-center justify-center px-4 py-2.5 border-2 border-brand-yellow text-brand-yellow rounded-full font-semibold text-sm hover:bg-brand-yellow hover:text-brand-green transition-colors no-underline"
              >
                {t("switchGuide", { source: sourceService })}{" "}
                <span aria-hidden className="ml-1.5">&rarr;</span>
              </Link>
            )}

            <Link
              href={`/services/eu/${service.slug}`}
              className="inline-flex items-center justify-center text-brand-cream/70 hover:text-brand-yellow text-xs sm:text-sm pt-1 transition-colors no-underline"
            >
              {t("learnMore", { name: service.name })}{" "}
              <span aria-hidden className="ml-1">&rarr;</span>
            </Link>
          </div>

          {outboundUrl && service.affiliateUrl && (
            <AffiliateDisclosure className="mt-3 text-brand-cream/40 hover:text-brand-cream/60 decoration-brand-cream/30 text-[10px]" />
          )}
        </div>

        {otherAlternatives.length > 0 && (
          <div className="relative border-t border-brand-yellow/15 px-5 sm:px-6 py-4 sm:py-5">
            <p className="text-brand-cream/55 text-[10px] font-semibold uppercase tracking-widest mb-3">
              {t("otherAlternatives")}
            </p>
            <ul className="space-y-1">
              {otherAlternatives.slice(0, 4).map((alt) => (
                <li key={alt.slug}>
                  <Link
                    href={`/services/eu/${alt.slug}`}
                    className="flex items-baseline justify-between gap-3 py-1.5 text-sm text-brand-cream/90 hover:text-brand-yellow transition-colors no-underline group"
                  >
                    <span className="font-medium">{alt.name}</span>
                    {alt.location && (
                      <span className="text-[11px] text-brand-cream/45 group-hover:text-brand-cream/70 transition-colors whitespace-nowrap">
                        {alt.location}
                      </span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
            {categoryTitle && categorySlug && (
              <Link
                href={`/services/${categorySlug}`}
                className="inline-flex items-center text-brand-yellow/80 hover:text-brand-yellow text-xs font-semibold uppercase tracking-wide mt-3 no-underline"
              >
                {t("seeAll", { category: categoryTitle })}{" "}
                <span aria-hidden className="ml-1">&rarr;</span>
              </Link>
            )}
          </div>
        )}
      </div>
    </aside>
  );
}
