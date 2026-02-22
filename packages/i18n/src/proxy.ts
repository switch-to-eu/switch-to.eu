import createMiddleware from "next-intl/middleware";
import { routing } from "./routing";

export interface I18nMiddlewareOptions {
  localeDetection?: boolean;
}

export function createI18nMiddleware(options?: I18nMiddlewareOptions) {
  return createMiddleware({
    ...routing,
    localeDetection: options?.localeDetection ?? true,
  });
}

export default createI18nMiddleware();
