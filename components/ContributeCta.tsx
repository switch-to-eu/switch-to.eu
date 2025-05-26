"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { ServiceRequestModal } from "@/components/ServiceRequestModal";

export const ContributeCta = () => {
  const t = useTranslations("contribute");

  return (
    <div className="flex flex-col sm:flex-row items-center gap-4 bg-[var(--green-bg)] p-4 sm:p-6 rounded-lg">
      <div className="w-40 h-40 sm:w-56 sm:h-56 relative flex-shrink-0 mr-6">
        <Image
          src="/images/contribute.svg"
          alt="Helper character illustration"
          fill
          className="object-contain p-4"
        />
      </div>
      <div className="flex-1">
        <h2 className="font-bold text-xl sm:text-2xl text-slate-800 mb-2 sm:mb-3">
          {t("ctaTitle")}
        </h2>
        <p className="text-slate-700 mb-4 sm:mb-6">{t("ctaDescription")}</p>
        <ServiceRequestModal triggerText={t("cta")} variant="red" />
      </div>
    </div>
  );
};
