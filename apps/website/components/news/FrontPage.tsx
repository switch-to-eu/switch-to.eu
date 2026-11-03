import { getTranslations } from "next-intl/server";
import type { Locale } from "next-intl";
import { Container } from "@switch-to-eu/blocks/components/container";
import { DecorativeShape } from "@switch-to-eu/blocks/components/decorative-shape";
import { Link } from "@switch-to-eu/i18n/navigation";
import type { Article } from "@/lib/content/types";
import { markdownToPlainText } from "@/lib/markdown";
import { formatArticleDate, readingMinutes } from "@/lib/news";

interface FrontPageProps {
  articles: Article[];
  locale: Locale;
  /** Section heading. Omit when the page already has one (news index). */
  title?: string;
  /** How many headlines the briefing column lists after the lead. */
  briefingCount?: number;
  /** "All news" and RSS links under the briefing. Off on /news itself. */
  showFooterLinks?: boolean;
}

/**
 * Newspaper-style front page: the latest article as the lead, the next few as
 * a dated briefing column. Renders nothing without articles.
 */
export async function FrontPage({
  articles,
  locale,
  title,
  briefingCount = 5,
  showFooterLinks = true,
}: FrontPageProps) {
  const [lead, ...rest] = articles;
  if (!lead) return null;
  const briefing = rest.slice(0, briefingCount);
  // Opening paragraph of the lead, as plain text, to give the lead some body.
  const excerpt = markdownToPlainText(lead.content.split(/\n\s*\n/)[0] ?? "");
  const t = await getTranslations({ locale, namespace: "news" });
  // Lead and briefing headings sit one level below the section title. Without
  // a title (news index, under the page h1) they are h2s.
  const Heading = title ? "h3" : "h2";

  return (
    <section aria-labelledby={title ? "front-page-title" : undefined}>
      <Container noPaddingMobile>
        {title && (
          <h2
            id="front-page-title"
            className="px-3 md:px-0 pt-10 md:pt-0 font-heading uppercase text-brand-green text-4xl sm:text-5xl mb-6 sm:mb-8"
          >
            {title}
          </h2>
        )}
        {articles.every((a) => a.sample) && (
          <p className="px-3 md:px-0 -mt-3 mb-6 sm:mb-8 max-w-2xl text-brand-green text-base sm:text-lg">
            {t("samplesIntro")}
          </p>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 md:gap-5">
          {/* Lead story */}
          <article className="relative overflow-hidden lg:col-span-8 bg-brand-yellow text-brand-green md:rounded-3xl px-6 sm:px-10 md:px-12 py-8 sm:py-10 md:py-12 flex flex-col">
            <DecorativeShape
              shape="starburst"
              className="-bottom-14 -right-14 w-48 h-48 sm:w-64 sm:h-64"
              color="text-white"
              opacity={0.35}
              duration="12s"
            />
            <DecorativeShape
              shape="pebble"
              className="-top-10 right-1/4 w-28 h-28 hidden sm:block"
              color="text-brand-green"
              opacity={0.12}
              duration="9s"
              delay="-3s"
            />

            <div className="relative z-10 flex flex-col h-full">
              <ArticleMeta article={lead} locale={locale} t={t} />
              <Heading className="font-heading uppercase leading-[0.95] text-4xl sm:text-5xl md:text-6xl mt-5 mb-5 text-balance">
                <Link
                  href={`/news/${lead.slug}`}
                  className="rounded-sm hover:underline decoration-[0.06em] underline-offset-[0.12em] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green focus-visible:ring-offset-4 focus-visible:ring-offset-brand-yellow"
                >
                  {lead.title}
                </Link>
              </Heading>
              <p className="text-lg sm:text-xl font-semibold leading-relaxed max-w-[60ch] mb-5">{lead.description}</p>
              {excerpt && (
                <p className="hidden sm:block text-base leading-relaxed max-w-[62ch] mb-8 line-clamp-4">{excerpt}</p>
              )}
              <div className="mt-auto">
                <Link
                  href={`/news/${lead.slug}`}
                  tabIndex={-1}
                  aria-hidden="true"
                  className="inline-block rounded-full bg-brand-green text-white px-6 py-2.5 font-semibold text-sm hover:opacity-90 transition-opacity"
                >
                  {t("readMore")} →
                </Link>
              </div>
            </div>
          </article>

          {/* Briefing column */}
          <aside
            aria-labelledby="briefing-title"
            className="lg:col-span-4 bg-brand-cream md:rounded-3xl border border-brand-green/10 px-6 sm:px-8 py-8"
          >
            <Heading id="briefing-title" className="font-heading uppercase text-brand-green text-2xl sm:text-3xl mb-4">
              {t("briefing")}
            </Heading>
            {briefing.length > 0 ? (
              <ol className="divide-y divide-brand-green/15">
                {briefing.map((article) => (
                  <li key={article.slug} className="py-4 first:pt-0">
                    <p className="flex flex-wrap items-center gap-x-2 text-xs font-semibold text-brand-green/80 mb-1.5">
                      <time dateTime={article.date}>{formatArticleDate(article.date, locale)}</time>
                      <span aria-hidden="true">·</span>
                      <span>{t(`types.${article.type}`)}</span>
                      {article.sample && (
                        <span className="rounded-full border border-brand-green/40 bg-white px-2 py-0.5 text-[0.7rem] uppercase tracking-wide text-brand-green">
                          {t("sampleLabel")}
                        </span>
                      )}
                    </p>
                    <Link
                      href={`/news/${article.slug}`}
                      className="block text-brand-green font-semibold leading-snug text-[1.05rem] hover:underline underline-offset-2 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green"
                    >
                      {article.title}
                    </Link>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="text-brand-green/80">{t("empty")}</p>
            )}
            {showFooterLinks && (
            <div className="mt-6 pt-5 border-t border-brand-green/15 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm font-semibold">
              <Link
                href="/news"
                className="inline-block py-1 text-brand-green underline underline-offset-2 hover:no-underline rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green"
              >
                {t("viewAll")} →
              </Link>
              <a
                href={`/${locale}/news/feed.xml`}
                className="inline-block py-1 text-brand-green/80 hover:text-brand-green underline underline-offset-2 hover:no-underline rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green"
              >
                {t("rss")}
              </a>
            </div>
            )}
          </aside>
        </div>
      </Container>
    </section>
  );
}

type T = Awaited<ReturnType<typeof getTranslations<"news">>>;

/** Type, date, reading time, source count and sample label. */
export function ArticleMeta({
  article,
  locale,
  t,
  tone = "dark",
}: {
  article: Article;
  locale: string;
  t: T;
  tone?: "dark" | "light";
}) {
  const pill = tone === "dark" ? "bg-brand-green text-white" : "bg-brand-yellow text-brand-green";
  return (
    <p className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm font-semibold">
      <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs uppercase tracking-wider ${pill}`}>
        {t(`types.${article.type}`)}
      </span>
      {article.sample && (
        <span className="inline-flex items-center rounded-full border border-current bg-white/90 px-3 py-1 text-xs uppercase tracking-wider text-brand-green">
          {t("sampleLabel")}
        </span>
      )}
      <time dateTime={article.date}>{formatArticleDate(article.date, locale)}</time>
      <span aria-hidden="true">·</span>
      <span>{t("readingTime", { minutes: readingMinutes(article.content) })}</span>
      {article.sources.length > 0 && (
        <>
          <span aria-hidden="true">·</span>
          <span>{t("sourcesCount", { count: article.sources.length })}</span>
        </>
      )}
    </p>
  );
}
