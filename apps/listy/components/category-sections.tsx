"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { Plus } from "lucide-react";
import { SHOPPING_CATEGORIES, DEFAULT_CATEGORY } from "@/lib/categories";
import { ListItem } from "@components/list-item";
import type { DecryptedItem } from "@hooks/use-list";

interface CategorySectionsProps {
  items: DecryptedItem[];
  preset: string;
  onToggle: (itemId: string, completed: boolean) => Promise<void>;
  onRemove: (itemId: string) => Promise<void>;
  onAdd: (text: string, category: string) => Promise<void>;
  isMutating: boolean;
}

export function CategorySections({
  items,
  preset,
  onToggle,
  onRemove,
  onAdd,
  isMutating,
}: CategorySectionsProps) {
  const t = useTranslations("ListPage");

  const grouped = useMemo(() => {
    const map = new Map<string, DecryptedItem[]>();
    for (const item of items) {
      const cat = item.category || DEFAULT_CATEGORY;
      const arr = map.get(cat) || [];
      arr.push(item);
      map.set(cat, arr);
    }
    return map;
  }, [items]);

  return (
    <div className="space-y-1.5">
      {SHOPPING_CATEGORIES.map((cat) => {
        const catItems = grouped.get(cat);
        const label = t(`categories.${cat}` as Parameters<typeof t>[0]);

        if (catItems && catItems.length > 0) {
          return (
            <PopulatedCategory
              key={cat}
              category={cat}
              label={label}
              items={catItems}
              preset={preset}
              onToggle={onToggle}
              onRemove={onRemove}
              onAdd={onAdd}
              isMutating={isMutating}
            />
          );
        }

        return (
          <EmptyCategory
            key={cat}
            category={cat}
            label={label}
            onAdd={onAdd}
            isMutating={isMutating}
          />
        );
      })}
    </div>
  );
}

/** Category card with items and an inline add input at the bottom. */
function PopulatedCategory({
  category,
  label,
  items,
  preset,
  onToggle,
  onRemove,
  onAdd,
  isMutating,
}: {
  category: string;
  label: string;
  items: DecryptedItem[];
  preset: string;
  onToggle: (itemId: string, completed: boolean) => Promise<void>;
  onRemove: (itemId: string) => Promise<void>;
  onAdd: (text: string, category: string) => Promise<void>;
  isMutating: boolean;
}) {
  const t = useTranslations("ListPage");
  const completedCount = items.filter((i) => i.completed).length;

  return (
    <div className="rounded-lg border bg-white overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 bg-neutral-50/80">
        <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">
          {label}
        </h3>
        <span className="text-xs text-neutral-400">
          {completedCount}/{items.length}
        </span>
      </div>
      <div className="divide-y divide-neutral-100">
        {items.map((item) => (
          <ListItem
            key={item.id}
            item={item}
            preset={preset}
            compact
            onToggle={onToggle}
            onRemove={onRemove}
          />
        ))}
      </div>
      <InlineAddInput
        category={category}
        onAdd={onAdd}
        isMutating={isMutating}
        placeholder={t("addItemPlaceholder")}
      />
    </div>
  );
}

/** Collapsed row for an empty category — expands to a card with an add input on click. */
function EmptyCategory({
  category,
  label,
  onAdd,
  isMutating,
}: {
  category: string;
  label: string;
  onAdd: (text: string, category: string) => Promise<void>;
  isMutating: boolean;
}) {
  const t = useTranslations("ListPage");
  const [isExpanded, setIsExpanded] = useState(false);
  const [text, setText] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || isMutating) return;
    await onAdd(text.trim(), category);
    setText("");
  };

  if (!isExpanded) {
    return (
      <button
        type="button"
        onClick={() => setIsExpanded(true)}
        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100/50 transition-colors"
      >
        <Plus className="h-3.5 w-3.5" />
        <span className="font-medium">{label}</span>
      </button>
    );
  }

  return (
    <div className="rounded-lg border bg-white overflow-hidden">
      <div className="px-3 py-2 bg-neutral-50/80">
        <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">
          {label}
        </h3>
      </div>
      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-2 px-3 py-2.5"
      >
        <Plus className="h-4 w-4 text-neutral-300 shrink-0" />
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={t("addItemPlaceholder")}
          maxLength={500}
          autoFocus
          className="flex-1 text-sm bg-transparent outline-none placeholder:text-neutral-300"
          onBlur={() => {
            if (!text.trim()) setIsExpanded(false);
          }}
        />
      </form>
    </div>
  );
}

/** Minimal inline input for adding items inside a populated category card. */
function InlineAddInput({
  category,
  onAdd,
  isMutating,
  placeholder,
}: {
  category: string;
  onAdd: (text: string, category: string) => Promise<void>;
  isMutating: boolean;
  placeholder: string;
}) {
  const [text, setText] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || isMutating) return;
    await onAdd(text.trim(), category);
    setText("");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-center gap-2 px-3 py-2.5 border-t border-neutral-100"
    >
      <Plus className="h-4 w-4 text-neutral-300 shrink-0" />
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={placeholder}
        maxLength={500}
        className="flex-1 text-sm bg-transparent outline-none placeholder:text-neutral-300"
      />
    </form>
  );
}
