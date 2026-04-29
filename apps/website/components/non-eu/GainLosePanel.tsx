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
    <section className="rounded-3xl bg-brand-cream p-6 sm:p-8">
      <h2 className="font-heading text-2xl sm:text-3xl uppercase mb-6">
        {t("headingTemplate", { source: service.name, target: recommendedName })}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {gain.length > 0 && (
          <div className="rounded-2xl bg-brand-green text-white p-5">
            <h3 className="font-heading uppercase text-lg mb-3">{t("gain")}</h3>
            <ul className="space-y-2 text-sm">
              {gain.map((point, i) => (
                <li key={i} className="flex gap-2">
                  <span aria-hidden>+</span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        {lose.length > 0 && (
          <div className="rounded-2xl bg-brand-orange text-white p-5">
            <h3 className="font-heading uppercase text-lg mb-3">{t("lose")}</h3>
            <ul className="space-y-2 text-sm">
              {lose.map((point, i) => (
                <li key={i} className="flex gap-2">
                  <span aria-hidden>−</span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}
