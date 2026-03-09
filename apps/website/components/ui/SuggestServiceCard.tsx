"use client";

import { useTranslations } from "next-intl";
import { ServiceRequestModal } from "@/components/ServiceRequestModal";
import { shapes } from "@switch-to-eu/blocks/shapes";
import { getCardColor } from "@switch-to-eu/ui/lib/brand-palette";

export function SuggestServiceCard({ colorIndex = 0 }: { colorIndex?: number }) {
  const t = useTranslations("contribute");
  const card = getCardColor(colorIndex);
  const shapeData = shapes["spark"];

  return (
    <div
      className={`${card.bg} flex flex-col h-full md:rounded-3xl overflow-hidden`}
    >
      {/* Visual area with decorative shape */}
      <div className="relative h-36 sm:h-44 flex items-center justify-center overflow-hidden">
        <div className="w-full h-full flex items-center justify-center p-8 sm:p-10">
          {shapeData && (
            <svg
              viewBox={shapeData.viewBox}
              className={`w-full h-full select-none animate-shape-float ${card.shapeColor}`}
              style={{
                animationDuration: "8s",
              }}
              aria-hidden="true"
            >
              <path d={shapeData.d} fill="currentColor" />
            </svg>
          )}
        </div>
      </div>

      {/* Content area */}
      <div className="flex flex-col flex-1 px-5 pt-4 pb-5 sm:px-6 sm:pt-5 sm:pb-6">
        <h3 className={`${card.text} text-lg sm:text-xl font-bold mb-3`}>
          {t("suggestCardTitle")}
        </h3>

        <p
          className={`${card.text} text-sm opacity-80 leading-relaxed line-clamp-3 mb-5`}
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
