import React from "react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { ServiceFrontmatter } from "@/lib/content/schemas";

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

  return (
    <div className="mb-10 p-6 bg-green-50 dark:bg-green-900/20 rounded-lg relative">
      <h2 className="text-2xl font-bold mb-6">
        {t("detail.recommendedAlternative.title")}
      </h2>

      <div className="absolute right-20 top-1/2 -translate-y-1/2 hidden lg:block">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/icon-04.svg"
          alt="Curved arrow"
          width="175"
          height="200"
        />
      </div>

      <div className="flex items-start">
        <div className="rounded-full bg-blue-100 p-1 mr-4">
          <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white text-xl font-semibold">
            {service.name.charAt(0)}
          </div>
        </div>
        <div className="flex-grow">
          <h3 className="text-xl font-bold mb-2">{service.name}</h3>

          <p className="text-slate-600 dark:text-slate-300 mb-3 max-w-md">
            {service.description}
          </p>

          <div className="flex flex-wrap gap-x-4 gap-y-1 mb-2">
            <div className="text-sm flex items-center">
              <span className="font-medium mr-1">{t("detail.freeOption")}:</span>
              <span>{service.freeOption ? "✅" : "❌"}</span>
            </div>

            {/* Only show starting price if it exists and is not falsy */}
            {service.startingPrice && typeof service.startingPrice === 'string' && (
              <div className="text-sm flex items-center">
                <span className="font-medium mr-1">{t("detail.startingPrice")}:</span>
                <span>{service.startingPrice}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Buttons for recommended alternative actions */}
      <div className="mt-6">
        <div className="flex flex-wrap gap-3">
          {sourceService &&
            migrationGuides.length > 0 &&
            migrationGuides.map((guide) => (
              <Link
                key={`${guide.category}-${guide.slug}`}
                href={`/guides/${guide.category}/${guide.slug}`}
                className="inline-block py-2 px-5 bg-[#a2d4a8] text-slate-800 border border-[#a2d4a8] rounded-md hover:bg-[#92c499] transition-colors"
              >
                {t("detail.recommendedAlternative.migrateFrom", {
                  source: sourceService,
                  target: service.name,
                })}
              </Link>
            ))}

          <Link
            href={`/services/${service.region || "eu"}/${serviceSlug}`}
            className="inline-block py-2 px-5 border border-slate-300 dark:border-slate-600 rounded-md text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            {t("detail.recommendedAlternative.viewDetails")}
          </Link>
        </div>
      </div>
    </div>
  );
}
