import { getTranslations, getFormatter } from "next-intl/server";
import type { Service } from "@/payload-types";

export async function TrustStrip({ service }: { service: Service }) {
  const t = await getTranslations("services.detail.nonEu.redesign");
  const format = await getFormatter();

  const gdpr = service.gdprCompliance ?? "unknown";
  const sourcesCount = service.sourceUrls?.length ?? 0;
  const lastReviewed = service.lastResearchedAt
    ? format.dateTime(new Date(service.lastResearchedAt), {
        year: "numeric",
        month: "long",
      })
    : null;

  const dotClass =
    gdpr === "compliant"
      ? "bg-brand-green"
      : gdpr === "partial"
        ? "bg-brand-yellow"
        : gdpr === "non-compliant"
          ? "bg-brand-orange"
          : "bg-gray-400";

  return (
    <div className="rounded-3xl bg-brand-cream px-5 py-3 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
      <span className="inline-flex items-center gap-2 font-semibold">
        <span aria-hidden className={`w-2.5 h-2.5 rounded-full ${dotClass}`} />
        {t(`gdprBadge.${gdpr}`)}
      </span>
      {service.headquarters && (
        <span className="text-gray-700">{service.headquarters}</span>
      )}
      {lastReviewed && (
        <span className="text-gray-700">
          {t("trustStrip.lastReviewed", { date: lastReviewed })}
        </span>
      )}
      {sourcesCount > 0 && (
        <a href="#sources" className="text-gray-700 underline">
          {t("trustStrip.sourcesCount", { count: sourcesCount })}
        </a>
      )}
    </div>
  );
}
