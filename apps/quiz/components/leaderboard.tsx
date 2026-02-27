"use client";

import { useTranslations } from "next-intl";
import { Trophy } from "lucide-react";
import type { LeaderboardEntry } from "@/lib/interfaces";

interface LeaderboardProps {
  entries: LeaderboardEntry[];
  currentSessionId?: string;
  maxEntries?: number;
}

const RANK_COLORS = [
  "text-yellow-500", // 1st
  "text-gray-400",   // 2nd
  "text-amber-600",  // 3rd
];

export function Leaderboard({ entries, currentSessionId, maxEntries = 10 }: LeaderboardProps) {
  const t = useTranslations("quiz.leaderboard");
  const displayed = entries.slice(0, maxEntries);

  return (
    <div className="rounded-lg border bg-white overflow-hidden">
      <div className="flex items-center gap-2 p-4 border-b bg-gray-50">
        <Trophy className="h-4 w-4 text-primary-color" />
        <h3 className="font-semibold">{t("title")}</h3>
      </div>
      <div className="divide-y">
        {displayed.map((entry) => {
          const isCurrentUser = entry.sessionId === currentSessionId;
          return (
            <div
              key={entry.sessionId}
              className={`flex items-center gap-3 px-4 py-3 ${
                isCurrentUser ? "bg-rose-50" : ""
              }`}
            >
              <span
                className={`w-8 text-center font-bold ${
                  entry.rank <= 3 ? RANK_COLORS[entry.rank - 1] : "text-gray-400"
                }`}
              >
                {entry.rank <= 3 ? (
                  <Trophy className={`h-5 w-5 inline ${RANK_COLORS[entry.rank - 1]}`} />
                ) : (
                  `#${entry.rank}`
                )}
              </span>
              <span className={`flex-1 font-medium ${isCurrentUser ? "text-rose-700" : ""}`}>
                {entry.nickname}
              </span>
              <span className="font-mono text-sm font-semibold">
                {entry.totalScore} {t("points")}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
