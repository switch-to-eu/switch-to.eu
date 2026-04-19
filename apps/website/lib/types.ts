import type { Service } from "@/payload-types";

export type SearchResult = {
  id: string;
  type: "service" | "guide" | "category" | "landing-page";
  title: string;
  description: string;
  url: string;
  region?: Service["region"];
  category?: string;
  location?: string;
  freeOption?: boolean;
  sourceService?: string;
  targetService?: string;
};

/**
 * Compact step descriptor consumed by the guide sidebar + steps summary.
 * Derived from a Payload `Guide["steps"][number]` at the page level.
 */
export type GuideStepSummary = {
  title: string;
  id: string;
};
