import {
  getServiceBySlug,
  getServicesByCategory,
  getServiceSlugs,
} from "@switch-to-eu/content/services/services";

import { getGuidesByTargetService } from "@switch-to-eu/content/services/guides";
import { notFound } from "next/navigation";
import { RegionBadge } from "@switch-to-eu/ui/components/region-badge";
import { Link } from "@switch-to-eu/i18n/navigation";
import { parseMarkdown } from "@switch-to-eu/content/markdown";
import { Metadata } from "next";
import { ServiceCard } from "@/components/ui/ServiceCard";

import { ContributeCta } from "@/components/ContributeCta";
import { RecommendedAlternative } from "@/components/ui/RecommendedAlternative";
import { Container } from "@switch-to-eu/blocks/components/container";
import { PageLayout } from "@switch-to-eu/blocks/components/page-layout";

import { getTranslations } from "next-intl/server";
import { Locale } from "next-intl";
import { Banner } from "@switch-to-eu/blocks/components/banner";
import { DecorativeShape } from "@switch-to-eu/blocks/components/decorative-shape";
import { SectionHeading } from "@switch-to-eu/blocks/components/section-heading";

export function generateStaticParams() {
  const serviceNames = getServiceSlugs("eu");

  return serviceNames.map((service_name) => ({
    service_name,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; service_name: string }>;
}): Promise<Metadata> {
  const { service_name, locale } = await params;
  const slug = service_name.replace(/-/g, " ");
  const serviceData = getServiceBySlug(slug, locale as Locale);

  if (!serviceData) {
    return {
      title: "Service Not Found",
    };
  }

  const { frontmatter } = serviceData;

  return {
    title: `${frontmatter.name} | EU Service | switch-to.eu`,
    description: frontmatter.description,
    keywords: [
      frontmatter.name,
      frontmatter.category,
      "EU service",
      "privacy-focused",
      "GDPR compliant",
      ...(frontmatter.tags || []),
    ],
    alternates: {
      canonical: `https://switch-to.eu/${locale}/services/eu/${service_name}`,
      languages: {
        en: `https://switch-to.eu/en/services/eu/${service_name}`,
        nl: `https://switch-to.eu/nl/services/eu/${service_name}`,
      },
    },
  };
}

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ locale: Locale; service_name: string }>;
}) {
  const { service_name, locale } = await params;
  const t = await getTranslations("services.detail");
  const servicesT = await getTranslations("services");

  const slug = service_name.replace(/-/g, " ");
  const serviceData = getServiceBySlug(slug, locale);

  if (!serviceData) {
    notFound();
  }

  const { frontmatter, content } = serviceData;

  const relatedGuides = getGuidesByTargetService(frontmatter.name, locale);

  const similarServices = getServicesByCategory(
    frontmatter.category,
    "eu",
    locale
  )
    .filter((service) => service.name !== frontmatter.name)
    .sort((a, b) => {
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      return 0;
    })
    .slice(0, 4);

  const recommendedService = !frontmatter.featured
    ? getServicesByCategory(frontmatter.category, "eu", locale).find(
        (s) => s.featured && s.name !== frontmatter.name
      )
    : null;

  const htmlContent = content ? parseMarkdown(content) : "";
  const categoryFormatted =
    frontmatter.category.charAt(0).toUpperCase() +
    frontmatter.category.slice(1);

  return (
    <PageLayout>
      {/* Hero */}
      <section>
        <Container noPaddingMobile>
          {/* Breadcrumb */}
          <Link
            href={`/services/${frontmatter.category}`}
            className="inline-flex items-center gap-1.5 text-brand-green/60 text-sm mb-3 px-4 sm:px-0 pt-2 no-underline hover:text-brand-green transition-colors"
          >
            <span>&larr;</span>
            <span>{categoryFormatted}</span>
          </Link>

          <Banner
            color="bg-brand-navy"
            shapes={[
              { shape: "spark", className: "-top-8 -right-8 w-36 h-36 sm:w-48 sm:h-48" },
              { shape: "blob", className: "bottom-4 right-20 hidden sm:block w-28 h-28", opacity: 0.1, duration: "9s", delay: "-3s" },
              { shape: "diamond-4", className: "top-1/3 -left-4 hidden md:block w-16 h-16", opacity: 0.1, duration: "7s", delay: "-5s" },
            ]}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-center">
              {/* Left: Info */}
              <div>
                <div className="flex items-start gap-3 mb-3">
                  <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl uppercase text-brand-yellow">
                    {frontmatter.name}
                  </h1>
                  <div className="flex-shrink-0 mt-2">
                    <RegionBadge
                      region={
                        (frontmatter.region as
                          | "eu"
                          | "non-eu"
                          | "eu-friendly") || "eu"
                      }
                    />
                  </div>
                </div>

                <p className="text-brand-sky text-base sm:text-lg mb-6 max-w-2xl leading-relaxed">
                  {frontmatter.description}
                </p>

                {/* Meta info as pills */}
                <div className="flex flex-wrap gap-3 mb-6">
                  <span className="inline-flex items-center gap-1.5 bg-white/10 text-white/90 rounded-full px-4 py-1.5 text-sm">
                    <span className="text-brand-yellow">&#9679;</span>
                    {frontmatter.location}
                  </span>
                  <span className="inline-flex items-center gap-1.5 bg-white/10 text-white/90 rounded-full px-4 py-1.5 text-sm">
                    <span className="text-brand-yellow">&#9679;</span>
                    {t("freeOption")}:{" "}
                    {frontmatter.freeOption
                      ? t("freeOptionYes")
                      : t("freeOptionNo")}
                  </span>
                  {frontmatter.startingPrice && (
                    <span className="inline-flex items-center gap-1.5 bg-white/10 text-white/90 rounded-full px-4 py-1.5 text-sm">
                      <span className="text-brand-yellow">&#9679;</span>
                      {t("startingPrice")}: {frontmatter.startingPrice}
                    </span>
                  )}
                </div>

                {/* CTAs */}
                <div className="flex flex-wrap gap-3">
                  <a
                    href={frontmatter.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block px-8 py-3 bg-brand-yellow text-brand-navy font-semibold rounded-full hover:opacity-90 transition-opacity text-sm sm:text-base no-underline"
                  >
                    {t("visitWebsite")} &rarr;
                  </a>
                  {relatedGuides.length > 0 && (
                    <a
                      href="#guides"
                      className="inline-block px-8 py-3 border-2 border-brand-yellow text-brand-yellow font-semibold rounded-full hover:bg-brand-yellow hover:text-brand-navy transition-colors text-sm sm:text-base no-underline"
                    >
                      {t("migrationGuides")}
                    </a>
                  )}
                </div>
              </div>

              {/* Right: Screenshot */}
              {frontmatter.screenshot && (
                <div className="flex justify-center md:justify-end">
                  <div className="relative w-full">
                    <img
                      src={frontmatter.screenshot}
                      alt={frontmatter.name}
                      className="w-full h-auto object-cover rounded-2xl"
                    />
                    {frontmatter.featured && (
                      <div className="absolute -top-6 -right-6 sm:-top-8 sm:-right-8 flex items-center justify-center">
                        <svg
                          viewBox="0 0 362.94 366"
                          className="w-28 h-28 sm:w-32 sm:h-32 text-brand-green drop-shadow-lg"
                          aria-hidden="true"
                        >
                          <path d="M166.52,360.05c-19.36-8.03-41.21-5.87-62.05-8.18-20.83-2.31-43.84-11.92-49.96-31.97-5.04-16.53,3.15-34.97-2.06-51.44-7.81-24.66-41.25-33.37-50.23-57.63-5.76-15.55.46-33.1,9.58-46.95,9.12-13.85,21.14-25.78,28.87-40.45,9.68-18.35,11.97-39.62,18.8-59.21,6.84-19.59,20.83-39.25,41.35-42.33,16.4-2.46,32.59,6.32,49.17,5.87,18.39-.5,34.31-12.06,50.84-20.14,16.53-8.08,38.34-12.16,51.86.32,10.92,10.08,12.24,27.37,22.51,38.11,10.86,11.35,28.27,12.28,43.85,14.26,15.58,1.98,33.43,7.89,38.23,22.84,3.89,12.1-2.62,24.95-9.81,35.44-7.19,10.48-15.61,21.27-16.03,33.97-.48,14.6,9.66,27.06,18.34,38.81,8.68,11.75,16.7,26.67,11.52,40.33-4.55,12-17.57,18.24-29.7,22.43-12.13,4.19-25.41,8.09-33.15,18.33-7.32,9.68-7.87,22.65-10.36,34.53-2.49,11.88-9.05,24.89-20.98,27.1-9.14,1.69-18.26-3.67-27.54-3.14-9.6.55-17.69,7.25-24.25,14.28-6.56,7.04-12.63,14.95-21.2,19.33-8.56,4.38-17.86-2.34-27.61-4.49" fill="currentColor"/>
                        </svg>
                        <span className="absolute text-white text-[9px] sm:text-[11px] font-bold uppercase leading-tight text-center px-2">
                          Recommended<br/>by Switch-to.eu
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </Banner>
        </Container>
      </section>

      {/* Features tags */}
      {frontmatter.features && frontmatter.features.length > 0 && (
        <section>
          <Container>
            <div className="flex flex-wrap gap-2.5">
              {frontmatter.features.map((feature) => (
                <span
                  key={feature}
                  className="inline-block bg-brand-sky/20 text-brand-green px-4 py-2 rounded-full text-sm font-medium"
                >
                  {feature}
                </span>
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* Main content area */}
      <section>
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
            {/* Main content */}
            <div className="lg:col-span-2">
              {htmlContent && (
                <div className="mdx-content prose prose-sm sm:prose max-w-none">
                  <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div
                id="guides"
                className="hidden lg:block sticky top-24 bg-brand-green rounded-3xl overflow-hidden"
              >
                <div className="relative px-6 py-8">
                  <DecorativeShape
                    shape="coral"
                    className="-top-4 -right-4 w-24 h-24"
                    duration="8s"
                  />
                  <DecorativeShape
                    shape="flower"
                    className="bottom-6 -left-4 w-20 h-20"
                    opacity={0.1}
                    duration="7s"
                    delay="-2s"
                  />

                  <div className="relative z-10">
                    <h2 className="font-heading text-xl uppercase text-brand-yellow mb-4">
                      {t("migrationGuides")}
                    </h2>

                    {relatedGuides.length > 0 ? (
                      <>
                        <p className="text-brand-sky/80 mb-4 text-sm">
                          {t("migrateHelp")} <b className="text-white">{frontmatter.name}</b>
                        </p>
                        <div className="space-y-3">
                          {relatedGuides.map((guide) => (
                            <Link
                              key={`${guide.category}-${guide.slug}`}
                              href={`/guides/${guide.category}/${guide.slug}`}
                              className="block rounded-2xl bg-white/10 p-3 no-underline transition-colors hover:bg-white/20 border border-white/5"
                            >
                              <h3 className="text-base mb-1 text-white font-semibold">
                                {guide.frontmatter.sourceService &&
                                  `${guide.frontmatter.sourceService} → ${frontmatter.name}`}
                                {!guide.frontmatter.sourceService &&
                                  guide.frontmatter.title}
                              </h3>
                              <p className="text-xs text-brand-sky/70">
                                {guide.frontmatter.description}
                              </p>
                            </Link>
                          ))}
                        </div>
                        <div className="mt-6 pt-4 border-t border-white/10">
                          <p className="text-sm text-brand-sky/60 mb-3 text-center">
                            {t("anotherServiceHelp")}
                          </p>
                          <div className="flex justify-center">
                            <Link
                              href="/contribute"
                              className="inline-block px-5 py-2 bg-brand-yellow text-brand-navy rounded-full text-sm font-semibold no-underline hover:opacity-90 transition-opacity"
                            >
                              {t("writeAnotherGuide")}
                            </Link>
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <p className="text-brand-sky/80 mb-3 text-sm">
                          {t("noGuides")} <b className="text-white">{frontmatter.name}</b>.
                        </p>
                        <p className="text-brand-sky/60 mb-6 text-sm">
                          {t("helpOthers")}
                        </p>
                        <div className="flex justify-center">
                          <Link
                            href="/contribute"
                            className="inline-block px-5 py-2 bg-brand-yellow text-brand-navy rounded-full text-sm font-semibold no-underline hover:opacity-90 transition-opacity"
                          >
                            {t("writeMigrationGuide")}
                          </Link>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Mobile migration guides */}
      <section className="lg:hidden">
        <Container noPaddingMobile>
          <div className="bg-brand-green md:rounded-3xl relative overflow-hidden">
            <div className="relative px-6 py-8">
              <DecorativeShape
                shape="coral"
                className="-top-4 -right-4 w-20 h-20"
              />
              <div className="relative z-10">
                <h2 className="font-heading text-2xl uppercase text-brand-yellow mb-4">
                  {t("migrationGuides")}
                </h2>
                {relatedGuides.length > 0 ? (
                  <>
                    <p className="text-brand-sky/80 mb-4 text-sm">
                      {t("migrateHelp")} <b className="text-white">{frontmatter.name}</b>
                    </p>
                    <div className="space-y-3">
                      {relatedGuides.map((guide) => (
                        <Link
                          key={`${guide.category}-${guide.slug}`}
                          href={`/guides/${guide.category}/${guide.slug}`}
                          className="block rounded-2xl bg-white/10 p-4 no-underline transition-colors hover:bg-white/20 border border-white/5"
                        >
                          <h3 className="text-lg mb-1 text-white font-semibold">
                            {guide.frontmatter.sourceService &&
                              `${guide.frontmatter.sourceService} → ${frontmatter.name}`}
                            {!guide.frontmatter.sourceService &&
                              guide.frontmatter.title}
                          </h3>
                          <p className="text-xs text-brand-sky/70">
                            {guide.frontmatter.description}
                          </p>
                        </Link>
                      ))}
                    </div>
                    <div className="mt-6 pt-4 border-t border-white/10">
                      <div className="flex justify-center">
                        <Link
                          href="/contribute"
                          className="inline-block px-6 py-2.5 bg-brand-yellow text-brand-navy rounded-full text-sm font-semibold no-underline hover:opacity-90 transition-opacity"
                        >
                          {t("writeAnotherGuide")}
                        </Link>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <p className="text-brand-sky/80 mb-3 text-sm">
                      {t("noGuides")} <b className="text-white">{frontmatter.name}</b>.
                    </p>
                    <p className="text-brand-sky/60 mb-6 text-sm">
                      {t("helpOthers")}
                    </p>
                    <div className="flex justify-center">
                      <Link
                        href="/contribute"
                        className="inline-block px-6 py-2.5 bg-brand-yellow text-brand-navy rounded-full text-sm font-semibold no-underline hover:opacity-90 transition-opacity"
                      >
                        {t("writeMigrationGuide")}
                      </Link>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Similar Services */}
      {similarServices.length > 0 && (
        <section>
          <Container noPaddingMobile>
            <SectionHeading>
              {t("similarServices")}
            </SectionHeading>
            <div className="grid gap-0 md:gap-5 auto-rows-fr grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {similarServices.map((service, index) => (
                <ServiceCard
                  key={service.name}
                  service={service}
                  showCategory={false}
                  colorIndex={index}
                />
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* CTA Section */}
      <ContributeCta />
    </PageLayout>
  );
}
