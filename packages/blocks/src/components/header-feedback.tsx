"use client";

import { MessageSquarePlus } from "lucide-react";
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
          className="fixed bottom-4 right-4 z-50 flex items-center justify-center gap-2 rounded-full bg-tool-primary p-3 sm:px-4 sm:py-2.5 text-sm font-semibold text-white shadow-lg transition-all hover:shadow-xl hover:scale-105 cursor-pointer"
        >
          <MessageSquarePlus className="h-5 w-5 sm:h-4 sm:w-4" />
          <span className="hidden sm:inline">{t("triggerButton")}</span>
        </button>
      }
    />
  );
}
