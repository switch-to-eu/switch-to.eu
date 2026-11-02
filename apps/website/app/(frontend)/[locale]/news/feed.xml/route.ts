import { routing, type Locale } from "@switch-to-eu/i18n/routing";
import { getAllArticles } from "@/lib/content/loader";

const siteUrl = process.env.NEXT_PUBLIC_URL || "https://www.switch-to.eu";

const TITLES: Record<string, { title: string; description: string }> = {
  en: {
    title: "switch-to.eu news",
    description: "Weekday news on digital sovereignty, privacy and European alternatives to US tech.",
  },
  nl: {
    title: "switch-to.eu nieuws",
    description: "Nieuws op werkdagen over digitale soevereiniteit, privacy en Europese alternatieven voor Amerikaanse tech.",
  },
};

function escape(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** RSS 2.0 feed of the latest 50 articles in a locale: /<locale>/news/feed.xml */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ locale: string }> }
) {
  const { locale } = await params;
  if (!routing.locales.includes(locale as Locale)) {
    return new Response("Not found", { status: 404 });
  }

  const meta = TITLES[locale] ?? TITLES.en!;
  const articles = getAllArticles(locale).slice(0, 50);
  const items = articles
    .map((article) => {
      const url = `${siteUrl}/${locale}/news/${article.slug}`;
      return `    <item>
      <title>${escape(article.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${new Date(`${article.date}T08:00:00Z`).toUTCString()}</pubDate>
      <description>${escape(article.description)}</description>
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escape(meta.title)}</title>
    <link>${siteUrl}/${locale}/news</link>
    <description>${escape(meta.description)}</description>
    <language>${locale}</language>
    <atom:link href="${siteUrl}/${locale}/news/feed.xml" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>
`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
