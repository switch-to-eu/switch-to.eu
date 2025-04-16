import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { match } from '@formatjs/intl-localematcher';
import Negotiator from 'negotiator';

// Define the locales supported by the application
export const locales = ['en', 'nl'];
export const defaultLocale = 'en';

// Get the preferred locale based on the request headers
function getLocale(request: NextRequest): string {
  // Negotiator expects a plain object, so we convert headers
  const negotiatorHeaders: Record<string, string> = {};
  request.headers.forEach((value, key) => {
    negotiatorHeaders[key] = value;
  });

  // Use negotiator and intl-localematcher to get the preferred locale
  const languages = new Negotiator({ headers: negotiatorHeaders }).languages();

  try {
    const locale = match(languages, locales, defaultLocale);
    return locale;
  } catch {
    return defaultLocale;
  }
}

// Check if the pathname is missing a locale
function pathnameIsMissingLocale(pathname: string): boolean {
  // Check if pathname doesn't start with a locale
  return locales.every((locale) =>
    !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
  );
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip for static assets and API routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.') // Skip for files (like favicon.ico, etc.)
  ) {
    return;
  }

  // Check if the pathname is missing a locale
  if (pathnameIsMissingLocale(pathname)) {
    // Get the preferred locale from the headers
    const locale = getLocale(request);

    // Clone the URL
    const newUrl = new URL(request.nextUrl);

    // Handle root path specifically
    if (pathname === '/') {
      newUrl.pathname = `/${locale}`;
    } else {
      // Otherwise, prefix the pathname with the locale
      newUrl.pathname = `/${locale}${pathname}`;
    }

    // Redirect to the locale version
    return NextResponse.redirect(newUrl);
  }
}

// Updated configuration format
export const matcher = ['/((?!api|_next/static|_next/image|favicon.ico).*)'];