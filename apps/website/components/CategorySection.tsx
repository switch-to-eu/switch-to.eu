import { Container } from "@/components/layout/container";
import { CardGrid } from "@switch-to-eu/blocks/components/card-grid";
import { BrandCard } from "@switch-to-eu/blocks/components/brand-card";
import { getAllCategoriesMetadata } from "@switch-to-eu/content/services/categories";
import { getLocale, getTranslations } from "next-intl/server";

const CATEGORY_SHAPES = [
  "spark",
  "cloud",
  "tulip",
  "speech",
  "heart",
  "sunburst",
  "flower",
  "starburst",
];

export async function CategorySection() {
  const locale = await getLocale();
  const t = await getTranslations("home");
  const categories = getAllCategoriesMetadata(locale);

  return (
    <section id="categories">
      <Container>
        <h2 className="mb-6 font-heading text-4xl uppercase text-brand-green">
          {t("categoriesSectionTitle")}
        </h2>
      </Container>

      <Container noPaddingMobile>
        <CardGrid cols={4}>
          {categories.map((category, index) => (
            <BrandCard
              key={category.slug}
              colorIndex={index}
              title={category.metadata.title}
              description={category.metadata.description}
              href={`/services/${category.slug}`}
              ctaText={t("exploreCategory")}
              shape={`/images/shapes/${CATEGORY_SHAPES[index % CATEGORY_SHAPES.length]}.svg`}
            />
          ))}
        </CardGrid>
      </Container>
    </section>
  );
}
