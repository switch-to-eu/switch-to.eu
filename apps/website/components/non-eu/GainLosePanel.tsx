import { getTranslations } from "next-intl/server";
import type { Service } from "@/payload-types";

export async function GainLosePanel({
  service,
  recommendedName,
}: {
  service: Service;
  recommendedName: string;
}) {
  const t = await getTranslations("services.detail.nonEu.redesign.gainLose");

  const gain = (service.whatYoudGain ?? []).map((g) => g.point);
  const lose = (service.whatYoudLose ?? []).map((l) => l.point);
  if (gain.length === 0 && lose.length === 0) return null;

  return (
    <section className="max-w-3xl">
      <h2 className="font-heading text-2xl sm:text-3xl uppercase text-brand-navy mb-5">
        {t("headingTemplate", {
          source: service.name,
          target: recommendedName,
        })}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6 rounded-2xl border border-brand-navy/10 bg-white p-5 sm:p-6">
        {gain.length > 0 && (
          <div>
            <h3 className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-brand-green mb-3">
              {t("gain")}
            </h3>
            <ul className="space-y-2.5">
              {gain.map((point, i) => (
                <li key={i} className="flex gap-2.5 text-sm leading-relaxed">
                  <span
                    aria-hidden
                    className="text-brand-green mt-0.5 flex-shrink-0"
                  >
                    &#10003;
                  </span>
                  <span className="text-brand-navy">{point}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        {lose.length > 0 && (
          <div>
            <h3 className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-brand-orange mb-3">
              {t("lose")}
            </h3>
            <ul className="space-y-2.5">
              {lose.map((point, i) => (
                <li key={i} className="flex gap-2.5 text-sm leading-relaxed">
                  <span
                    aria-hidden
                    className="text-brand-orange mt-0.5 flex-shrink-0"
                  >
                    &times;
                  </span>
                  <span className="text-brand-navy">{point}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}
