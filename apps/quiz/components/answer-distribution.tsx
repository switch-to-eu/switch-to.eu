"use client";

import { Check, X } from "lucide-react";

const BAR_COLORS = [
  "bg-red-500",
  "bg-blue-500",
  "bg-yellow-500",
  "bg-green-500",
  "bg-purple-500",
  "bg-orange-500",
];

function getOptionLabel(index: number): string {
  return String.fromCharCode(65 + index);
}

interface AnswerDistributionProps {
  options: string[];
  distribution: number[];
  correctIndex: number;
}

export function AnswerDistribution({
  options,
  distribution,
  correctIndex,
}: AnswerDistributionProps) {
  const total = distribution.reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-3">
      {options.map((option, i) => {
        const count = distribution[i] ?? 0;
        const pct = total > 0 ? (count / total) * 100 : 0;
        const isCorrect = i === correctIndex;
        const barColor = BAR_COLORS[i % BAR_COLORS.length];

        return (
          <div key={i} className="flex items-center gap-3">
            <span
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${barColor}`}
            >
              {getOptionLabel(i)}
            </span>
            <div className="flex-1">
              <div className="flex items-center justify-between text-sm mb-1">
                <span className={`font-medium ${isCorrect ? "text-green-700" : ""}`}>
                  {option}
                  {isCorrect && <Check className="inline ml-1 h-4 w-4 text-green-600" />}
                  {!isCorrect && count > 0 && <X className="inline ml-1 h-4 w-4 text-red-400" />}
                </span>
                <span className="text-muted-foreground">{count}</span>
              </div>
              <div className="h-3 w-full rounded-full bg-gray-100 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    isCorrect ? "bg-green-500" : barColor
                  }`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
