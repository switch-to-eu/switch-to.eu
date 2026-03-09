import { routing } from "@switch-to-eu/i18n/routing";
import messages from "@switch-to-eu/i18n/messages/quiz/en.json";
import sharedMessages from "@switch-to-eu/i18n/messages/shared/en.json";

declare module "next-intl" {
  interface AppConfig {
    Locale: (typeof routing.locales)[number];
    Messages: typeof messages & typeof sharedMessages;
  }
}
