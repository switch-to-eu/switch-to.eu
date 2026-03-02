"use client";

import { useTranslations } from "next-intl";
import { MessageSquare } from "lucide-react";
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
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground cursor-pointer"
        >
          <MessageSquare className="h-4 w-4" />
          <span className="hidden sm:inline">{t("triggerButton")}</span>
        </button>
      }
    />
  );
}
