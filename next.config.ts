import type { NextConfig } from "next";
import createMDX from '@next/mdx';

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
  pageExtensions: ['ts', 'tsx', 'js', 'jsx', 'md', 'mdx'],
};

// Merge MDX config with Next.js config
export default withMDX(nextConfig);
