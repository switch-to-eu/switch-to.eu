import { getPayload } from "@/lib/payload";
import { notFound } from "next/navigation";
import { Metadata } from "next";

import { Container } from "@switch-to-eu/blocks/components/container";
import { PageLayout } from "@switch-to-eu/blocks/components/page-layout";

import { getTranslations } from "next-intl/server";
import type { Locale } from "next-intl";
import type { Locale as AppLocale } from "@switch-to-eu/i18n/routing";
import { generateLanguageAlternates } from "@switch-to-eu/i18n/utils";
import type { Service, Guide } from "@/payload-types";
import { getServiceBySlug } from "@/lib/services";

export const dynamicParams = false;

export async function generateStaticParams() {
  const payload = await getPayload();
  const { docs: guides } = await payload.find({
    collection: "guides",
    depth: 1,
    limit: 100,
  });
  const locales = ["en", "nl"];

  return locales.flatMap((locale) =>
    guides
      .filter(
        (g) =>
          typeof g.targetService === "object" &&
          typeof g.sourceService === "object" &&
          g.targetService.region !== "non-eu"
      )
      .map((g) => ({
        locale,
        service_name: (g.targetService as Service).slug,
        comparison: `vs-${(g.sourceService as Service).slug}`,
      }))
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; service_name: string; comparison: string }>;
}): Promise<Metadata> {
  const { service_name, comparison, locale } = await params;
  const slug = comparison.replace(/^vs-/, "");
  if (!comparison.startsWith("vs-")) notFound();

  const payload = await getPayload();
  const [euService, nonEuDocs] = await Promise.all([
    getServiceBySlug(service_name, locale),
    payload.find({
      collection: "services",
      where: { slug: { equals: slug } },
      locale: locale as "en" | "nl",
      limit: 1,
    }),
  ]);

  const nonEuService = nonEuDocs.docs[0] as Service | undefined;

  if (!euService || !nonEuService) return { title: "Not Found" };

  const title = `${euService.name} vs ${nonEuService.name} | switch-to.eu`;
  const description = `Compare ${euService.name} and ${nonEuService.name}. See how the EU alternative stacks up on privacy, pricing, and features.`;

  return {
    title,
    description,
    alternates: generateLanguageAlternates(`services/eu/${service_name}/vs-${slug}`, locale as AppLocale),
    openGraph: {
      title,
      description,
    },
  };
}

// Comparison row component
function CompareRow({
  label,
  euValue,
  nonEuValue,
  highlight,
}: {
  label: string;
  euValue: string;
  nonEuValue: string;
  highlight?: "eu" | "non-eu" | "neutral";
}) {
  return (
    <div className={`grid grid-cols-3 gap-4 py-4 border-b border-gray-100 last:border-0${highlight === "eu" ? " bg-brand-green/[0.03]" : ""}`}>
      <div className="text-sm font-medium text-gray-500">{label}</div>
      <div
        className={`text-sm ${
          highlight === "non-eu"
            ? "text-gray-500"
            : highlight === "eu"
              ? "text-brand-green font-medium"
              : "text-gray-700"
        }`}
      >
        {euValue}
      </div>
      <div
        className={`text-sm ${
          highlight === "eu"
            ? "text-gray-500"
            : highlight === "non-eu"
              ? "text-brand-green font-medium"
              : "text-gray-700"
        }`}
      >
        {nonEuValue}
      </div>
    </div>
  );
}

export default async function ComparisonPage({
  params,
}: {
  params: Promise<{ locale: Locale; service_name: string; comparison: string }>;
}) {
  const { service_name, comparison, locale } = await params;
  const slug = comparison.replace(/^vs-/, "");
  if (!comparison.startsWith("vs-")) notFound();
  const t = await getTranslations("services.detail");

  const payload = await getPayload();

  // Fetch both services in parallel
  const [euService, nonEuResult] = await Promise.all([
    getServiceBySlug(service_name, locale),
    payload.find({
      collection: "services",
      where: { slug: { equals: slug } },
      locale: locale as "en" | "nl",
      depth: 1,
      limit: 1,
    }),
  ]);

  const nonEuService = nonEuResult.docs[0] as Service | undefined;

  if (!euService || !nonEuService) {
    notFound();
  }

  // Find the migration guide between these two
  const { docs: guides } = (await payload.find({
    collection: "guides",
    where: {
      targetService: { equals: euService.id },
      sourceService: { equals: nonEuService.id },
    },
    locale: locale as "en" | "nl",
    depth: 1,
    limit: 1,
  })) as { docs: Guide[] };

  const guide = guides[0];

  return (
    <PageLayout>
      <Container>
        {/* Page header */}
        <div className="max-w-4xl pb-8">
          <h2 className="font-heading text-3xl sm:text-4xl uppercase text-brand-green mb-3">
            {euService.name} vs {nonEuService.name}
          </h2>
          <p className="text-gray-600 text-base sm:text-lg leading-relaxed">
            {t("compare.intro", { service: euService.name, other: nonEuService.name })}
          </p>
        </div>

        {/* Comparison table */}
        <div className="max-w-4xl pb-12">
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            {/* Table header */}
            <div className="grid grid-cols-3 gap-4 px-6 py-4 bg-gray-50 border-b border-gray-100">
              <div className="text-sm font-bold text-gray-400 uppercase">
                {t("compare.feature")}
              </div>
              <div className="text-sm font-bold text-brand-green">
                {euService.name}
              </div>
              <div className="text-sm font-bold text-gray-700">
                {nonEuService.name}
              </div>
            </div>

            <div className="px-6">
              <CompareRow
                label={t("compare.basedIn")}
                euValue={euService.location}
                nonEuValue={nonEuService.location}
                highlight="eu"
              />
              <CompareRow
                label={t("compare.freePlan")}
                euValue={euService.freeOption ? t("compare.yes") : t("compare.no")}
                nonEuValue={nonEuService.freeOption ? t("compare.yes") : t("compare.no")}
                highlight="neutral"
              />
              <CompareRow
                label={t("compare.startingPrice")}
                euValue={euService.startingPrice || t("compare.free")}
                nonEuValue={nonEuService.startingPrice || t("compare.free")}
                highlight="neutral"
              />
              <CompareRow
                label="GDPR"
                euValue={
                  euService.gdprCompliance === "compliant"
                    ? t("gdprCompliant")
                    : euService.gdprCompliance || t("compare.unknown")
                }
                nonEuValue={
                  nonEuService.gdprCompliance === "compliant"
                    ? t("gdprCompliant")
                    : nonEuService.gdprCompliance === "partial"
                      ? t("gdprPartial")
                      : nonEuService.gdprCompliance || t("compare.unknown")
                }
                highlight={
                  euService.gdprCompliance === "compliant" ? "eu" : "neutral"
                }
              />
              <CompareRow
                label={t("compare.openSource")}
                euValue={euService.openSource ? t("compare.yes") : t("compare.no")}
                nonEuValue={nonEuService.openSource ? t("compare.yes") : t("compare.no")}
                highlight={
                  euService.openSource && !nonEuService.openSource
                    ? "eu"
                    : "neutral"
                }
              />
              <CompareRow
                label={t("compare.dataStorage")}
                euValue={
                  euService.dataStorageLocations
                    ?.map((l) => l.location)
                    .join(", ") || t("compare.notDisclosed")
                }
                nonEuValue={
                  nonEuService.dataStorageLocations
                    ?.map((l) => l.location)
                    .join(", ") || t("compare.notDisclosed")
                }
                highlight="eu"
              />
            </div>
          </div>

          {/* Known concerns about non-EU service */}
          {nonEuService.issues && nonEuService.issues.length > 0 && (
            <div className="mt-8">
              <h3 className="font-heading text-lg uppercase text-brand-green mb-3">
                {t("compare.knownConcerns", { service: nonEuService.name })}
              </h3>
              <ul className="space-y-2">
                {nonEuService.issues.map((issue) => (
                  <li
                    key={issue.issue}
                    className="flex items-start gap-2 text-sm text-gray-600 leading-relaxed"
                  >
                    <span className="text-brand-orange mt-0.5 flex-shrink-0">
                      &bull;
                    </span>
                    {issue.issue}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Missing features */}
          {guide?.missingFeatures && guide.missingFeatures.length > 0 && (
            <div className="mt-8 bg-brand-yellow/5 rounded-2xl p-6 border border-brand-yellow/20">
              <h3 className="font-heading text-lg uppercase text-brand-green mb-3">
                {t("compare.worthKnowing")}
              </h3>
              <p className="text-sm text-gray-600 mb-3">
                {t("compare.missingFeatures", { service: euService.name, other: nonEuService.name })}
              </p>
              <ul className="space-y-1.5">
                {guide.missingFeatures.map((f) => (
                  <li
                    key={f.feature}
                    className="flex items-start gap-2 text-sm text-gray-600"
                  >
                    <span className="text-brand-orange mt-0.5 flex-shrink-0">
                      &bull;
                    </span>
                    {f.feature}
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
