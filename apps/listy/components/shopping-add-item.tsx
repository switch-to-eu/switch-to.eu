"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Plus } from "lucide-react";
import { Button } from "@switch-to-eu/ui/components/button";
import { Input } from "@switch-to-eu/ui/components/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@switch-to-eu/ui/components/select";
import {
  SHOPPING_CATEGORIES,
  DEFAULT_CATEGORY,
  type ShoppingCategory,
} from "@/lib/categories";

interface ShoppingAddItemProps {
  onAdd: (text: string, category: string) => Promise<void>;
  isMutating: boolean;
}

export function ShoppingAddItem({ onAdd, isMutating }: ShoppingAddItemProps) {
  const t = useTranslations("ListPage");
  const [text, setText] = useState("");
  const [category, setCategory] = useState<ShoppingCategory>(DEFAULT_CATEGORY);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    await onAdd(text.trim(), category);
    setText("");
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <Select
        value={category}
        onValueChange={(v) => setCategory(v as ShoppingCategory)}
      >
        <SelectTrigger className="w-[140px] shrink-0">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {SHOPPING_CATEGORIES.map((cat) => (
            <SelectItem key={cat} value={cat}>
              {t(`categories.${cat}` as Parameters<typeof t>[0])}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={t("addItemPlaceholder")}
        maxLength={500}
        className="flex-1"
      />
      <Button type="submit" disabled={!text.trim() || isMutating}>
        <Plus className="h-4 w-4" />
      </Button>
    </form>
  );
}
