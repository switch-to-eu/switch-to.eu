import { createI18nMiddleware } from "@switch-to-eu/i18n/proxy";

export default createI18nMiddleware();

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)",],
};
