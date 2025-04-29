import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Container } from "@/components/layout/container";
import { getAllCategoriesMetadata } from "@/lib/content/categories";
import { Locale, getDictionary } from "@/lib/i18n/dictionaries";

interface CategorySectionProps {
  lang: Locale;
}

export async function CategorySection({ lang }: CategorySectionProps) {
  // Get all categories and their metadata, passing the language parameter
  const categories = getAllCategoriesMetadata(lang);
  const dict = await getDictionary(lang);

  return (
    <section>
      <Container>
        <h2 className="mb-8 text-center font-bold text-3xl">{dict.home.categoriesSectionTitle}</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 auto-rows-fr">
          {categories.map((category, index) => {
            // Calculate the color index (1-4) - cycle through colors
            const colorIndex = (index % 4) + 1;

            return (
              <Link key={category.slug} href={`/${lang}/services/${category.slug}`} className="no-underline h-full">
                <div className={`bg-[var(--pop-${colorIndex})] p-5 sm:p-8 rounded-xl h-full flex flex-col`}>
                  <div className="flex flex-col items-center text-center h-full justify-between">
                    <div className="mb-3 sm:mb-4">
                      <Image
                        src={`/images/categories/${category.slug}.svg`}
                        alt={`${category.metadata.title} icon`}
                        width={120}
                        height={120}
                        priority
                        unoptimized
                      />
                    </div>
                    <div>
                      <h3 className="mb-2 font-bold text-xl">{category.metadata.title}</h3>
                      <p className=" text-sm sm:text-base">{category.metadata.description}</p>
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