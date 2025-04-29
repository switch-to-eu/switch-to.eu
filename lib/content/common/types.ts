import { Locale } from '@/lib/i18n/dictionaries';

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

/**
 * Common parameters for content retrieval functions
 * This type allows both passing an object with a lang property
 * and passing a string directly for backward compatibility
 */
export type ContentParams = { lang?: Locale } | Locale;