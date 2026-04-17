import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_URL || "https://www.switch-to.eu";
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/api/llm/", "/api/media/"],
      disallow: "/api/",
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
