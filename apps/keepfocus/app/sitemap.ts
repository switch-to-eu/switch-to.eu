import { createSitemap } from "@switch-to-eu/i18n/seo";

const baseUrl = process.env.NEXT_PUBLIC_URL || "https://focus.switch-to.eu";

export default function sitemap() {
  return createSitemap(baseUrl, [""]);
}
