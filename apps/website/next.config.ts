import type { NextConfig } from "next";
import { withPayload } from "@payloadcms/next/withPayload";
import createNextIntlPlugin from "next-intl/plugin";

const nextConfig: NextConfig = {
  transpilePackages: [
    "@switch-to-eu/ui",
    "@switch-to-eu/i18n",
    "@switch-to-eu/blocks",
    "@switch-to-eu/content",
  ],
  // Configure pageExtensions to include md and mdx
  pageExtensions: ["ts", "tsx", "js", "jsx", "md", "mdx"],
  async rewrites() {
    return {
      beforeFiles: [
        // LLM-friendly .md URLs → API route handlers
        { source: "/services/:slug.md", destination: "/api/llm/services/:slug" },
        { source: "/guides/:slug.md", destination: "/api/llm/guides/:slug" },
      ],
    };
  },
};

const withNextIntl = createNextIntlPlugin();
export default withPayload(withNextIntl(nextConfig));
