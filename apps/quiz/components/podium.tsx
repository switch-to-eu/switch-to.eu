"use client";

import { useTranslations } from "next-intl";
import { Trophy } from "lucide-react";
import type { LeaderboardEntry } from "@/lib/interfaces";

interface PodiumProps {
  entries: LeaderboardEntry[];
}

const PODIUM_HEIGHTS = ["h-28", "h-20", "h-16"];
const PODIUM_COLORS = [
  "bg-gradient-to-t from-yellow-400 to-yellow-300",
  "bg-gradient-to-t from-gray-300 to-gray-200",
  "bg-gradient-to-t from-amber-500 to-amber-400",
];
const PODIUM_ORDER = [1, 0, 2]; // Display: 2nd, 1st, 3rd

export function Podium({ entries }: PodiumProps) {
  const t = useTranslations("quiz.finished");
  const top3 = entries.slice(0, 3);

  if (top3.length === 0) return null;

  const orderedEntries = PODIUM_ORDER.map((i) => top3[i]).filter(Boolean);

  return (
    <div className="text-center space-y-6">
      <h2 className="font-bricolage text-2xl font-bold">{t("podium")}</h2>
      <div className="flex items-end justify-center gap-4">
        {orderedEntries.map((entry) => {
          if (!entry) return null;
          const podiumIndex = entry.rank - 1;
          const labels = [t("first"), t("second"), t("third")];

          return (
            <div key={entry.sessionId} className="flex flex-col items-center gap-2">
              <div className="text-center">
                {entry.rank === 1 && (
                  <Trophy className="h-8 w-8 text-yellow-500 mx-auto mb-1" />
                )}
                <p className="font-semibold text-sm">{entry.nickname}</p>
                <p className="text-xs text-muted-foreground">
                  {entry.totalScore} {t("totalPoints", { points: "" }).trim()}
                </p>
              </div>
              <div
                className={`w-24 rounded-t-lg flex items-center justify-center ${PODIUM_HEIGHTS[podiumIndex]} ${PODIUM_COLORS[podiumIndex]}`}
              >
                <span className="text-2xl font-black text-white/80">
                  {labels[podiumIndex]}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
