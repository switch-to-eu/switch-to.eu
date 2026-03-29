import { getPayload } from "@/lib/payload";
import { buildLlmsIndex } from "@/lib/llm-content";

export const dynamic = "force-dynamic";

export async function GET() {
  const payload = await getPayload();

  const [services, guides] = await Promise.all([
    payload.find({
      collection: "services",
      where: { _status: { equals: "published" } },
      locale: "en",
      limit: 0,
      pagination: false,
      depth: 0,
    }),
    payload.find({
      collection: "guides",
      where: { _status: { equals: "published" } },
      locale: "en",
      limit: 0,
      pagination: false,
      depth: 0,
    }),
  ]);

  const markdown = buildLlmsIndex(services.docs, guides.docs);

  return new Response(markdown, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
