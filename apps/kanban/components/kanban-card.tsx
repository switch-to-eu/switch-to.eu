"use client";

import { Calendar, Tag } from "lucide-react";
import type { DecryptedCardData } from "@/lib/types";

const LABEL_COLORS: Record<string, string> = {
  bug: "bg-destructive/10 text-destructive",
  feature: "bg-tool-primary/10 text-tool-primary",
  improvement: "bg-success/10 text-success",
  urgent: "bg-warning/10 text-warning",
  design: "bg-tool-accent/20 text-tool-accent",
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
      className="rounded-lg border bg-card p-3 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
      onClick={onClick}
    >
      {/* Labels */}
      {data.labels && data.labels.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {data.labels.map((label) => (
            <span
              key={label}
              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${LABEL_COLORS[label] || "bg-muted text-foreground"}`}
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
        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
          {data.description}
        </p>
      )}

      {/* Due date */}
      {data.dueDate && (
        <div className={`flex items-center gap-1 mt-2 text-xs ${isOverdue ? "text-destructive" : "text-muted-foreground"}`}>
          <Calendar className="h-3 w-3" />
          <span>{new Date(data.dueDate).toLocaleDateString()}</span>
        </div>
      )}
    </div>
  );
}
