import { getTranslations } from "next-intl/server";
import { Link } from "@switch-to-eu/i18n/navigation";
import { ServiceFrontmatter } from "@switch-to-eu/content/schemas";
import { DecorativeShape } from "@switch-to-eu/blocks/components/decorative-shape";

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
    <div className="bg-brand-green md:rounded-3xl relative overflow-hidden">
      <div className={`grid grid-cols-1 ${service.screenshot ? "md:grid-cols-2" : "md:grid-cols-[auto_1fr]"} items-center`}>
        {/* Left: content (always first) */}
        {!service.screenshot && (
          <div className="relative w-full md:w-72 lg:w-80 flex-shrink-0 flex items-center justify-center py-10 md:py-0">
            <div className="relative z-10 flex flex-col items-center gap-3">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-brand-yellow flex items-center justify-center text-brand-green text-3xl sm:text-4xl font-bold shadow-lg">
                {service.name.charAt(0)}
              </div>
              <span className="text-white/60 text-xs font-semibold uppercase tracking-widest">
                {t("detail.recommendedAlternative.badge")}
              </span>
            </div>
            <DecorativeShape
              shape="star"
              className="inset-0 flex items-center justify-center"
              opacity={0.15}
            />
          </div>
        )}

        <div className="px-6 sm:px-8 md:px-10 py-8 sm:py-10 md:py-12 relative">
          <DecorativeShape
            shape="swirl"
            className="-top-4 -right-4 w-24 h-24"
            opacity={0.1}
            duration="9s"
            delay="-3s"
          />

          <span className="text-white/60 text-xs font-semibold uppercase tracking-widest mb-2 block">
            {t("detail.recommendedAlternative.featured")}
          </span>
          <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl uppercase text-brand-yellow mb-4">
            {service.name}
          </h2>

          <p className="text-brand-cream text-base sm:text-lg mb-5 max-w-xl leading-relaxed">
            {service.description}
          </p>

          {/* Meta info */}
          <div className="flex flex-wrap gap-4 mb-6">
            {service.location && (
              <div className="flex items-center gap-1.5 text-white/80 text-sm">
                <span className="text-brand-yellow">&#9679;</span>
                {service.location}
              </div>
            )}
            <div className="flex items-center gap-1.5 text-white/80 text-sm">
              <span className="text-brand-yellow">&#9679;</span>
              {service.freeOption
                ? t("detail.freeOptionYes") + " " + t("detail.freeOption")
                : t("detail.freeOptionNo") + " " + t("detail.freeOption")}
            </div>
            {service.startingPrice &&
              typeof service.startingPrice === "string" && (
                <div className="flex items-center gap-1.5 text-white/80 text-sm">
                  <span className="text-brand-yellow">&#9679;</span>
                  {t("detail.startingPrice")}: {service.startingPrice}
                </div>
              )}
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-3">
            {sourceService &&
              migrationGuides.length > 0 &&
              migrationGuides.map((guide) => (
                <Link
                  key={`${guide.category}-${guide.slug}`}
                  href={`/guides/${guide.category}/${guide.slug}`}
                  className="inline-block py-2.5 px-6 bg-brand-yellow text-brand-green rounded-full font-semibold text-sm hover:opacity-90 transition-opacity no-underline"
                >
                  {t("detail.recommendedAlternative.migrateFrom", {
                    source: sourceService,
                    target: service.name,
                  })}
                </Link>
              ))}

            <Link
              href={`/services/${regionPath}/${serviceSlug}`}
              className="inline-block py-2.5 px-6 bg-brand-yellow text-brand-green rounded-full font-semibold text-sm hover:opacity-90 transition-opacity no-underline"
            >
              {t("detail.recommendedAlternative.viewDetails")}
            </Link>

            {service.url && (
              <a
                href={service.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block py-2.5 px-6 border-2 border-brand-yellow text-brand-yellow rounded-full font-semibold text-sm hover:bg-brand-yellow hover:text-brand-green transition-colors no-underline"
              >
                {t("detail.visitWebsite")} &rarr;
              </a>
            )}
          </div>
        </div>

        {/* Right: Screenshot */}
        {service.screenshot && (
          <div className="flex justify-center md:justify-end p-6 md:p-8">
            <div className="relative w-full">
              <img
                src={service.screenshot}
                alt={service.name}
                className="w-full h-auto object-cover rounded-2xl"
              />
              <div className="absolute -top-6 -right-6 sm:-top-8 sm:-right-8 flex items-center justify-center">
                <svg
                  viewBox="0 0 362.94 366"
                  className="w-28 h-28 sm:w-32 sm:h-32 text-brand-yellow drop-shadow-lg"
                  aria-hidden="true"
                >
                  <path d="M166.52,360.05c-19.36-8.03-41.21-5.87-62.05-8.18-20.83-2.31-43.84-11.92-49.96-31.97-5.04-16.53,3.15-34.97-2.06-51.44-7.81-24.66-41.25-33.37-50.23-57.63-5.76-15.55.46-33.1,9.58-46.95,9.12-13.85,21.14-25.78,28.87-40.45,9.68-18.35,11.97-39.62,18.8-59.21,6.84-19.59,20.83-39.25,41.35-42.33,16.4-2.46,32.59,6.32,49.17,5.87,18.39-.5,34.31-12.06,50.84-20.14,16.53-8.08,38.34-12.16,51.86.32,10.92,10.08,12.24,27.37,22.51,38.11,10.86,11.35,28.27,12.28,43.85,14.26,15.58,1.98,33.43,7.89,38.23,22.84,3.89,12.1-2.62,24.95-9.81,35.44-7.19,10.48-15.61,21.27-16.03,33.97-.48,14.6,9.66,27.06,18.34,38.81,8.68,11.75,16.7,26.67,11.52,40.33-4.55,12-17.57,18.24-29.7,22.43-12.13,4.19-25.41,8.09-33.15,18.33-7.32,9.68-7.87,22.65-10.36,34.53-2.49,11.88-9.05,24.89-20.98,27.1-9.14,1.69-18.26-3.67-27.54-3.14-9.6.55-17.69,7.25-24.25,14.28-6.56,7.04-12.63,14.95-21.2,19.33-8.56,4.38-17.86-2.34-27.61-4.49" fill="currentColor"/>
                </svg>
                <span className="absolute text-brand-green text-[9px] sm:text-[11px] font-bold uppercase leading-tight text-center px-2">
                  Recommended<br/>by Switch-to.eu
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
