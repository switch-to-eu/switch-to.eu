import { z } from 'zod';

/**
 * Interface for content segments
 * Used to represent different sections of content separated by custom markers
 */
export interface ContentSegments {
    intro?: string;
    before?: string;
    steps?: string;
    troubleshooting?: string;
    outro?: string;
    unsegmented?: string; // For legacy compatibility
    [key: string]: string | undefined; // Allow for custom segment types
}

// Import schema types
import type {
    GuideFrontmatterSchema,
    AlternativesFrontmatterSchema,
    ServiceFrontmatterSchema,
    CategoryMetadataSchema
} from '../schemas';

// Define types from schemas
export type GuideFrontmatter = z.infer<typeof GuideFrontmatterSchema>;
export type AlternativesFrontmatter = z.infer<typeof AlternativesFrontmatterSchema>;
export type ServiceFrontmatter = z.infer<typeof ServiceFrontmatterSchema>;
export type CategoryMetadata = z.infer<typeof CategoryMetadataSchema>;

// Export these schemas references for use with the type inference
// Actual schema definitions are in the schemas directory
export {
    GuideFrontmatterSchema,
    AlternativesFrontmatterSchema,
    ServiceFrontmatterSchema,
    CategoryMetadataSchema
} from '../schemas';