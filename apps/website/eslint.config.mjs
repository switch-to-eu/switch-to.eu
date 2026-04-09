import { nextJsConfig } from "@switch-to-eu/eslint-config/next-js";

export default [
  {
    ignores: ["app/(payload)/admin/importMap.js"],
  },
  ...nextJsConfig,
];
