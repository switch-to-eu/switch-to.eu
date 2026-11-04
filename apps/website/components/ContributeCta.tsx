"use client";

import { useTranslations } from "next-intl";
import { ServiceRequestModal } from "@/components/ServiceRequestModal";
import { Container } from "@switch-to-eu/blocks/components/container";
import { Banner } from "@switch-to-eu/blocks/components/banner";

export const ContributeCta = () => {
  const t = useTranslations("contribute");

  return (
    <section>
      <Container noPaddingMobile>
        <Banner
          color="bg-white border-y md:border border-black/10"
        >
          <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
            <div className="text-center md:text-left">
              <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl text-brand-green mb-8 sm:mb-10">
                {t("ctaTitle")}
              </h2>
              <p className="text-[#1a1a1a] text-base sm:text-lg mb-6 sm:mb-8 max-w-xl">
                {t("ctaDescription")}
              </p>
              <ServiceRequestModal
                triggerText={t("ctaButton")}
                variant="red"
              />
            </div>
          </div>
        </Banner>
      </Container>
    </section>
  );
};
