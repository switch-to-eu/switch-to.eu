import type { Metadata, ResolvingMetadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "next-intl";
import { Container } from "@switch-to-eu/blocks/components/container";
import { PageLayout } from "@switch-to-eu/blocks/components/page-layout";
import { pageMetadata } from "@/lib/seo";
import { ArticleCard } from "@/components/news/ArticleCard";
import { NewsletterCta } from "@/components/NewsletterCta";
import { FrontPage } from "@/components/news/FrontPage";
import { getAllArticles } from "@/lib/content/loader";

const BRIEFING_COUNT = 4;

export async function generateMetadata(
  {
    params,
  }: {
    params: Promise<{ locale: Locale }>;
  },
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "news" });
  const metadata = await pageMetadata({
    parent,
    path: "news",
    locale,
    title: t("meta.title"),
    description: t("meta.description"),
  });
  return {
    ...metadata,
    alternates: {
      ...metadata.alternates,
      types: { "application/rss+xml": `/${locale}/news/feed.xml` },
    },
  };
}

export default async function NewsIndexPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "news" });
  const articles = getAllArticles(locale);
  // The front page shows the lead plus BRIEFING_COUNT headlines. Older pieces follow as cards.
  const older = articles.slice(1 + BRIEFING_COUNT);

  return (
    <PageLayout>
      <section>
        <Container>
          <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-3 border-b-2 border-brand-green pb-5">
            <div className="max-w-2xl">
              <h1 className="font-heading text-brand-green text-4xl sm:text-5xl leading-none mb-3">
                {t("hero.title")}
              </h1>
            </div>
            <a
              href={`/${locale}/news/feed.xml`}
              className="inline-block py-2 px-5 rounded-full border-2 border-brand-green text-brand-green font-semibold text-sm hover:bg-brand-green hover:text-white transition-colors focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-green"
            >
              {t("rss")}
            </a>
          </div>
        </Container>
      </section>

      {articles.length === 0 ? (
        <section>
          <Container>
            <p className="text-lg text-brand-green/80">{t("empty")}</p>
          </Container>
        </section>
      ) : (
        <FrontPage articles={articles} locale={locale} briefingCount={BRIEFING_COUNT} showFooterLinks={false} />
      )}

      {older.length > 0 && (
        <section aria-labelledby="more-news-title">
          <Container noPaddingMobile>
            <h2
              id="more-news-title"
              className="px-3 md:px-0 pt-10 md:pt-0 font-heading text-brand-green text-3xl sm:text-4xl mb-6 sm:mb-8"
            >
              {t("moreNews")}
            </h2>
            <div role="list" className="grid gap-0 md:gap-5 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {older.map((article, index) => (
                <ArticleCard
                  key={article.slug}
                  article={article}
                  locale={locale}
                  index={index}
                  typeLabel={t(`types.${article.type}`)}
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
