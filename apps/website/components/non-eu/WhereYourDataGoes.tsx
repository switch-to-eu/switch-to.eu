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
    <section className="rounded-3xl bg-brand-navy text-white p-6 sm:p-8 md:p-10">
      <h2 className="font-heading uppercase text-2xl sm:text-3xl mb-5 text-brand-yellow">
        {t("title")}
      </h2>
      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 text-sm">
        {service.parentCompany && (
          <div>
            <dt className="text-white/60 uppercase text-xs tracking-wider mb-1">
              {t("ownedBy")}
            </dt>
            <dd>{service.parentCompany}</dd>
          </div>
        )}
        {service.headquarters && (
          <div>
            <dt className="text-white/60 uppercase text-xs tracking-wider mb-1">
              {t("headquarters")}
            </dt>
            <dd>{service.headquarters}</dd>
          </div>
        )}
        {locations.length > 0 && (
          <div className="sm:col-span-2">
            <dt className="text-white/60 uppercase text-xs tracking-wider mb-1">
              {t("dataStored")}
            </dt>
            <dd className="flex flex-wrap gap-2">
              {locations.map((loc, i) => (
                <span
                  key={i}
                  className="rounded-full bg-white/10 px-3 py-1 text-xs"
                >
                  {loc}
                </span>
              ))}
            </dd>
          </div>
        )}
        {typeof service.openSource === "boolean" && (
          <div className="sm:col-span-2">
            <dd>
              {service.openSource ? (
                <>
                  <span className="font-semibold">{t("openSource")}</span>
                  {service.sourceCodeUrl && (
                    <>
                      {" "}
                      <a
                        href={service.sourceCodeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline text-brand-yellow"
                      >
                        {t("viewCode")}
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
