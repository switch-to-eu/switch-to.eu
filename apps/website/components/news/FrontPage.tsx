import { getTranslations } from "next-intl/server";
import type { Locale } from "next-intl";
import { Container } from "@switch-to-eu/blocks/components/container";
import { Link } from "@switch-to-eu/i18n/navigation";
import type { Article } from "@/lib/content/types";
import { markdownToPlainText } from "@/lib/markdown";
import { formatArticleDate, readingMinutes } from "@/lib/news";
import { ARTICLE_TYPE_PILL } from "@/components/news/article-type";
import { Byline } from "@/components/news/Byline";
import Image from "next/image";

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
            className="px-3 md:px-0 pt-10 md:pt-0 font-heading text-brand-green text-3xl sm:text-4xl mb-6 sm:mb-8"
          >
            {title}
          </h2>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 md:gap-5">
          {/* Lead story */}
          <article className={`relative overflow-hidden ${briefing.length > 0 ? "lg:col-span-8" : "lg:col-span-12"} bg-white border-y md:border border-black/10 text-brand-green md:rounded-3xl flex flex-col`}>
            {lead.image && (
              <div className="relative aspect-[16/9] lg:aspect-[2/1] bg-[#f3efe8]">
                <Image
                  src={lead.image}
                  alt={lead.imageAlt ?? ""}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 66vw"
                  className="object-cover"
                />
              </div>
            )}
            <div className="flex flex-col flex-1 px-6 sm:px-10 md:px-12 py-8 sm:py-10">
              <ArticleMeta article={lead} locale={locale} t={t} />
              <Heading className="font-heading leading-[1.02] text-3xl sm:text-4xl md:text-5xl mt-5 mb-4 text-balance">
                <Link
                  href={`/news/${lead.slug}`}
                  className="rounded-sm hover:underline decoration-[0.06em] underline-offset-[0.12em] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green focus-visible:ring-offset-4 focus-visible:ring-offset-white"
                >
                  {lead.title}
                </Link>
              </Heading>
              <p className="text-lg sm:text-xl font-semibold leading-relaxed max-w-[60ch] mb-5">
                {lead.description}
              </p>
              {excerpt && (
                <p
                  className={`hidden sm:block text-base leading-relaxed max-w-[62ch] mb-5 ${lead.image ? "line-clamp-2" : "line-clamp-4"}`}
                >
                  {excerpt}
                </p>
              )}
              <Byline
                name={lead.author}
                label={t("byline", { name: lead.author })}
                className="mb-3"
              />
              <div className="mt-auto pt-3">
                <Link
                  href={`/news/${lead.slug}`}
                  tabIndex={-1}
                  aria-hidden="true"
                  className="inline-block rounded-full bg-brand-green text-white px-6 py-2.5 font-semibold text-sm hover:opacity-90 transition-opacity"
                >
                  {t("readMore")}
                </Link>
              </div>
            </div>
          </article>

          {/* Briefing column */}
          {briefing.length > 0 && (
            <aside
              aria-labelledby="briefing-title"
              className="lg:col-span-4 bg-white md:rounded-3xl border-y md:border border-black/10 px-6 sm:px-8 py-8"
            >
              <Heading
                id="briefing-title"
                className="font-heading text-brand-green text-2xl sm:text-3xl mb-4"
              >
                {t("briefing")}
              </Heading>
              <ol className="divide-y divide-brand-green/15">
                {briefing.map((article) => (
                  <li key={article.slug} className="py-4 first:pt-0 flex gap-4">
                    <div className="min-w-0 flex-1">
                      <p className="flex flex-wrap items-center gap-x-2 text-xs font-semibold text-brand-green/80 mb-1.5">
                        <time dateTime={article.date}>
                          {formatArticleDate(article.date, locale)}
                        </time>
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
                    </div>
                    {article.image && (
                      <div className="relative h-16 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-[#f3efe8]">
                        <Image
                          src={article.image}
                          alt=""
                          fill
                          sizes="80px"
                          className="object-cover"
                        />
                      </div>
                    )}
                  </li>
                ))}
              </ol>
              {showFooterLinks && (
                <div className="mt-6 pt-5 border-t border-brand-green/15 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm font-semibold">
                  <Link
                    href="/news"
                    className="inline-block py-1 text-brand-green underline underline-offset-2 hover:no-underline rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green"
                  >
                    {t("viewAll")}
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
          )}
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
}: {
  article: Article;
  locale: string;
  t: T;
}) {
  const pill = ARTICLE_TYPE_PILL[article.type];
  return (
    <p className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm font-semibold">
      <span
        className={`inline-flex items-center rounded-full px-3 py-1 text-xs uppercase tracking-wider ${pill}`}
      >
        {t(`types.${article.type}`)}
      </span>
      {article.sample && (
        <span className="inline-flex items-center rounded-full border border-current bg-white/90 px-3 py-1 text-xs uppercase tracking-wider text-brand-green">
          {t("sampleLabel")}
        </span>
      )}
      <time dateTime={article.date}>
        {formatArticleDate(article.date, locale)}
      </time>
      <span aria-hidden="true">·</span>
      <span>
        {t("readingTime", { minutes: readingMinutes(article.content) })}
      </span>
      {article.sources.length > 0 && (
        <>
          <span aria-hidden="true">·</span>
          <span>{t("sourcesCount", { count: article.sources.length })}</span>
        </>
      )}
    </p>
  );
}
