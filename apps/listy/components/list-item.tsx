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
  // eslint-disable-next-line no-unused-vars
  onToggle: (itemId: string, completed: boolean) => Promise<void>;
  // eslint-disable-next-line no-unused-vars
  onRemove: (itemId: string) => Promise<void>;
  // eslint-disable-next-line no-unused-vars
  onClaim?: (itemId: string) => void;
  // eslint-disable-next-line no-unused-vars
  onUnclaim?: (itemId: string) => Promise<void>;
  dragHandleProps?: {
    attributes: DraggableAttributes;
    listeners: DraggableSyntheticListeners;
  };
  isDragging?: boolean;
}

export function ListItem({
  item,
  // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
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
          ? cn("px-3 py-2.5", item.completed && "bg-tool-surface/5")
          : cn("rounded-lg border bg-card p-3", item.completed && "bg-tool-surface/10 border-tool-primary/20"),
        isDragging && "opacity-50",
      )}
    >
      {dragHandleProps && (
        <button
          type="button"
          className="shrink-0 touch-none text-muted-foreground hover:text-foreground cursor-grab active:cursor-grabbing"
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
        className="shrink-0 size-5 rounded-md border-2 border-border transition-colors duration-150 data-[state=checked]:bg-tool-primary data-[state=checked]:border-tool-primary"
      />

      <div className="flex-1 min-w-0">
        <span
          className={cn(
            "block text-sm",
            item.completed && "line-through text-muted-foreground",
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
                className="h-8 px-2 text-xs text-muted-foreground hover:text-destructive"
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onClaim?.(item.id)}
                className="h-8 px-2 text-xs text-tool-primary hover:text-tool-primary"
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
          className="h-8 px-2 text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-destructive transition-opacity"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}
