const MAIN_SITE_URL = "https://www.switch-to.eu";

/**
 * Build a URL on the main switch-to.eu site for the given locale + path.
 * Subdomain apps link to /privacy, /terms, etc. on the main site — without
 * the locale prefix those paths 308-redirect, so always include it.
 */
export function mainSiteUrl(locale: string, path: string): string {
  const cleaned = path.startsWith("/") ? path : `/${path}`;
  return `${MAIN_SITE_URL}/${locale}${cleaned}`;
}
