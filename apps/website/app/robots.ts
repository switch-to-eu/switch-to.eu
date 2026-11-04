import type { MetadataRoute } from "next";

import { isNonProductionDeploy } from "@/lib/indexing";

export default function robots(): MetadataRoute.Robots {
  if (isNonProductionDeploy) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }

  const baseUrl = process.env.NEXT_PUBLIC_URL || "https://www.switch-to.eu";
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/api/llm/", "/api/media/"],
      disallow: ["/api/", "/admin", "/admin/"],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
