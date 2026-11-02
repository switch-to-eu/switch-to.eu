import { getAllCategories, getAllGuides, getAllServices } from "@/lib/content/loader";
import { buildLlmsIndex } from "@/lib/llm-content";

export function GET() {
  const markdown = buildLlmsIndex(
    getAllCategories("en"),
    getAllServices("en"),
    getAllGuides("en")
  );

  return new Response(markdown, {
    headers: { "Content-Type": "text/markdown; charset=utf-8" },
  });
}
