import { Link } from "@switch-to-eu/i18n/navigation";
import type { Article } from "@/lib/content/types";
import { formatArticleDate, getReadableCardColor } from "@/lib/news";

interface ArticleCardProps {
  article: Pick<Article, "slug" | "title" | "description" | "date" | "type" | "sample">;
  locale: string;
  typeLabel: string;
  readMoreLabel: string;
  sampleLabel?: string;
  /** Position in the list, drives the (AA-safe) brand colour rotation. */
  index: number;
}

/** Brand-coloured card linking to a news article. The whole card is the link target. */
export function ArticleCard({ article, locale, typeLabel, readMoreLabel, sampleLabel, index }: ArticleCardProps) {
  const color = getReadableCardColor(index);
  return (
    <article
      role="listitem"
      className={`${color.bg} ${color.text} group relative h-full flex flex-col md:rounded-3xl p-6 sm:p-8 transition-transform duration-300 ease-out hover:-translate-y-1 motion-reduce:transition-none motion-reduce:hover:translate-y-0`}
    >
      <p className="flex flex-wrap items-center gap-2 mb-4 text-sm font-semibold">
        <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs uppercase tracking-wider ${color.pill}`}>
          {typeLabel}
        </span>
        {article.sample && sampleLabel && (
          <span className="inline-flex items-center rounded-full border border-current px-3 py-1 text-xs uppercase tracking-wider">
            {sampleLabel}
          </span>
        )}
        <time dateTime={article.date}>{formatArticleDate(article.date, locale)}</time>
      </p>
      <h3 className="font-heading uppercase text-2xl sm:text-3xl leading-[1.02] mb-3 text-balance">
        <Link
          href={`/news/${article.slug}`}
          className="rounded-sm after:absolute after:inset-0 after:content-[''] group-hover:underline decoration-[0.06em] underline-offset-[0.12em] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current focus-visible:ring-offset-2"
        >
          {article.title}
        </Link>
      </h3>
      <p className="text-base leading-relaxed mb-6 flex-1">{article.description}</p>
      <span aria-hidden="true" className={`self-start rounded-full px-5 py-2 text-sm font-semibold ${color.button}`}>
        {readMoreLabel} →
      </span>
    </article>
  );
}
