import path from 'path';
import fs from 'fs';
import { ContentParams } from '../common/types';
import { ServiceFrontmatter, isServiceFrontmatter } from '../schemas';
import { getLanguageContentPath } from '../utils/fs-helpers';
import { ContentSegments } from '../common/types';
import { loadMarkdownFile } from '../utils/content-parser';
import matter from 'gray-matter';

/**
 * Get all services
 */
export async function getAllServices(params?: ContentParams): Promise<ServiceFrontmatter[]> {
    const langContentRoot = getLanguageContentPath(params);
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

            const result = loadMarkdownFile<ServiceFrontmatter>(fullPath);

            if (!result || !isServiceFrontmatter(result.data)) {
                console.warn(`Invalid service frontmatter in ${fullPath}`);
                continue;
            }

            // Add inferred region for backward compatibility
            if (!result.data.region) {
                result.data.region = 'eu'; // Default to EU for existing services
            }

            services.push(result.data);
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
                const result = loadMarkdownFile<ServiceFrontmatter>(fullPath);

                if (!result || !isServiceFrontmatter(result.data)) {
                    console.warn(`Invalid service frontmatter in ${fullPath}`);
                    continue;
                }

                // Ensure the region is set correctly
                result.data.region = 'eu';
                services.push(result.data);
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
                const result = loadMarkdownFile<ServiceFrontmatter>(fullPath);

                if (!result || !isServiceFrontmatter(result.data)) {
                    console.warn(`Invalid service frontmatter in ${fullPath}`);
                    continue;
                }

                // Ensure the region is set correctly
                result.data.region = 'non-eu';
                services.push(result.data);
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
export async function getEUServices(params?: ContentParams): Promise<ServiceFrontmatter[]> {
    const services = await getAllServices(params);
    return services.filter(service => service.region === 'eu');
}

/**
 * Get only non-EU services
 */
export async function getNonEUServices(params?: ContentParams): Promise<ServiceFrontmatter[]> {
    const services = await getAllServices(params);
    return services.filter(service => service.region === 'non-eu');
}

/**
 * Get services filtered by category with optional region filter
 */
export async function getServicesByCategory(
    category: string,
    regionFilter?: 'eu' | 'non-eu',
    params?: ContentParams
): Promise<ServiceFrontmatter[]> {
    const services = await getAllServices(params);
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
 * Get all featured services across categories
 */
export async function getFeaturedServices(
    params?: ContentParams,
    regionFilter?: 'eu' | 'non-eu'
): Promise<Array<{
    service: ServiceFrontmatter;
    category: string;
}>> {
    try {
        // Use the getAllServices function which now scans all directories
        const allServices = await getAllServices(params);

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
 * Get all service slugs for a specific region
 */
export async function getServiceSlugs(
    region: 'eu' | 'non-eu',
    params?: ContentParams
): Promise<string[]> {
    const services = await getAllServices(params);
    return services
        .filter(service => service.region === region)
        .map(service => {
            // Convert service name to slug format (lowercase, spaces to hyphens)
            return service.name.toLowerCase().replace(/\s+/g, '-');
        });
}

/**
 * Get a specific service by slug
 */
export async function getServiceBySlug(
    slug: string,
    params?: ContentParams
): Promise<{
    frontmatter: ServiceFrontmatter;
    content: string;
    segments: ContentSegments;
} | null> {
    const langContentRoot = getLanguageContentPath(params);
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
        const result = loadMarkdownFile<ServiceFrontmatter>(filePath);

        if (!result || !isServiceFrontmatter(result.data)) {
            console.warn(`Invalid service frontmatter in ${filePath}`);
            return null;
        }

        // Set region based on file location if not already set
        if (!result.data.region) {
            if (filePath.includes('/eu/')) {
                result.data.region = 'eu';
            } else if (filePath.includes('/non-eu/')) {
                result.data.region = 'non-eu';
            } else {
                result.data.region = 'eu'; // Default for legacy files
            }
        }

        return {
            frontmatter: result.data,
            content: result.content,
            segments: result.segments,
        };
    } catch (error) {
        console.error(`Error reading service ${slug}:`, error);
        return null;
    }
}

/**
 * Gets the recommended alternative service based on a service name
 */
export async function getRecommendedAlternative(
    serviceName: string,
    params?: ContentParams
): Promise<ServiceFrontmatter | null> {
    // Get the service data first
    const service = await getServiceBySlug(serviceName, params);
    if (!service || !service.frontmatter.recommendedAlternative) return null;

    // Get the recommended alternative service
    const alternativeSlug = service.frontmatter.recommendedAlternative;
    const alternativeService = await getServiceBySlug(alternativeSlug, params);

    return alternativeService ? alternativeService.frontmatter : null;
}