import { FILTER_BRAND_GREEN, FILTER_WHITE } from "./shape-filters";

export interface CardColorScheme {
  bg: string;
  text: string;
  button: string;
  shapeFilter: string;
}

/** 8-color rotation matching the brand palette */
export const BRAND_CARD_COLORS: CardColorScheme[] = [
  { bg: "bg-brand-sky", text: "text-brand-green", button: "bg-brand-green text-white", shapeFilter: FILTER_BRAND_GREEN },
  { bg: "bg-brand-orange", text: "text-white", button: "bg-white text-brand-orange", shapeFilter: FILTER_WHITE },
  { bg: "bg-brand-yellow", text: "text-brand-green", button: "bg-brand-green text-white", shapeFilter: FILTER_BRAND_GREEN },
  { bg: "bg-brand-green", text: "text-white", button: "bg-white text-brand-green", shapeFilter: FILTER_WHITE },
  { bg: "bg-brand-pink", text: "text-brand-green", button: "bg-brand-green text-white", shapeFilter: FILTER_BRAND_GREEN },
  { bg: "bg-brand-navy", text: "text-white", button: "bg-white text-brand-navy", shapeFilter: FILTER_WHITE },
  { bg: "bg-brand-sage", text: "text-brand-green", button: "bg-brand-green text-white", shapeFilter: FILTER_BRAND_GREEN },
  { bg: "bg-brand-red", text: "text-white", button: "bg-white text-brand-red", shapeFilter: FILTER_WHITE },
];

/** Get a card color scheme by index (wraps around) */
export function getCardColor(index: number): CardColorScheme {
  return BRAND_CARD_COLORS[index % BRAND_CARD_COLORS.length]!;
}
