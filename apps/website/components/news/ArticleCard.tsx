import Image from "next/image";
import { Link } from "@switch-to-eu/i18n/navigation";
import type { Article } from "@/lib/content/types";
import { formatArticleDate } from "@/lib/news";
import { ARTICLE_TYPE_PILL } from "@/components/news/article-type";

interface ArticleCardProps {
  article: Pick<Article, "slug" | "title" | "description" | "date" | "type" | "sample" | "image">;
  locale: string;
  typeLabel: string;
  readMoreLabel: string;
  sampleLabel?: string;
  /** Position in the list (kept for API compatibility with other card grids). */
  index?: number;
}

/** White card linking to a news article, with its header photo on top. The whole card is the link target. */
export function ArticleCard({ article, locale, typeLabel, readMoreLabel, sampleLabel }: ArticleCardProps) {
  return (
    <article
      role="listitem"
      className="group relative h-full flex flex-col overflow-hidden bg-white border-y md:border border-black/10 text-[#1a1a1a] md:rounded-3xl"
    >
      {article.image && (
        <div className="relative aspect-[16/9] bg-[#f3efe8]">
          <Image
            src={article.image}
            alt=""
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover"
          />
        </div>
      )}
      <div className="flex flex-col flex-1 p-6 sm:p-7">
        <p className="flex flex-wrap items-center gap-2 mb-3 text-sm font-semibold">
          <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs uppercase tracking-wider ${ARTICLE_TYPE_PILL[article.type]}`}>
            {typeLabel}
          </span>
          {article.sample && sampleLabel && (
            <span className="inline-flex items-center rounded-full border border-brand-green/40 px-3 py-1 text-xs uppercase tracking-wider text-brand-green">
              {sampleLabel}
            </span>
          )}
          <time dateTime={article.date}>{formatArticleDate(article.date, locale)}</time>
        </p>
        <h3 className="font-heading text-2xl leading-[1.08] mb-3 text-balance text-brand-green">
          <Link
            href={`/news/${article.slug}`}
            className="rounded-sm after:absolute after:inset-0 after:content-[''] group-hover:underline decoration-[0.06em] underline-offset-[0.12em] focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-green"
          >
            {article.title}
          </Link>
        </h3>
        <p className="text-base leading-relaxed mb-5 flex-1">{article.description}</p>
        <span aria-hidden="true" className="self-start text-sm font-semibold text-brand-green underline underline-offset-2">
          {readMoreLabel} →
        </span>
      </div>
    </article>
  );
}
