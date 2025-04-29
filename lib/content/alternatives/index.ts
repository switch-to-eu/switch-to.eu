import path from 'path';
import { ContentParams } from '../common/types';
import { AlternativesFrontmatter, isAlternativesFrontmatter, ServiceFrontmatter } from '../schemas';
import { getLanguageContentPath } from '../utils/fs-helpers';
import { loadMarkdownFile } from '../utils/content-parser';
import fs from 'fs';
import { ServiceByCategoryFunction } from '../utils/interop';

// Service getter function - to be injected from the index
let _getServicesByCategory: ServiceByCategoryFunction;

/**
 * Initialize the services getter function to break circular dependency
 */
export function initServiceGetter(getServicesByCategory: ServiceByCategoryFunction): void {
    _getServicesByCategory = getServicesByCategory;
}

/**
 * Get services for a category from legacy alternatives format
 */
export async function getAlternativesByCategory(
    category: string,
    params?: ContentParams
): Promise<AlternativesFrontmatter | null> {
    const langContentRoot = getLanguageContentPath(params);
    const mdxFile = path.join(langContentRoot, 'alternatives', category, 'index.mdx');

    try {
        // First try to load from the legacy format (alternatives/category/index.mdx)
        if (fs.existsSync(mdxFile)) {
            const result = loadMarkdownFile<AlternativesFrontmatter>(mdxFile);

            if (!result || !isAlternativesFrontmatter(result.data)) {
                console.warn(`Invalid frontmatter in ${mdxFile}`);
                return null;
            }

            return result.data;
        }

        // Check if service getter has been initialized
        if (!_getServicesByCategory) {
            console.error('Service getter not initialized');
            return null;
        }

        // If no legacy file exists, try to load from individual service files
        const services = await _getServicesByCategory(category, undefined, params);

        if (services.length === 0) {
            return null;
        }

        // Create a compatible AlternativesFrontmatter object from the services
        const alternativesData: AlternativesFrontmatter = {
            title: `${category.charAt(0).toUpperCase() + category.slice(1)} Service Alternatives`,
            description: `EU-based alternatives for common ${category} services that prioritize privacy and data protection.`,
            services: services.map((service: ServiceFrontmatter) => ({
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
export function getAlternativesCategories(params?: ContentParams): string[] {
    const langContentRoot = getLanguageContentPath(params);
    const alternativesPath = path.join(langContentRoot, 'alternatives');

    return fs.existsSync(alternativesPath)
        ? fs.readdirSync(alternativesPath).filter(dir =>
            fs.statSync(path.join(alternativesPath, dir)).isDirectory() &&
            !dir.startsWith('.')
        )
        : [];
}