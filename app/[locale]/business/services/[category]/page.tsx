import {
  getBusinessServicesByCategory,
} from "@/lib/content/services/services";
import {
  getBusinessCategoryContent,
  getAllBusinessCategoriesMetadata,
} from "@/lib/content/services/categories";
import { notFound } from "next/navigation";
import { ServiceCard } from "@/components/ui/ServiceCard";
import { RecommendedAlternative } from "@/components/ui/RecommendedAlternative";
import { Container } from "@/components/layout/container";
import { ContributeCta } from "@/components/ContributeCta";
import { getTranslations, unstable_setRequestLocale } from "next-intl/server";
import { Locale } from "next-intl";
import { routing } from "@/i18n/routing"; // For generateStaticParams
import { CategoryMetadata } from "@/lib/content/schemas"; // For generateMetadata type

interface BusinessCategoryPageProps {
  params: {
    locale: Locale;
    category: string;
  };
}

export async function generateStaticParams() {
  const params = [];
  for (const locale of routing.locales) {
    const categories = await getAllBusinessCategoriesMetadata(locale);
    for (const category of categories) {
      params.push({ locale, category: category.slug });
    }
  }
  return params;
}

export async function generateMetadata({
  params: { locale, category: categorySlug },
}: BusinessCategoryPageProps): Promise<{
  title: string;
  description?: string;
  keywords?: string[];
}> {
  unstable_setRequestLocale(locale);
  const { metadata: categoryMetadata } = await getBusinessCategoryContent(
    categorySlug,
    locale
  );

  if (!categoryMetadata) {
    return {
      title: "Category Not Found",
    };
  }

  const t = await getTranslations({ locale, namespace: "guides.category" }); // Reusing existing namespace for now

  return {
    title: t("meta.title", { category: categoryMetadata.title }),
    description: categoryMetadata.description || undefined,
    keywords: categoryMetadata.keywords || [],
  };
}

export default async function BusinessCategoryPage({
  params,
}: BusinessCategoryPageProps) {
  unstable_setRequestLocale(params.locale);
  const { metadata: categoryMetadata, content: categoryContent } =
    await getBusinessCategoryContent(params.category, params.locale);

  // Fetch EU business services for this category
  const businessServices = await getBusinessServicesByCategory(
    params.category,
    "eu", // Assuming we filter by "eu" for now
    params.locale
  );

  if (businessServices.length === 0 || !categoryMetadata) {
    notFound();
  }

  const featuredServices = businessServices.filter(
    (service) => service.featured
  );
  const regularServices = businessServices.filter(
    (service) => !service.featured
  );

  const t = await getTranslations({ locale: params.locale, namespace: "services.detail" }); // Reusing for "Recommended Alternative" title

  return (
    <Container className="py-8">
      <h1 className="text-3xl md:text-4xl font-bold mb-4">
        {categoryMetadata.title}
      </h1>
      <p className="text-lg text-muted-foreground mb-6">
        {categoryMetadata.description}
      </p>

      {categoryContent && (
        <div
          className="prose dark:prose-invert max-w-none mb-8"
          dangerouslySetInnerHTML={{ __html: categoryContent }}
        />
      )}

      {featuredServices.length > 0 && (
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">{t("recommendedAlternative.title")}</h2>
          <div className="grid grid-cols-1 gap-6">
            {featuredServices.map((service) => (
              <RecommendedAlternative
                key={service.slug}
                serviceName={service.name}
                locale={params.locale}
                isBusinessService={true} // Add a prop to fetch business alternatives
              />
            ))}
          </div>
        </section>
      )}

      {regularServices.length > 0 && (
        <section>
          <h2 className="text-2xl font-semibold mb-6">
            {/* Consider a more generic title if "recommended" is too specific for non-featured */}
            {categoryMetadata.title} {t("alternatives")} {/* Reusing existing key */}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {regularServices.map((service) => (
              <ServiceCard
                key={service.slug}
                service={service}
                locale={params.locale}
                isBusiness={true} // To link to business services
              />
            ))}
          </div>
        </section>
      )}
      
      <ContributeCta className="mt-12" />
    </Container>
  );
}
