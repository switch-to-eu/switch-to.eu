import React from "react";
import { RegionBadge } from "@switch-to-eu/ui/components/region-badge";
import { getTranslations } from "next-intl/server";
import { Link } from "@switch-to-eu/i18n/navigation";
import { getCardColor } from "@switch-to-eu/ui/lib/brand-palette";
import { shapes } from "@switch-to-eu/blocks/shapes";

/**
 * Service data shape compatible with Payload CMS Service documents.
 * Accepts both resolved relationship objects and raw values.
 */
export interface ServiceCardData {
  name: string;
  slug?: string;
  category: string | { slug: string; title?: string };
  region?: "eu" | "non-eu" | "eu-friendly" | null;
  location: string;
  freeOption?: boolean | null;
  startingPrice?: string | null;
  description: string;
  url: string;
  screenshot?: string | { url?: string | null } | null;
  features?: Array<{ feature: string }> | string[] | null;
  tags?: Array<{ tag: string }> | string[] | null;
}

const SERVICE_SHAPES = [
  "spark",
  "cloud",
  "tulip",
  "pebble",
  "heart",
  "sunburst",
  "flower",
  "starburst",
  "coral",
  "diamond-4",
  "daisy",
  "star",
];

export async function ServiceCard({
  service,
  showCategory = true,
  colorIndex = 0,
}: {
  service: ServiceCardData;
  showCategory?: boolean;
  colorIndex?: number;
}) {
  const t = await getTranslations("services");

  const categorySlug =
    typeof service.category === "object"
      ? service.category.slug
      : service.category;
  const categoryFormatted =
    categorySlug.charAt(0).toUpperCase() + categorySlug.slice(1);

  const serviceSlug = service.slug ?? service.name.toLowerCase().replace(/\s+/g, "-");
  const regionPath = service.region === "non-eu" ? "non-eu" : "eu";
  const serviceLink = `/services/${regionPath}/${serviceSlug}`;

  // Resolve screenshot URL (Payload Media object or plain string)
  const screenshotUrl =
    typeof service.screenshot === "object" && service.screenshot !== null
      ? service.screenshot.url ?? undefined
      : service.screenshot ?? undefined;

  const card = getCardColor(colorIndex);
  const shapeName = SERVICE_SHAPES[colorIndex % SERVICE_SHAPES.length]!;
  const shapeData = shapes[shapeName];

  return (
    <Link href={serviceLink} className="block h-full no-underline group">
      <div
        className={`${card.bg} flex flex-col h-full md:rounded-3xl overflow-hidden`}
      >
        {/* Visual area: screenshot or decorative shape */}
        <div className="relative h-36 sm:h-44 flex items-center justify-center overflow-hidden">
          {screenshotUrl ? (
            <img
              src={screenshotUrl}
              alt={service.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center p-8 sm:p-10">
              {shapeData && (
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
              )}
            </div>
          )}
          {/* Region badge floated top-right */}
          <div className="absolute top-3 right-3">
            <RegionBadge region={service.region || "eu"} />
          </div>
        </div>

        {/* Content area */}
        <div className="flex flex-col flex-1 px-5 pt-4 pb-5 sm:px-6 sm:pt-5 sm:pb-6">
          <h3 className={`${card.text} text-lg sm:text-xl font-bold mb-1`}>
            {service.name}
          </h3>

          {showCategory && (
            <p className={`${card.text} text-xs opacity-60 mb-2`}>
              {categoryFormatted}
            </p>
          )}

          {/* Compact meta row */}
          <div className={`${card.text} flex flex-wrap gap-x-3 gap-y-0.5 text-xs opacity-70 mb-3`}>
            <span>{service.location}</span>
            <span>{service.freeOption ? "Free tier" : "Paid"}</span>
            {service.startingPrice &&
              typeof service.startingPrice === "string" && (
                <span>{service.startingPrice}</span>
              )}
          </div>

          <p
            className={`${card.text} text-sm opacity-80 leading-relaxed line-clamp-3 mb-5`}
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
