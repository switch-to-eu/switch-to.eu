import type { Article } from "@/lib/content/types";

/**
 * One saturated accent per article type. Text colours follow the brand
 * text-on-colour rule (dark fills take white, light fills take #1a1a1a).
 */
export const ARTICLE_TYPE_PILL: Record<Article["type"], string> = {
  news: "bg-brand-yellow text-[#1a1a1a]",
  analysis: "bg-brand-navy text-white",
};
