import { routing } from "@switch-to-eu/i18n/routing";

import sharedMessages from "@switch-to-eu/i18n/messages/shared/en.json";
import appMessages from "@switch-to-eu/i18n/messages/keepfocus/en.json";

type Messages = typeof sharedMessages & typeof appMessages;

declare module "next-intl" {
  interface AppConfig {
    Locale: (typeof routing.locales)[number];
    Messages: Messages;
  }
}
