import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { getLanguageContentPath, extractContentSegments } from "../utils";
import { Locale, PageData } from "../types";
import { ContentSegments } from "../schemas";

/**
 * Get a specific page content from the pages directory
 */
export function getPageContent(
    pageName: string,
    lang: Locale = "en"
): {
    content: string;
    segments: ContentSegments;
    data: PageData;
} | null {
    const langContentRoot = getLanguageContentPath(lang);
    const pageFile = path.join(langContentRoot, "pages", `${pageName}.md`);

    try {
        if (!fs.existsSync(pageFile)) {
            return null;
        }

        const fileContent = fs.readFileSync(pageFile, "utf8");
        const { data, content } = matter(fileContent);

        // Extract segments using the content segmentation function
        const segments = extractContentSegments(content);

        return {
            content: content.trim(),
            segments,
            data: data as PageData,
        };
    } catch (error) {
        console.error(`Error reading page ${pageName}:`, error);
        return null;
    }
}

/**
 * Check if a page exists
 */
export function pageExists(pageName: string, lang: Locale = "en"): boolean {
    const langContentRoot = getLanguageContentPath(lang);
    const pageFile = path.join(langContentRoot, "pages", `${pageName}.md`);
    return fs.existsSync(pageFile);
}
