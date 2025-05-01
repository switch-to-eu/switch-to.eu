/**
 * This utility provides functions to convert between server-side and client-side Locale types
 * to fix TypeScript errors when passing locales between server and client components.
 */

import { Locale as ClientLocale } from '@/lib/i18n/client-utils';
import type { Locale as ServerLocale } from '@/lib/i18n/dictionaries';

/**
 * Safely converts a server-side locale to a client-side locale
 * @param locale The server-side locale to convert
 * @returns A client-side compatible locale
 */
export function toClientLocale(locale: ServerLocale | string): ClientLocale {
    // Valid values for ClientLocale are only 'en' and 'nl'
    return (locale === 'en' || locale === 'nl') ? locale as ClientLocale : 'en' as ClientLocale;
}

/**
 * Safely converts a client-side locale to a server-side locale
 * This is primarily needed for type safety, as the actual values are the same
 * @param locale The client-side locale to convert
 * @returns A server-side compatible locale
 */
export function toServerLocale(locale: ClientLocale): ServerLocale {
    // Server locales are dynamically defined, but we know they include 'en' and 'nl'
    return locale as unknown as ServerLocale;
}