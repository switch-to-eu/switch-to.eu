'use client';

// Define the type for locales
export type Locale = 'en' | 'nl';

/**
 * Access nested dictionary values using dot notation
 * This is a client-side version of getNestedValue that doesn't depend on server-only
 * Example: getClientNestedValue(dict, 'contribute.guide.heading')
 */
export function getClientNestedValue(obj: Record<string, unknown>, path: string): unknown {
    const keys = path.split('.');
    return keys.reduce((o, k) => (o && typeof o === 'object' && k in o ? o[k as keyof typeof o] : undefined), obj as unknown);
}