"use client";

import { useTranslations } from "next-intl";
import { FeedbackDialog } from "./feedback-dialog";

interface FooterFeedbackProps {
  toolId: string;
}

export function FooterFeedback({ toolId }: FooterFeedbackProps) {
  const t = useTranslations("feedback");

  return (
    <FeedbackDialog
      toolId={toolId}
      trigger={
        <button
          type="button"
          className="text-sm text-white/70 transition-colors hover:text-white cursor-pointer"
        >
          {t("triggerButton")}
        </button>
      }
    />
  );
}
