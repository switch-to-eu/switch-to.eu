import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { z } from 'zod';
import { Locale } from '@/lib/i18n/dictionaries';

// Base content directory
const contentRoot = path.join(process.cwd(), '/content');

// Function to get content path for a specific language
export function getLanguageContentPath(lang: Locale = 'en'): string {
  const langPath = path.join(contentRoot, lang);

  // Check if language-specific directory exists
  if (fs.existsSync(langPath)) {
    return langPath;
  }

  // Fallback to base content directory
  return contentRoot;
}

// Define schemas for validation
const GuideFrontmatterSchema = z.object({
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

const AlternativesFrontmatterSchema = z.object({
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

// New schema for individual service files
const ServiceFrontmatterSchema = z.object({
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

// New schema for category metadata
const CategoryMetadataSchema = z.object({
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

// Function to get all guide categories
export async function getGuideCategories(lang: Locale = 'en'): Promise<string[]> {
    try {
        const langContentRoot = getLanguageContentPath(lang);
        const guidesDir = path.join(langContentRoot, 'guides');
        return fs.readdirSync(guidesDir)
            .filter(file =>
                fs.statSync(path.join(guidesDir, file)).isDirectory() &&
                !file.startsWith('.')
            );
    } catch (error) {
        console.error('Error reading guide categories:', error);
        return [];
    }
}

// Function to get all guides for a category
export async function getGuidesByCategory(category: string, lang: Locale = 'en'): Promise<{
    slug: string;
    frontmatter: GuideFrontmatter;
}[]> {
    const langContentRoot = getLanguageContentPath(lang);
    const categoryDir = path.join(langContentRoot, 'guides', category);

    try {
        if (!fs.existsSync(categoryDir)) {
            return [];
        }

        const guides = fs.readdirSync(categoryDir)
            .filter(dir =>
                fs.statSync(path.join(categoryDir, dir)).isDirectory() &&
                !dir.startsWith('.')
            );

        const guidesData = guides.map(slug => {
            const mdxFile = path.join(categoryDir, slug, 'index.mdx');

            // Skip if MDX file doesn't exist
            if (!fs.existsSync(mdxFile)) {
                return null;
            }

            const fileContent = fs.readFileSync(mdxFile, 'utf8');
            const { data } = matter(fileContent);

            // Skip if data is not valid
            if (!isGuideFrontmatter(data)) {
                console.warn(`Invalid frontmatter in ${mdxFile}`);
                return null;
            }

            return {
                slug,
                frontmatter: data,
            };
        }).filter((item): item is { slug: string; frontmatter: GuideFrontmatter } => item !== null);

        return guidesData;
    } catch (error) {
        console.error(`Error reading guides for category ${category}:`, error);
        return [];
    }
}

// Function to get a specific guide
export async function getGuide(category: string, slug: string, lang: Locale = 'en'): Promise<{
    frontmatter: GuideFrontmatter;
    content: string;
} | null> {
    const langContentRoot = getLanguageContentPath(lang);
    const mdxFile = path.join(langContentRoot, 'guides', category, slug, 'index.mdx');

    try {
        if (!fs.existsSync(mdxFile)) {
            return null;
        }

        const fileContent = fs.readFileSync(mdxFile, 'utf8');
        const { data, content } = matter(fileContent);

        if (!isGuideFrontmatter(data)) {
            console.warn(`Invalid frontmatter in ${mdxFile}`);
            return null;
        }

        return {
            frontmatter: data,
            content,
        };
    } catch (error) {
        console.error(`Error reading guide ${category}/${slug}:`, error);
        return null;
    }
}

// Function to get services for a category
export async function getAlternativesByCategory(category: string, lang: Locale = 'en'): Promise<AlternativesFrontmatter | null> {
    const langContentRoot = getLanguageContentPath(lang);
    const mdxFile = path.join(langContentRoot, 'alternatives', category, 'index.mdx');

    try {
        // First try to load from the legacy format (alternatives/category/index.mdx)
        if (fs.existsSync(mdxFile)) {
            const fileContent = fs.readFileSync(mdxFile, 'utf8');
            const { data } = matter(fileContent);

            if (!isAlternativesFrontmatter(data)) {
                console.warn(`Invalid frontmatter in ${mdxFile}`);
                return null;
            }

            return data;
        }

        // If no legacy file exists, try to load from individual service files
        const services = await getServicesByCategory(category, undefined, lang);

        if (services.length === 0) {
            return null;
        }

        // Create a compatible AlternativesFrontmatter object from the services
        const alternativesData: AlternativesFrontmatter = {
            title: `${category.charAt(0).toUpperCase() + category.slice(1)} Service Alternatives`,
            description: `EU-based alternatives for common ${category} services that prioritize privacy and data protection.`,
            services: services.map(service => ({
                name: service.name,
                location: service.location,
                privacyRating: service.privacyRating,
                freeOption: service.freeOption,
                startingPrice: service.startingPrice,
                description: service.description,
                url: service.url
            }))
        };

        return alternativesData;
    } catch (error) {
        console.error(`Error reading alternatives for ${category}:`, error);
        return null;
    }
}

/**
 * Get a list of all alternatives categories
 */
export function getAlternativesCategories(lang: Locale = 'en'): string[] {
    const langContentRoot = getLanguageContentPath(lang);
    const alternativesPath = path.join(langContentRoot, 'alternatives');
    return fs.existsSync(alternativesPath)
        ? fs.readdirSync(alternativesPath).filter(dir =>
            fs.statSync(path.join(alternativesPath, dir)).isDirectory() &&
            !dir.startsWith('.')
        )
        : [];
}

/**
 * Get metadata for a category
 */
export function getCategoryMetadata(category: string, lang: Locale = 'en'): CategoryMetadata | null {
    const langContentRoot = getLanguageContentPath(lang);
    const categoryFile = path.join(langContentRoot, 'categories', `${category}.md`);

    try {
        if (!fs.existsSync(categoryFile)) {
            return null;
        }

        const fileContent = fs.readFileSync(categoryFile, 'utf8');
        const { data } = matter(fileContent);

        if (!isCategoryMetadata(data)) {
            console.warn(`Invalid metadata in ${categoryFile}`);
            return null;
        }

        return data;
    } catch (error) {
        console.error(`Error reading category metadata for ${category}:`, error);
        return null;
    }
}

/**
 * Get metadata for all categories
 */
export function getAllCategoriesMetadata(lang: Locale = 'en'): {
    slug: string;
    metadata: CategoryMetadata
}[] {
    try {
        const langContentRoot = getLanguageContentPath(lang);
        const categoriesDir = path.join(langContentRoot, 'categories');

        if (!fs.existsSync(categoriesDir)) {
            return [];
        }

        return fs.readdirSync(categoriesDir)
            .filter(file => file.endsWith('.md') && !file.startsWith('.'))
            .map(file => {
                const slug = file.replace('.md', '');
                const metadata = getCategoryMetadata(slug, lang);

                if (!metadata) {
                    return null;
                }

                return {
                    slug,
                    metadata
                };
            })
            .filter((item): item is { slug: string; metadata: CategoryMetadata } => item !== null);
    } catch (error) {
        console.error('Error reading category metadata:', error);
        return [];
    }
}

/**
 * Get all featured services across categories
 */
export async function getFeaturedServices(lang: Locale = 'en', regionFilter?: 'eu' | 'non-eu'): Promise<{
    service: ServiceFrontmatter;
    category: string;
}[]> {
    try {
        // Use the getAllServices function which now scans all directories
        const allServices = await getAllServices(lang);

        // Filter to featured services
        const featuredServices = allServices
            .filter(service => service.featured === true)
            // Apply region filter if specified
            .filter(service => !regionFilter || service.region === regionFilter)
            .map(service => ({
                service,
                category: service.category
            }));

        return featuredServices;
    } catch (error) {
        console.error('Error reading featured services:', error);
        return [];
    }
}

/**
 * Get all guides (optionally filtered by source or target service)
 */
export async function getAllGuides({
    sourceService,
    targetService,
    lang = 'en'
}: {
    sourceService?: string;
    targetService?: string;
    lang?: Locale;
} = {}): Promise<Array<{
    category: string;
    slug: string;
    frontmatter: GuideFrontmatter;
}>> {
    const categories = await getGuideCategories(lang);
    const allGuides: Array<{
        category: string;
        slug: string;
        frontmatter: GuideFrontmatter;
    }> = [];

    // Process categories one by one
    for (const category of categories) {
        const guides = await getGuidesByCategory(category, lang);
        for (const guide of guides) {
            allGuides.push({
                category,
                slug: guide.slug,
                frontmatter: guide.frontmatter
            });
        }
    }

    // Apply filters if provided
    return allGuides.filter(guide => {
        if (sourceService && guide.frontmatter.sourceService !== sourceService) {
            return false;
        }
        if (targetService && guide.frontmatter.targetService !== targetService) {
            return false;
        }
        return true;
    });
}

/**
 * Get all services
 */
export async function getAllServices(lang: Locale = 'en'): Promise<ServiceFrontmatter[]> {
    const langContentRoot = getLanguageContentPath(lang);
    const servicesDir = path.join(langContentRoot, 'services');
    const services: ServiceFrontmatter[] = [];

    try {
        if (!fs.existsSync(servicesDir)) {
            return [];
        }

        // First, check for services in the root services directory (legacy)
        const rootServiceFiles = fs.readdirSync(servicesDir)
            .filter(file =>
                (file.endsWith('.md') || file.endsWith('.mdx')) &&
                !file.startsWith('.') &&
                file !== 'README.md'
            );

        for (const file of rootServiceFiles) {
            const fullPath = path.join(servicesDir, file);
            if (fs.statSync(fullPath).isDirectory()) continue;

            const fileContent = fs.readFileSync(fullPath, 'utf8');
            const { data } = matter(fileContent);

            if (!isServiceFrontmatter(data)) {
                console.warn(`Invalid service frontmatter in ${fullPath}`);
                continue;
            }

            // Add inferred region for backward compatibility
            if (!data.region) {
                data.region = 'eu'; // Default to EU for existing services
            }

            services.push(data);
        }

        // Check for EU services
        const euDir = path.join(servicesDir, 'eu');
        if (fs.existsSync(euDir)) {
            const euServiceFiles = fs.readdirSync(euDir)
                .filter(file =>
                    (file.endsWith('.md') || file.endsWith('.mdx')) &&
                    !file.startsWith('.')
                );

            for (const file of euServiceFiles) {
                const fullPath = path.join(euDir, file);
                const fileContent = fs.readFileSync(fullPath, 'utf8');
                const { data } = matter(fileContent);

                if (!isServiceFrontmatter(data)) {
                    console.warn(`Invalid service frontmatter in ${fullPath}`);
                    continue;
                }

                // Ensure the region is set correctly
                data.region = 'eu';
                services.push(data);
            }
        }

        // Check for non-EU services
        const nonEuDir = path.join(servicesDir, 'non-eu');
        if (fs.existsSync(nonEuDir)) {
            const nonEuServiceFiles = fs.readdirSync(nonEuDir)
                .filter(file =>
                    (file.endsWith('.md') || file.endsWith('.mdx')) &&
                    !file.startsWith('.')
                );

            for (const file of nonEuServiceFiles) {
                const fullPath = path.join(nonEuDir, file);
                const fileContent = fs.readFileSync(fullPath, 'utf8');
                const { data } = matter(fileContent);

                if (!isServiceFrontmatter(data)) {
                    console.warn(`Invalid service frontmatter in ${fullPath}`);
                    continue;
                }

                // Ensure the region is set correctly
                data.region = 'non-eu';
                services.push(data);
            }
        }

        return services;
    } catch (error) {
        console.error('Error reading services:', error);
        return [];
    }
}

/**
 * Get only EU-based services
 */
export async function getEUServices(lang: Locale = 'en'): Promise<ServiceFrontmatter[]> {
    const services = await getAllServices(lang);
    return services.filter(service => service.region === 'eu');
}

/**
 * Get only non-EU services
 */
export async function getNonEUServices(lang: Locale = 'en'): Promise<ServiceFrontmatter[]> {
    const services = await getAllServices(lang);
    return services.filter(service => service.region === 'non-eu');
}

/**
 * Get services filtered by category with optional region filter
 */
export async function getServicesByCategory(
    category: string,
    regionFilter?: 'eu' | 'non-eu',
    lang: Locale = 'en'
): Promise<ServiceFrontmatter[]> {
    const services = await getAllServices(lang);
    return services.filter(service => {
        // Always filter by category
        const categoryMatch = service.category.toLowerCase() === category.toLowerCase();

        // Apply region filter if specified
        if (regionFilter) {
            return categoryMatch && service.region === regionFilter;
        }

        return categoryMatch;
    });
}

/**
 * Get a specific service by slug
 */
export async function getServiceBySlug(slug: string, lang: Locale = 'en'): Promise<{
    frontmatter: ServiceFrontmatter;
    content: string;
} | null> {
    const langContentRoot = getLanguageContentPath(lang);
    const fileExtensions = ['.md', '.mdx'];
    const servicesDir = path.join(langContentRoot, 'services');
    const euDir = path.join(servicesDir, 'eu');
    const nonEuDir = path.join(servicesDir, 'non-eu');
    const directories = [servicesDir, euDir, nonEuDir]; // Try root first, then eu/, then non-eu/

    // Create several variations of the slug to try
    // 1. Original slug (as passed)
    // 2. Replace hyphens with dots
    // 3. Replace hyphens with spaces
    // 4. Replace dots with hyphens
    const slugVariations = [
        slug,
        slug.replace(/-/g, '.'),
        slug.replace(/-/g, ' '),
        slug.replace(/\./g, '-')
    ];

    // Try to find the file with either extension in any of the directories
    let filePath: string | null = null;

    // First, try exact filename matches with each slug variation
    for (const dir of directories) {
        if (!fs.existsSync(dir)) {
            continue;
        }

        // Try every slug variation with every file extension
        for (const slugVar of slugVariations) {
            for (const ext of fileExtensions) {
                const testPath = path.join(dir, `${slugVar}${ext}`);

                if (fs.existsSync(testPath)) {
                    filePath = testPath;
                    break;
                }
            }
            if (filePath) break;
        }
        if (filePath) break;
    }

    // If exact match not found, try a fuzzy search by reading all files and comparing names
    if (!filePath) {
        for (const dir of directories) {
            if (!fs.existsSync(dir)) continue;

            const files = fs.readdirSync(dir);

            for (const file of files) {
                // Skip directories and non-markdown files
                const ext = path.extname(file);
                if (!fileExtensions.includes(ext)) continue;

                // Get the base name without extension
                const baseName = path.basename(file, ext);

                // Try to match with any of the slug variations, case-insensitively
                // Also normalize by removing spaces, dots, and hyphens for comparison
                const normalizedBaseName = baseName.replace(/[\s.-]/g, '').toLowerCase();

                for (const slugVar of slugVariations) {
                    const normalizedSlugVar = slugVar.replace(/[\s.-]/g, '').toLowerCase();

                    if (normalizedBaseName === normalizedSlugVar) {
                        filePath = path.join(dir, file);
                        break;
                    }
                }

                if (filePath) break;
            }

            if (filePath) break;
        }
    }

    // If still not found, look for a name match inside the frontmatter
    if (!filePath) {
        // Read all service files and check their frontmatter
        for (const dir of directories) {
            if (!fs.existsSync(dir)) continue;

            const files = fs.readdirSync(dir);

            for (const file of files) {
                // Skip directories and non-markdown files
                const ext = path.extname(file);
                if (!fileExtensions.includes(ext)) continue;

                const fullPath = path.join(dir, file);

                try {
                    const fileContent = fs.readFileSync(fullPath, 'utf8');
                    const { data } = matter(fileContent);

                    if (!isServiceFrontmatter(data)) continue;

                    // Check if the service name in frontmatter matches any slug variation
                    const serviceName = data.name.toLowerCase();

                    for (const slugVar of slugVariations) {
                        // Replace all separators with nothing for comparison
                        const normalizedServiceName = serviceName.replace(/[\s.-]/g, '').toLowerCase();
                        const normalizedSlugVar = slugVar.replace(/[\s.-]/g, '').toLowerCase();

                        if (normalizedServiceName === normalizedSlugVar) {
                            filePath = fullPath;
                            break;
                        }
                    }

                    if (filePath) break;
                } catch (error) {
                    console.error(`Error reading file ${fullPath}:`, error);
                }
            }

            if (filePath) break;
        }
    }

    if (!filePath) {
        return null;
    }

    try {
        const fileContent = fs.readFileSync(filePath, 'utf8');
        const { data, content } = matter(fileContent);

        if (!isServiceFrontmatter(data)) {
            console.warn(`Invalid service frontmatter in ${filePath}`);
            return null;
        }

        // Set region based on file location if not already set
        if (!data.region) {
            if (filePath.includes('/eu/')) {
                data.region = 'eu';
            } else if (filePath.includes('/non-eu/')) {
                data.region = 'non-eu';
            } else {
                data.region = 'eu'; // Default for legacy files
            }
        }

        return {
            frontmatter: data,
            content,
        };
    } catch (error) {
        console.error(`Error reading service ${slug}:`, error);
        return null;
    }
}

/**
 * Get metadata and content for a category
 */
export function getCategoryContent(category: string, lang: Locale = 'en'): {
    metadata: CategoryMetadata | null;
    content: string | null;
} {
    const langContentRoot = getLanguageContentPath(lang);
    const categoryFile = path.join(langContentRoot, 'categories', `${category}.md`);

    try {
        if (!fs.existsSync(categoryFile)) {
            return { metadata: null, content: null };
        }

        const fileContent = fs.readFileSync(categoryFile, 'utf8');
        const { data, content } = matter(fileContent);

        if (!isCategoryMetadata(data)) {
            console.warn(`Invalid metadata in ${categoryFile}`);
            return { metadata: null, content: null };
        }

        return {
            metadata: data,
            content: content.trim()
        };
    } catch (error) {
        console.error(`Error reading category content for ${category}:`, error);
        return { metadata: null, content: null };
    }
}

/**
 * Get all guides where a specific service is the target
 */
export async function getGuidesByTargetService(targetService: string, lang: Locale = 'en'): Promise<{
    slug: string;
    frontmatter: GuideFrontmatter;
    category: string;
}[]> {
    const categories = await getGuideCategories(lang);
    const allGuides: {
        slug: string;
        frontmatter: GuideFrontmatter;
        category: string;
    }[] = [];

    // Gather guides from all categories
    for (const category of categories) {
        const categoryGuides = await getGuidesByCategory(category, lang);

        // Add each guide with its category
        categoryGuides.forEach(guide => {
            allGuides.push({
                ...guide,
                category
            });
        });
    }

    // Filter guides to only those targeting the specified service
    return allGuides.filter(guide =>
        guide.frontmatter.targetService.toLowerCase() === targetService.toLowerCase()
    );
}

/**
 * Extracts service issues from the markdown content
 * Looks for a section titled "## Service Issues" and parses the list items
 */
export function extractServiceIssues(content: string): string[] {
    if (!content) return [];

    // Find the Service Issues section
    const issuesSectionMatch = content.match(/## Service Issues\s+([\s\S]*?)(?=##|$)/);
    if (!issuesSectionMatch || !issuesSectionMatch[1]) return [];

    // Extract list items (lines starting with "- " or "* ")
    const issuesSection = issuesSectionMatch[1].trim();
    const issues = issuesSection
        .split('\n')
        .filter(line => line.trim().startsWith('- ') || line.trim().startsWith('* '))
        .map(line => line.replace(/^[*-]\s+/, '').trim())
        .filter(issue => issue.length > 0);

    return issues;
}

/**
 * Extracts heading sections from the markdown content
 * Captures only h2 headings (##) and returns them with their IDs for anchor links
 */
export function extractMigrationSteps(content: string): Array<{ title: string; id: string }> {
    if (!content) return [];

    // Find only h2 headings (exactly two # characters),
    // using word boundary \b to ensure we don't match ### or more
    const headingRegex = /^##\s+(.+?)(?=\n|$)/gm;
    const matches = [...content.matchAll(headingRegex)];

    return matches.map(match => {
        const title = match[1].trim();
        // Create a valid HTML ID by converting to lowercase, replacing spaces with hyphens
        // and removing any characters that aren't alphanumeric, hyphens, or underscores
        const id = title
            .toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '-');

        return {
            title,
            id
        };
    });
}

/**
 * Extracts missing features from the frontmatter metadata
 * Falls back to content parsing if no metadata is available
 */
export function extractMissingFeatures(content: string, frontmatter?: GuideFrontmatter): string[] {
    // If frontmatter has missing features, return those
    if (frontmatter?.missingFeatures && frontmatter.missingFeatures.length > 0) {
        return frontmatter.missingFeatures;
    }

    // Legacy fallback: extract from content if no frontmatter data
    if (!content) return [];

    // Look for relevant sections with different potential titles
    const sectionRegexes = [
        /## What's Different\s+([\s\S]*?)(?=##|$)/,
        /## Limitations\s+([\s\S]*?)(?=##|$)/,
        /## Missing Features\s+([\s\S]*?)(?=##|$)/,
        /## Feature Comparison\s+([\s\S]*?)(?=##|$)/
    ];

    let allMissingFeatures: string[] = [];

    for (const regex of sectionRegexes) {
        const sectionMatch = content.match(regex);
        if (sectionMatch && sectionMatch[1]) {
            const sectionContent = sectionMatch[1].trim();

            // First try to find list items that mention missing features
            const listItems = sectionContent
                .split('\n')
                .filter(line => {
                    const trimmedLine = line.trim();
                    return (trimmedLine.startsWith('- ') || trimmedLine.startsWith('* '));
                })
                .map(line => line.replace(/^[*-]\s+/, '').trim())
                .filter(item => item.length > 0);

            // If we found list items, add them
            if (listItems.length > 0) {
                allMissingFeatures = [...allMissingFeatures, ...listItems];
                continue;
            }

            // Otherwise, try to parse tables for missing features
            // This is a simplified approach - a more comprehensive table parser might be needed
            // for real-world varied markdown table formats
            const tableRows = sectionContent.split('\n')
                .filter(line => line.includes('|'))
                .map(line => {
                    const cells = line.split('|').map(cell => cell.trim());
                    // Filter out empty cells (beginning and end of the line)
                    return cells.filter(cell => cell.length > 0);
                })
                .filter(cells => cells.length >= 2); // Ensure it has at least 2 columns

            // Skip header and separator rows
            const dataRows = tableRows.filter(row =>
                !row.some(cell => cell.includes('---')) &&
                !row.some(cell => cell.toLowerCase() === 'feature')
            );

            // Extract feature comparison info
            for (const row of dataRows) {
                if (row.length >= 3) {
                    const feature = row[0];
                    const sourceInfo = row[1];
                    const targetInfo = row[2];

                    // If source has the feature but target doesn't
                    if (
                        (sourceInfo.toLowerCase().includes('yes') || sourceInfo.toLowerCase().includes('✓')) &&
                        (targetInfo.toLowerCase().includes('no') || targetInfo.toLowerCase().includes('limited') || targetInfo.toLowerCase().includes('✗'))
                    ) {
                        allMissingFeatures.push(`${feature} is missing or limited`);
                    }
                }
            }
        }
    }

    return allMissingFeatures;
}

/**
 * Gets the recommended alternative service based on a service name
 */
export async function getRecommendedAlternative(serviceName: string, lang: Locale = 'en'): Promise<ServiceFrontmatter | null> {
    // Get the service data first
    const service = await getServiceBySlug(serviceName, lang);
    if (!service || !service.frontmatter.recommendedAlternative) return null;

    // Get the recommended alternative service
    const alternativeSlug = service.frontmatter.recommendedAlternative;
    const alternativeService = await getServiceBySlug(alternativeSlug, lang);

    return alternativeService ? alternativeService.frontmatter : null;
}

/**
 * Get all service slugs for a specific region
 */
export async function getServiceSlugs(region: 'eu' | 'non-eu', lang: Locale = 'en'): Promise<string[]> {
    const services = await getAllServices(lang);
    return services
        .filter(service => service.region === region)
        .map(service => {
            // Convert service name to slug format (lowercase, spaces to hyphens)
            return service.name.toLowerCase().replace(/\s+/g, '-');
        });
}