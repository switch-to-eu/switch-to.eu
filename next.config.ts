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
  /* config options here */
  // Configure pageExtensions to include md and mdx
  pageExtensions: ["ts", "tsx", "js", "jsx", "md", "mdx"],
  // Enable turbopack (replacing experimental.turbo)
  turbopack: {
    // Add any turbopack configuration here if needed
  },
};
const withNextIntl = createNextIntlPlugin();
// Merge MDX config with Next.js config
export default withMDX(withNextIntl(nextConfig));
