import { routing } from "@switch-to-eu/i18n/routing";
import messages from "@switch-to-eu/i18n/messages/split/en.json";
import sharedMessages from "@switch-to-eu/i18n/messages/shared/en.json";

declare module "next-intl" {
  interface AppConfig {
    Locale: (typeof routing.locales)[number];
    Messages: typeof messages & typeof sharedMessages;
  }
}

export const colors = {
  gradients: {
    primary: "gradient-emerald-teal",
    primaryExtended: "gradient-emerald-teal-blue",
    secondary: "gradient-teal-blue",
    accent: "gradient-green-yellow",
    heroBg: "gradient-bg-emerald-teal",
  },
  backgrounds: {
    light: "bg-gradient-to-br from-neutral-50 to-emerald-50/30",
    soft: "bg-gradient-to-r from-emerald-50 to-teal-50",
    subtle: "bg-gradient-to-br from-green-50/30 to-neutral-50",
  },
  text: {
    primary: "text-primary-color",
    success: "text-green-600",
    danger: "text-red-600",
    warning: "text-orange-600",
  }
};
