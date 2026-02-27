"use client";

import { useTranslations } from "next-intl";

interface CountdownTimerProps {
  secondsLeft: number;
  progress: number;
}

export function CountdownTimer({ secondsLeft, progress }: CountdownTimerProps) {
  const t = useTranslations("quiz.active");

  const urgent = secondsLeft <= 5;

  return (
    <div className="flex flex-col items-center gap-2">
      <span className="text-xs text-muted-foreground uppercase tracking-wider">
        {t("timeLeft")}
      </span>
      <div className="relative h-20 w-20">
        <svg className="h-20 w-20 -rotate-90" viewBox="0 0 36 36">
          <path
            className="text-gray-200"
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
          />
          <path
            className={urgent ? "text-red-500" : "text-rose-600"}
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeDasharray={`${progress * 100}, 100`}
            style={{ transition: "stroke-dasharray 0.2s ease" }}
          />
        </svg>
        <span
          className={`absolute inset-0 flex items-center justify-center text-2xl font-black ${
            urgent ? "text-red-500 animate-pulse" : ""
          }`}
        >
          {secondsLeft}
        </span>
      </div>
    </div>
  );
}
