"use client";

import { useTranslations } from "next-intl";
import { ServiceRequestModal } from "@/components/ServiceRequestModal";
import { Container } from "@switch-to-eu/blocks/components/container";
import { Banner } from "@switch-to-eu/blocks/components/banner";
import { DecorativeShape } from "@switch-to-eu/blocks/components/decorative-shape";

export const ContributeCta = () => {
  const t = useTranslations("contribute");

  return (
    <section>
      <Container noPaddingMobile>
        <Banner
          color="bg-white border-y md:border border-black/10"
          shapes={[
            { shape: "tulip", className: "-top-6 -right-6 w-36 h-36 sm:w-48 sm:h-48", opacity: 0.3, color: "text-brand-yellow" },
            { shape: "pebble", className: "-bottom-10 -left-10 w-40 h-40 sm:w-52 sm:h-52", opacity: 0.3, delay: "-3s", color: "text-brand-sky" },
            { shape: "clover", className: "top-1/3 left-1/4 w-24 h-24 sm:w-32 sm:h-32", opacity: 0.3, delay: "-5s", color: "text-brand-pink" },
          ]}
        >
          <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
            <div className="w-48 h-48 sm:w-64 sm:h-64 relative flex-shrink-0">
              <DecorativeShape
          color="text-brand-yellow"
                shape="wide-heart"
                className="inset-0"
                opacity={0.3}
                duration="7s"
              />
              <DecorativeShape
          color="text-brand-sky"
                shape="clover"
                className="inset-8"
                opacity={0.3}
                duration="6s"
                delay="-2s"
              />
            </div>
            <div className="text-center md:text-left">
              <h2 className="font-heading text-4xl sm:text-5xl md:text-6xl uppercase text-brand-green mb-8 sm:mb-10">
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
