import { getPayload } from "@/lib/payload";
import { guideToMarkdown } from "@/lib/llm-content";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
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

  if (docs.length === 0) {
    return new Response("Guide not found", { status: 404 });
  }

  const markdown = guideToMarkdown(docs[0]);

  return new Response(markdown, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
