"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

export function AffiliateDisclosure({ className }: { className?: string }) {
  const [open, setOpen] = useState(false);
  const t = useTranslations("services.detail.cta");

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`text-[11px] text-gray-400 hover:text-gray-500 transition-colors underline decoration-gray-300 underline-offset-2 ${className ?? ""}`}
      >
        {t("affiliateNote")}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={() => setOpen(false)}
        >
          <div className="fixed inset-0 bg-black/30" />
          <div
            className="relative bg-white rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-lg"
            >
              &times;
            </button>
            <h3 className="font-heading text-lg uppercase text-brand-green mb-3">
              {t("affiliateTitle")}
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              {t("affiliateBody")}
            </p>
          </div>
        </div>
      )}
    </>
  );
}
