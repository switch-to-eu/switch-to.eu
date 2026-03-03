"use client";

import { useTranslations } from "next-intl";
import { FeedbackDialog } from "./feedback-dialog";

interface HeaderFeedbackProps {
  toolId: string;
}

export function HeaderFeedback({ toolId }: HeaderFeedbackProps) {
  const t = useTranslations("feedback");

  return (
    <FeedbackDialog
      toolId={toolId}
      trigger={
        <button
          type="button"
          className="px-4 py-2 text-sm text-tool-primary-foreground uppercase tracking-wide hover:underline cursor-pointer [font-family:var(--font-hanken-grotesk-bold)] [font-weight:700]"
        >
          {t("triggerButton")}
        </button>
      }
    />
  );
}
