import { Link } from "@switch-to-eu/i18n/navigation";
import { getCardColor } from "@switch-to-eu/ui/lib/brand-palette";
import type { Article } from "@/lib/content/types";
import { formatArticleDate } from "@/lib/news";

interface ArticleCardProps {
  article: Pick<Article, "slug" | "title" | "description" | "date" | "type">;
  locale: string;
  typeLabel: string;
  readMoreLabel: string;
  /** Position in the list, drives the brand colour rotation. */
  index: number;
}

/** Brand-coloured card linking to a news article. */
export function ArticleCard({ article, locale, typeLabel, readMoreLabel, index }: ArticleCardProps) {
  const color = getCardColor(index);
  return (
    <article
      role="listitem"
      className={`${color.bg} ${color.text} h-full flex flex-col md:rounded-3xl p-6 sm:p-8`}
    >
      <div className="flex flex-wrap items-center gap-3 mb-4 text-sm font-semibold">
        <span className="inline-flex items-center rounded-full bg-white/80 text-brand-navy px-3 py-1 text-xs uppercase tracking-wider">
          {typeLabel}
        </span>
        <time dateTime={article.date}>{formatArticleDate(article.date, locale)}</time>
      </div>
      <h3 className="font-heading uppercase text-2xl sm:text-3xl leading-tight mb-3">
        <Link
          href={`/news/${article.slug}`}
          className="rounded-sm hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current focus-visible:ring-offset-2"
        >
          {article.title}
        </Link>
      </h3>
      <p className="text-base leading-relaxed opacity-90 mb-6 flex-1">{article.description}</p>
      <span aria-hidden="true" className={`self-start rounded-full px-5 py-2 text-sm font-semibold ${color.button}`}>
        {readMoreLabel} →
      </span>
    </article>
  );
}
