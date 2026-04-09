import { notFound } from "next/navigation";
import { Metadata } from "next";

import { Container } from "@switch-to-eu/blocks/components/container";
import { PageLayout } from "@switch-to-eu/blocks/components/page-layout";

import { getTranslations } from "next-intl/server";
import { Locale } from "next-intl";

import { getAllEuServiceSlugs, getServiceBySlug, hasPricingData } from "@/lib/services";
import { generateServiceMetadata } from "@/lib/service-metadata";

export const dynamicParams = false;

export async function generateStaticParams() {
  return getAllEuServiceSlugs();
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; service_name: string }>;
}): Promise<Metadata> {
  const { service_name, locale } = await params;
  return generateServiceMetadata({ serviceName: service_name, locale, section: "pricing" });
}

export default async function PricingPage({
  params,
}: {
  params: Promise<{ locale: Locale; service_name: string }>;
}) {
  const { service_name, locale } = await params;
  const t = await getTranslations("services.detail");

  const service = await getServiceBySlug(service_name, locale);

  if (!service || !hasPricingData(service)) {
    notFound();
  }

  const tiers = service.pricingTiers ?? [];

  return (
    <PageLayout>
      <Container>
        <div className="max-w-3xl pb-8">
          <h2 className="font-heading text-3xl sm:text-4xl uppercase text-brand-green mb-3">
            {service.name} {t("pricing.title")}
          </h2>
          <p className="text-gray-600 text-base sm:text-lg leading-relaxed">
            {service.freeOption
              ? t("pricing.freeIntro", { service: service.name })
              : t("pricing.paidIntro", { service: service.name })}
            {service.startingPrice &&
              ` ${t("pricing.startingAt", { price: service.startingPrice })}`}
          </p>
        </div>

        {tiers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl pb-12">
            {tiers.map((tier, index) => (
              <div
                key={tier.name || index}
                className="rounded-2xl p-6 border-2 bg-white border-gray-100"
              >
                <h3 className="font-heading text-lg uppercase mb-1 text-brand-green">
                  {tier.name}
                </h3>
                <div className="text-3xl font-bold mb-1 text-brand-navy">
                  {tier.price}
                </div>
                {tier.billingNote && (
                  <p className="text-xs mb-4 text-gray-400">
                    {tier.billingNote}
                  </p>
                )}
                {!tier.billingNote && <div className="mb-4" />}
                {tier.features && tier.features.length > 0 && (
                  <ul className="space-y-2.5">
                    {tier.features.map((f) => (
                      <li
                        key={f.feature}
                        className="flex items-start gap-2 text-sm leading-relaxed text-gray-600"
                      >
                        <span className="mt-0.5 flex-shrink-0 text-brand-green">
                          &#10003;
                        </span>
                        {f.feature}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        ) : service.pricingDetails ? (
          <div className="max-w-3xl pb-12">
            <div className="bg-white rounded-2xl p-8 border border-gray-100">
              <div className="whitespace-pre-line text-gray-600 leading-relaxed">
                {service.pricingDetails}
              </div>
            </div>
          </div>
        ) : null}

      </Container>
    </PageLayout>
  );
}
