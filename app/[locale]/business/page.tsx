import { Link } from "@/i18n/navigation";
import { Container } from "@/components/layout/container";
import { getAllBusinessCategoriesMetadata } from "@/lib/content/services/categories";
import { routing } from "@/i18n/routing";
import { getTranslations, unstable_setRequestLocale } from "next-intl/server";
import { Locale } from "next-intl";

interface BusinessLandingPageProps {
  params: {
    locale: Locale;
  };
}

export async function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params: { locale },
}: BusinessLandingPageProps) {
  const t = await getTranslations({ locale, namespace: "businessLanding" });
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
  };
}

export default async function BusinessLandingPage({
  params: { locale },
}: BusinessLandingPageProps) {
  unstable_setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "businessLanding" });
  const businessCategories = await getAllBusinessCategoriesMetadata(locale);

  return (
    <Container className="py-8">
      <h1 className="text-3xl font-bold mb-6">{t("pageTitle")}</h1>
      {businessCategories.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {businessCategories.map((category) => (
            <Link
              key={category.slug}
              href={`/business/services/${category.slug}`}
              className="block p-6 border rounded-lg hover:shadow-lg transition-shadow"
            >
              <h2 className="text-xl font-semibold mb-2">
                {category.metadata.title}
              </h2>
              <p className="text-muted-foreground">
                {category.metadata.description}
              </p>
            </Link>
          ))}
        </div>
      ) : (
        <p>{t("noCategoriesFound")}</p>
      )}
    </Container>
  );
}
