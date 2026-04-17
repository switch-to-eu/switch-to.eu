import { unstable_cache } from "next/cache";
import { locales, type Locale } from "@switch-to-eu/i18n/routing";
import { getPayload } from "@/lib/payload";
import { guideToMarkdown } from "@/lib/llm-content";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ locale: string; slug: string }> }
) {
  const { locale, slug } = await params;

  if (!locales.includes(locale as Locale)) {
    return new Response("Not found", { status: 404 });
  }

  const getGuide = unstable_cache(
    async () => {
      const payload = await getPayload();
      const { docs } = await payload.find({
        collection: "guides",
        where: {
          slug: { equals: slug },
          _status: { equals: "published" },
        },
        locale: locale as Locale,
        depth: 2,
        limit: 1,
      });
      const doc = docs[0];
      if (!doc) return null;
      return guideToMarkdown(doc);
    },
    [`llm-guide-${locale}-${slug}`],
    { tags: ["guides"] }
  );

  const markdown = await getGuide();

  if (!markdown) {
    return new Response("Guide not found", { status: 404 });
  }

  return new Response(markdown, {
    headers: { "Content-Type": "text/markdown; charset=utf-8" },
  });
}
