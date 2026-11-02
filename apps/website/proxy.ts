import { createI18nMiddleware } from "@switch-to-eu/i18n/proxy";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default createI18nMiddleware() as any;

export const config = {
  // Match all pathnames except for
  // - … if they start with `/api`, `/trpc`, `/_next` or `/_vercel`
  // - … the ones containing a dot (e.g. `favicon.ico`)
  // The dotted-slug carve-outs below re-include paths that legitimately
  // contain dots (service slugs like `mailbox.org`, scanned domains).
  // Without these, the i18n middleware skips the request and `getLocale()`
  // falls back to the default locale, producing `<html lang="en">` on NL URLs.
  // The locale is pinned to en|nl so static files like
  // /images/services/x.png don't match and get redirected.
  matcher: [
    "/((?!admin|api|trpc|_next|_vercel|sitemap|.*\\..*).*)",
    "/:locale(en|nl)/tools/domain/:domain*",
    "/:locale(en|nl)/services/:category/:service*",
    "/:locale(en|nl)/guides/:category/:service*",
  ],
};
