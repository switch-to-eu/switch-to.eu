import { notFound } from "next/navigation";
import { Metadata } from "next";

import { Container } from "@switch-to-eu/blocks/components/container";
import { PageLayout } from "@switch-to-eu/blocks/components/page-layout";

import { getTranslations } from "next-intl/server";
import type { Locale } from "next-intl";

import {
  getAllEuServiceSlugs,
  getServiceBySlug,
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
  return generateServiceMetadata({ serviceName: service_name, locale, section: "security" });
}

export default async function SecurityPage({
  params,
}: {
  params: Promise<{ locale: Locale; service_name: string }>;
}) {
  const { service_name, locale } = await params;
  const t = await getTranslations("services.detail");

  const service = await getServiceBySlug(service_name, locale as string);

  if (!service || !hasSecurityData(service)) {
    notFound();
  }

  const gdprLabel =
    service.gdprCompliance === "compliant"
      ? t("gdprCompliant")
      : service.gdprCompliance === "partial"
        ? t("gdprPartial")
        : service.gdprCompliance === "non-compliant"
          ? t("gdprNonCompliant")
          : null;

  const gdprColor =
    service.gdprCompliance === "compliant"
      ? "bg-brand-green/10 text-brand-green border-brand-green/20"
      : service.gdprCompliance === "partial"
        ? "bg-brand-yellow/10 text-brand-orange border-brand-yellow/20"
        : "bg-gray-100 text-gray-600 border-gray-200";

  return (
    <PageLayout>
      <Container>
        <div className="max-w-3xl pb-8">
          <h2 className="font-heading text-3xl sm:text-4xl uppercase text-brand-green mb-3">
            {service.name} {t("security.title")}
          </h2>
          <p className="text-gray-600 text-base sm:text-lg leading-relaxed">
            {t("security.intro", { service: service.name })}
          </p>
        </div>

        <div className="max-w-3xl space-y-8 pb-12">
          {/* GDPR + Jurisdiction row */}
          <div className="flex flex-col gap-6">
            {service.gdprCompliance && (
              <div>
                <h3 className="text-xs font-medium uppercase tracking-wide text-gray-400 mb-2">
                  GDPR
                </h3>
                <div
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-medium ${gdprColor}`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      service.gdprCompliance === "compliant"
                        ? "bg-brand-green"
                        : service.gdprCompliance === "partial"
                          ? "bg-brand-orange"
                          : "bg-gray-400"
                    }`}
                  />
                  {gdprLabel}
                </div>
              </div>
            )}

            <div>
              <h3 className="text-xs font-medium uppercase tracking-wide text-gray-400 mb-2">
                {t("security.jurisdiction")}
              </h3>
              <p className="text-sm text-gray-700">
                {service.location}
                {service.headquarters ? ` (HQ: ${service.headquarters})` : ""}
                {service.parentCompany ? ` / ${service.parentCompany}` : ""}
              </p>
            </div>

            <div>
              <h3 className="text-xs font-medium uppercase tracking-wide text-gray-400 mb-2">
                {t("security.openSource")}
              </h3>
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${
                  service.openSource
                    ? "bg-brand-green/10 text-brand-green"
                    : "bg-gray-100 text-gray-500"
                }`}
              >
                {service.openSource ? t("security.yes") : t("security.no")}
              </span>
              {service.openSource && service.sourceCodeUrl && (
                <a
                  href={service.sourceCodeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-brand-navy text-xs font-medium hover:underline mt-1"
                >
                  {t("security.viewSource")} &rarr;
                </a>
              )}
            </div>
          </div>

          {/* GDPR notes */}
          {service.gdprNotes && (
            <p className="text-gray-600 text-sm leading-relaxed">
              {service.gdprNotes}
            </p>
          )}

          {/* Data Storage Locations */}
          {service.dataStorageLocations &&
            service.dataStorageLocations.length > 0 && (
              <div>
                <h3 className="text-xs font-medium uppercase tracking-wide text-gray-400 mb-3">
                  {t("security.dataStorage")}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {service.dataStorageLocations.map((loc) => (
                    <span
                      key={loc.location}
                      className="inline-flex items-center gap-1.5 bg-brand-sky/10 text-brand-green px-3 py-1.5 rounded-full text-sm"
                    >
                      <span className="text-brand-sky">&#9679;</span>
                      {loc.location}
                    </span>
                  ))}
                </div>
              </div>
            )}

          {/* Certifications */}
          {service.certifications && service.certifications.length > 0 && (
            <div>
              <h3 className="text-xs font-medium uppercase tracking-wide text-gray-400 mb-3">
                {t("security.compliance")}
              </h3>
              <ul className="space-y-2">
                {service.certifications.map((cert) => (
                  <li
                    key={cert.certification}
                    className="flex items-start gap-2 text-sm text-gray-600"
                  >
                    <span className="text-brand-green mt-0.5 flex-shrink-0">
                      &#10003;
                    </span>
                    {cert.certification}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </Container>
    </PageLayout>
  );
}
