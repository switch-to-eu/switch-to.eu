"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

import { useRouter } from "@switch-to-eu/i18n/navigation";
import { Globe, Search, Shield, Server } from "lucide-react";
import { Banner } from "@switch-to-eu/blocks/components/banner";
import { PageLayout } from "@switch-to-eu/blocks/components/page-layout";
import { Container } from "@switch-to-eu/blocks/components/container";

const HOW_IT_WORKS_STEPS = [
  { step: "step1", icon: Globe },
  { step: "step2", icon: Search },
  { step: "step3", icon: Shield },
] as const;

export function WebsiteAnalyzerClient() {
  const router = useRouter();
  const t = useTranslations("tools");

  const [url, setUrl] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!url.trim()) {
      setError(t("websiteAnalyzer.urlError"));
      return;
    }

    let domain = url.trim();

    domain = domain.replace(/^(https?:\/\/)?(www\.)?/, "");

    domain = domain.split("/")[0] ?? "";

    if (!domain) {
      setError(t("websiteAnalyzer.invalidUrlError"));
      return;
    }

    router.push(`/domain/${encodeURIComponent(domain)}`);
  };

  return (
    <PageLayout gapMobile>
      {/* Hero */}
      <Container noPaddingMobile>
        
      <Banner
        color="bg-brand-green"
        shapes={[
          {
            shape: "sunburst",
            className: "-top-8 -right-8 w-40 h-40 sm:w-52 sm:h-52",
            opacity: 0.1,
            duration: "8s",
          },
          {
            shape: "blob",
            className: "-bottom-6 -left-6 w-32 h-32 sm:w-40 sm:h-40",
            opacity: 0.1,
            duration: "10s",
            delay: "-3s",
          },
        ]}
        contentClassName="text-center max-w-2xl mx-auto"
      >
        <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl uppercase text-brand-yellow mb-8">
          {t("websiteAnalyzer.pageTitle")}
        </h1>

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
              className="px-8 py-3 bg-brand-yellow text-brand-green rounded-full font-semibold text-sm sm:text-base hover:opacity-90 transition-opacity flex-shrink-0"
            >
              {t("websiteAnalyzer.checkButton")}
            </button>
          </div>
          {error && (
            <p className="text-brand-red text-sm mt-3">{error}</p>
          )}
        </form>
      </Banner>
      </Container>

      {/* Empty State */}
      <Container>
        <div className="max-w-2xl mx-auto rounded-3xl border-2 border-dashed border-brand-green/20 bg-white p-10 flex flex-col items-center justify-center text-center min-h-[200px]">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-green/10 mb-4">
            <Server className="h-7 w-7 text-brand-green" />
          </div>
          <h3 className="font-heading text-xl uppercase text-brand-green mb-2">
            {t("websiteAnalyzer.emptyStateTitle")}
          </h3>
          <p className="text-muted-foreground max-w-md">
            {t("websiteAnalyzer.emptyStateDescription")}
          </p>
        </div>
      </Container>

      {/* How It Works */}
      <Container>
        <div className="text-center mb-10 sm:mb-12">
          <h2 className="font-heading text-4xl sm:text-5xl uppercase text-brand-green mb-4">
            {t("websiteAnalyzer.howItWorksTitle")}
          </h2>
        </div>
        <div className="grid gap-4 md:gap-6 sm:grid-cols-3">
          {HOW_IT_WORKS_STEPS.map(({ step, icon: Icon }) => (
            <div
              key={step}
              className="bg-white border border-brand-green/20 rounded-3xl p-6 sm:p-8 flex flex-col gap-4"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-green/10">
                <Icon className="h-6 w-6 text-brand-green" />
              </div>
              <h3 className="font-heading text-2xl uppercase text-brand-green">
                {t(`websiteAnalyzer.${step}.title`)}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {t(`websiteAnalyzer.${step}.description`)}
              </p>
            </div>
          ))}
        </div>
      </Container>

    </PageLayout>
  );
}
