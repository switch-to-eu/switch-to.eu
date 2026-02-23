import type { NextConfig } from "next";
import createMDX from "@next/mdx";
import createNextIntlPlugin from "next-intl/plugin";

const withMDX = createMDX({
  // Add markdown plugins here, if needed
  options: {
    remarkPlugins: [],
    rehypePlugins: [],
  },
});

const nextConfig: NextConfig = {
  output: "standalone",
  transpilePackages: ["@switch-to-eu/ui", "@switch-to-eu/i18n", "@switch-to-eu/blocks"],
  /* config options here */
  // Configure pageExtensions to include md and mdx
  pageExtensions: ["ts", "tsx", "js", "jsx", "md", "mdx"],

  // Configure static file serving from the content submodule
  rewrites() {
    return [
      {
        source: "/content/:path*",
        destination: "/api/content/:path*",
      },
    ];
  },

  // Add CORS headers for content files
  headers() {
    return [
      {
        source: "/api/content/:path*",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Access-Control-Allow-Methods", value: "GET" },
          { key: "Cache-Control", value: "public, max-age=86400" },
        ],
      },
    ];
  },
};

const withNextIntl = createNextIntlPlugin();
// Merge MDX config with Next.js config
export default withMDX(withNextIntl(nextConfig));
