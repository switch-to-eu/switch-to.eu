import { config } from "@switch-to-eu/eslint-config/react-internal";

export default [
  ...config,
  {
    rules: {
      // Disable rules that may not apply to a UI component library
      "@next/next/no-html-link-for-pages": "off",
    },
  },
];
