import { routing } from "@switch-to-eu/i18n/routing";
import messages from "@switch-to-eu/i18n/messages/quiz/en.json";
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
    primary: "gradient-rose-orange",
    primaryExtended: "gradient-rose-orange-yellow",
    secondary: "gradient-orange-yellow",
    accent: "gradient-rose-pink",
    heroBg: "gradient-bg-rose-orange",
  },
  backgrounds: {
    light: "bg-gradient-to-br from-neutral-50 to-rose-50/30",
    soft: "bg-gradient-to-r from-rose-50 to-orange-50",
    subtle: "bg-gradient-to-br from-orange-50/30 to-neutral-50",
  },
  text: {
    primary: "text-primary-color",
    success: "text-green-600",
    danger: "text-red-600",
    warning: "text-orange-600",
  }
};
