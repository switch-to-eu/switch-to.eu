import { getTranslations } from "next-intl/server";
import { Container } from "@switch-to-eu/blocks/components/container";
import { SectionHeading } from "@switch-to-eu/blocks/components/section-heading";
import { Link } from "@switch-to-eu/i18n/navigation";
import type { Service } from "@/lib/content/types";

/** The non-EU services in a category, so a reader who leaves one finds its page. */
export async function CategoryLeaving({ services }: { services: Service[] }) {
  const t = await getTranslations("services.buyersGuide");

  return (
    <section>
      <Container noPaddingMobile>
        <SectionHeading>{t("leavingTitle")}</SectionHeading>
        <p className="px-3 md:px-0 mb-4 text-[#1a1a1a] text-base sm:text-lg max-w-3xl">
          {t("leavingIntro")}
        </p>
        <ul className="flex flex-wrap gap-2 px-3 md:px-0">
          {services.map((service) => (
            <li key={service.slug}>
              <Link
                href={`/services/non-eu/${service.slug}`}
                className="inline-block rounded-full border-2 border-brand-green px-4 py-1.5 text-sm font-semibold text-brand-green no-underline hover:bg-brand-green hover:text-white transition-colors focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-green"
              >
                {service.name}
              </Link>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
