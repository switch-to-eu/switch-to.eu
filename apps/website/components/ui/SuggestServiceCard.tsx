"use client";

import { useTranslations } from "next-intl";
import { ServiceRequestModal } from "@/components/ServiceRequestModal";
import { getCardColor } from "@/lib/quiet-palette";

export function SuggestServiceCard({ colorIndex = 0 }: { colorIndex?: number }) {
  const t = useTranslations("contribute");
  const card = getCardColor(colorIndex);

  return (
    <div
      className={`${card.bg} flex flex-col h-full md:rounded-3xl overflow-hidden`}
    >
      <div aria-hidden="true" className={`h-1.5 ${card.strip}`} />
      {/* Content area */}
      <div className="flex flex-col flex-1 p-5 sm:p-6">
        <h3 className={`${card.text} text-lg sm:text-xl font-bold mb-3`}>
          {t("suggestCardTitle")}
        </h3>

        <p
          className={`${card.text} text-sm leading-relaxed line-clamp-3 mb-5`}
        >
          {t("suggestCardDescription")}
        </p>

        <div className="mt-auto">
          <ServiceRequestModal
            triggerText={t("suggestCardButton")}
            variant="default"
            className={`${card.button} rounded-full text-sm font-semibold px-5 py-2 h-auto`}
          />
        </div>
      </div>
    </div>
  );
}
