import fs from "fs";
import path from "path";
import matter from "gray-matter";

import {
    getLanguageContentPath,
    isCategoryMetadata,
    extractContentSegments,
} from "../utils";

import { CategoryMetadata, ContentSegments } from "../schemas";
import { Locale } from "next-intl";

/**
 * Get metadata for a category
 */
export function getCategoryMetadata(
    category: string,
    lang: Locale = "en"
): CategoryMetadata | null {
    const langContentRoot = getLanguageContentPath(lang);

    const categoryFile = path.join(
        langContentRoot,
        "categories",
        `${category}.md`
    );

    try {
        if (!fs.existsSync(categoryFile)) {
            return null;
        }

        const fileContent = fs.readFileSync(categoryFile, "utf8");
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
 * Get metadata for a business category
 */
export function getBusinessCategoryMetadata(
    category: string,
    lang: Locale = "en"
): CategoryMetadata | null {
    const langContentRoot = getLanguageContentPath(lang);

    const categoryFile = path.join(
        langContentRoot,
        "business-categories",
        `${category}.md`
    );

    try {
        if (!fs.existsSync(categoryFile)) {
            return null;
        }

        const fileContent = fs.readFileSync(categoryFile, "utf8");
        const { data } = matter(fileContent);

        if (!isCategoryMetadata(data)) {
            console.warn(`Invalid metadata in ${categoryFile}`);
            return null;
        }

        return data;
    } catch (error) {
        console.error(`Error reading business category metadata for ${category}:`, error);
        return null;
    }
}

/**
 * Get metadata for all business categories
 */
export function getAllBusinessCategoriesMetadata(lang: Locale = "en"): Array<{
    slug: string;
    metadata: CategoryMetadata;
}> {
    try {
        const langContentRoot = getLanguageContentPath(lang);

        const categoriesDir = path.join(langContentRoot, "business-categories");

        if (!fs.existsSync(categoriesDir)) {
            return [];
        }

        return fs
            .readdirSync(categoriesDir)
            .filter((file) => file.endsWith(".md") && !file.startsWith("."))
            .map((file) => {
                const slug = file.replace(".md", "");
                const metadata = getBusinessCategoryMetadata(slug, lang);

                if (!metadata) {
                    return null;
                }

                return {
                    slug,
                    metadata,
                };
            })
            .filter(
                (item): item is { slug: string; metadata: CategoryMetadata } =>
                    item !== null
            );
    } catch (error) {
        console.error("Error reading business category metadata:", error);
        return [];
    }
}

/**
 * Get metadata and content for a business category
 */
export function getBusinessCategoryContent(
    category: string,
    lang: Locale = "en"
): {
    metadata: CategoryMetadata | null;
    content: string | null;
    segments: ContentSegments | null;
} {
    const langContentRoot = getLanguageContentPath(lang);
    const categoryFile = path.join(
        langContentRoot,
        "business-categories",
        `${category}.md`
    );

    try {
        if (!fs.existsSync(categoryFile)) {
            return { metadata: null, content: null, segments: null };
        }

        const fileContent = fs.readFileSync(categoryFile, "utf8");
        const { data, content } = matter(fileContent);

        if (!isCategoryMetadata(data)) {
            console.warn(`Invalid metadata in ${categoryFile}`);
            return { metadata: null, content: null, segments: null };
        }

        // Extract segments using the content segmentation function
        const segments = extractContentSegments(content);

        return {
            metadata: data,
            content: content.trim(),
            segments,
        };
    } catch (error) {
        console.error(`Error reading business category content for ${category}:`, error);
        return { metadata: null, content: null, segments: null };
    }
}

/**
 * Get metadata for all categories
 */
export function getAllCategoriesMetadata(lang: Locale = "en"): Array<{
    slug: string;
    metadata: CategoryMetadata;
}> {
    try {
        const langContentRoot = getLanguageContentPath(lang);

        const categoriesDir = path.join(langContentRoot, "categories");

        if (!fs.existsSync(categoriesDir)) {
            return [];
        }

        return fs
            .readdirSync(categoriesDir)
            .filter((file) => file.endsWith(".md") && !file.startsWith("."))
            .map((file) => {
                const slug = file.replace(".md", "");
                const metadata = getCategoryMetadata(slug, lang);

                if (!metadata) {
                    return null;
                }

                return {
                    slug,
                    metadata,
                };
            })
            .filter(
                (item): item is { slug: string; metadata: CategoryMetadata } =>
                    item !== null
            );
    } catch (error) {
        console.error("Error reading category metadata:", error);
        return [];
    }
}

/**
 * Get metadata and content for a category
 */
export function getCategoryContent(
    category: string,
    lang: Locale = "en"
): {
    metadata: CategoryMetadata | null;
    content: string | null;
    segments: ContentSegments | null;
} {
    const langContentRoot = getLanguageContentPath(lang);
    const categoryFile = path.join(
        langContentRoot,
        "categories",
        `${category}.md`
    );

    try {
        if (!fs.existsSync(categoryFile)) {
            return { metadata: null, content: null, segments: null };
        }

        const fileContent = fs.readFileSync(categoryFile, "utf8");
        const { data, content } = matter(fileContent);

        if (!isCategoryMetadata(data)) {
            console.warn(`Invalid metadata in ${categoryFile}`);
            return { metadata: null, content: null, segments: null };
        }

        // Extract segments using the content segmentation function
        const segments = extractContentSegments(content);

        return {
            metadata: data,
            content: content.trim(),
            segments,
        };
    } catch (error) {
        console.error(`Error reading category content for ${category}:`, error);
        return { metadata: null, content: null, segments: null };
    }
}
