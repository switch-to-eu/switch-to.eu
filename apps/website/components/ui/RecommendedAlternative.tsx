import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@switch-to-eu/i18n/navigation";
import { AffiliateDisclosure } from "@/components/ui/AffiliateDisclosure";
import { RecommendedPill } from "@/components/ui/RecommendedPill";
import {
  getCategorySlug,
  getOutboundUrl,
  getScreenshotUrl,
} from "@/lib/services";
import type { Guide, Service } from "@/lib/content/types";

export type RecommendedAlternativeService = Pick<
  Service,
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
>;

export type RecommendedAlternativeGuide = Pick<Guide, "slug" | "category">;

export async function RecommendedAlternative({
  service,
  sourceService,
  migrationGuides = [],
}: {
  service: RecommendedAlternativeService;
  sourceService: string;
  migrationGuides?: RecommendedAlternativeGuide[];
}) {
  const t = await getTranslations("services");

  const regionPath = service.region.includes("eu") ? "eu" : "non-eu";
  const outboundUrl = getOutboundUrl(service);
  const screenshotUrl = getScreenshotUrl(service.screenshot);

  return (
    <div className="bg-white border-y md:border border-black/10 md:rounded-3xl relative overflow-hidden">
      <div className={`grid grid-cols-1 ${screenshotUrl ? "md:grid-cols-2" : "md:grid-cols-[auto_1fr]"} items-center`}>
        {/* Left: content (always first) */}
        {!screenshotUrl && (
          <div className="relative w-full md:w-72 lg:w-80 flex-shrink-0 flex items-center justify-center py-10 md:py-0">
            <div
              aria-hidden="true"
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-brand-yellow/40 flex items-center justify-center text-brand-green text-3xl sm:text-4xl font-bold"
            >
              {service.name.charAt(0)}
            </div>
          </div>
        )}

        <div className="px-6 sm:px-8 md:px-10 py-8 sm:py-10 md:py-12 relative">
          <p className="mb-3">
            <RecommendedPill label={t("detail.recommendedAlternative.badge")} />
          </p>
          <h2 className="font-heading text-3xl md:text-4xl text-brand-green mb-4">
            {service.name}
          </h2>

          <p className="text-[#1a1a1a] text-base sm:text-lg mb-5 max-w-xl leading-relaxed">
            {service.description}
          </p>

          {/* Meta info */}
          <div className="flex flex-wrap gap-4 mb-6">
            {service.location && (
              <div className="flex items-center gap-1.5 text-[#1a1a1a] text-sm">
                <span className="text-brand-green">&#9679;</span>
                {service.location}
              </div>
            )}
            <div className="flex items-center gap-1.5 text-[#1a1a1a] text-sm">
              <span className="text-brand-green">&#9679;</span>
              {service.freeOption
                ? t("detail.freeOptionYes") + " " + t("detail.freeOption")
                : t("detail.freeOptionNo") + " " + t("detail.freeOption")}
            </div>
            {service.startingPrice &&
              typeof service.startingPrice === "string" && (
                <div className="flex items-center gap-1.5 text-[#1a1a1a] text-sm">
                  <span className="text-brand-green">&#9679;</span>
                  {t("detail.startingPrice")}: {service.startingPrice}
                </div>
              )}
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-3">
            {outboundUrl && (
              <a
                href={outboundUrl}
                target="_blank"
                rel={service.affiliateUrl ? "sponsored noopener noreferrer" : "noopener noreferrer"}
                className="inline-block py-2.5 px-6 bg-brand-green text-white rounded-full font-semibold text-sm hover:opacity-90 transition-opacity no-underline"
              >
                {t("detail.tryService", { service: service.name })}
              </a>
            )}

            <Link
              href={`/services/${regionPath}/${service.slug}`}
              className="inline-block py-2.5 px-6 border-2 border-brand-green text-brand-green rounded-full font-semibold text-sm hover:bg-brand-green hover:text-white transition-colors no-underline"
            >
              {t("detail.recommendedAlternative.learnMore")}
            </Link>

            {sourceService &&
              migrationGuides.map((guide) => {
                const categorySlug = getCategorySlug(guide.category);
                if (!categorySlug) return null;
                return (
                  <Link
                    key={`${categorySlug}-${guide.slug}`}
                    href={`/guides/${categorySlug}/${guide.slug}`}
                    className="inline-block py-2.5 px-6 border-2 border-brand-green text-brand-green rounded-full font-semibold text-sm hover:bg-brand-green hover:text-white transition-colors no-underline"
                  >
                    {t("detail.recommendedAlternative.migrateFrom", {
                      source: sourceService,
                      target: service.name,
                    })}
                  </Link>
                );
              })}
          </div>

          {outboundUrl && service.affiliateUrl && (
            <AffiliateDisclosure className="mt-3 text-[#1a1a1a] hover:text-[#1a1a1a] decoration-brand-cream/60" />
          )}
        </div>

        {/* Right: Screenshot */}
        {screenshotUrl && (
          <div className="flex justify-center md:justify-end p-6 md:p-8">
            <div className="relative w-full">
              <Image
                src={screenshotUrl}
                alt={service.name}
                width={0}
                height={0}
                sizes="(max-width: 768px) 100vw, 50vw"
                className="w-full h-auto object-cover rounded-2xl"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
