"use client";

import { useState } from "react";
import { Checkbox } from "@switch-to-eu/ui/components/checkbox";
import { Button } from "@switch-to-eu/ui/components/button";
import { Input } from "@switch-to-eu/ui/components/input";
import { Badge } from "@switch-to-eu/ui/components/badge";
import { Trash2, Hand, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@switch-to-eu/ui/lib/utils";
import type { DecryptedItem } from "@hooks/use-list";

interface ListItemProps {
  item: DecryptedItem;
  preset: string;
  onToggle: (itemId: string, completed: boolean) => Promise<void>;
  onRemove: (itemId: string) => Promise<void>;
  onClaim?: (itemId: string, name: string) => Promise<void>;
  onUnclaim?: (itemId: string) => Promise<void>;
}

export function ListItem({
  item,
  preset,
  onToggle,
  onRemove,
  onClaim,
  onUnclaim,
}: ListItemProps) {
  const t = useTranslations("ListPage");
  const [claimName, setClaimName] = useState("");
  const [showClaimInput, setShowClaimInput] = useState(false);
  const [isToggling, setIsToggling] = useState(false);

  const isPotluck = preset === "potluck";

  const handleToggle = async () => {
    setIsToggling(true);
    try {
      await onToggle(item.id, !item.completed);
    } finally {
      setIsToggling(false);
    }
  };

  const handleClaim = async () => {
    if (!claimName.trim() || !onClaim) return;
    await onClaim(item.id, claimName.trim());
    setClaimName("");
    setShowClaimInput(false);
  };

  const handleUnclaim = async () => {
    if (!onUnclaim) return;
    await onUnclaim(item.id);
  };

  return (
    <div
      className={cn(
        "group flex items-center gap-3 rounded-lg border bg-white p-3 transition-colors",
        item.completed && "bg-neutral-50 border-neutral-200",
      )}
    >
      <Checkbox
        checked={item.completed}
        onCheckedChange={() => handleToggle()}
        disabled={isToggling}
        className="shrink-0"
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

        {isPotluck && item.claimedBy && (
          <Badge variant="secondary" className="mt-1 text-xs">
            {t("claimedBy", { name: item.claimedBy })}
          </Badge>
        )}
      </div>

      <div className="flex items-center gap-1 shrink-0">
        {isPotluck && !item.completed && (
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
            ) : showClaimInput ? (
              <div className="flex items-center gap-1">
                <Input
                  value={claimName}
                  onChange={(e) => setClaimName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleClaim()}
                  placeholder={t("claimPlaceholder")}
                  className="h-8 w-28 text-xs"
                  autoFocus
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClaim}
                  disabled={!claimName.trim()}
                  className="h-8 px-2"
                >
                  <Hand className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowClaimInput(false)}
                  className="h-8 px-2"
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowClaimInput(true)}
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
