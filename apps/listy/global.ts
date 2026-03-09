import { routing } from "@switch-to-eu/i18n/routing";
import messages from "@switch-to-eu/i18n/messages/listy/en.json";
import sharedMessages from "@switch-to-eu/i18n/messages/shared/en.json";

declare module "next-intl" {
  interface AppConfig {
    Locale: (typeof routing.locales)[number];
    Messages: typeof messages & typeof sharedMessages;
  }
}

// Color scheme constants - teal/green theme for Listy
export const colors = {
  gradients: {
    primary: "gradient-teal-green",
    primaryExtended: "gradient-teal-green-blue",
    secondary: "gradient-green-blue",
    accent: "gradient-green-yellow",
    heroBg: "gradient-bg-teal-green",
  },
  backgrounds: {
    light: "bg-gradient-to-br from-neutral-50 to-teal-50/30",
    soft: "bg-gradient-to-r from-teal-50 to-green-50",
    subtle: "bg-gradient-to-br from-green-50/30 to-neutral-50",
  },
  text: {
    primary: "text-primary-color",
    success: "text-green-600",
    danger: "text-red-600",
    warning: "text-orange-600",
  }
};
