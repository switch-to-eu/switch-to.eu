import { notFound } from "next/navigation";
import { Metadata } from "next";

import { Container } from "@switch-to-eu/blocks/components/container";
import { PageLayout } from "@switch-to-eu/blocks/components/page-layout";

import { getTranslations } from "next-intl/server";
import { Locale } from "next-intl";

import { getAllEuServiceSlugs, getServiceBySlug, hasPricingData } from "@/lib/services";
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
              ? `${service.name} offers a free plan alongside paid tiers.`
              : `${service.name} is a paid service.`}
            {service.startingPrice &&
              ` Paid plans start at ${service.startingPrice}.`}
          </p>
        </div>

        {tiers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl pb-12">
            {tiers.map((tier, index) => (
              <div
                key={tier.name || index}
                className={`rounded-2xl p-6 border-2 ${
                  tier.highlighted
                    ? "bg-brand-navy border-brand-navy shadow-lg relative"
                    : "bg-white border-gray-100"
                }`}
              >
                {tier.highlighted && (
                  <span className="absolute -top-3 left-6 bg-brand-yellow text-brand-navy text-xs font-bold px-3 py-1 rounded-full uppercase">
                    Popular
                  </span>
                )}
                <h3
                  className={`font-heading text-lg uppercase mb-1 ${
                    tier.highlighted ? "text-brand-yellow" : "text-brand-green"
                  }`}
                >
                  {tier.name}
                </h3>
                <div
                  className={`text-3xl font-bold mb-1 ${
                    tier.highlighted ? "text-white" : "text-brand-navy"
                  }`}
                >
                  {tier.price}
                </div>
                {tier.billingNote && (
                  <p
                    className={`text-xs mb-4 ${
                      tier.highlighted
                        ? "text-brand-cream/60"
                        : "text-gray-400"
                    }`}
                  >
                    {tier.billingNote}
                  </p>
                )}
                {!tier.billingNote && <div className="mb-4" />}
                {tier.features && tier.features.length > 0 && (
                  <ul className="space-y-2.5">
                    {tier.features.map((f) => (
                      <li
                        key={f.feature}
                        className={`flex items-start gap-2 text-sm leading-relaxed ${
                          tier.highlighted
                            ? "text-brand-cream/80"
                            : "text-gray-600"
                        }`}
                      >
                        <span
                          className={`mt-0.5 flex-shrink-0 ${
                            tier.highlighted
                              ? "text-brand-yellow"
                              : "text-brand-green"
                          }`}
                        >
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

        {service.pricingUrl && (
          <div className="pb-12">
            <a
              href={service.pricingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-brand-navy font-medium hover:underline"
            >
              {t("pricing.viewFullPricing")} {service.name} &rarr;
            </a>
          </div>
        )}
      </Container>
    </PageLayout>
  );
}
