"use client";

import { useState } from "react";
import { Checkbox } from "@switch-to-eu/ui/components/checkbox";
import { Button } from "@switch-to-eu/ui/components/button";
import { Badge } from "@switch-to-eu/ui/components/badge";
import { Trash2, Hand, X, GripVertical } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@switch-to-eu/ui/lib/utils";
import type { DraggableAttributes, DraggableSyntheticListeners } from "@dnd-kit/core";
import type { DecryptedItem } from "@hooks/use-list";

interface ListItemProps {
  item: DecryptedItem;
  preset: string;
  compact?: boolean;
  onToggle: (itemId: string, completed: boolean) => Promise<void>;
  onRemove: (itemId: string) => Promise<void>;
  onClaim?: (itemId: string) => void;
  onUnclaim?: (itemId: string) => Promise<void>;
  dragHandleProps?: {
    attributes: DraggableAttributes;
    listeners: DraggableSyntheticListeners;
  };
  isDragging?: boolean;
}

export function ListItem({
  item,
  preset,
  compact = false,
  onToggle,
  onRemove,
  onClaim,
  onUnclaim,
  dragHandleProps,
  isDragging,
}: ListItemProps) {
  const t = useTranslations("ListPage");
  const [isToggling, setIsToggling] = useState(false);

  const showClaims = !!(onClaim || onUnclaim);

  const handleToggle = async () => {
    setIsToggling(true);
    try {
      await onToggle(item.id, !item.completed);
    } finally {
      setIsToggling(false);
    }
  };

  const handleUnclaim = async () => {
    if (!onUnclaim) return;
    await onUnclaim(item.id);
  };

  return (
    <div
      className={cn(
        "group flex items-center gap-3 transition-colors",
        compact
          ? cn("px-3 py-2.5", item.completed && "bg-teal-50/30")
          : cn("rounded-lg border bg-white p-3", item.completed && "bg-teal-50/50 border-teal-200/60"),
        isDragging && "opacity-50",
      )}
    >
      {dragHandleProps && (
        <button
          type="button"
          className="shrink-0 touch-none text-neutral-300 hover:text-neutral-500 cursor-grab active:cursor-grabbing"
          {...dragHandleProps.attributes}
          {...dragHandleProps.listeners}
        >
          <GripVertical className="h-4 w-4" />
        </button>
      )}

      <Checkbox
        checked={item.completed}
        onCheckedChange={() => handleToggle()}
        disabled={isToggling}
        className="shrink-0 size-5 rounded-md border-2 border-neutral-300 transition-colors duration-150 data-[state=checked]:bg-teal-600 data-[state=checked]:border-teal-600"
      />

      <div className="flex-1 min-w-0">
        <span
          className={cn(
            "block text-sm",
            item.completed && "line-through text-neutral-400",
          )}
        >
          {item.text}
        </span>

        {showClaims && item.claimedBy && (
          <Badge variant="secondary" className="mt-1 text-xs">
            {t("claimedBy", { name: item.claimedBy })}
          </Badge>
        )}
      </div>

      <div className="flex items-center gap-1 shrink-0">
        {showClaims && !item.completed && (
          <>
            {item.claimedBy ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleUnclaim}
                className="h-8 px-2 text-xs text-neutral-500 hover:text-red-600"
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onClaim?.(item.id)}
                className="h-8 px-2 text-xs text-teal-600 hover:text-teal-700"
              >
                <Hand className="mr-1 h-3.5 w-3.5" />
                {t("claim")}
              </Button>
            )}
          </>
        )}

        <Button
          variant="ghost"
          size="sm"
          onClick={() => onRemove(item.id)}
          className="h-8 px-2 text-neutral-400 opacity-0 group-hover:opacity-100 hover:text-red-600 transition-opacity"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}
