import { config as baseConfig } from './base.js';

/**
 * A shared ESLint configuration for TypeScript libraries.
 *
 * @type {import("eslint").Linter.Config}
 * */
export const libraryConfig = [
  ...baseConfig,
  {
    ignores: ["dist/**", "node_modules/**"],
  },
];