"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { nanoid } from "nanoid";
import { Plus, Pencil, X, Check, List, ShoppingCart, Users } from "lucide-react";

import { Switch } from "@switch-to-eu/ui/components/switch";
import { Label } from "@switch-to-eu/ui/components/label";
import { Button } from "@switch-to-eu/ui/components/button";
import { cn } from "@switch-to-eu/ui/lib/utils";

import { getDefaultCategories, SHOPPING_CATEGORIES } from "@/lib/categories";
import type { DecryptedList } from "@hooks/use-list";
import type { DecryptedListData, ListSettings, CustomCategory } from "@/lib/types";

interface AdminSettingsProps {
  list: DecryptedList;
  settings: ListSettings;
  onUpdate: (newListData: DecryptedListData) => Promise<void>;
}

const PRESET_CONFIG = {
  plain: { enableCategories: false, enableClaims: false },
  shopping: { enableCategories: true, enableClaims: false },
  potluck: { enableCategories: false, enableClaims: true },
} as const;

const PRESET_ICONS = {
  plain: List,
  shopping: ShoppingCart,
  potluck: Users,
} as const;

export function AdminSettings({ list, settings, onUpdate }: AdminSettingsProps) {
  const t = useTranslations("ListPage");

  const categoryLabels = Object.fromEntries(
    SHOPPING_CATEGORIES.map((id) => [id, t(`categories.${id}` as Parameters<typeof t>[0])]),
  );

  const buildListData = (newSettings: ListSettings): DecryptedListData => ({
    title: list.title,
    description: list.description,
    settings: newSettings,
  });

  const handlePresetClick = (preset: "plain" | "shopping" | "potluck") => {
    const presetDefaults = PRESET_CONFIG[preset];
    const newSettings: ListSettings = {
      ...presetDefaults,
      categories: presetDefaults.enableCategories
        ? getDefaultCategories(categoryLabels)
        : undefined,
    };
    void onUpdate(buildListData(newSettings));
  };

  const handleToggleCategories = (enabled: boolean) => {
    const newSettings: ListSettings = {
      ...settings,
      enableCategories: enabled,
      categories: enabled
        ? settings.categories ?? getDefaultCategories(categoryLabels)
        : undefined,
    };
    void onUpdate(buildListData(newSettings));
  };

  const handleToggleClaims = (enabled: boolean) => {
    const newSettings: ListSettings = {
      ...settings,
      enableClaims: enabled,
    };
    void onUpdate(buildListData(newSettings));
  };

  const handleAddCategory = (label: string) => {
    const newCategory: CustomCategory = { id: nanoid(8), label };
    const newSettings: ListSettings = {
      ...settings,
      categories: [...(settings.categories ?? []), newCategory],
    };
    void onUpdate(buildListData(newSettings));
  };

  const handleRenameCategory = (id: string, newLabel: string) => {
    const newSettings: ListSettings = {
      ...settings,
      categories: (settings.categories ?? []).map((c) =>
        c.id === id ? { ...c, label: newLabel } : c,
      ),
    };
    void onUpdate(buildListData(newSettings));
  };

  const handleDeleteCategory = (id: string) => {
    const newSettings: ListSettings = {
      ...settings,
      categories: (settings.categories ?? []).filter((c) => c.id !== id),
    };
    void onUpdate(buildListData(newSettings));
  };

  // Determine which preset matches current settings (if any)
  const activePreset = Object.entries(PRESET_CONFIG).find(
    ([, config]) =>
      config.enableCategories === settings.enableCategories &&
      config.enableClaims === settings.enableClaims,
  )?.[0];

  return (
    <div className="rounded-lg border bg-neutral-50 p-4 space-y-5">
      <h3 className="text-sm font-semibold text-neutral-700">
        {t("settings.title")}
      </h3>

      {/* Preset quick-select */}
      <div className="space-y-2">
        <Label className="text-xs text-neutral-500">{t("settings.presetLabel")}</Label>
        <div className="grid grid-cols-3 gap-2">
          {(Object.keys(PRESET_CONFIG) as Array<keyof typeof PRESET_CONFIG>).map((preset) => {
            const Icon = PRESET_ICONS[preset];
            const isActive = activePreset === preset;
            return (
              <button
                key={preset}
                type="button"
                onClick={() => handlePresetClick(preset)}
                className={cn(
                  "flex flex-col items-center gap-1.5 rounded-lg border p-3 text-center transition-all",
                  isActive
                    ? "border-teal-500 bg-teal-50 text-teal-700"
                    : "border-neutral-200 bg-white text-neutral-500 hover:border-neutral-300",
                )}
              >
                <Icon className="h-4 w-4" />
                <span className="text-xs font-medium">
                  {t(`presets.${preset}` as Parameters<typeof t>[0])}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Feature toggles */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label htmlFor="enable-categories" className="text-sm text-neutral-600">
            {t("settings.enableCategories")}
          </Label>
          <Switch
            id="enable-categories"
            checked={settings.enableCategories}
            onCheckedChange={handleToggleCategories}
          />
        </div>
        <div className="flex items-center justify-between">
          <Label htmlFor="enable-claims" className="text-sm text-neutral-600">
            {t("settings.enableClaims")}
          </Label>
          <Switch
            id="enable-claims"
            checked={settings.enableClaims}
            onCheckedChange={handleToggleClaims}
          />
        </div>
      </div>

      {/* Category management */}
      {settings.enableCategories && (
        <CategoryManager
          categories={settings.categories ?? []}
          onAdd={handleAddCategory}
          onRename={handleRenameCategory}
          onDelete={handleDeleteCategory}
        />
      )}
    </div>
  );
}

function CategoryManager({
  categories,
  onAdd,
  onRename,
  onDelete,
}: {
  categories: CustomCategory[];
  onAdd: (label: string) => void;
  onRename: (id: string, label: string) => void;
  onDelete: (id: string) => void;
}) {
  const t = useTranslations("ListPage");
  const [newCategoryText, setNewCategoryText] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryText.trim()) return;
    onAdd(newCategoryText.trim());
    setNewCategoryText("");
  };

  const startEditing = (cat: CustomCategory) => {
    setEditingId(cat.id);
    setEditingText(cat.label);
  };

  const confirmEdit = () => {
    if (editingId && editingText.trim()) {
      onRename(editingId, editingText.trim());
    }
    setEditingId(null);
    setEditingText("");
  };

  return (
    <div className="space-y-2">
      <Label className="text-xs text-neutral-500">{t("settings.categoriesTitle")}</Label>
      <div className="rounded-lg border bg-white overflow-hidden">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="flex items-center gap-2 px-3 py-2 border-b border-neutral-100 last:border-b-0"
          >
            {editingId === cat.id ? (
              <>
                <input
                  value={editingText}
                  onChange={(e) => setEditingText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && confirmEdit()}
                  className="flex-1 text-sm bg-transparent outline-none"
                  autoFocus
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={confirmEdit}
                  className="h-7 w-7 p-0 text-teal-600 hover:text-teal-700"
                >
                  <Check className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditingId(null)}
                  className="h-7 w-7 p-0 text-neutral-400 hover:text-neutral-600"
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              </>
            ) : (
              <>
                <span className="flex-1 text-sm text-neutral-700">{cat.label}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => startEditing(cat)}
                  className="h-7 w-7 p-0 text-neutral-400 hover:text-neutral-600"
                >
                  <Pencil className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(cat.id)}
                  className="h-7 w-7 p-0 text-neutral-400 hover:text-red-600"
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              </>
            )}
          </div>
        ))}

        {/* Add category input */}
        <form
          onSubmit={handleAddSubmit}
          className={cn(
            "flex items-center gap-2 px-3 py-2",
            categories.length > 0 && "border-t border-neutral-100",
          )}
        >
          <Plus className="h-4 w-4 text-neutral-300 shrink-0" />
          <input
            value={newCategoryText}
            onChange={(e) => setNewCategoryText(e.target.value)}
            placeholder={t("settings.addCategory")}
            maxLength={100}
            className="flex-1 text-sm bg-transparent outline-none placeholder:text-neutral-300"
          />
        </form>
      </div>
    </div>
  );
}
