import React from "react";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@switch-to-eu/i18n/navigation";
import { ServiceFrontmatter } from "@switch-to-eu/content/schemas";

interface MigrationGuide {
  category: string;
  slug: string;
}

export async function RecommendedAlternative({
  service,
  sourceService,
  migrationGuides = [],
}: {
  service: ServiceFrontmatter;
  sourceService: string;
  migrationGuides: MigrationGuide[];
}) {
  if (!service) return null;
  const t = await getTranslations("services");

  const serviceSlug = service.name.toLowerCase().replace(/\s+/g, "-");
  const regionPath = service.region?.includes("eu") ? "eu" : "non-eu";

  return (
    <div className="mb-10 p-6 sm:p-8 bg-brand-sage rounded-3xl relative overflow-hidden">
      <div className="absolute -top-4 -right-4 w-24 h-24 sm:w-32 sm:h-32 opacity-15 pointer-events-none">
        <Image
          src="/images/shapes/spark.svg"
          alt=""
          fill
          className="object-contain select-none animate-shape-float"
          style={{
            filter:
              "brightness(0) saturate(100%) invert(20%) sepia(95%) saturate(750%) hue-rotate(127deg) brightness(93%) contrast(102%)",
          }}
          aria-hidden="true"
          unoptimized
        />
      </div>

      <h2 className="font-heading text-2xl sm:text-3xl uppercase text-brand-green mb-6">
        {t("detail.recommendedAlternative.title")}
      </h2>

      <div className="absolute right-16 top-1/2 -translate-y-1/2 hidden lg:block w-32 h-32 opacity-20 pointer-events-none">
        <Image
          src="/images/shapes/swirl.svg"
          alt=""
          fill
          className="object-contain select-none animate-shape-float"
          style={{
            filter:
              "brightness(0) saturate(100%) invert(20%) sepia(95%) saturate(750%) hue-rotate(127deg) brightness(93%) contrast(102%)",
            animationDuration: "8s",
          }}
          aria-hidden="true"
          unoptimized
        />
      </div>

      <div className="flex items-start">
        <div className="rounded-full bg-brand-green p-1 mr-4 flex-shrink-0">
          <div className="w-12 h-12 rounded-full bg-brand-yellow flex items-center justify-center text-brand-green text-xl font-semibold">
            {service.name.charAt(0)}
          </div>
        </div>
        <div className="flex-grow">
          <h3 className="text-xl font-bold text-brand-green mb-2">
            {service.name}
          </h3>

          <p className="text-brand-green/80 mb-3 max-w-md">
            {service.description}
          </p>

          <div className="flex flex-wrap gap-x-4 gap-y-1 mb-2">
            <div className="text-sm flex items-center text-brand-green">
              <span className="font-medium mr-1">
                {t("detail.freeOption")}:
              </span>
              <span>{service.freeOption ? "Yes" : "No"}</span>
            </div>

            {service.startingPrice &&
              typeof service.startingPrice === "string" && (
                <div className="text-sm flex items-center text-brand-green">
                  <span className="font-medium mr-1">
                    {t("detail.startingPrice")}:
                  </span>
                  <span>{service.startingPrice}</span>
                </div>
              )}
          </div>
        </div>
      </div>

      <div className="mt-6">
        <div className="flex flex-wrap gap-3">
          {sourceService &&
            migrationGuides.length > 0 &&
            migrationGuides.map((guide) => (
              <Link
                key={`${guide.category}-${guide.slug}`}
                href={`/guides/${guide.category}/${guide.slug}`}
                className="inline-block py-2.5 px-6 bg-brand-green text-white rounded-full font-semibold text-sm hover:opacity-90 transition-opacity no-underline"
              >
                {t("detail.recommendedAlternative.migrateFrom", {
                  source: sourceService,
                  target: service.name,
                })}
              </Link>
            ))}

          <Link
            href={`/services/${regionPath}/${serviceSlug}`}
            className="inline-block py-2.5 px-6 border-2 border-brand-green text-brand-green rounded-full font-semibold text-sm hover:bg-brand-green hover:text-white transition-colors no-underline"
          >
            {t("detail.recommendedAlternative.viewDetails")}
          </Link>
        </div>
      </div>
    </div>
  );
}
