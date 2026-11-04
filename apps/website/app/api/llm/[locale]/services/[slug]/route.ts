import { locales, type Locale } from "@switch-to-eu/i18n/routing";
import { findService } from "@/lib/content/loader";
import { serviceToMarkdown } from "@/lib/llm-content";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ locale: string; slug: string }> }
) {
  const { locale, slug } = await params;

  if (!locales.includes(locale as Locale)) {
    return new Response("Not found", { status: 404 });
  }

  const service = findService(slug, locale);
  if (!service) {
    return new Response("Service not found", { status: 404 });
  }

  return new Response(serviceToMarkdown(service), {
    headers: { "Content-Type": "text/markdown; charset=utf-8" },
  });
}
