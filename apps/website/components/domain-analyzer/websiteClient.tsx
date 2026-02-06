"use client";

import { useState } from "react";
import { Button } from "@switch-to-eu/ui/components/button";
import { Input } from "@switch-to-eu/ui/components/input";
import { useTranslations } from "next-intl";

import Image from "next/image";
import { Container } from "../layout/container";
import { useRouter } from "@/i18n/navigation";

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
    domain = domain.split("/")[0];

    if (!domain) {
      setError(t("websiteAnalyzer.invalidUrlError"));
      return;
    }

    router.push(`/tools/domain/${encodeURIComponent(domain)}`);
  };

  return (
    <div className="flex flex-col gap-8 sm:gap-12 py-6 md:gap-20 md:py-12">
      {/* Hero Section */}
      <section className="relative">
        <Container className="flex flex-col items-center gap-6 sm:gap-8 py-4 sm:py-6">
          <div className="flex flex-col gap-4 sm:gap-6 text-center max-w-3xl">
            <h1 className="font-bold text-3xl sm:text-4xl md:text-4xl text-[#1a3c5a]">
              {t("websiteAnalyzer.pageTitle")}
            </h1>
          </div>

          {/* Website URL Input */}
          <div className="w-full max-w-2xl mt-4 sm:mt-6">
            <form
              onSubmit={handleSubmit}
              className="flex flex-col sm:flex-row gap-0"
            >
              <Input
                type="text"
                value={url}
                onChange={(e) => {
                  setUrl(e.target.value);
                  setError("");
                }}
                placeholder={t("websiteAnalyzer.urlInputPlaceholder")}
                className="h-12 text-base bg-white border-2 focus-visible:border-primary sm:rounded-r-none sm:border-r-0"
              />
              <Button
                variant="default"
                size="lg"
                type="submit"
                className="sm:rounded-l-none sm:px-8"
              >
                {t("websiteAnalyzer.checkButton")}
              </Button>
            </form>
            {error ? <p className="text-sm text-red-500 mt-2">{error}</p> : ""}
          </div>

          {/* Results Placeholder (empty state) */}
          <div className="w-full max-w-2xl mt-8 rounded-xl border border-dashed border-gray-300 bg-gray-50 p-8 flex flex-col items-center justify-center text-center min-h-[300px]">
            <div className="relative w-20 h-20 mb-4">
              <Image
                src="/images/icon-01.svg"
                alt="Analysis icon"
                fill
                className="object-contain opacity-50"
              />
            </div>
            <h3 className="text-xl font-semibold text-[#1a3c5a] mb-2">
              {t("websiteAnalyzer.emptyStateTitle")}
            </h3>
            <p className="text-[#334155] max-w-md">
              {t("websiteAnalyzer.emptyStateDescription")}
            </p>
          </div>
        </Container>
      </section>

      {/* How It Works Section */}
      <section className="bg-[#e9f4fd] py-12">
        <Container>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#1a3c5a] mb-8 text-center">
            {t("websiteAnalyzer.howItWorksTitle")}
          </h2>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-[#ff9d8a] flex items-center justify-center mb-4">
                  <span className="font-bold text-white">
                    {t("websiteAnalyzer.step1.number")}
                  </span>
                </div>
                <h3 className="mb-2 font-semibold text-lg">
                  {t("websiteAnalyzer.step1.title")}
                </h3>
                <p className="text-[#334155] text-sm sm:text-base">
                  {t("websiteAnalyzer.step1.description")}
                </p>
              </div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-[#ff9d8a] flex items-center justify-center mb-4">
                  <span className="font-bold text-white">
                    {t("websiteAnalyzer.step2.number")}
                  </span>
                </div>
                <h3 className="mb-2 font-semibold text-lg">
                  {t("websiteAnalyzer.step2.title")}
                </h3>
                <p className="text-[#334155] text-sm sm:text-base">
                  {t("websiteAnalyzer.step2.description")}
                </p>
              </div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-[#ff9d8a] flex items-center justify-center mb-4">
                  <span className="font-bold text-white">
                    {t("websiteAnalyzer.step3.number")}
                  </span>
                </div>
                <h3 className="mb-2 font-semibold text-lg">
                  {t("websiteAnalyzer.step3.title")}
                </h3>
                <p className="text-[#334155] text-sm sm:text-base">
                  {t("websiteAnalyzer.step3.description")}
                </p>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* CTA Section */}
      <section className="py-12">
        <Container>
          <div className="rounded-lg border p-8 text-center shadow-sm md:p-12 bg-[#fff9f5]">
            <h2 className="font-bold text-2xl sm:text-3xl text-[#1a3c5a]">
              {t("websiteAnalyzer.ctaTitle")}
            </h2>
            <p className="mx-auto mt-4 max-w-[600px] text-[#334155]">
              {t("websiteAnalyzer.ctaDescription")}
            </p>
            <Button variant="default" size="lg" className="mt-6">
              {t("websiteAnalyzer.ctaButton")}
            </Button>
          </div>
        </Container>
      </section>
    </div>
  );
}
