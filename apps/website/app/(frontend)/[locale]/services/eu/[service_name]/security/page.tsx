import { notFound } from "next/navigation";
import { Metadata } from "next";

import { Container } from "@switch-to-eu/blocks/components/container";
import { PageLayout } from "@switch-to-eu/blocks/components/page-layout";

import { getTranslations } from "next-intl/server";
import type { Locale } from "next-intl";

import {
  getAllEuServiceSlugs,
  getServiceBySlug,
  getGdprLabel,
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

  const gdprLabel = getGdprLabel(service.gdprCompliance);

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
            How {service.name} handles your data, where it's stored, and what
            certifications back their claims.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl pb-12">
          {/* GDPR Compliance */}
          {service.gdprCompliance && (
            <div className="bg-white rounded-2xl p-6 border border-gray-100">
              <h3 className="font-heading text-lg uppercase text-brand-green mb-4">
                GDPR {t("security.compliance")}
              </h3>
              <div
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium mb-4 ${gdprColor}`}
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
              {service.gdprNotes && (
                <p className="text-gray-600 text-sm leading-relaxed">
                  {service.gdprNotes}
                </p>
              )}
            </div>
          )}

          {/* Data Storage */}
          {service.dataStorageLocations &&
            service.dataStorageLocations.length > 0 && (
              <div className="bg-white rounded-2xl p-6 border border-gray-100">
                <h3 className="font-heading text-lg uppercase text-brand-green mb-4">
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
            <div className="bg-white rounded-2xl p-6 border border-gray-100">
              <h3 className="font-heading text-lg uppercase text-brand-green mb-4">
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

          {/* Open Source */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100">
            <h3 className="font-heading text-lg uppercase text-brand-green mb-4">
              {t("security.openSource")}
            </h3>
            <div className="flex items-center gap-3 mb-3">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${
                  service.openSource
                    ? "bg-brand-green/10 text-brand-green"
                    : "bg-gray-100 text-gray-500"
                }`}
              >
                {service.openSource ? t("security.yes") : t("security.no")}
              </span>
            </div>
            {service.openSource && service.sourceCodeUrl && (
              <a
                href={service.sourceCodeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-navy text-sm font-medium hover:underline"
              >
                {t("security.viewSource")} &rarr;
              </a>
            )}
          </div>

          {/* Jurisdiction */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100">
            <h3 className="font-heading text-lg uppercase text-brand-green mb-4">
              {t("security.jurisdiction")}
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              {service.name} is based in {service.location}
              {service.headquarters
                ? `, headquartered in ${service.headquarters}`
                : ""}
              .
              {service.parentCompany &&
                ` Parent company: ${service.parentCompany}.`}
            </p>
          </div>

        </div>

        {service.privacyPolicyUrl && (
          <div className="max-w-5xl pb-12">
            <a
              href={service.privacyPolicyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-brand-navy text-sm font-medium hover:underline"
            >
              {t("security.viewPolicy")} &rarr;
            </a>
          </div>
        )}
      </Container>
    </PageLayout>
  );
}
