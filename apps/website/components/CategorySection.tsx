import React from "react";
import Image from "next/image";
import { Container } from "@/components/layout/container";
import { getAllCategoriesMetadata } from "@switch-to-eu/content/services/categories";
import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@switch-to-eu/i18n/navigation";
import { FILTER_BRAND_GREEN, FILTER_WHITE } from "@switch-to-eu/ui/lib/shape-filters";

const CATEGORY_CARDS = [
  {
    bg: "bg-brand-sky",
    text: "text-brand-green",
    button: "bg-brand-green text-white",
    shape: "spark",
    shapeFilter: FILTER_BRAND_GREEN,
  },
  {
    bg: "bg-brand-orange",
    text: "text-white",
    button: "bg-white text-brand-orange",
    shape: "cloud",
    shapeFilter: FILTER_WHITE,
  },
  {
    bg: "bg-brand-yellow",
    text: "text-brand-green",
    button: "bg-brand-green text-white",
    shape: "tulip",
    shapeFilter: FILTER_BRAND_GREEN,
  },
  {
    bg: "bg-brand-green",
    text: "text-white",
    button: "bg-white text-brand-green",
    shape: "speech",
    shapeFilter: FILTER_WHITE,
  },
  {
    bg: "bg-brand-pink",
    text: "text-brand-green",
    button: "bg-brand-green text-white",
    shape: "heart",
    shapeFilter: FILTER_BRAND_GREEN,
  },
  {
    bg: "bg-brand-navy",
    text: "text-white",
    button: "bg-white text-brand-navy",
    shape: "sunburst",
    shapeFilter: FILTER_WHITE,
  },
  {
    bg: "bg-brand-sage",
    text: "text-brand-green",
    button: "bg-brand-green text-white",
    shape: "flower",
    shapeFilter: FILTER_BRAND_GREEN,
  },
  {
    bg: "bg-brand-red",
    text: "text-white",
    button: "bg-white text-brand-red",
    shape: "starburst",
    shapeFilter: FILTER_WHITE,
  },
];

export async function CategorySection() {
  const locale = await getLocale();
  const t = await getTranslations("home");
  const categories = getAllCategoriesMetadata(locale);

  return (
    <section>
      <Container>
        <h2 className="mb-10 font-heading text-4xl sm:text-5xl uppercase text-brand-green">
          {t("categoriesSectionTitle")}
        </h2>
        <div className="grid gap-5 sm:gap-6 grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 auto-rows-fr">
          {categories.map((category, index) => {
            const card = CATEGORY_CARDS[index % CATEGORY_CARDS.length]!;

            return (
              <Link
                key={category.slug}
                href={`/services/${category.slug}`}
                className="no-underline h-full group"
              >
                <div
                  className={`${card.bg} rounded-3xl h-full flex flex-col overflow-hidden transition-shadow duration-200 group-hover:shadow-md`}
                >
                  {/* Decorative shape area */}
                  <div className="relative h-40 sm:h-48 flex items-center justify-center p-6">
                    <Image
                      src={`/images/shapes/${card.shape}.svg`}
                      alt=""
                      fill
                      className="object-contain p-4 sm:p-6 select-none animate-shape-float"
                      style={{
                        filter: card.shapeFilter,
                        animationDuration: `${6 + (index % 4) * 1.5}s`,
                        animationDelay: `${(index % 4) * -1.5}s`,
                      }}
                      aria-hidden="true"
                      unoptimized
                    />
                  </div>

                  {/* Content area */}
                  <div className="flex flex-col flex-1 px-5 pb-5 sm:px-6 sm:pb-6">
                    <h3
                      className={`${card.text} mb-2 font-bold text-lg sm:text-xl`}
                    >
                      {category.metadata.title}
                    </h3>
                    <p
                      className={`${card.text} text-sm sm:text-base opacity-80 leading-relaxed line-clamp-3 mb-5`}
                    >
                      {category.metadata.description}
                    </p>
                    <div className="mt-auto">
                      <span
                        className={`${card.button} inline-block px-5 py-2 rounded-full text-sm font-semibold`}
                      >
                        {t("exploreCategory")}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
