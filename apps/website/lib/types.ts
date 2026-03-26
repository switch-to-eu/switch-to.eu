export type SearchResult = {
  id: string;
  type: "service" | "guide" | "category" | "landing-page";
  title: string;
  description: string;
  url: string;
  region?: string;
  category?: string;
  location?: string;
  freeOption?: boolean;
  sourceService?: string;
  targetService?: string;
}
