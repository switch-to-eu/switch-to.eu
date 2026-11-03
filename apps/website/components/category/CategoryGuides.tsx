import { getTranslations } from "next-intl/server";
import { Container } from "@switch-to-eu/blocks/components/container";
import { SectionHeading } from "@switch-to-eu/blocks/components/section-heading";
import { Link } from "@switch-to-eu/i18n/navigation";
import { getCardColor } from "@/lib/quiet-palette";
import { getCategorySlug } from "@/lib/services";
import type { Guide } from "@/lib/content/types";

/** The switching guides in a category, so a reader can act on a pick. */
export async function CategoryGuides({ guides }: { guides: Guide[] }) {
  const t = await getTranslations("services.buyersGuide");
  const tDifficulty = await getTranslations("guides.category.difficulty");

  return (
    <section>
      <Container noPaddingMobile>
        <SectionHeading>{t("guidesTitle")}</SectionHeading>
        <ul className="grid grid-cols-1 gap-0 md:gap-5 md:grid-cols-2 lg:grid-cols-3">
          {guides.map((guide, index) => (
            <li key={guide.slug}>
              <Link
                href={`/guides/${getCategorySlug(guide.category)}/${guide.slug}`}
                className="group flex h-full flex-col overflow-hidden bg-white text-[#1a1a1a] no-underline border-y md:border border-black/10 md:rounded-3xl focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-green"
              >
                <span aria-hidden="true" className={`h-1.5 ${getCardColor(index + 3).strip}`} />
                <span className="flex flex-col flex-1 p-6">
                  <span className="font-heading text-xl sm:text-2xl leading-[1.1] text-brand-green text-balance group-hover:underline decoration-[0.06em] underline-offset-[0.12em]">
                    {guide.title}
                  </span>
                  <span className="mt-3 text-sm">
                    {t("guideTime", {
                      time: guide.timeRequired,
                      difficulty: tDifficulty(guide.difficulty),
                    })}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
