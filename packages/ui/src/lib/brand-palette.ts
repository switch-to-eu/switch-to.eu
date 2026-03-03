export interface CardColorScheme {
  bg: string;
  text: string;
  button: string;
  shapeColor: string;
}

/** 8-color rotation matching the brand palette */
export const BRAND_CARD_COLORS: CardColorScheme[] = [
  { bg: "bg-brand-sky", text: "text-brand-green", button: "bg-brand-green text-white", shapeColor: "text-brand-green" },
  { bg: "bg-brand-orange", text: "text-white", button: "bg-white text-brand-orange", shapeColor: "text-white" },
  { bg: "bg-brand-yellow", text: "text-brand-green", button: "bg-brand-green text-white", shapeColor: "text-brand-green" },
  { bg: "bg-brand-green", text: "text-white", button: "bg-white text-brand-green", shapeColor: "text-white" },
  { bg: "bg-brand-pink", text: "text-brand-green", button: "bg-brand-green text-white", shapeColor: "text-brand-green" },
  { bg: "bg-brand-navy", text: "text-white", button: "bg-white text-brand-navy", shapeColor: "text-white" },
  { bg: "bg-brand-sage", text: "text-brand-green", button: "bg-brand-green text-white", shapeColor: "text-brand-green" },
  { bg: "bg-brand-red", text: "text-white", button: "bg-white text-brand-red", shapeColor: "text-white" },
];

/** Get a card color scheme by index (wraps around) */
export function getCardColor(index: number): CardColorScheme {
  return BRAND_CARD_COLORS[index % BRAND_CARD_COLORS.length]!;
}
