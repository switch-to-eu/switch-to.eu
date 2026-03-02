"use client";

import { Calendar, Tag } from "lucide-react";
import type { DecryptedCardData } from "@/lib/types";

const LABEL_COLORS: Record<string, string> = {
  bug: "bg-red-100 text-red-700",
  feature: "bg-blue-100 text-blue-700",
  improvement: "bg-green-100 text-green-700",
  urgent: "bg-orange-100 text-orange-700",
  design: "bg-purple-100 text-purple-700",
  research: "bg-yellow-100 text-yellow-700",
};

interface KanbanCardProps {
  cardId: string;
  data: Omit<DecryptedCardData, "id">;
  onClick?: () => void;
}

export function KanbanCard({ data, onClick }: KanbanCardProps) {
  const isOverdue = data.dueDate && new Date(data.dueDate) < new Date();

  return (
    <div
      className="rounded-lg border bg-white p-3 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
      onClick={onClick}
    >
      {/* Labels */}
      {data.labels && data.labels.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {data.labels.map((label) => (
            <span
              key={label}
              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${LABEL_COLORS[label] || "bg-gray-100 text-gray-700"}`}
            >
              <Tag className="h-3 w-3" />
              {label}
            </span>
          ))}
        </div>
      )}

      {/* Title */}
      <p className="text-sm font-medium text-foreground">{data.title}</p>

      {/* Description preview */}
      {data.description && (
        <p className="text-xs text-neutral-500 mt-1 line-clamp-2">
          {data.description}
        </p>
      )}

      {/* Due date */}
      {data.dueDate && (
        <div className={`flex items-center gap-1 mt-2 text-xs ${isOverdue ? "text-red-600" : "text-neutral-400"}`}>
          <Calendar className="h-3 w-3" />
          <span>{new Date(data.dueDate).toLocaleDateString()}</span>
        </div>
      )}
    </div>
  );
}
