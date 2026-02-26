"use client";

import { useState, useMemo, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Plus } from "lucide-react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  useDraggable,
  type DragStartEvent,
  type DragEndEvent,
  type DraggableAttributes,
  type DraggableSyntheticListeners,
} from "@dnd-kit/core";
import { cn } from "@switch-to-eu/ui/lib/utils";
import { ListItem } from "@components/list-item";
import type { DecryptedItem } from "@hooks/use-list";
import type { CustomCategory } from "@/lib/types";

interface CategorySectionsProps {
  items: DecryptedItem[];
  categories: CustomCategory[];
  preset: string;
  onToggle: (itemId: string, completed: boolean) => Promise<void>;
  onRemove: (itemId: string) => Promise<void>;
  onAdd: (text: string, category: string) => Promise<void>;
  onMoveToCategory: (itemId: string, newCategory: string) => Promise<void>;
  onClaim?: (itemId: string) => void;
  onUnclaim?: (itemId: string) => Promise<void>;
  enableClaims?: boolean;
  isMutating: boolean;
}

export function CategorySections({
  items,
  categories,
  preset,
  onToggle,
  onRemove,
  onAdd,
  onMoveToCategory,
  onClaim,
  onUnclaim,
  enableClaims,
  isMutating,
}: CategorySectionsProps) {
  const [activeItem, setActiveItem] = useState<DecryptedItem | null>(null);

  const fallbackCategory = categories[categories.length - 1]?.id ?? "other";

  const grouped = useMemo(() => {
    const categoryIds = new Set(categories.map((c) => c.id));
    const map = new Map<string, DecryptedItem[]>();
    for (const item of items) {
      const cat = item.category && categoryIds.has(item.category)
        ? item.category
        : fallbackCategory;
      const arr = map.get(cat) || [];
      arr.push(item);
      map.set(cat, arr);
    }
    return map;
  }, [items, categories, fallbackCategory]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
  );

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const item = items.find((i) => i.id === event.active.id);
      setActiveItem(item ?? null);
    },
    [items],
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      setActiveItem(null);
      const { active, over } = event;
      if (!over) return;

      const targetCategory = over.id as string;
      const itemId = active.id as string;
      const sourceCategory =
        (active.data.current as { category?: string })?.category ||
        fallbackCategory;

      if (targetCategory !== sourceCategory) {
        void onMoveToCategory(itemId, targetCategory);
      }
    },
    [onMoveToCategory, fallbackCategory],
  );

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="space-y-1.5">
        {categories.map((cat) => {
          const catItems = grouped.get(cat.id) || [];
          return (
            <CategoryCard
              key={cat.id}
              category={cat.id}
              label={cat.label}
              items={catItems}
              preset={preset}
              onToggle={onToggle}
              onRemove={onRemove}
              onAdd={onAdd}
              onClaim={enableClaims ? onClaim : undefined}
              onUnclaim={enableClaims ? onUnclaim : undefined}
              isMutating={isMutating}
            />
          );
        })}
      </div>

      <DragOverlay>
        {activeItem ? (
          <div className="rounded-lg border bg-white shadow-lg p-3 opacity-90">
            <span className="text-sm">{activeItem.text}</span>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

/** Unified category card — always shows header + inline add input. Droppable zone. */
function CategoryCard({
  category,
  label,
  items,
  preset,
  onToggle,
  onRemove,
  onAdd,
  onClaim,
  onUnclaim,
  isMutating,
}: {
  category: string;
  label: string;
  items: DecryptedItem[];
  preset: string;
  onToggle: (itemId: string, completed: boolean) => Promise<void>;
  onRemove: (itemId: string) => Promise<void>;
  onAdd: (text: string, category: string) => Promise<void>;
  onClaim?: (itemId: string) => void;
  onUnclaim?: (itemId: string) => Promise<void>;
  isMutating: boolean;
}) {
  const t = useTranslations("ListPage");
  const { setNodeRef, isOver } = useDroppable({ id: category });
  const completedCount = items.filter((i) => i.completed).length;
  const hasItems = items.length > 0;

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "rounded-lg border bg-white overflow-hidden transition-colors",
        isOver && "border-teal-400 bg-teal-50/30",
      )}
    >
      <div className="flex items-center justify-between px-3 py-2 bg-neutral-50/80">
        <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">
          {label}
        </h3>
        {hasItems && (
          <span className="text-xs text-neutral-400">
            {completedCount}/{items.length}
          </span>
        )}
      </div>

      {hasItems && (
        <div className="divide-y divide-neutral-100">
          {items.map((item) => (
            <DraggableItem key={item.id} item={item} category={category}>
              {(dragHandleProps, isDragging) => (
                <ListItem
                  item={item}
                  preset={preset}
                  compact
                  onToggle={onToggle}
                  onRemove={onRemove}
                  onClaim={onClaim}
                  onUnclaim={onUnclaim}
                  dragHandleProps={dragHandleProps}
                  isDragging={isDragging}
                />
              )}
            </DraggableItem>
          ))}
        </div>
      )}

      <InlineAddInput
        category={category}
        onAdd={onAdd}
        isMutating={isMutating}
        placeholder={t("addItemPlaceholder")}
        hasItems={hasItems}
      />
    </div>
  );
}

/** Render-prop wrapper that makes a list item draggable without coupling ListItem to dnd-kit. */
function DraggableItem({
  item,
  category,
  children,
}: {
  item: DecryptedItem;
  category: string;
  children: (
    dragHandleProps: {
      attributes: DraggableAttributes;
      listeners: DraggableSyntheticListeners;
    },
    isDragging: boolean,
  ) => React.ReactNode;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: item.id,
    data: { category },
  });

  return (
    <div ref={setNodeRef}>
      {children({ attributes, listeners }, isDragging)}
    </div>
  );
}

/** Minimal inline input for adding items. Always visible in every category card. */
function InlineAddInput({
  category,
  onAdd,
  isMutating,
  placeholder,
  hasItems,
}: {
  category: string;
  onAdd: (text: string, category: string) => Promise<void>;
  isMutating: boolean;
  placeholder: string;
  hasItems: boolean;
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
      className={cn(
        "flex items-center gap-2 px-3 py-2.5",
        hasItems && "border-t border-neutral-100",
      )}
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
