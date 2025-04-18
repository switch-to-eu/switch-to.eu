"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Container } from "@/components/layout/container";
import Image from "next/image";
import { useState } from "react";
import { useRouter, useParams } from "next/navigation";

export default function WebsiteAnalyzerPage() {
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();
  const params = useParams();
  const lang = params.lang as string;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (!url.trim()) {
      setError("Please enter a website URL");
      return;
    }

    // Normalize URL
    let domain = url.trim();

    // Remove protocol if present
    domain = domain.replace(/^(https?:\/\/)?(www\.)?/, "");

    // Remove trailing slashes and everything after
    domain = domain.split("/")[0];

    if (!domain) {
      setError("Please enter a valid website URL");
      return;
    }

    // Redirect to domain analysis page with language parameter
    router.push(`/${lang}/tools/domain/${encodeURIComponent(domain)}`);
  };

  return (
    <div className="flex flex-col gap-8 sm:gap-12 py-6 md:gap-20 md:py-12">
      {/* Hero Section */}
      <section className="relative">
        <Container className="flex flex-col items-center gap-6 sm:gap-8 py-4 sm:py-6">
          <div className="flex flex-col gap-4 sm:gap-6 text-center max-w-3xl">
            <h1 className="font-bold text-3xl sm:text-4xl md:text-5xl text-[#1a3c5a]">
              Website EU Services Analyzer
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-[#334155]">
              Check if your website is using EU-based services or if it relies
              on non-EU providers
            </p>
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
                placeholder="Enter website URL (e.g., example.com)"
                className="h-12 text-base bg-white border-2 focus-visible:border-primary sm:rounded-r-none sm:border-r-0"
              />
              <Button
                variant="default"
                size="lg"
                type="submit"
                className="sm:rounded-l-none sm:px-8"
              >
                Analyze
              </Button>
            </form>
            {error ? (
              <p className="text-sm text-red-500 mt-2">{error}</p>
            ) : (
              <p className="text-sm text-muted-foreground mt-2">
                We&apos;ll analyze the website to detect services and provide an
                EU compliance score
              </p>
            )}
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
              Enter a URL to analyze
            </h3>
            <p className="text-[#334155] max-w-md">
              Your analysis results will appear here, showing you which services
              your website uses and whether they are EU-based
            </p>
          </div>
        </Container>
      </section>

      {/* How It Works Section */}
      <section className="bg-[#e9f4fd] py-12">
        <Container>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#1a3c5a] mb-8 text-center">
            How It Works
          </h2>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-[#ff9d8a] flex items-center justify-center mb-4">
                  <span className="font-bold text-white">1</span>
                </div>
                <h3 className="mb-2 font-semibold text-lg">
                  Enter Website URL
                </h3>
                <p className="text-[#334155] text-sm sm:text-base">
                  Provide the URL of the website you want to analyze for EU
                  service usage
                </p>
              </div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-[#ff9d8a] flex items-center justify-center mb-4">
                  <span className="font-bold text-white">2</span>
                </div>
                <h3 className="mb-2 font-semibold text-lg">
                  Automatic Analysis
                </h3>
                <p className="text-[#334155] text-sm sm:text-base">
                  Our tool scans the website to detect various third-party
                  services, APIs, and data processors
                </p>
              </div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-[#ff9d8a] flex items-center justify-center mb-4">
                  <span className="font-bold text-white">3</span>
                </div>
                <h3 className="mb-2 font-semibold text-lg">Review Results</h3>
                <p className="text-[#334155] text-sm sm:text-base">
                  Get a detailed report showing your EU compliance score and
                  recommendations for alternatives
                </p>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* FAQ Section */}
      <section>
        <Container>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#1a3c5a] mb-8 text-center">
            Frequently Asked Questions
          </h2>
          <div className="grid gap-4 sm:gap-6 max-w-3xl mx-auto">
            <div className="border rounded-lg p-5">
              <h3 className="font-semibold text-lg mb-2">
                What does the EU services score mean?
              </h3>
              <p className="text-[#334155]">
                The score indicates how much your website relies on EU-based
                digital services vs. non-EU services. A higher score means
                better alignment with EU data sovereignty principles.
              </p>
            </div>
            <div className="border rounded-lg p-5">
              <h3 className="font-semibold text-lg mb-2">
                What services are detected?
              </h3>
              <p className="text-[#334155]">
                Our tool detects analytics, hosting, CDN, marketing tools,
                payment processors, and other third-party services integrated
                with your website.
              </p>
            </div>
            <div className="border rounded-lg p-5">
              <h3 className="font-semibold text-lg mb-2">
                How can I improve my score?
              </h3>
              <p className="text-[#334155]">
                For each non-EU service detected, we&apos;ll suggest EU
                alternatives and provide migration guides to help you make the
                switch to improve your score.
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* CTA Section */}
      <section className="py-12">
        <Container>
          <div className="rounded-lg border bg-card p-8 text-center shadow-sm md:p-12 bg-[#fff9f5]">
            <h2 className="font-bold text-2xl sm:text-3xl text-[#1a3c5a]">
              Ready to make the switch?
            </h2>
            <p className="mx-auto mt-4 max-w-[600px] text-[#334155]">
              Discover EU alternatives for any non-EU services detected on your
              website and follow our step-by-step migration guides.
            </p>
            <Button variant="default" size="lg" className="mt-6">
              Explore EU Alternatives
            </Button>
          </div>
        </Container>
      </section>
    </div>
  );
}
