import path from 'path';
import { ContentParams } from '../common/types';
import { CategoryMetadata, isCategoryMetadata } from '../schemas';
import { getLanguageContentPath } from '../utils/fs-helpers';
import { loadMarkdownFile } from '../utils/content-parser';
import { ContentSegments } from '../common/types';
import fs from 'fs';

/**
 * Get metadata for a category
 */
export function getCategoryMetadata(
    category: string,
    params?: ContentParams
): CategoryMetadata | null {
    const langContentRoot = getLanguageContentPath(params);
    const categoryFile = path.join(langContentRoot, 'categories', `${category}.md`);

    try {
        const result = loadMarkdownFile<CategoryMetadata>(categoryFile);

        if (!result || !isCategoryMetadata(result.data)) {
            console.warn(`Invalid metadata in ${categoryFile}`);
            return null;
        }

        return result.data;
    } catch (error) {
        console.error(`Error reading category metadata for ${category}:`, error);
        return null;
    }
}

/**
 * Get metadata for all categories
 */
export function getAllCategoriesMetadata(params?: ContentParams): Array<{
    slug: string;
    metadata: CategoryMetadata;
}> {
    try {
        const langContentRoot = getLanguageContentPath(params);
        const categoriesDir = path.join(langContentRoot, 'categories');

        if (!fs.existsSync(categoriesDir)) {
            return [];
        }

        return fs.readdirSync(categoriesDir)
            .filter(file => file.endsWith('.md') && !file.startsWith('.'))
            .map(file => {
                const slug = file.replace('.md', '');
                const metadata = getCategoryMetadata(slug, params);

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
 * Get metadata and content for a category
 */
export function getCategoryContent(
    category: string,
    params?: ContentParams
): {
    metadata: CategoryMetadata | null;
    content: string | null;
    segments: ContentSegments | null;
} {
    const langContentRoot = getLanguageContentPath(params);
    const categoryFile = path.join(langContentRoot, 'categories', `${category}.md`);

    try {
        const result = loadMarkdownFile<CategoryMetadata>(categoryFile);

        if (!result || !isCategoryMetadata(result.data)) {
            console.warn(`Invalid metadata in ${categoryFile}`);
            return { metadata: null, content: null, segments: null };
        }

        return {
            metadata: result.data,
            content: result.content.trim(),
            segments: result.segments,
        };
    } catch (error) {
        console.error(`Error reading category content for ${category}:`, error);
        return { metadata: null, content: null, segments: null };
    }
}