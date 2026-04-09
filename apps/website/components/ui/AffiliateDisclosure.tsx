"use client";

import { useTranslations } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@switch-to-eu/ui/components/dialog";

export function AffiliateDisclosure({ className }: { className?: string }) {
  const t = useTranslations("services.detail.cta");

  return (
    <Dialog>
      <DialogTrigger
        className={`text-[11px] text-gray-400 hover:text-gray-500 transition-colors underline decoration-gray-300 underline-offset-2 ${className ?? ""}`}
      >
        {t("affiliateNote")}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading text-lg uppercase text-brand-green">
            {t("affiliateTitle")}
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-600 leading-relaxed">
            {t("affiliateBody")}
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
