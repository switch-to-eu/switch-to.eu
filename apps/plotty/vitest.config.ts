import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["__tests__/**/*.test.ts"],
  },
  resolve: {
    alias: {
      "@/lib": path.resolve(__dirname, "./lib"),
      "@/server": path.resolve(__dirname, "./server"),
      "@components": path.resolve(__dirname, "./components"),
      "@hooks": path.resolve(__dirname, "./hooks"),
      "@i18n": path.resolve(__dirname, "./i18n"),
    },
  },
});
