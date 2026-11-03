import { config } from "@switch-to-eu/eslint-config/base";

export default [
  ...config,
  // The explorer UI is plain browser JavaScript served as-is, so the typed Node rules don't apply.
  { ignores: ["src/explore/public/**"] },
];
