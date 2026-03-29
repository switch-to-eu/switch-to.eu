import { unstable_cache } from "next/cache";
import { getPayload } from "@/lib/payload";
import { serviceToMarkdown } from "@/lib/llm-content";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const getService = unstable_cache(
    async () => {
      const payload = await getPayload();
      const { docs } = await payload.find({
        collection: "services",
        where: {
          slug: { equals: slug },
          _status: { equals: "published" },
        },
        locale: "en",
        depth: 1,
        limit: 1,
      });
      if (docs.length === 0) return null;
      return serviceToMarkdown(docs[0]);
    },
    [`llm-service-${slug}`],
    { tags: ["services"] }
  );

  const markdown = await getService();

  if (!markdown) {
    return new Response("Service not found", { status: 404 });
  }

  return new Response(markdown, {
    headers: { "Content-Type": "text/markdown; charset=utf-8" },
  });
}
