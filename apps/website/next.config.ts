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
};

const withNextIntl = createNextIntlPlugin();
export default withPayload(withNextIntl(nextConfig));
