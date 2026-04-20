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
  images: {
    // Payload media is served from Vercel Blob when BLOB_READ_WRITE_TOKEN
    // is set (see payload.config.ts), otherwise from /api/media/file/* on
    // the same origin.
    remotePatterns: [
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com" },
    ],
  },
  redirects() {
    return [
      // Non-prefixed content URLs → default locale (308 permanent).
      // Prevents Accept-Language-based 307 redirects that fragment SEO.
      // These fire before the middleware.
      {
        source: "/services/:path*",
        destination: "/en/services/:path*",
        permanent: true,
      },
      {
        source: "/guides/:path*",
        destination: "/en/guides/:path*",
        permanent: true,
      },
      {
        source: "/about",
        destination: "/en/about",
        permanent: true,
      },
      {
        source: "/tools",
        destination: "/en/tools",
        permanent: true,
      },
      {
        source: "/contribute",
        destination: "/en/contribute",
        permanent: true,
      },
      {
        source: "/privacy",
        destination: "/en/privacy",
        permanent: true,
      },
      {
        source: "/terms",
        destination: "/en/terms",
        permanent: true,
      },
      {
        source: "/feedback",
        destination: "/en/feedback",
        permanent: true,
      },
      {
        source: "/search",
        destination: "/en/search",
        permanent: true,
      },
      // Renamed slug: tutanota → tuta
      {
        source: "/:locale/services/eu/tutanota",
        destination: "/:locale/services/eu/tuta",
        permanent: true,
      },
      {
        source: "/:locale/services/eu/tutanota/:path*",
        destination: "/:locale/services/eu/tuta/:path*",
        permanent: true,
      },
      // /llm.txt → /llms.txt (common alternative URL)
      {
        source: "/llm.txt",
        destination: "/llms.txt",
        permanent: true,
      },
    ];
  },
  rewrites() {
    return {
      beforeFiles: [
        // LLM-friendly .md URLs → API route handlers.
        // Locale-prefixed so the /services/:path* → /en/services/:path* locale
        // redirect doesn't clobber these before the rewrite fires.
        {
          source: "/:locale(en|nl)/services/:slug.md",
          destination: "/api/llm/:locale/services/:slug",
        },
        {
          source: "/:locale(en|nl)/guides/:slug.md",
          destination: "/api/llm/:locale/guides/:slug",
        },
      ],
    };
  },
};

const withNextIntl = createNextIntlPlugin();
export default withPayload(withNextIntl(nextConfig));
