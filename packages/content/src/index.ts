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
  ContentSegments,
} from "./schemas";

export {
  GuideFrontmatterSchema,
  AlternativesFrontmatterSchema,
  ServiceFrontmatterSchema,
  CategoryMetadataSchema,
} from "./schemas";

// Utilities
export {
  getLanguageContentPath,
  isGuideFrontmatter,
  isAlternativesFrontmatter,
  isServiceFrontmatter,
  isCategoryMetadata,
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
} from "./search";
