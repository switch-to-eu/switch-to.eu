import { FILTER_BRAND_GREEN, FILTER_WHITE } from "./shape-filters";
import type { CardColorScheme } from "./brand-palette";

export const BRAND_COLORS = {
  yellow: { name: "Yellow", value: "#FBA616", tw: "brand-yellow", foreground: "#1a1a1a" },
  green: { name: "Green", value: "#0D492C", tw: "brand-green", foreground: "#ffffff" },
  sky: { name: "Sky", value: "#9BCDD0", tw: "brand-sky", foreground: "#1a1a1a" },
  red: { name: "Red", value: "#E22028", tw: "brand-red", foreground: "#ffffff" },
  pink: { name: "Pink", value: "#E282B4", tw: "brand-pink", foreground: "#1a1a1a" },
  navy: { name: "Navy", value: "#1E42B0", tw: "brand-navy", foreground: "#ffffff" },
  sage: { name: "Sage", value: "#B0D8B0", tw: "brand-sage", foreground: "#1a1a1a" },
  orange: { name: "Orange", value: "#E45229", tw: "brand-orange", foreground: "#ffffff" },
  cream: { name: "Cream", value: "#fefbf9", tw: "brand-cream", foreground: "#1a1a1a" },
} as const;

export type BrandColorKey = keyof typeof BRAND_COLORS;

export interface ToolColorScheme {
  /** Buttons, headings, gradient start */
  primary: BrandColorKey;
  /** Icons, highlights, gradient end */
  accent: BrandColorKey;
  /** Light tinted backgrounds (used at /10 opacity) */
  surface: BrandColorKey;
}

/** Current tool assignments — pick from UI Kit combo browser */
export const TOOL_SCHEMES: Record<string, ToolColorScheme> = {
  keepfocus: { primary: "navy", accent: "sky", surface: "sky" },
  plotty: { primary: "navy", accent: "pink", surface: "pink" },
  listy: { primary: "green", accent: "sage", surface: "sage" },
  privnote: { primary: "orange", accent: "yellow", surface: "yellow" },
  kanban: { primary: "navy", accent: "sage", surface: "sage" },
  quiz: { primary: "red", accent: "orange", surface: "orange" },
  "eu-scan": { primary: "green", accent: "sky", surface: "sky" },
};

/** Generate CSS variable values for a tool scheme */
export function getToolCSSVars(scheme: ToolColorScheme) {
  return {
    "--tool-primary": `var(--brand-${scheme.primary})`,
    "--tool-primary-foreground": BRAND_COLORS[scheme.primary].foreground,
    "--tool-accent": `var(--brand-${scheme.accent})`,
    "--tool-accent-foreground": BRAND_COLORS[scheme.accent].foreground,
    "--tool-surface": `var(--brand-${scheme.surface})`,
    "--tool-surface-foreground": BRAND_COLORS[scheme.surface].foreground,
  } as const;
}

/** Get a CardColorScheme for a tool based on its TOOL_SCHEMES primary color */
export function getToolCardColor(toolId: string): CardColorScheme {
  const scheme = TOOL_SCHEMES[toolId];
  if (!scheme) {
    return { bg: "bg-brand-green", text: "text-white", button: "bg-white text-brand-green", shapeFilter: FILTER_WHITE };
  }

  const primary = BRAND_COLORS[scheme.primary];
  const isDark = primary.foreground === "#ffffff";

  return {
    bg: `bg-${primary.tw}`,
    text: isDark ? "text-white" : "text-brand-green",
    button: isDark
      ? `bg-white text-${primary.tw}`
      : `bg-brand-green text-white`,
    shapeFilter: isDark ? FILTER_WHITE : FILTER_BRAND_GREEN,
  };
}

/** All brand color keys suitable for selection UIs */
export const BRAND_COLOR_KEYS = Object.keys(BRAND_COLORS) as BrandColorKey[];
