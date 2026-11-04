import React from "react";
import Image from "next/image";
import { RegionBadge } from "@switch-to-eu/ui/components/region-badge";
import { getTranslations } from "next-intl/server";
import { Link } from "@switch-to-eu/i18n/navigation";
import { getCardColor } from "@/lib/quiet-palette";
import { getCategorySlug, getScreenshotUrl } from "@/lib/services";
import type { Service } from "@/lib/content/types";

export type ServiceCardService = Pick<
  Service,
  | "name"
  | "slug"
  | "category"
  | "region"
  | "location"
  | "freeOption"
  | "startingPrice"
  | "description"
  | "screenshot"
  | "angle"
>;


export async function ServiceCard({
  service,
  showCategory = true,
  colorIndex = 0,
}: {
  service: ServiceCardService;
  showCategory?: boolean;
  colorIndex?: number;
}) {
  const t = await getTranslations("services");

  const categorySlug = getCategorySlug(service.category);
  const categoryFormatted =
    categorySlug.charAt(0).toUpperCase() + categorySlug.slice(1);

  const regionPath = service.region === "non-eu" ? "non-eu" : "eu";
  const serviceLink = `/services/${regionPath}/${service.slug}`;
  const screenshotUrl = getScreenshotUrl(service.screenshot);

  const card = getCardColor(colorIndex);

  return (
    <Link href={serviceLink} className="block h-full no-underline group">
      <div
        className={`${card.bg} flex flex-col h-full md:rounded-3xl overflow-hidden`}
      >
        <div aria-hidden="true" className={`h-1.5 ${card.strip}`} />
        {screenshotUrl && (
          <div className={`${card.band} relative h-36 sm:h-44 overflow-hidden`}>
            <Image
              src={screenshotUrl}
              alt={service.name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover"
            />
          </div>
        )}

        {/* Content area */}
        <div className="flex flex-col flex-1 px-5 pt-4 pb-5 sm:px-6 sm:pt-5 sm:pb-6">
          <div className="flex items-start justify-between gap-3 mb-1">
            <h3 className={`${card.text} text-lg sm:text-xl font-bold`}>
              {service.name}
            </h3>
            <RegionBadge region={service.region} />
          </div>

          {showCategory && (
            <p className={`${card.text} text-xs mb-2`}>
              {categoryFormatted}
            </p>
          )}

          {/* Compact meta row */}
          <div className={`${card.text} flex flex-wrap gap-x-3 gap-y-0.5 text-xs mb-3`}>
            <span>{service.location}</span>
            <span>{service.freeOption ? "Free tier" : "Paid"}</span>
            {service.startingPrice &&
              typeof service.startingPrice === "string" && (
                <span>{service.startingPrice}</span>
              )}
          </div>

          {service.angle && (
            <span
              className={`${card.text} block text-[11px] uppercase tracking-wider font-bold mb-1`}
            >
              {service.angle}
            </span>
          )}

          <p
            className={`${card.text} text-sm leading-relaxed line-clamp-3 mb-5`}
          >
            {service.description}
          </p>

          <div className="mt-auto">
            <span
              className={`${card.button} inline-block px-5 py-2 rounded-full text-sm font-semibold`}
            >
              {t("viewDetails")}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
