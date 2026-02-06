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
  /* config options here */
  // Configure pageExtensions to include md and mdx
  pageExtensions: ["ts", "tsx", "js", "jsx", "md", "mdx"],
  // Enable turbopack (replacing experimental.turbo)

  // Configure static file serving from the content submodule
  async rewrites() {
    return [
      {
        source: "/content/:path*",
        destination: "/api/content/:path*",
      },
    ];
  },

  // Add CORS headers for content files
  async headers() {
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

  turbopack: {
    // Add any turbopack configuration here if needed
  },
};

const withNextIntl = createNextIntlPlugin();
// Merge MDX config with Next.js config
export default withMDX(withNextIntl(nextConfig));
