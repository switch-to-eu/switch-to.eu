import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import type { Locale } from "next-intl";
import { Banner } from "@switch-to-eu/blocks/components/banner";
import { Container } from "@switch-to-eu/blocks/components/container";
import { PageLayout } from "@switch-to-eu/blocks/components/page-layout";
import { generateLanguageAlternates } from "@switch-to-eu/i18n/utils";
import { ArticleCard } from "@/components/news/ArticleCard";
import { NewsletterCta } from "@/components/NewsletterCta";
import { FrontPage } from "@/components/news/FrontPage";
import { getAllArticles } from "@/lib/content/loader";

const BRIEFING_COUNT = 4;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "news" });
  return {
    title: t("meta.title"),
    description: t("meta.description"),
    alternates: {
      ...generateLanguageAlternates("news", locale),
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
  const t = await getTranslations({ locale, namespace: "news" });
  const articles = getAllArticles(locale);
  // The front page shows the lead plus BRIEFING_COUNT headlines. Older pieces follow as cards.
  const older = articles.slice(1 + BRIEFING_COUNT);

  return (
    <PageLayout>
      <section>
        <Container noPaddingMobile>
          <Banner
            color="bg-brand-navy"
            shapes={[
              { shape: "sunburst", className: "-top-10 -right-10 w-40 h-40 sm:w-56 sm:h-56", opacity: 0.15, color: "text-brand-yellow" },
              { shape: "petal", className: "bottom-4 right-24 hidden sm:block w-24 h-24", opacity: 0.12, duration: "8s", delay: "-3s" },
              { shape: "wave", className: "top-1/2 -left-8 hidden md:block w-24 h-24", opacity: 0.1, duration: "7s", delay: "-5s" },
            ]}
          >
            <div className="max-w-3xl">
              <h1 className="font-heading text-5xl sm:text-6xl md:text-7xl uppercase text-brand-yellow mb-4">
                {t("hero.title")}
              </h1>
              <p className="text-white text-base sm:text-lg mb-6">{t("hero.description")}</p>
              <a
                href={`/${locale}/news/feed.xml`}
                className="inline-block py-2.5 px-6 bg-brand-yellow text-brand-green rounded-full font-semibold text-sm hover:opacity-90 transition-opacity no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-brand-navy"
              >
                {t("rss")}
              </a>
            </div>
          </Banner>
        </Container>
      </section>

      {articles.length === 0 ? (
        <section>
          <Container>
            <p className="text-lg text-brand-green/80">{t("empty")}</p>
          </Container>
        </section>
      ) : (
        <FrontPage articles={articles} locale={locale} briefingCount={BRIEFING_COUNT} />
      )}

      {older.length > 0 && (
        <section aria-labelledby="more-news-title">
          <Container noPaddingMobile>
            <h2
              id="more-news-title"
              className="px-3 md:px-0 pt-10 md:pt-0 font-heading uppercase text-brand-green text-4xl sm:text-5xl mb-6 sm:mb-8"
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
