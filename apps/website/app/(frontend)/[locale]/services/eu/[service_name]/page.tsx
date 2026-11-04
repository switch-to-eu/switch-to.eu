import Image from "next/image";
import { Check } from "lucide-react";
import { notFound } from "next/navigation";
import type { Metadata, ResolvingMetadata } from "next";

import { Link } from "@switch-to-eu/i18n/navigation";
import { RegionBadge } from "@switch-to-eu/ui/components/region-badge";
import { Container } from "@switch-to-eu/blocks/components/container";
import { Banner } from "@switch-to-eu/blocks/components/banner";
import { PageLayout } from "@switch-to-eu/blocks/components/page-layout";
import { SectionHeading } from "@switch-to-eu/blocks/components/section-heading";
import { ServiceSubNav } from "@/components/ui/ServiceSubNav";
import { TabsContent } from "@switch-to-eu/ui/components/tabs";
import { ServiceCta } from "@/components/ui/ServiceCta";
import { ServiceCard } from "@/components/ui/ServiceCard";
import { AffiliateDisclosure } from "@/components/ui/AffiliateDisclosure";
import { RecommendedPill } from "@/components/ui/RecommendedPill";
import { SuggestServiceCard } from "@/components/ui/SuggestServiceCard";
import { RichText } from "@/components/rich-text";

import { getTranslations, setRequestLocale } from "next-intl/server";
import { Locale } from "next-intl";

import {
  getServiceBySlug,
  getRelatedGuides,
  getSimilarServices,
  getCategorySlug,
  getCategoryId,
  getGuideSourceService,
  getScreenshotUrl,
  getOutboundUrl,
  hasPricingData,
  hasSecurityData,
  getAllEuServiceSlugs,
  getServicesReplacedBy,
} from "@/lib/services";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumbJsonLd } from "@/lib/structured-data";
import { generateServiceMetadata } from "@/lib/service-metadata";
import type { Service, Guide } from "@/lib/content/types";

const OVERVIEW_KEY = "overview";

export function generateStaticParams() {
  return getAllEuServiceSlugs();
}

export async function generateMetadata(
  {
    params,
  }: {
    params: Promise<{ locale: string; service_name: string }>;
  },
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { service_name, locale } = await params;
  setRequestLocale(locale as Locale);
  return generateServiceMetadata({ serviceName: service_name, locale, parent });
}

interface TabSpec {
  key: string;
  label: string;
}

// eslint-disable-next-line no-unused-vars
type Translator = (key: string, values?: Record<string, string>) => string;

// Free tiers are written per locale: "Free" (en), "Gratis" (nl), or a zero price
// such as "€0", "€0,00" or "$0/maand".
const FREE_PRICE = /^(free|gratis|[€$]\s?0(?:[.,]00)?(?:\/\S+)?)$/i;

function isFreePrice(price: string): boolean {
  return FREE_PRICE.test(price.trim());
}

function buildTabs(
  service: Service,
  guides: Guide[],
  t: Translator
): TabSpec[] {
  const tabs: TabSpec[] = [
    { key: OVERVIEW_KEY, label: t("tabs.overview") },
  ];

  if (hasPricingData(service)) {
    tabs.push({ key: "pricing", label: t("tabs.pricing") });
  }

  if (hasSecurityData(service)) {
    tabs.push({ key: "security", label: t("tabs.security") });
  }

  for (const guide of guides) {
    const sourceService = getGuideSourceService(guide);
    if (sourceService) {
      tabs.push({
        key: `vs-${sourceService.slug}`,
        label: `${service.name} vs ${sourceService.name}`,
      });
    }
  }

  return tabs;
}

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
    <div
      className={`grid grid-cols-3 gap-4 py-4 border-b border-gray-100 last:border-0${
        highlight === "eu" ? " bg-brand-green/[0.03]" : ""
      }`}
    >
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

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ locale: Locale; service_name: string }>;
}) {
  const { service_name, locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("services.detail");

  const service = await getServiceBySlug(service_name, locale);

  if (!service) {
    notFound();
  }

  const categorySlug = getCategorySlug(service.category);

  const screenshotUrl = getScreenshotUrl(service.screenshot);
  const relatedGuides = await getRelatedGuides(service.id, locale);

  const firstGuide = relatedGuides[0] ?? null;
  const firstGuideCategory = firstGuide
    ? getCategorySlug(firstGuide.category) || null
    : null;
  const firstSourceName = firstGuide
    ? (getGuideSourceService(firstGuide)?.name ?? null)
    : null;

  const categoryId = getCategoryId(service.category);
  const similarServices = await getSimilarServices(
    categoryId,
    service.id,
    locale
  );

  const tabs = buildTabs(service, relatedGuides, t);

  const basePath = `/services/eu/${service_name}`;

  // Pre-compute overview fields
  const hasPricing = hasPricingData(service);
  const hasSecurity = hasSecurityData(service);
  const freeTier = service.pricingTiers?.find((tier) =>
    isFreePrice(tier.price)
  );
  const cheapestPaid = service.pricingTiers?.find(
    (tier) => !isFreePrice(tier.price)
  );

  const gdprLabel =
    service.gdprCompliance === "compliant"
      ? t("gdprCompliant")
      : service.gdprCompliance === "partial"
        ? t("gdprPartial")
        : service.gdprCompliance === "non-compliant"
          ? t("gdprNonCompliant")
          : null;

  // Comparison data — fetch full source services + matching guides for any
  // vs-X tabs the relatedGuides expose. The depth:1 on relatedGuides already
  // gives us a populated source service, but we need the missingFeatures off
  // the guide itself which is on the guide doc.
  const filteredFeatures = service.features?.filter(
    (f) => !/free|gratis/i.test(f)
  );

  // `relatedGuides` is fetched with depth: 1, which already populates the
  // source service with the fields the comparison table renders (issues,
  // dataStorageLocations, etc.). Reuse that data instead of refetching.
  const comparisonGuides = relatedGuides.flatMap((guide) => {
    const source = getGuideSourceService(guide);
    return source ? [{ guide, nonEuService: source }] : [];
  });

  const replacedServices = getServicesReplacedBy(service.slug, locale);
  const tNav = await getTranslations("navigation");

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd(locale, [
          { name: tNav("home"), path: "" },
          { name: service.category.title, path: `services/${categorySlug}` },
          { name: service.name, path: `services/eu/${service_name}` },
        ])}
      />
      {/* Hero */}
      <Container noPaddingMobile>
        <Link
          href={`/services/${categorySlug}`}
          className="inline-flex items-center gap-1.5 text-brand-green/80 text-sm mb-3 px-4 sm:px-0 pt-2 no-underline hover:text-brand-green transition-colors"
        >
          {t("nonEu.redesign.heroBack", { category: service.category.shortTitle })}
        </Link>

        <Banner
          color="bg-white border-y md:border border-black/10"
          {...(!screenshotUrl && {
            className: "[&>div]:py-8 [&>div]:sm:py-10",
          })}
        >
          <div
            className={`grid gap-8 items-center ${
              screenshotUrl
                ? "grid-cols-1 md:grid-cols-2 md:gap-16"
                : "grid-cols-1 max-w-3xl"
            }`}
          >
            <div>
              <div className="flex items-start gap-3 mb-3">
                <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl text-brand-green">
                  {service.name}
                </h1>
                <div className="flex-shrink-0 mt-2">
                  <RegionBadge region={service.region} />
                </div>
              </div>

              <p className="text-[#1a1a1a] text-base sm:text-lg mb-4 max-w-2xl leading-relaxed">
                {service.description}
              </p>

              <div className="flex flex-wrap items-center gap-2 mb-4">
                {service.featured && (
                  <RecommendedPill label={t("recommendedAlternative.badge")} />
                )}
                <span className="inline-flex items-center gap-1.5 bg-black/5 text-[#1a1a1a] rounded-full px-3 py-1 text-sm">
                  {service.location}
                </span>
                {service.freeOption && (
                  <span className="inline-flex items-center gap-1.5 bg-black/5 text-[#1a1a1a] rounded-full px-3 py-1 text-sm">
                    {t("freePlanPill")}
                  </span>
                )}
                {service.startingPrice && (
                  <span className="inline-flex items-center gap-1.5 bg-black/5 text-[#1a1a1a] rounded-full px-3 py-1 text-sm">
                    {t("fromPrice", { price: service.startingPrice })}
                  </span>
                )}
              </div>

              {replacedServices.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 mb-4 text-sm">
                  <span className="text-[#1a1a1a]">{t("alternativeTo")}</span>
                  {replacedServices.map((replaced) => (
                    <Link
                      key={replaced.slug}
                      href={`/services/non-eu/${replaced.slug}`}
                      className="rounded-full border border-brand-green/40 px-3 py-1 font-semibold text-brand-green no-underline hover:bg-brand-green hover:text-white transition-colors focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-green"
                    >
                      {replaced.name}
                    </Link>
                  ))}
                </div>
              )}

              <div className="flex flex-row gap-2">
                <a
                  href={getOutboundUrl(service)}
                  target="_blank"
                  rel={service.affiliateUrl ? "sponsored noopener noreferrer" : "noopener noreferrer"}
                  className="inline-block px-4 sm:px-6 py-2 bg-brand-green text-white font-semibold rounded-full hover:opacity-90 transition-opacity text-xs sm:text-sm no-underline whitespace-nowrap"
                >
                  {t("tryService", { service: service.name })}
                </a>
                {firstGuide && firstGuideCategory && (
                  <Link
                    href={`/guides/${firstGuideCategory}/${firstGuide.slug}`}
                    className="inline-block px-4 sm:px-6 py-2 border-2 border-brand-green text-brand-green font-semibold rounded-full hover:bg-brand-green hover:text-white transition-colors text-xs sm:text-sm no-underline whitespace-nowrap"
                  >
                    {t("switchFrom", { service: firstSourceName ?? "" })}
                  </Link>
                )}
              </div>
              {service.affiliateUrl && (
                <AffiliateDisclosure className="mt-2 text-gray-700 hover:text-gray-900 decoration-gray-400" />
              )}
            </div>
            {screenshotUrl && (
              <div className="flex justify-center md:justify-end">
                <div className="relative w-full">
                  <Image
                    src={screenshotUrl}
                    alt={service.name}
                    width={0}
                    height={0}
                    sizes="(max-width: 768px) 100vw, 50vw"
                    priority
                    className="w-full h-auto object-cover rounded-2xl"
                  />
                </div>
              </div>
            )}
          </div>
        </Banner>
      </Container>

      <ServiceSubNav tabs={tabs} label={t("tabs.navLabel")}>
        <PageLayout className="pt-1 sm:pt-0 md:pt-0 pb-10 sm:pb-12 md:pb-14 md:gap-8">
          <TabsContent value={OVERVIEW_KEY} className="space-y-5 sm:space-y-7">
            {filteredFeatures && filteredFeatures.length > 0 && (
              <Container>
                <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm sm:text-base text-[#1a1a1a]">
                  {filteredFeatures.map((f) => (
                    <li key={f} className="inline-flex items-center gap-2">
                      <Check
                        className="h-4 w-4 shrink-0 text-brand-green"
                        strokeWidth={2.5}
                        aria-hidden="true"
                      />
                      {f}
                    </li>
                  ))}
                </ul>
              </Container>
            )}

            {service.content && (
              <Container>
                <div className="max-w-[38rem]">
                  <div className="mdx-content prose prose-sm sm:prose max-w-none">
                    <RichText data={service.content} />
                  </div>
                </div>
              </Container>
            )}

            {(hasPricing || hasSecurity) && (
              <Container>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 max-w-3xl">
                  {hasPricing && (
                    <Link
                      href={`${basePath}?tab=pricing`}
                      scroll={false}
                      className="group no-underline rounded-xl border border-brand-navy/10 bg-white p-4 sm:p-5 shadow-sm transition-all hover:border-brand-navy/30 hover:shadow-md"
                    >
                      <span className="block text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-brand-navy/80 mb-1">
                        {t("tabs.pricing")}
                      </span>
                      <span className="block text-base sm:text-lg font-semibold text-brand-navy group-hover:text-brand-green transition-colors">
                        {freeTier && cheapestPaid
                          ? `${t("snippetFree")} – ${cheapestPaid.price}`
                          : freeTier
                            ? t("snippetFree")
                            : service.startingPrice ||
                              t("snippetViewPlans")}
                      </span>
                    </Link>
                  )}

                  {hasSecurity && (
                    <Link
                      href={`${basePath}?tab=security`}
                      scroll={false}
                      className="group no-underline rounded-xl border border-brand-navy/10 bg-white p-4 sm:p-5 shadow-sm transition-all hover:border-brand-navy/30 hover:shadow-md"
                    >
                      <span className="block text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-brand-navy/80 mb-1">
                        {t("tabs.security")}
                      </span>
                      <span className="block text-base sm:text-lg font-semibold text-brand-navy group-hover:text-brand-green transition-colors">
                        {gdprLabel || t("snippetViewDetails")}
                      </span>
                    </Link>
                  )}
                </div>
              </Container>
            )}
          </TabsContent>

          {hasPricing && (
            <TabsContent value="pricing" className="space-y-5 sm:space-y-7">
              <Container>
                <div className="max-w-3xl">
                  <h2 className="font-heading text-3xl text-brand-green mb-3">
                    {service.name} {t("pricing.title")}
                  </h2>
                  <p className="text-foreground/70 text-base sm:text-lg leading-relaxed">
                    {service.freeOption
                      ? t("pricing.freeIntro", { service: service.name })
                      : t("pricing.paidIntro", { service: service.name })}
                    {service.startingPrice &&
                      ` ${t("pricing.startingAt", { price: service.startingPrice })}`}
                  </p>
                </div>
              </Container>

              {(service.pricingTiers ?? []).length > 0 && (
                <Container>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 max-w-5xl">
                    {(service.pricingTiers ?? []).map((tier, index) => (
                      <div
                        key={tier.name || index}
                        className="rounded-2xl p-5 sm:p-6 border border-brand-navy/10 bg-white shadow-sm"
                      >
                        <h3 className="font-heading text-lg mb-1 text-brand-green">
                          {tier.name}
                        </h3>
                        <div className="text-3xl font-bold text-brand-navy">
                          {tier.price}
                        </div>
                        <p className="text-xs text-brand-navy/40 mt-1 mb-5 min-h-[1rem]">
                          {tier.billingNote ?? " "}
                        </p>
                        {tier.features && tier.features.length > 0 && (
                          <ul className="space-y-2.5">
                            {tier.features.map((f) => (
                              <li
                                key={f}
                                className="flex items-start gap-2 text-sm leading-relaxed text-foreground/75"
                              >
                                <span className="mt-0.5 flex-shrink-0 text-brand-green">
                                  &#10003;
                                </span>
                                {f}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                </Container>
              )}
            </TabsContent>
          )}

          {hasSecurity && (
            <TabsContent value="security" className="space-y-5 sm:space-y-7">
              <Container>
                <div className="max-w-3xl">
                  <h2 className="font-heading text-3xl text-brand-green mb-3">
                    {service.name} {t("security.title")}
                  </h2>
                  <p className="text-foreground/70 text-base sm:text-lg leading-relaxed">
                    {t("security.intro", { service: service.name })}
                  </p>
                </div>
              </Container>

              <Container>
                <div className="max-w-3xl space-y-8">
                  <div className="flex flex-col gap-6">
                    {service.gdprCompliance && (
                      <div>
                        <h3 className="text-xs font-medium uppercase tracking-wide text-gray-400 mb-2">
                          GDPR
                        </h3>
                        <div
                          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-medium ${
                            service.gdprCompliance === "compliant"
                              ? "bg-brand-green/10 text-brand-green border-brand-green/20"
                              : service.gdprCompliance === "partial"
                                ? "bg-brand-yellow/20 text-[#1a1a1a] border-brand-yellow/40"
                                : "bg-gray-100 text-gray-600 border-gray-200"
                          }`}
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
                        {service.headquarters
                          ? ` (HQ: ${service.headquarters})`
                          : ""}
                        {service.parentCompany
                          ? ` / ${service.parentCompany}`
                          : ""}
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
                        {service.openSource
                          ? t("security.yes")
                          : t("security.no")}
                      </span>
                      {service.openSource && service.sourceCodeUrl && (
                        <a
                          href={service.sourceCodeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block text-brand-navy text-xs font-medium hover:underline mt-1"
                        >
                          {t("security.viewSource")}
                        </a>
                      )}
                    </div>
                  </div>

                  {service.gdprNotes && (
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {service.gdprNotes}
                    </p>
                  )}

                  {service.dataStorageLocations &&
                    service.dataStorageLocations.length > 0 && (
                      <div>
                        <h3 className="text-xs font-medium uppercase tracking-wide text-gray-400 mb-3">
                          {t("security.dataStorage")}
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {service.dataStorageLocations.map((loc) => (
                            <span
                              key={loc}
                              className="inline-flex items-center gap-1.5 bg-brand-sky/10 text-brand-green px-3 py-1.5 rounded-full text-sm"
                            >
                              <span className="text-brand-sky">&#9679;</span>
                              {loc}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                  {service.certifications &&
                    service.certifications.length > 0 && (
                      <div>
                        <h3 className="text-xs font-medium uppercase tracking-wide text-gray-400 mb-3">
                          {t("security.compliance")}
                        </h3>
                        <ul className="space-y-2">
                          {service.certifications.map((cert) => (
                            <li
                              key={cert}
                              className="flex items-start gap-2 text-sm text-gray-600"
                            >
                              <span className="text-brand-green mt-0.5 flex-shrink-0">
                                &#10003;
                              </span>
                              {cert}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                </div>
              </Container>
            </TabsContent>
          )}

          {comparisonGuides.map(({ guide, nonEuService }) => {
            const tabKey = `vs-${nonEuService.slug}`;
            return (
              <TabsContent
                key={tabKey}
                value={tabKey}
                className="space-y-5 sm:space-y-7"
              >
                <Container>
                  <div className="max-w-4xl">
                    <h2 className="font-heading text-3xl text-brand-green mb-3">
                      {service.name} vs {nonEuService.name}
                    </h2>
                    <p className="text-foreground/70 text-base sm:text-lg leading-relaxed">
                      {t("compare.intro", {
                        service: service.name,
                        other: nonEuService.name,
                      })}
                    </p>
                  </div>
                </Container>

                <Container>
                  <div className="max-w-4xl space-y-8">
                    <div className="bg-white rounded-2xl border border-brand-navy/10 shadow-sm overflow-hidden">
                      <div className="grid grid-cols-3 gap-4 px-6 py-4 bg-gray-50 border-b border-gray-100">
                        <div className="text-sm font-bold text-gray-400 uppercase">
                          {t("compare.feature")}
                        </div>
                        <div className="text-sm font-bold text-brand-green">
                          {service.name}
                        </div>
                        <div className="text-sm font-bold text-gray-700">
                          {nonEuService.name}
                        </div>
                      </div>

                      <div className="px-6">
                        <CompareRow
                          label={t("compare.basedIn")}
                          euValue={service.location}
                          nonEuValue={nonEuService.location}
                          highlight="eu"
                        />
                        <CompareRow
                          label={t("compare.freePlan")}
                          euValue={
                            service.freeOption
                              ? t("compare.yes")
                              : t("compare.no")
                          }
                          nonEuValue={
                            nonEuService.freeOption
                              ? t("compare.yes")
                              : t("compare.no")
                          }
                          highlight="neutral"
                        />
                        <CompareRow
                          label={t("compare.startingPrice")}
                          euValue={service.startingPrice || t("compare.free")}
                          nonEuValue={
                            nonEuService.startingPrice || t("compare.free")
                          }
                          highlight="neutral"
                        />
                        <CompareRow
                          label="GDPR"
                          euValue={
                            service.gdprCompliance === "compliant"
                              ? t("gdprCompliant")
                              : service.gdprCompliance || t("compare.unknown")
                          }
                          nonEuValue={
                            nonEuService.gdprCompliance === "compliant"
                              ? t("gdprCompliant")
                              : nonEuService.gdprCompliance === "partial"
                                ? t("gdprPartial")
                                : nonEuService.gdprCompliance ||
                                  t("compare.unknown")
                          }
                          highlight={
                            service.gdprCompliance === "compliant"
                              ? "eu"
                              : "neutral"
                          }
                        />
                        <CompareRow
                          label={t("compare.openSource")}
                          euValue={
                            service.openSource
                              ? t("compare.yes")
                              : t("compare.no")
                          }
                          nonEuValue={
                            nonEuService.openSource
                              ? t("compare.yes")
                              : t("compare.no")
                          }
                          highlight={
                            service.openSource && !nonEuService.openSource
                              ? "eu"
                              : "neutral"
                          }
                        />
                        <CompareRow
                          label={t("compare.dataStorage")}
                          euValue={
                            (service.dataStorageLocations ?? []).join(", ") || t("compare.notDisclosed")
                          }
                          nonEuValue={
                            (nonEuService.dataStorageLocations ?? []).join(", ") || t("compare.notDisclosed")
                          }
                          highlight="eu"
                        />
                      </div>
                    </div>

                    {nonEuService.issues && nonEuService.issues.length > 0 && (
                      <div>
                        <h3 className="font-heading text-lg text-brand-green mb-3">
                          {t("compare.knownConcerns", {
                            service: nonEuService.name,
                          })}
                        </h3>
                        <ul className="space-y-2">
                          {nonEuService.issues.map((issue) => (
                            <li
                              key={issue}
                              className="flex items-start gap-2 text-sm text-foreground/70 leading-relaxed"
                            >
                              <span className="text-brand-orange mt-0.5 flex-shrink-0">
                                &bull;
                              </span>
                              {issue}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {guide.missingFeatures &&
                      guide.missingFeatures.length > 0 && (
                        <div className="rounded-2xl bg-brand-yellow/5 p-5 sm:p-6 border border-brand-yellow/20">
                          <h3 className="font-heading text-lg text-brand-green mb-3">
                            {t("compare.worthKnowing")}
                          </h3>
                          <p className="text-sm text-foreground/70 mb-3">
                            {t("compare.missingFeatures", {
                              service: service.name,
                              other: nonEuService.name,
                            })}
                          </p>
                          <ul className="space-y-1.5">
                            {guide.missingFeatures.map((f) => (
                              <li
                                key={f}
                                className="flex items-start gap-2 text-sm text-foreground/70"
                              >
                                <span className="text-brand-orange mt-0.5 flex-shrink-0">
                                  &bull;
                                </span>
                                {f}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                  </div>
                </Container>
              </TabsContent>
            );
          })}
        </PageLayout>
      </ServiceSubNav>

      <ServiceCta
        serviceName={service.name}
        serviceUrl={getOutboundUrl(service)}
        affiliate={!!service.affiliateUrl}
        guideHref={
          firstGuide && firstGuideCategory
            ? `/guides/${firstGuideCategory}/${firstGuide.slug}`
            : null
        }
        sourceServiceName={firstSourceName}
      />

      {similarServices.length > 0 && (
        <Container noPaddingMobile className="sm:py-8 md:py-12">
          <SectionHeading>{t("similarServices")}</SectionHeading>
          <div className="grid gap-0 md:gap-5 auto-rows-fr grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {similarServices.map((s, index) => (
              <ServiceCard
                key={s.name}
                service={s}
                showCategory={false}
                colorIndex={index}
              />
            ))}
            <SuggestServiceCard colorIndex={similarServices.length} />
          </div>
        </Container>
      )}
    </>
  );
}
