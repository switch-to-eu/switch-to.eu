import js from "@eslint/js"

import eslintConfigPrettier from "eslint-config-prettier"
import turboPlugin from "eslint-plugin-turbo"
import tseslint from "typescript-eslint"

/**
 * A shared ESLint configuration for the repository.
 *
 * @type {import("eslint").Linter.Config}
 * */
export const config = [
  js.configs.recommended,
  eslintConfigPrettier,
  ...tseslint.configs.recommendedTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    plugins: {
      turbo: turboPlugin,
    },
    rules: {
      "turbo/no-undeclared-env-vars": "warn",
      // Allow type assertions when dealing with untyped external APIs
      "@typescript-eslint/no-unnecessary-type-assertion": "warn",
      // Be more lenient with promises in event handlers (common React pattern)
      "@typescript-eslint/no-misused-promises": [
        "error",
        {
          checksVoidReturn: {
            attributes: false,
          },
        },
      ],
      // Allow unused vars in type declarations (function signatures, interfaces)
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
      "no-unused-vars": "off", // Disable base rule as it can report incorrect errors
    },
  },
  {
    ignores: [
      "dist/**",
      ".next/**",
      "out/**",
      "build/**",
      "node_modules/**",
      ".turbo/**",
      "next-env.d.ts",
    ],
  },
]
