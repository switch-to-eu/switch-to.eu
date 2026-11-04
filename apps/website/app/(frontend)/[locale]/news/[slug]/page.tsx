import type { Metadata, ResolvingMetadata } from "next";
import { inheritedOpenGraph } from "@/lib/seo";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumbJsonLd } from "@/lib/structured-data";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "next-intl";
import { Banner } from "@switch-to-eu/blocks/components/banner";
import { Container } from "@switch-to-eu/blocks/components/container";
import { PageLayout } from "@switch-to-eu/blocks/components/page-layout";
import { SectionHeading } from "@switch-to-eu/blocks/components/section-heading";
import { Link } from "@switch-to-eu/i18n/navigation";
import { routing } from "@switch-to-eu/i18n/routing";
import { NewsletterCta } from "@/components/NewsletterCta";
import { RichText } from "@/components/rich-text";
import { ServiceCard } from "@/components/ui/ServiceCard";
import { ArticleCard } from "@/components/news/ArticleCard";
import { findArticle, getAllArticles } from "@/lib/content/loader";
import type { Article } from "@/lib/content/types";
import { markdownToPlainText } from "@/lib/markdown";
import {
  ARTICLE_LOCALE_NAMES,
  NEWS_INDEX_ENABLED,
  formatArticleDate,
  sourceHost,
} from "@/lib/news";
import { ArticleMeta } from "@/components/news/FrontPage";
import { getCategorySlug } from "@/lib/services";
import { getAuthor } from "@/lib/authors";
import { Byline } from "@/components/news/Byline";

const siteUrl = process.env.NEXT_PUBLIC_URL || "https://www.switch-to.eu";

/** Site locales this article is published in. */
function servedLocales(article: Article) {
  return routing.locales.filter((l) =>
    (article.locales as string[]).includes(l),
  );
}

export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    getAllArticles(locale).map((article) => ({ locale, slug: article.slug })),
  );
}

export async function generateMetadata(
  {
    params,
  }: {
    params: Promise<{ locale: Locale; slug: string }>;
  },
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const article = findArticle(slug, locale);
  if (!article) return { title: "Not Found" };

  const locales = servedLocales(article);
  const canonical = `${siteUrl}/${locale}/news/${slug}`;
  return {
    title: `${article.metaTitle || article.title} | switch-to.eu`,
    description: article.metaDescription || article.description,
    keywords: article.keywords,
    ...(article.sample ? { robots: { index: false, follow: false } } : {}),
    alternates: {
      canonical,
      languages: {
        ...Object.fromEntries(
          locales.map((l) => [l, `${siteUrl}/${l}/news/${slug}`]),
        ),
        "x-default": `${siteUrl}/en/news/${slug}`,
      },
    },
    openGraph: {
      ...(await inheritedOpenGraph(parent, canonical)),
      type: "article",
      title: article.ogTitle || article.title,
      description: article.ogDescription || article.description,
      publishedTime: article.date,
      modifiedTime: article.updatedAt || article.date,
      authors: [article.author],
    },
  };
}

export default async function NewsArticlePage({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const article = findArticle(slug, locale);
  if (!article) notFound();

  const t = await getTranslations({ locale, namespace: "news" });
  const otherLocales = servedLocales(article).filter((l) => l !== locale);
  // Prefer other pieces from the same story, then the most recent.
  const others = getAllArticles(locale).filter((a) => a.slug !== slug);
  const moreNews = [
    ...others.filter((a) => article.story && a.story === article.story),
    ...others.filter((a) => !article.story || a.story !== article.story),
  ].slice(0, 3);
  const updated =
    article.updatedAt && article.updatedAt > article.date
      ? article.updatedAt
      : null;

  const author = getAuthor(article.author);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: article.title,
    description: article.description,
    datePublished: article.date,
    dateModified: article.updatedAt || article.date,
    inLanguage: locale,
    author: author
      ? { "@type": "Person", name: article.author }
      : { "@type": "Organization", name: article.author, url: siteUrl },
    publisher: { "@type": "Organization", name: "switch-to.eu", url: siteUrl },
    mainEntityOfPage: `${siteUrl}/${locale}/news/${slug}`,
    articleBody: markdownToPlainText(article.content),
    citation: article.sources.map((s) => ({
      "@type": "CreativeWork",
      name: s.title,
      url: s.url,
    })),
  };

  const tNav = await getTranslations({ locale, namespace: "navigation" });
  const breadcrumbs = breadcrumbJsonLd(locale, [
    { name: tNav("home"), path: "" },
    ...(NEWS_INDEX_ENABLED ? [{ name: tNav("news"), path: "news" }] : []),
    { name: article.title, path: `news/${slug}` },
  ]);

  const header = (
    <div className="max-w-3xl">
      {NEWS_INDEX_ENABLED && (
      <Link
        href="/news"
        className="inline-block py-1 mb-5 text-sm font-semibold text-brand-green hover:underline rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green"
      >
        {t("backToNews")}
      </Link>
      )}
      <div className="text-[#1a1a1a] mb-5">
        <ArticleMeta article={article} locale={locale} t={t} />
        {updated && (
          <p className="mt-2 text-sm text-brand-green">
            {t("updatedOn", { date: formatArticleDate(updated, locale) })}
          </p>
        )}
      </div>
      <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl text-brand-green mb-4 leading-[1.02] text-balance">
        {article.title}
      </h1>
      <p className="text-[#1a1a1a] text-lg sm:text-xl leading-relaxed max-w-[60ch]">
        {article.description}
      </p>
      <Byline
        name={article.author}
        label={t("byline", { name: article.author })}
        className="mt-5 text-[#1a1a1a]"
      />
    </div>
  );

  return (
    <PageLayout>
      <JsonLd data={breadcrumbs} />
      <JsonLd data={jsonLd} />

      <section>
        <Container noPaddingMobile>
          {article.image ? (
            <div>
              <div className="relative h-[220px] sm:h-[340px] lg:h-[440px] md:rounded-3xl overflow-hidden bg-[#f3efe8]">
                <Image
                  src={article.image}
                  alt={article.imageAlt ?? ""}
                  fill
                  priority
                  sizes="(max-width: 1280px) 100vw, 1280px"
                  className="object-cover"
                />
              </div>
              <div className="relative -mt-12 sm:-mt-24 mx-3 sm:mx-8 lg:mx-16 bg-white border border-black/10 rounded-3xl px-6 sm:px-10 md:px-12 py-7 sm:py-10">
                {header}
              </div>
              {article.imageCredit && (
                <p className="mx-3 sm:mx-8 lg:mx-16 mt-2 px-1 text-xs text-[#1a1a1a]/75 text-right">
                  {article.imageCreditUrl ? (
                    <a
                      href={article.imageCreditUrl}
                      rel="noopener noreferrer"
                      className="underline underline-offset-2 hover:no-underline"
                    >
                      {article.imageCredit}
                    </a>
                  ) : (
                    article.imageCredit
                  )}
                </p>
              )}
            </div>
          ) : (
            <Banner color="bg-white border-y md:border border-black/10">
              {header}
            </Banner>
          )}
        </Container>
      </section>

      <section className="pt-8 md:pt-0">
        <Container>
          {/* One column, one measure: note, body, language line and sources share these edges. */}
          <div className="max-w-[42.5rem] mx-auto">
            {article.sample && (
              <p
                role="note"
                className="mb-8 max-w-[36rem] rounded-2xl bg-brand-cream border border-brand-green/20 px-5 py-4 text-brand-green leading-relaxed"
              >
                {t("sampleNotice")}
              </p>
            )}
            <div className="article-body mdx-content text-[1.125rem] leading-[1.75] text-[#2b2b2b]">
              <RichText data={article.content} />
            </div>

            {otherLocales.length > 0 && (
              <p className="mt-10 pt-6 border-t border-brand-green/15 text-sm text-gray-700">
                {t("otherLanguages")}{" "}
                {otherLocales.map((l, i) => (
                  <span key={l}>
                    {i > 0 && ", "}
                    <Link
                      href={`/news/${slug}`}
                      locale={l}
                      className="text-brand-green underline hover:no-underline"
                    >
                      {ARTICLE_LOCALE_NAMES[l]}
                    </Link>
                  </span>
                ))}
              </p>
            )}
          </div>
        </Container>
      </section>

      {article.sources.length > 0 && (
        <section className="pt-8 md:pt-0">
          <Container>
            <div className="max-w-[42.5rem] mx-auto bg-white border border-black/10 rounded-3xl p-6 sm:p-8">
              <h2 className="font-heading text-2xl text-brand-green mb-2">
                {t("sources")}
              </h2>
              <ol className="space-y-3 list-decimal pl-5 text-gray-700">
                {article.sources.map((source) => (
                  <li key={source.url}>
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-brand-green underline hover:no-underline"
                    >
                      {source.title}
                    </a>
                    <span className="text-sm">
                      {" "}
                      · {source.publisher || sourceHost(source.url)}
                      {source.date
                        ? ` · ${formatArticleDate(source.date, locale)}`
                        : ""}
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          </Container>
        </section>
      )}

      {article.services.length > 0 && (
        <section>
          <Container noPaddingMobile>
            <SectionHeading>{t("mentioned")}</SectionHeading>
            <div
              role="list"
              className="grid gap-0 md:gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
            >
              {article.services.map((service, index) => (
                <div role="listitem" key={service.slug}>
                  <ServiceCard
                    service={service}
                    showCategory
                    colorIndex={index}
                  />
                </div>
              ))}
            </div>
          </Container>
        </section>
      )}

      {article.guides.length > 0 && (
        <section>
          <Container>
            <SectionHeading>{t("relatedGuides")}</SectionHeading>
            <ul className="space-y-2">
              {article.guides.map((guide) => (
                <li key={guide.slug}>
                  <Link
                    href={`/guides/${getCategorySlug(guide.category)}/${guide.slug}`}
                    className="text-brand-green font-semibold underline hover:no-underline"
                  >
                    {guide.title}
                  </Link>
                </li>
              ))}
            </ul>
          </Container>
        </section>
      )}

      {moreNews.length > 0 && (
        <section aria-labelledby="more-news-title">
          <Container noPaddingMobile>
            <h2
              id="more-news-title"
              className="px-3 md:px-0 pt-10 md:pt-0 font-heading text-brand-green text-3xl sm:text-4xl mb-6 sm:mb-8"
            >
              {t("moreNews")}
            </h2>
            <div
              role="list"
              className="grid gap-0 md:gap-5 grid-cols-1 md:grid-cols-3"
            >
              {moreNews.map((other, index) => (
                <ArticleCard
                  key={other.slug}
                  article={other}
                  locale={locale}
                  index={index}
                  typeLabel={t(`types.${other.type}`)}
                  readMoreLabel={t("readMore")}
                  sampleLabel={t("sampleLabel")}
                />
              ))}
            </div>
          </Container>
        </section>
      )}

      <NewsletterCta />
    </PageLayout>
  );
}
