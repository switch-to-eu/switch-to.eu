import { unstable_cache } from "next/cache";
import { getPayload } from "@/lib/payload";
import { guideToMarkdown } from "@/lib/llm-content";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const getGuide = unstable_cache(
    async () => {
      const payload = await getPayload();
      const { docs } = await payload.find({
        collection: "guides",
        where: {
          slug: { equals: slug },
          _status: { equals: "published" },
        },
        locale: "en",
        depth: 2,
        limit: 1,
      });
      if (docs.length === 0) return null;
      return guideToMarkdown(docs[0]);
    },
    [`llm-guide-${slug}`],
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
