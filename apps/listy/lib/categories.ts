import type { CustomCategory, ListSettings } from "@/lib/types";

export const SHOPPING_CATEGORIES = [
  "produce",
  "bakery",
  "dairy",
  "meat",
  "pantry",
  "drinks",
  "snacks",
  "frozen",
  "household",
  "other",
] as const;

export type ShoppingCategory = (typeof SHOPPING_CATEGORIES)[number];

export const DEFAULT_CATEGORY: ShoppingCategory = "other";

/** Build default shopping CustomCategory[] with translated labels */
export function getDefaultCategories(
  labels: Record<string, string>,
): CustomCategory[] {
  return SHOPPING_CATEGORIES.map((id) => ({
    id,
    label: labels[id] ?? id,
  }));
}

/** Derive effective settings from preset + optional stored settings */
export function getListSettings(
  preset: string,
  settings?: ListSettings,
): ListSettings {
  if (settings) return settings;

  switch (preset) {
    case "shopping":
      return { enableCategories: true, enableClaims: false };
    case "potluck":
      return { enableCategories: false, enableClaims: true };
    default:
      return { enableCategories: false, enableClaims: false };
  }
}
