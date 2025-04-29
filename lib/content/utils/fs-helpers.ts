import fs from 'fs';
import path from 'path';
import { Locale } from '@/lib/i18n/dictionaries';
import { ContentParams } from '../common/types';

// Base content directory
const CONTENT_ROOT = path.join(process.cwd(), '/content');

/**
 * Parse ContentParams to extract the language
 */
export function getLangFromParams(params?: ContentParams): Locale {
    if (!params) {
        return 'en';
    }

    if (typeof params === 'string') {
        return params as Locale;
    }

    return params.lang || 'en';
}

/**
 * Get content path for a specific language
 */
export function getLanguageContentPath(params?: ContentParams): string {
    const lang = getLangFromParams(params);
    const langPath = path.join(CONTENT_ROOT, lang);

    // Check if language-specific directory exists
    if (fs.existsSync(langPath)) {
        return langPath;
    }

    // Fallback to base content directory
    return CONTENT_ROOT;
}

/**
 * Safely read directory contents
 * @param directoryPath Path to directory
 * @returns Array of file/directory names or empty array on error
 */
export function safeReadDir(directoryPath: string): string[] {
    try {
        if (!fs.existsSync(directoryPath)) {
            return [];
        }
        return fs.readdirSync(directoryPath);
    } catch (error) {
        console.error(`Error reading directory ${directoryPath}:`, error);
        return [];
    }
}

/**
 * Filter for directories only
 */
export function filterDirectories(basePath: string, items: string[]): string[] {
    return items.filter(item =>
        fs.statSync(path.join(basePath, item)).isDirectory() &&
        !item.startsWith('.')
    );
}

/**
 * Filter for markdown files only
 */
export function filterMarkdownFiles(basePath: string, items: string[]): string[] {
    return items.filter(item =>
        (item.endsWith('.md') || item.endsWith('.mdx')) &&
        !item.startsWith('.') &&
        item !== 'README.md' &&
        !fs.statSync(path.join(basePath, item)).isDirectory()
    );
}