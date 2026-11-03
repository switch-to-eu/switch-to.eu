import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

import { isNonProductionDeploy } from "./lib/indexing";

const nextConfig: NextConfig = {
  transpilePackages: [
    "@switch-to-eu/ui",
    "@switch-to-eu/i18n",
    "@switch-to-eu/blocks",
  ],
  // Markdown content lives in /content at the repo root and is read with fs
  // at runtime by the search, sitemap and llm routes, so ship it with every
  // server bundle.
  outputFileTracingIncludes: {
    "/**": ["../../content/**/*.md"],
  },
  // Configure pageExtensions to include md and mdx
  pageExtensions: ["ts", "tsx", "js", "jsx", "md", "mdx"],
  images: {
    // Guide videos live on Vercel Blob (too large for git).
    remotePatterns: [
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com" },
    ],
  },
  redirects() {
    return [
      // Service detail tabs were separate pages; they're now query params on
      // the canonical service URL. Redirect the old paths (locale-prefixed
      // and unprefixed) before the generic /services prefixer below, so we
      // collapse to a single hop where possible.
      {
        source: "/:locale(en|nl)/services/eu/:slug/pricing",
        destination: "/:locale/services/eu/:slug?tab=pricing",
        permanent: true,
      },
      {
        source: "/:locale(en|nl)/services/eu/:slug/security",
        destination: "/:locale/services/eu/:slug?tab=security",
        permanent: true,
      },
      {
        source: "/:locale(en|nl)/services/eu/:slug/vs-:source",
        destination: "/:locale/services/eu/:slug?tab=vs-:source",
        permanent: true,
      },
      {
        source: "/services/eu/:slug/pricing",
        destination: "/en/services/eu/:slug?tab=pricing",
        permanent: true,
      },
      {
        source: "/services/eu/:slug/security",
        destination: "/en/services/eu/:slug?tab=security",
        permanent: true,
      },
      {
        source: "/services/eu/:slug/vs-:source",
        destination: "/en/services/eu/:slug?tab=vs-:source",
        permanent: true,
      },
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
  headers() {
    return [
      {
        source: "/_next/static/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex" }],
      },
      // dev.switch-to.eu and preview URLs: keep every response out of search.
      ...(isNonProductionDeploy
        ? [
            {
              source: "/:path*",
              headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
            },
          ]
        : []),
    ];
  },
};

const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);
