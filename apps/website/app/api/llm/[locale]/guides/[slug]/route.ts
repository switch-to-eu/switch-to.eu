import { locales, type Locale } from "@switch-to-eu/i18n/routing";
import { findGuide } from "@/lib/content/loader";
import { guideToMarkdown } from "@/lib/llm-content";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ locale: string; slug: string }> }
) {
  const { locale, slug } = await params;

  if (!locales.includes(locale as Locale)) {
    return new Response("Not found", { status: 404 });
  }

  const guide = findGuide(slug, locale);
  if (!guide) {
    return new Response("Guide not found", { status: 404 });
  }

  return new Response(guideToMarkdown(guide), {
    headers: { "Content-Type": "text/markdown; charset=utf-8" },
  });
}
