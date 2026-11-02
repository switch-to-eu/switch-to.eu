import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
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
import { findArticle, getAllArticles } from "@/lib/content/loader";
import type { Article } from "@/lib/content/types";
import { markdownToPlainText } from "@/lib/markdown";
import { ARTICLE_LOCALE_NAMES, formatArticleDate, sourceHost } from "@/lib/news";
import { getCategorySlug } from "@/lib/services";

const siteUrl = process.env.NEXT_PUBLIC_URL || "https://www.switch-to.eu";

/** Site locales this article is published in. */
function servedLocales(article: Article) {
  return routing.locales.filter((l) => (article.locales as string[]).includes(l));
}

export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    getAllArticles(locale).map((article) => ({ locale, slug: article.slug }))
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const article = findArticle(slug, locale);
  if (!article) return { title: "Not Found" };

  const locales = servedLocales(article);
  return {
    title: `${article.metaTitle || article.title} | switch-to.eu`,
    description: article.metaDescription || article.description,
    keywords: article.keywords,
    alternates: {
      canonical: `${siteUrl}/${locale}/news/${slug}`,
      languages: {
        ...Object.fromEntries(locales.map((l) => [l, `${siteUrl}/${l}/news/${slug}`])),
        "x-default": `${siteUrl}/en/news/${slug}`,
      },
    },
    openGraph: {
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
  const article = findArticle(slug, locale);
  if (!article) notFound();

  const t = await getTranslations({ locale, namespace: "news" });
  const otherLocales = servedLocales(article).filter((l) => l !== locale);
  const updated = article.updatedAt && article.updatedAt > article.date ? article.updatedAt : null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: article.title,
    description: article.description,
    datePublished: article.date,
    dateModified: article.updatedAt || article.date,
    inLanguage: locale,
    author: { "@type": "Organization", name: article.author, url: siteUrl },
    publisher: { "@type": "Organization", name: "switch-to.eu", url: siteUrl },
    mainEntityOfPage: `${siteUrl}/${locale}/news/${slug}`,
    articleBody: markdownToPlainText(article.content),
    citation: article.sources.map((s) => ({ "@type": "CreativeWork", name: s.title, url: s.url })),
  };

  return (
    <PageLayout>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <section>
        <Container noPaddingMobile>
          <Banner
            color="bg-brand-navy"
            shapes={[
              { shape: "cloud", className: "-top-8 -right-8 w-36 h-36 sm:w-48 sm:h-48", opacity: 0.12 },
              { shape: "petal", className: "bottom-6 right-16 hidden sm:block w-24 h-24", opacity: 0.1, duration: "8s", delay: "-2s" },
            ]}
          >
            <div className="max-w-3xl">
              <Link
                href="/news"
                className="inline-block mb-6 text-sm font-semibold text-brand-sky hover:underline rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-sky"
              >
                ← {t("backToNews")}
              </Link>
              <div className="flex flex-wrap items-center gap-3 mb-4 text-sm text-white">
                <span className="inline-flex items-center rounded-full bg-brand-yellow text-brand-navy px-3 py-1 text-xs font-semibold uppercase tracking-wider">
                  {t(`types.${article.type}`)}
                </span>
                <time dateTime={article.date}>
                  {t("publishedOn", { date: formatArticleDate(article.date, locale) })}
                </time>
                {updated && (
                  <span>· {t("updatedOn", { date: formatArticleDate(updated, locale) })}</span>
                )}
              </div>
              <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl uppercase text-brand-yellow mb-4 leading-none">
                {article.title}
              </h1>
              <p className="text-white text-base sm:text-lg">{article.description}</p>
            </div>
          </Banner>
        </Container>
      </section>

      <section>
        <Container>
          <div className="mdx-content max-w-3xl mx-auto text-lg text-gray-700">
            <RichText data={article.content} />
          </div>

          {otherLocales.length > 0 && (
            <p className="max-w-3xl mx-auto mt-8 text-sm text-gray-700">
              {t("otherLanguages")}{" "}
              {otherLocales.map((l, i) => (
                <span key={l}>
                  {i > 0 && ", "}
                  <Link href={`/news/${slug}`} locale={l} className="text-brand-green underline hover:no-underline">
                    {ARTICLE_LOCALE_NAMES[l]}
                  </Link>
                </span>
              ))}
            </p>
          )}
        </Container>
      </section>

      {article.sources.length > 0 && (
        <section>
          <Container>
            <div className="max-w-3xl mx-auto bg-brand-sage/40 rounded-3xl p-6 sm:p-8">
              <h2 className="font-heading uppercase text-2xl text-brand-green mb-2">{t("sources")}</h2>
              <p className="text-sm text-gray-700 mb-4">{t("sourcesIntro")}</p>
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
                      {source.date ? ` · ${formatArticleDate(source.date, locale)}` : ""}
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
            <div role="list" className="grid gap-0 md:gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {article.services.map((service, index) => (
                <div role="listitem" key={service.slug}>
                  <ServiceCard service={service} showCategory colorIndex={index} />
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

      <NewsletterCta />
    </PageLayout>
  );
}
