import { getRequestConfig } from "next-intl/server";
import { hasLocale } from "next-intl";
import { routing } from "./routing";

export function createRequestConfig(appName: string) {
  return getRequestConfig(async ({ requestLocale }) => {
    const requested = await requestLocale;

    const locale = hasLocale(routing.locales, requested)
      ? requested
      : routing.defaultLocale;

    const sharedMessages = (await import(
      `../messages/shared/${locale}.json`
    )) as { default: Record<string, unknown> };

    const appMessages = (await import(
      `../messages/${appName}/${locale}.json`
    )) as { default: Record<string, unknown> };

    return {
      locale,
      messages: {
        ...sharedMessages.default,
        ...appMessages.default,
      },
    };
  });
}
