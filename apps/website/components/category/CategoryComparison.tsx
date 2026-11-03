import { getTranslations } from "next-intl/server";
import { Container } from "@switch-to-eu/blocks/components/container";
import { SectionHeading } from "@switch-to-eu/blocks/components/section-heading";
import { RegionBadge } from "@switch-to-eu/ui/components/region-badge";
import { Link } from "@switch-to-eu/i18n/navigation";
import { serviceHref } from "@/lib/buyers-guide";
import type { CompareColumn, Service } from "@/lib/content/types";

/**
 * Comparison table for a buyer's-guide category. Every value comes from the
 * listings. A missing value reads "Not listed", never "No": the vendor not
 * mentioning something is not proof that it is missing.
 */
export async function CategoryComparison({
  services,
  compare,
  categoryName,
}: {
  services: Service[];
  compare: CompareColumn[];
  categoryName: string;
}) {
  const t = await getTranslations("services.buyersGuide");

  const openSource = (value: boolean | undefined) =>
    value === true ? t("yes") : value === false ? t("no") : t("notListed");

  return (
    <section>
      <Container noPaddingMobile>
        <SectionHeading>{t("compareTitle")}</SectionHeading>
        <div className="px-3 md:px-0">
          <div
            className="mdx-table"
            role="region"
            tabIndex={0}
            aria-label={t("tableLabel", { category: categoryName })}
          >
            <table>
              <thead>
                <tr>
                  <th scope="col">{t("colService")}</th>
                  <th scope="col">{t("colHeadOffice")}</th>
                  {compare.map((column) => (
                    <th key={column.key} scope="col">
                      {column.label}
                    </th>
                  ))}
                  <th scope="col">{t("colOpenSource")}</th>
                </tr>
              </thead>
              <tbody>
                {services.map((service) => (
                  <tr key={service.slug}>
                    <th scope="row">
                      <Link
                        href={serviceHref(service)}
                        className="rounded-sm text-brand-green underline decoration-brand-green/40 underline-offset-2 hover:decoration-current focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-green"
                      >
                        {service.name}
                      </Link>
                      <span className="mt-1.5 block">
                        <RegionBadge region={service.region} />
                      </span>
                    </th>
                    <td>{service.headquarters || service.location}</td>
                    {compare.map((column) => (
                      <td key={column.key}>{service.specs?.[column.key] || t("notListed")}</td>
                    ))}
                    <td>{openSource(service.openSource)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Container>
    </section>
  );
}
