// Export types and schemas
export type {
  GuideFrontmatter,
  AlternativesFrontmatter,
  ServiceFrontmatter,
  CategoryMetadata,
  ContentSegments,
} from "./schemas";

// Export schemas
export {
  GuideFrontmatterSchema,
  AlternativesFrontmatterSchema,
  ServiceFrontmatterSchema,
  CategoryMetadataSchema,
} from "./schemas";

// Export utility functions
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
} from "./utils";

// Export service modules
export * from "./services";
