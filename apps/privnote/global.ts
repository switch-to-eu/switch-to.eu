import { routing } from "@switch-to-eu/i18n/routing";
import messages from "@switch-to-eu/i18n/messages/privnote/en.json";
import sharedMessages from "@switch-to-eu/i18n/messages/shared/en.json";

declare module "next-intl" {
  interface AppConfig {
    Locale: (typeof routing.locales)[number];
    Messages: typeof messages & typeof sharedMessages;
  }
}

// Color scheme constants
export const colors = {
  gradients: {
    primary: "gradient-amber-red",
    primaryExtended: "gradient-amber-red-orange",
    secondary: "gradient-orange-red",
    accent: "gradient-amber-orange",
    heroBg: "gradient-bg-amber-red",
  },
  backgrounds: {
    light: "bg-gradient-to-br from-neutral-50 to-amber-50/30",
    soft: "bg-gradient-to-r from-amber-50 to-red-50",
    subtle: "bg-gradient-to-br from-orange-50/30 to-neutral-50",
  },
  text: {
    primary: "text-primary-color",
    success: "text-green-600",
    danger: "text-red-600",
    warning: "text-orange-600",
  },
};
