import { getTranslations } from "next-intl/server";
import type { Locale } from "next-intl";
import { Container } from "@switch-to-eu/blocks/components/container";
import { SectionHeading } from "@switch-to-eu/blocks/components/section-heading";
import { Link } from "@switch-to-eu/i18n/navigation";
import { ArticleCard } from "@/components/news/ArticleCard";
import { getAllArticles } from "@/lib/content/loader";

/** Latest three news articles for the homepage. Renders nothing until there are any. */
export async function ArticlesSection({ locale }: { locale: Locale }) {
  const articles = getAllArticles(locale).slice(0, 3);
  if (articles.length === 0) return null;

  const t = await getTranslations({ locale, namespace: "news" });

  return (
    <section>
      <Container noPaddingMobile>
        <SectionHeading>{t("latest")}</SectionHeading>
        <p className="px-3 md:px-0 max-w-2xl text-brand-green/80 text-base sm:text-lg leading-relaxed mb-8 sm:mb-10">
          {t("latestIntro")}
        </p>
        <div role="list" className="grid gap-0 md:gap-5 grid-cols-1 md:grid-cols-3">
          {articles.map((article, index) => (
            <ArticleCard
              key={article.slug}
              article={article}
              locale={locale}
              index={index}
              typeLabel={t(`types.${article.type}`)}
              readMoreLabel={t("readMore")}
            />
          ))}
        </div>
        <div className="mt-8 px-3 md:px-0">
          <Link
            href="/news"
            className="inline-block py-2.5 px-6 bg-brand-green text-white rounded-full font-semibold text-sm hover:opacity-90 transition-opacity no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green focus-visible:ring-offset-2"
          >
            {t("viewAll")} →
          </Link>
        </div>
      </Container>
    </section>
  );
}
