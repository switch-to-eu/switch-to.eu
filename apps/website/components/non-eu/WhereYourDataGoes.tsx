import { getTranslations } from "next-intl/server";
import type { Service } from "@/payload-types";

export async function WhereYourDataGoes({ service }: { service: Service }) {
  const t = await getTranslations(
    "services.detail.nonEu.redesign.whereDataGoes"
  );

  const locations = (service.dataStorageLocations ?? []).map((l) => l.location);
  const hasContent =
    !!service.parentCompany ||
    !!service.headquarters ||
    locations.length > 0 ||
    typeof service.openSource === "boolean";
  if (!hasContent) return null;

  return (
    <section>
      <h2 className="font-heading uppercase text-2xl sm:text-3xl text-brand-green mb-5">
        {t("title")}
      </h2>
      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-5 rounded-2xl border border-brand-navy/10 bg-white p-5 sm:p-6">
        {service.parentCompany && (
          <div>
            <dt className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-foreground/55 mb-1">
              {t("ownedBy")}
            </dt>
            <dd className="text-sm text-foreground">{service.parentCompany}</dd>
          </div>
        )}
        {service.headquarters && (
          <div>
            <dt className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-foreground/55 mb-1">
              {t("headquarters")}
            </dt>
            <dd className="text-sm text-foreground">{service.headquarters}</dd>
          </div>
        )}
        {locations.length > 0 && (
          <div className="sm:col-span-2">
            <dt className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-foreground/55 mb-2">
              {t("dataStored")}
            </dt>
            <dd className="flex flex-wrap gap-1.5">
              {locations.map((loc, i) => (
                <span
                  key={i}
                  className="rounded-full bg-foreground/[0.06] text-foreground px-3 py-1 text-xs"
                >
                  {loc}
                </span>
              ))}
            </dd>
          </div>
        )}
        {typeof service.openSource === "boolean" && (
          <div className="sm:col-span-2">
            <dt className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-foreground/55 mb-1">
              {t("openSource")}
            </dt>
            <dd className="text-sm text-foreground">
              {service.openSource ? (
                <>
                  <span>{t("openSource")}</span>
                  {service.sourceCodeUrl && (
                    <>
                      {" "}
                      <a
                        href={service.sourceCodeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-brand-green underline"
                      >
                        {t("viewCode")} &rarr;
                      </a>
                    </>
                  )}
                </>
              ) : (
                <span>{t("closedSource")}</span>
              )}
            </dd>
          </div>
        )}
      </dl>
    </section>
  );
}
