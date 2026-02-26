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
