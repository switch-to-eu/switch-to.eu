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
                Recommended by Switch-to.eu
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
            Recommended by Switch-to.eu
          </span>
          <h2 className="font-heading text-2xl sm:text-3xl uppercase text-brand-yellow mb-4">
            {service.name}
          </h2>

          <p className="text-brand-sky text-base sm:text-lg mb-5 max-w-xl leading-relaxed">
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
            <img
              src={service.screenshot}
              alt={service.name}
              className="w-full h-auto object-cover rounded-2xl"
            />
          </div>
        )}
      </div>
    </div>
  );
}
