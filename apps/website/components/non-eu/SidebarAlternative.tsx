import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@switch-to-eu/i18n/navigation";
import { AffiliateDisclosure } from "@/components/ui/AffiliateDisclosure";
import {
  getCategorySlug,
  getOutboundUrl,
  getScreenshotUrl,
} from "@/lib/services";
import type { Guide, Service } from "@/lib/content/types";

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
      <div className="bg-white border border-black/10 rounded-3xl overflow-hidden relative">

        <div className="relative px-5 sm:px-6 pt-5 sm:pt-6 pb-5 sm:pb-6">
          <span className="text-[#1a1a1a] text-[11px] font-semibold uppercase tracking-widest mb-2 block">
            {t("featured")}
          </span>

          <h2 className="font-heading text-2xl sm:text-3xl text-brand-green leading-[1.05] mb-4">
            {service.name}
          </h2>

          {screenshotUrl && (
            <div className="rounded-2xl overflow-hidden mb-4 bg-black/5">
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

          <p className="text-[#1a1a1a] text-sm mb-4 leading-relaxed">
            {service.description}
          </p>

          <div className="flex flex-wrap gap-1.5 mb-5">
            {service.location && (
              <span className="inline-flex items-center bg-black/5 text-[#1a1a1a] rounded-full px-2.5 py-0.5 text-xs">
                {service.location}
              </span>
            )}
            {service.gdprCompliance === "compliant" && (
              <span className="inline-flex items-center gap-1.5 bg-black/5 text-[#1a1a1a] rounded-full px-2.5 py-0.5 text-xs">
                <span aria-hidden className="w-1.5 h-1.5 rounded-full bg-brand-yellow" />
                {tDetail("gdprCompliant")}
              </span>
            )}
            {service.freeOption && (
              <span className="inline-flex items-center bg-black/5 text-[#1a1a1a] rounded-full px-2.5 py-0.5 text-xs">
                {tDetail("freeOption") || "Free plan"}
              </span>
            )}
            {service.startingPrice && (
              <span className="inline-flex items-center bg-black/5 text-[#1a1a1a] rounded-full px-2.5 py-0.5 text-xs">
                {service.startingPrice}
              </span>
            )}
          </div>

          <div className="flex flex-col gap-2">
            {outboundUrl && (
              <a
                href={outboundUrl}
                target="_blank"
                rel={service.affiliateUrl ? "sponsored noopener noreferrer" : "noopener noreferrer"}
                className="inline-flex items-center justify-center px-4 py-2.5 bg-brand-green text-white rounded-full font-semibold text-sm hover:opacity-90 transition-opacity no-underline"
              >
                {t("tryService", { name: service.name })}{" "}
                <span aria-hidden className="ml-1.5">&rarr;</span>
              </a>
            )}

            {firstGuide && firstGuideCategory && (
              <Link
                href={`/guides/${firstGuideCategory}/${firstGuide.slug}`}
                className="inline-flex items-center justify-center px-4 py-2.5 border-2 border-brand-green text-brand-green rounded-full font-semibold text-sm hover:bg-brand-green hover:text-white transition-colors no-underline"
              >
                {t("switchGuide", { source: sourceService })}{" "}
                <span aria-hidden className="ml-1.5">&rarr;</span>
              </Link>
            )}

            <Link
              href={`/services/eu/${service.slug}`}
              className="inline-flex items-center justify-center text-[#1a1a1a] hover:text-brand-green text-xs sm:text-sm py-1.5 transition-colors underline underline-offset-2 decoration-brand-cream/50 hover:decoration-current"
            >
              {t("learnMore", { name: service.name })}{" "}
              <span aria-hidden className="ml-1">&rarr;</span>
            </Link>
          </div>

          {outboundUrl && service.affiliateUrl && (
            <AffiliateDisclosure className="mt-3 text-[#1a1a1a] hover:text-[#1a1a1a] decoration-brand-cream/60" />
          )}
        </div>

        {otherAlternatives.length > 0 && (
          <div className="relative border-t border-brand-green/15 px-5 sm:px-6 py-4 sm:py-5">
            <p className="text-[#1a1a1a] text-[10px] font-semibold uppercase tracking-widest mb-3">
              {t("otherAlternatives")}
            </p>
            <ul className="space-y-1">
              {otherAlternatives.slice(0, 4).map((alt) => (
                <li key={alt.slug}>
                  <Link
                    href={`/services/eu/${alt.slug}`}
                    className="flex items-baseline justify-between gap-3 py-1.5 text-sm text-[#1a1a1a] hover:text-brand-green transition-colors no-underline group"
                  >
                    <span className="font-medium">{alt.name}</span>
                    {alt.location && (
                      <span className="text-[11px] text-[#1a1a1a] group-hover:text-[#1a1a1a] transition-colors whitespace-nowrap">
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
                className="inline-flex items-center text-brand-green/80 hover:text-brand-green text-xs font-semibold uppercase tracking-wide mt-3 no-underline"
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
