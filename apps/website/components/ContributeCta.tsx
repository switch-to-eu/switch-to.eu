"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { ServiceRequestModal } from "@/components/ServiceRequestModal";

export const ContributeCta = () => {
  const t = useTranslations("contribute");

  return (
    <section>
      <div className="container max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
        <div className="bg-brand-green rounded-3xl">
          <div className="relative px-6 sm:px-10 md:px-16 py-12 sm:py-16 md:py-20 overflow-hidden">
            {/* Decorative shapes — same scale as Hero */}
            <div className="absolute -top-6 -right-6 w-36 h-36 sm:w-48 sm:h-48 opacity-15 pointer-events-none">
              <Image
                src="/images/shapes/tulip.svg"
                alt=""
                fill
                className="object-contain select-none animate-shape-float"
                style={{ filter: "brightness(0) invert(1)" }}
                aria-hidden="true"
                unoptimized
              />
            </div>
            <div className="absolute -bottom-10 -left-10 w-40 h-40 sm:w-52 sm:h-52 opacity-10 pointer-events-none">
              <Image
                src="/images/shapes/pebble.svg"
                alt=""
                fill
                className="object-contain select-none animate-shape-float"
                style={{
                  filter: "brightness(0) invert(1)",
                  animationDelay: "-3s",
                }}
                aria-hidden="true"
                unoptimized
              />
            </div>
            <div className="absolute top-1/3 left-1/4 w-24 h-24 sm:w-32 sm:h-32 opacity-10 pointer-events-none">
              <Image
                src="/images/shapes/clover.svg"
                alt=""
                fill
                className="object-contain select-none animate-shape-float"
                style={{
                  filter: "brightness(0) invert(1)",
                  animationDelay: "-5s",
                }}
                aria-hidden="true"
                unoptimized
              />
            </div>

            {/* Content */}
            <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 md:gap-12">
              <div className="w-48 h-48 sm:w-64 sm:h-64 relative flex-shrink-0">
                <div className="absolute inset-0">
                  <Image
                    src="/images/shapes/wide-heart.svg"
                    alt=""
                    fill
                    className="object-contain select-none animate-shape-float"
                    style={{ filter: "brightness(0) invert(1)", opacity: 0.3, animationDuration: "7s" }}
                    aria-hidden="true"
                    unoptimized
                  />
                </div>
                <div className="absolute inset-8">
                  <Image
                    src="/images/shapes/clover.svg"
                    alt=""
                    fill
                    className="object-contain select-none animate-shape-float"
                    style={{ filter: "brightness(0) invert(1)", opacity: 0.5, animationDuration: "6s", animationDelay: "-2s" }}
                    aria-hidden="true"
                    unoptimized
                  />
                </div>
              </div>
              <div className="text-center md:text-left">
                <h2 className="font-heading text-4xl sm:text-5xl md:text-6xl uppercase text-brand-yellow mb-4 sm:mb-6">
                  {t("ctaTitle")}
                </h2>
                <p className="text-white/90 text-base sm:text-lg mb-6 sm:mb-8 max-w-xl">
                  {t("ctaDescription")}
                </p>
                <ServiceRequestModal
                  triggerText={t("ctaButton")}
                  variant="red"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
