import React from "react";
import { RegionBadge } from "@switch-to-eu/ui/components/region-badge";
import { getTranslations } from "next-intl/server";
import { ServiceFrontmatter } from "@switch-to-eu/content";
import { Link } from "@switch-to-eu/i18n/navigation";

export async function ServiceCard({
  service,
  showCategory = true,
}: {
  service: ServiceFrontmatter;
  showCategory?: boolean;
}) {
  const t = await getTranslations("services");
  const categoryFormatted =
    service.category.charAt(0).toUpperCase() + service.category.slice(1);

  const serviceSlug = service.name.toLowerCase().replace(/\s+/g, "-");
  const regionPath = service.region === "non-eu" ? "non-eu" : "eu";
  const serviceLink = `/services/${regionPath}/${serviceSlug}`;

  return (
    <Link
      href={serviceLink}
      className="block h-full no-underline group"
    >
      <div
        className={`flex flex-col h-full rounded-3xl overflow-hidden transition-all duration-200 group-hover:shadow-md ${
          service.featured
            ? "bg-brand-sage"
            : "bg-white border border-gray-100"
        }`}
      >
        <div className="p-6 pb-3">
          <div className="flex justify-between items-start mb-1">
            <h3 className="text-xl font-semibold text-brand-green">
              {service.featured && (
                <span className="inline-block w-2 h-2 rounded-full bg-brand-yellow mr-2 align-middle" />
              )}
              {service.name}
            </h3>
            <RegionBadge region={service.region || "eu"} />
          </div>
          {showCategory && (
            <p className="text-sm text-muted-foreground">
              {t("category")}: {categoryFormatted}
            </p>
          )}
        </div>
        <div className="px-6 flex-grow pb-6">
          <div className="mb-3">
            <div className="flex flex-wrap gap-x-4 gap-y-1">
              <div className="text-sm flex items-center">
                <span className="font-medium mr-1">{t("location")}:</span>
                <span>{service.location}</span>
              </div>
              <div className="text-sm flex items-center">
                <span className="font-medium mr-1">{t("freeOption")}:</span>
                <span>{service.freeOption ? "Yes" : "No"}</span>
              </div>
              {service.startingPrice &&
                typeof service.startingPrice === "string" && (
                  <div className="text-sm flex items-center">
                    <span className="font-medium mr-1">
                      {t("detail.startingPrice")}:
                    </span>
                    <span>{service.startingPrice}</span>
                  </div>
                )}
            </div>
          </div>
          <p className="text-gray-700 text-sm sm:text-base leading-relaxed">
            {service.description}
          </p>
        </div>
      </div>
    </Link>
  );
}
