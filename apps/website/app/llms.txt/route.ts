import { unstable_cache } from "next/cache";
import { getPayload } from "@/lib/payload";
import { buildLlmsIndex } from "@/lib/llm-content";

const getCachedIndex = unstable_cache(
  async () => {
    const payload = await getPayload();
    const [categories, services, guides] = await Promise.all([
      payload.find({
        collection: "categories",
        locale: "en",
        limit: 0,
        pagination: false,
        depth: 0,
      }),
      payload.find({
        collection: "services",
        where: { _status: { equals: "published" } },
        locale: "en",
        limit: 0,
        pagination: false,
        depth: 1,
      }),
      payload.find({
        collection: "guides",
        where: { _status: { equals: "published" } },
        locale: "en",
        limit: 0,
        pagination: false,
        depth: 1,
      }),
    ]);
    return buildLlmsIndex(categories.docs, services.docs, guides.docs);
  },
  ["llm-index"],
  { tags: ["categories", "services", "guides"] }
);

export async function GET() {
  const markdown = await getCachedIndex();

  return new Response(markdown, {
    headers: { "Content-Type": "text/markdown; charset=utf-8" },
  });
}
