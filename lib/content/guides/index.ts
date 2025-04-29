import path from 'path';
import { ContentParams } from '../common/types';
import { GuideFrontmatter, isGuideFrontmatter } from '../schemas';
import { getLanguageContentPath } from '../utils/fs-helpers';
import { loadMarkdownFile } from '../utils/content-parser';
import { ContentSegments } from '../common/types';
import fs from 'fs';

/**
 * Get all guide categories
 */
export async function getGuideCategories(params?: ContentParams): Promise<string[]> {
    try {
        const langContentRoot = getLanguageContentPath(params);
        const guidesDir = path.join(langContentRoot, 'guides');

        if (!fs.existsSync(guidesDir)) {
            return [];
        }

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

/**
 * Get all guides for a category
 */
export async function getGuidesByCategory(
    category: string,
    params?: ContentParams
): Promise<Array<{ slug: string; frontmatter: GuideFrontmatter }>> {
    const langContentRoot = getLanguageContentPath(params);
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

            const result = loadMarkdownFile<GuideFrontmatter>(mdxFile);

            // Skip if data is not valid
            if (!result || !isGuideFrontmatter(result.data)) {
                console.warn(`Invalid frontmatter in ${mdxFile}`);
                return null;
            }

            return {
                slug,
                frontmatter: result.data,
            };
        }).filter((item): item is { slug: string; frontmatter: GuideFrontmatter } => item !== null);

        return guidesData;
    } catch (error) {
        console.error(`Error reading guides for category ${category}:`, error);
        return [];
    }
}

/**
 * Get a specific guide
 */
export async function getGuide(
    category: string,
    slug: string,
    params?: ContentParams
): Promise<{
    frontmatter: GuideFrontmatter;
    content: string;
    segments: ContentSegments;
} | null> {
    const langContentRoot = getLanguageContentPath(params);
    const mdxFile = path.join(langContentRoot, 'guides', category, slug, 'index.mdx');

    try {
        const result = loadMarkdownFile<GuideFrontmatter>(mdxFile);

        if (!result || !isGuideFrontmatter(result.data)) {
            console.warn(`Invalid frontmatter in ${mdxFile}`);
            return null;
        }

        return {
            frontmatter: result.data,
            content: result.content,
            segments: result.segments,
        };
    } catch (error) {
        console.error(`Error reading guide ${category}/${slug}:`, error);
        return null;
    }
}

/**
 * Get all guides (optionally filtered by source or target service)
 */
export async function getAllGuides({
    sourceService,
    targetService,
    lang
}: {
    sourceService?: string;
    targetService?: string;
    lang?: string;
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
 * Get all guides where a specific service is the target
 */
export async function getGuidesByTargetService(
    targetService: string,
    params?: ContentParams
): Promise<Array<{
    slug: string;
    frontmatter: GuideFrontmatter;
    category: string;
}>> {
    const categories = await getGuideCategories(params);
    const allGuides: Array<{
        slug: string;
        frontmatter: GuideFrontmatter;
        category: string;
    }> = [];

    // Gather guides from all categories
    for (const category of categories) {
        const categoryGuides = await getGuidesByCategory(category, params);

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