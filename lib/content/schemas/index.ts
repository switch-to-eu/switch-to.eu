import { z } from 'zod';

// Define schemas for validation
export const GuideFrontmatterSchema = z.object({
    title: z.string(),
    description: z.string(),
    difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
    timeRequired: z.string(),
    sourceService: z.string(),
    targetService: z.string(),
    date: z.string().optional(),
    author: z.string().optional(),
    missingFeatures: z.array(z.string()).optional(),
});

export const AlternativesFrontmatterSchema = z.object({
    title: z.string(),
    description: z.string(),
    services: z.array(
        z.object({
            name: z.string(),
            location: z.string(),
            privacyRating: z.number(),
            freeOption: z.boolean(),
            startingPrice: z.string(),
            description: z.string(),
            url: z.string(),
        })
    ),
});

// Schema for individual service files
export const ServiceFrontmatterSchema = z.object({
    name: z.string(),
    category: z.string(),
    location: z.string(),
    region: z.enum(['eu', 'non-eu']).optional(),
    privacyRating: z.number(),
    freeOption: z.boolean(),
    startingPrice: z.string(),
    description: z.string(),
    url: z.string(),
    logo: z.string().optional(),
    features: z.array(z.string()).optional(),
    tags: z.array(z.string()).optional(),
    featured: z.boolean().optional(),
    recommendedAlternative: z.string().optional(),
    issues: z.array(z.string()).optional(),
});

// Schema for category metadata
export const CategoryMetadataSchema = z.object({
    title: z.string(),
    description: z.string(),
    icon: z.string().optional(),
});

// Define types from schemas
export type GuideFrontmatter = z.infer<typeof GuideFrontmatterSchema>;
export type AlternativesFrontmatter = z.infer<typeof AlternativesFrontmatterSchema>;
export type ServiceFrontmatter = z.infer<typeof ServiceFrontmatterSchema>;
export type CategoryMetadata = z.infer<typeof CategoryMetadataSchema>;

// Type guards
export function isGuideFrontmatter(data: unknown): data is GuideFrontmatter {
    return GuideFrontmatterSchema.safeParse(data).success;
}

export function isAlternativesFrontmatter(data: unknown): data is AlternativesFrontmatter {
    return AlternativesFrontmatterSchema.safeParse(data).success;
}

export function isServiceFrontmatter(data: unknown): data is ServiceFrontmatter {
    return ServiceFrontmatterSchema.safeParse(data).success;
}

export function isCategoryMetadata(data: unknown): data is CategoryMetadata {
    return CategoryMetadataSchema.safeParse(data).success;
}