"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

import Image from "next/image";
import { useRouter } from "@switch-to-eu/i18n/navigation";
import { FILTER_BRAND_GREEN, FILTER_WHITE } from "@switch-to-eu/ui/lib/shape-filters";

const HOW_IT_WORKS_CARDS = [
  {
    bg: "bg-brand-sky",
    text: "text-brand-green",
    numberBg: "bg-brand-green",
    numberText: "text-white",
    shape: "/images/shapes/cloud.svg",
    shapeFilter:
      "brightness(0) saturate(100%) invert(22%) sepia(95%) saturate(1000%) hue-rotate(130deg) brightness(90%) contrast(95%)",
    step: "step1",
  },
  {
    bg: "bg-brand-yellow/20",
    text: "text-brand-green",
    numberBg: "bg-brand-orange",
    numberText: "text-white",
    shape: "/images/shapes/star.svg",
    shapeFilter:
      "brightness(0) saturate(100%) invert(22%) sepia(95%) saturate(1000%) hue-rotate(130deg) brightness(90%) contrast(95%)",
    step: "step2",
  },
  {
    bg: "bg-brand-sage",
    text: "text-brand-green",
    numberBg: "bg-brand-navy",
    numberText: "text-white",
    shape: "/images/shapes/pebble.svg",
    shapeFilter:
      "brightness(0) saturate(100%) invert(22%) sepia(95%) saturate(1000%) hue-rotate(130deg) brightness(90%) contrast(95%)",
    step: "step3",
  },
] as const;

export function WebsiteAnalyzerClient() {
  const router = useRouter();
  const t = useTranslations("tools");

  const [url, setUrl] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (!url.trim()) {
      setError(t("websiteAnalyzer.urlError"));
      return;
    }

    // Normalize URL
    let domain = url.trim();

    // Remove protocol if present
    domain = domain.replace(/^(https?:\/\/)?(www\.)?/, "");

    // Remove trailing slashes and everything after
    domain = domain.split("/")[0] ?? "";

    if (!domain) {
      setError(t("websiteAnalyzer.invalidUrlError"));
      return;
    }

    router.push(`/tools/domain/${encodeURIComponent(domain)}`);
  };

  return (
    <main className="flex flex-col gap-8 sm:gap-12 md:gap-20 py-4 sm:py-6 md:py-8">
      {/* Hero Section */}
      <section>
        <div className="container max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="bg-brand-navy rounded-3xl">
            <div className="relative px-6 sm:px-10 md:px-16 py-12 sm:py-16 md:py-20 overflow-hidden">
              {/* Decorative shapes */}
              <div className="absolute -top-8 -right-8 w-40 h-40 sm:w-52 sm:h-52 opacity-10 pointer-events-none">
                <Image
                  src="/images/shapes/sunburst.svg"
                  alt=""
                  fill
                  className="object-contain select-none animate-shape-float"
                  style={{ animationDuration: "8s", filter: FILTER_WHITE }}
                  aria-hidden="true"
                  unoptimized
                />
              </div>
              <div className="absolute -bottom-6 -left-6 w-32 h-32 sm:w-40 sm:h-40 opacity-10 pointer-events-none">
                <Image
                  src="/images/shapes/blob.svg"
                  alt=""
                  fill
                  className="object-contain select-none animate-shape-float"
                  style={{ animationDuration: "10s", animationDelay: "1s", filter: FILTER_WHITE }}
                  aria-hidden="true"
                  unoptimized
                />
              </div>

              <div className="relative z-10 max-w-2xl mx-auto text-center">
                <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl uppercase text-brand-yellow mb-8">
                  {t("websiteAnalyzer.pageTitle")}
                </h1>

                {/* Website URL Input */}
                <form onSubmit={handleSubmit}>
                  <div className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto">
                    <input
                      type="text"
                      value={url}
                      onChange={(e) => {
                        setUrl(e.target.value);
                        setError("");
                      }}
                      placeholder={t("websiteAnalyzer.urlInputPlaceholder")}
                      className="flex-1 px-6 py-3 rounded-full bg-white/10 border border-white/20 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-brand-yellow/50 focus:border-brand-yellow/50 text-sm sm:text-base"
                    />
                    <button
                      type="submit"
                      className="px-8 py-3 bg-brand-yellow text-brand-navy rounded-full font-semibold text-sm sm:text-base hover:opacity-90 transition-opacity flex-shrink-0"
                    >
                      {t("websiteAnalyzer.checkButton")}
                    </button>
                  </div>
                  {error && (
                    <p className="text-brand-red text-sm mt-3">{error}</p>
                  )}
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Empty State / Results Placeholder */}
      <section>
        <div className="container max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto rounded-3xl border-2 border-dashed border-brand-sage bg-brand-sage/10 p-10 flex flex-col items-center justify-center text-center min-h-[260px]">
            <div className="relative w-20 h-20 mb-4 opacity-30">
              <Image
                src="/images/shapes/sunburst.svg"
                alt=""
                fill
                className="object-contain select-none animate-shape-float"
                style={{
                  filter: FILTER_BRAND_GREEN,
                  animationDuration: "8s",
                }}
                aria-hidden="true"
                unoptimized
              />
            </div>
            <h3 className="font-heading text-xl uppercase text-brand-green mb-2">
              {t("websiteAnalyzer.emptyStateTitle")}
            </h3>
            <p className="text-brand-green/60 max-w-md">
              {t("websiteAnalyzer.emptyStateDescription")}
            </p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section>
        <div className="container max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <h2 className="font-heading text-3xl sm:text-4xl uppercase text-brand-green mb-8 text-center">
            {t("websiteAnalyzer.howItWorksTitle")}
          </h2>
          <div className="grid gap-5 sm:gap-6 md:grid-cols-3">
            {HOW_IT_WORKS_CARDS.map((card) => (
              <div
                key={card.step}
                className={`relative overflow-hidden rounded-3xl ${card.bg}`}
              >
                {/* Shape area */}
                <div className="relative h-32 overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="relative w-20 h-20 opacity-15">
                      <Image
                        src={card.shape}
                        alt=""
                        fill
                        className="object-contain select-none animate-shape-float"
                        style={{ filter: card.shapeFilter }}
                        aria-hidden="true"
                        unoptimized
                      />
                    </div>
                  </div>
                  {/* Step number */}
                  <div className="absolute top-4 left-4">
                    <div
                      className={`w-10 h-10 rounded-full ${card.numberBg} ${card.numberText} flex items-center justify-center font-bold text-lg`}
                    >
                      {t(`websiteAnalyzer.${card.step}.number`)}
                    </div>
                  </div>
                </div>

                {/* Content area */}
                <div className="p-6 pt-2">
                  <h3 className={`font-semibold text-lg mb-2 ${card.text}`}>
                    {t(`websiteAnalyzer.${card.step}.title`)}
                  </h3>
                  <p className={`${card.text}/70 text-sm leading-relaxed`}>
                    {t(`websiteAnalyzer.${card.step}.description`)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section>
        <div className="container max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="bg-brand-green rounded-3xl">
            <div className="relative px-6 sm:px-10 md:px-16 py-12 sm:py-16 overflow-hidden text-center">
              {/* Decorative shape */}
              <div className="absolute -top-6 -right-6 w-36 h-36 opacity-10 pointer-events-none">
                <Image
                  src="/images/shapes/spark.svg"
                  alt=""
                  fill
                  className="object-contain select-none animate-shape-float"
                  style={{ animationDuration: "7s", filter: FILTER_WHITE }}
                  aria-hidden="true"
                  unoptimized
                />
              </div>

              <div className="relative z-10">
                <h2 className="font-heading text-3xl sm:text-4xl uppercase text-brand-yellow mb-4">
                  {t("websiteAnalyzer.ctaTitle")}
                </h2>
                <p className="text-white/80 max-w-xl mx-auto mb-6">
                  {t("websiteAnalyzer.ctaDescription")}
                </p>
                <button className="px-8 py-3 bg-brand-yellow text-brand-navy rounded-full font-semibold text-sm sm:text-base hover:opacity-90 transition-opacity">
                  {t("websiteAnalyzer.ctaButton")}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
