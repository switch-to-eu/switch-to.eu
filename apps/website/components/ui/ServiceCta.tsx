"use client";

import { Link } from "@switch-to-eu/i18n/navigation";
import { useTranslations } from "next-intl";
import { Container } from "@switch-to-eu/blocks/components/container";
import { Banner } from "@switch-to-eu/blocks/components/banner";
import { AffiliateDisclosure } from "@/components/ui/AffiliateDisclosure";

export function ServiceCta({
  serviceName,
  serviceUrl,
  guideHref,
  sourceServiceName,
}: {
  serviceName: string;
  serviceUrl: string;
  guideHref?: string | null;
  sourceServiceName?: string | null;
}) {
  const t = useTranslations("services.detail");

  return (
    <section>
      <Container noPaddingMobile>
        <Banner
          color="bg-white border-y md:border border-black/10"
          shapes={[
            {
              shape: "sunburst",
              className: "-top-8 -right-8 w-36 h-36",
              opacity: 0.3, color: "text-brand-yellow" },
            {
              shape: "blob",
              className: "-bottom-10 -left-10 w-40 h-40",
              delay: "-3s", opacity: 0.3, color: "text-brand-sky" },
          ]}
          contentClassName="text-center max-w-2xl mx-auto"
        >
          <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl uppercase text-brand-green mb-4">
            {t("cta.title", { service: serviceName })}
          </h2>
          <p className="text-[#1a1a1a] text-base sm:text-lg mb-8">
            {t("cta.description")}
          </p>
          <div className="flex flex-row gap-2 sm:gap-3 justify-center">
            <a
              href={serviceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-4 sm:px-8 py-2 sm:py-3 bg-brand-green text-white font-semibold rounded-full hover:opacity-90 transition-opacity text-xs sm:text-sm no-underline whitespace-nowrap"
            >
              {t("tryService", { service: serviceName })} &rarr;
            </a>
            {guideHref && sourceServiceName && (
              <Link
                href={guideHref}
                className="inline-block px-4 sm:px-8 py-2 sm:py-3 border-2 border-brand-green text-brand-green font-semibold rounded-full hover:bg-brand-green hover:text-white transition-colors text-xs sm:text-sm no-underline whitespace-nowrap"
              >
                {t("switchFrom", { service: sourceServiceName })}
              </Link>
            )}
          </div>
          <AffiliateDisclosure className="mt-4 text-gray-700 hover:text-gray-900 decoration-gray-400" />
        </Banner>
      </Container>
    </section>
  );
}
