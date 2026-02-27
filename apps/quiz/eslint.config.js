import { nextJsConfig } from "@switch-to-eu/eslint-config/next-js"

/** @type {import("eslint").Linter.Config} */
export default [
  ...nextJsConfig,
  {
    rules: {
      // Disable base rule — @typescript-eslint/no-unused-vars handles this correctly for TS
      "no-unused-vars": "off",
    },
  },
]
