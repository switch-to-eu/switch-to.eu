import { nextJsConfig } from "@switch-to-eu/eslint-config/next-js";

export default [
  // Plain Node tooling run outside the app (no type information).
  { ignores: ["scripts/**/*.cjs"] },
  ...nextJsConfig,
];
