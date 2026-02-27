"use client";

import { useTranslations } from "next-intl";
import { Users } from "lucide-react";
import type { ParticipantInfo } from "@/server/db/types";

interface ParticipantListProps {
  participants: ParticipantInfo[];
}

export function ParticipantList({ participants }: ParticipantListProps) {
  const t = useTranslations("quiz.lobby");

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <Users className="h-4 w-4 text-muted-foreground" />
        <h3 className="text-sm font-medium">
          {t("participants")} ({participants.length})
        </h3>
      </div>
      {participants.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t("noParticipants")}</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {participants.map((p) => (
            <span
              key={p.sessionId}
              className="inline-flex items-center rounded-full bg-rose-100 px-3 py-1 text-sm font-medium text-rose-700"
            >
              {p.nickname}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
