import { RichText } from "@payloadcms/richtext-lexical/react";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { Link } from "@switch-to-eu/i18n/navigation";

import { Container } from "@switch-to-eu/blocks/components/container";
import { PageLayout } from "@switch-to-eu/blocks/components/page-layout";

import { getTranslations } from "next-intl/server";
import { Locale } from "next-intl";

import {
  getServiceBySlug,
  getAllEuServiceSlugs,
  hasPricingData,
  hasSecurityData,
} from "@/lib/services";
import { generateServiceMetadata } from "@/lib/service-metadata";

export async function generateStaticParams() {
  return getAllEuServiceSlugs();
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; service_name: string }>;
}): Promise<Metadata> {
  const { service_name, locale } = await params;
  return generateServiceMetadata({ serviceName: service_name, locale });
}

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ locale: Locale; service_name: string }>;
}) {
  const { service_name, locale } = await params;
  const t = await getTranslations("services.detail");

  const service = await getServiceBySlug(service_name, locale);

  if (!service) {
    notFound();
  }

  const basePath = `/services/eu/${service_name}`;

  // Determine which snippets to show
  const hasPricing = hasPricingData(service);
  const hasSecurity = hasSecurityData(service);

  // Get pricing summary data
  const freeTier = service.pricingTiers?.find(
    (t) => t.price === "Free" || t.price === "free" || t.price === "€0"
  );
  const cheapestPaid = service.pricingTiers
    ?.filter((t) => t.price !== "Free" && t.price !== "free" && t.price !== "€0")
    ?.[0];

  const gdprLabel =
    service.gdprCompliance === "compliant"
      ? t("gdprCompliant")
      : service.gdprCompliance === "partial"
        ? t("gdprPartial")
        : service.gdprCompliance === "non-compliant"
          ? t("gdprNonCompliant")
          : null;

  return (
    <PageLayout className="md:gap-8 md:pt-0 md:pb-8">
      {/* Feature highlights (filter out pills redundant with hero meta) */}
      {service.features && service.features.length > 0 && (() => {
        const filtered = service.features.filter(
          (f) => !/free/i.test(f.feature)
        );
        return filtered.length > 0 ? (
          <Container className="py-2 md:py-0">
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {filtered.map((f) => (
                <span
                  key={f.feature}
                  className="inline-block bg-brand-sky/20 text-brand-green px-2.5 py-1 sm:px-4 sm:py-1.5 rounded-full text-xs sm:text-sm font-medium"
                >
                  {f.feature}
                </span>
              ))}
            </div>
          </Container>
        ) : null;
      })()}

      {/* Content */}
      {service.content && (
        <section>
          <Container>
            <div className="max-w-3xl">
              <div className="mdx-content prose prose-sm sm:prose max-w-none">
                <RichText data={service.content} />
              </div>
            </div>
          </Container>
        </section>
      )}

      {/* Pricing + Security snippets linking to tabs */}
      {(hasPricing || hasSecurity) && (
        <section>
          <Container>
            <div className="flex gap-4 sm:gap-6 mb-4">
              {hasPricing && (
                <Link
                  href={`${basePath}/pricing`}
                  className="group no-underline sm:bg-white sm:p-5 sm:rounded-xl sm:border sm:border-gray-200 sm:shadow-sm sm:hover:shadow-md sm:hover:border-brand-green/30 sm:transition-all"
                >
                  <span className="block text-xs sm:text-sm text-gray-400 mb-0.5 sm:mb-1.5">{t("tabs.pricing")}</span>
                  <span className="text-sm sm:text-base font-semibold text-brand-navy group-hover:text-brand-green transition-colors whitespace-nowrap">
                    {freeTier && cheapestPaid
                      ? `${t("snippetFree")} \u2013 ${cheapestPaid.price.replace("/month", "").replace("/user", "").replace(".", ",")} p/m`
                      : freeTier
                        ? t("snippetFree")
                        : service.startingPrice || t("snippetViewPlans")}
                    {" "}<span className="text-xs sm:text-sm">&rarr;</span>
                  </span>
                </Link>
              )}

              {hasSecurity && (
                <Link
                  href={`${basePath}/security`}
                  className="group no-underline sm:bg-white sm:p-5 sm:rounded-xl sm:border sm:border-gray-200 sm:shadow-sm sm:hover:shadow-md sm:hover:border-brand-green/30 sm:transition-all"
                >
                  <span className="block text-xs sm:text-sm text-gray-400 mb-0.5 sm:mb-1.5">{t("tabs.security")}</span>
                  <span className="text-sm sm:text-base font-semibold text-brand-navy group-hover:text-brand-green transition-colors whitespace-nowrap">
                    {gdprLabel || t("snippetViewDetails")} <span className="text-xs sm:text-sm">&rarr;</span>
                  </span>
                </Link>
              )}
            </div>
          </Container>
        </section>
      )}
    </PageLayout>
  );
}
