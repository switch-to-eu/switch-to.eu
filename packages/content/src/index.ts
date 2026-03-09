// Config
export { setContentRoot, getContentRoot } from "./config";

// Types
export type { Locale, PageData } from "./types";

// Schemas
export type {
  GuideFrontmatter,
  AlternativesFrontmatter,
  ServiceFrontmatter,
  CategoryMetadata,
  LandingPageFrontmatter,
  ContentSegments,
} from "./schemas";

export {
  GuideFrontmatterSchema,
  AlternativesFrontmatterSchema,
  ServiceFrontmatterSchema,
  CategoryMetadataSchema,
  LandingPageFrontmatterSchema,
} from "./schemas";

// Utilities
export {
  getLanguageContentPath,
  isGuideFrontmatter,
  isAlternativesFrontmatter,
  isServiceFrontmatter,
  isCategoryMetadata,
  isLandingPageFrontmatter,
  extractContentSegments,
  extractServiceIssues,
  extractMigrationSteps,
  extractMissingFeatures,
  extractStepsWithMeta,
  processCompletionMarkers,
} from "./utils";

// Services
export * from "./services";

// Markdown
export { createCustomRenderer, parseMarkdown } from "./markdown";

// Search
export {
  buildSearchIndex,
  performSearch,
  getRecommendedSearchResults,
} from "./search";
export type {
  SearchResultType,
  SearchResult,
  BaseSearchResult,
  GuideSearchResult,
  ServiceSearchResult,
  CategorySearchResult,
  LandingPageSearchResult,
} from "./search";
