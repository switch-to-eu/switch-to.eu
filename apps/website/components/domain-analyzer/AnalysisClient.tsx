"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@switch-to-eu/ui/components/button";
import {
  Share2Icon,
  CheckCircle2Icon,
  XCircleIcon,
  Clock,
  LightbulbIcon,
  MinusCircleIcon,
} from "lucide-react";
import { AnalysisStep, Service } from "@/lib/types";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

import ReactCountryFlag from "react-country-flag";
import { cn } from "@switch-to-eu/ui";

interface AnalysisClientProps {
  domain: string;
  formattedDomain: string;
  initialResults: AnalysisStep[] | null;
}

export function AnalysisClient({
  domain,
  formattedDomain,
  initialResults,
}: AnalysisClientProps) {
  const [results, setResults] = useState<AnalysisStep[]>(initialResults || []);
  const [isComplete, setIsComplete] = useState(!!initialResults);
  const [isLoading, setIsLoading] = useState(!initialResults);
  const [error, setError] = useState<string | null>(null);
  const [domainExists, setDomainExists] = useState<boolean | null>(null);

  // Use next-intl translations
  const t = useTranslations("domainAnalyzer");
  const commonT = useTranslations("common");

  const fetchResults = useCallback(
    async (force = false) => {
      try {
        setIsLoading(true);
        setError(null);
        setDomainExists(null);

        // Set up streaming response
        const response = await fetch(
          `/api/domain-analyzer?domain=${domain}${force ? "&force=true" : ""}`
        );

        // Handle 404 response (domain not found)
        if (response.status === 404) {
          setDomainExists(false);
          setIsLoading(false);
          setIsComplete(true);
          return;
        }

        if (!response.ok) {
          throw new Error("Failed to analyze domain");
        }

        // Domain exists if we got this far
        setDomainExists(true);

        const reader = response.body?.getReader();
        if (!reader) throw new Error("Stream not available");

        const decoder = new TextDecoder();
        let done = false;

        while (!done) {
          const { value, done: doneReading } = await reader.read();
          done = doneReading;

          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split("\n").filter((line) => line.trim());

          for (const line of lines) {
            try {
              const data = JSON.parse(line);
              setResults(data.results);

              if (data.complete) {
                setIsComplete(true);
              }

              if (data.domainExists === false) {
                setDomainExists(false);
              }
            } catch (e) {
              console.error("Error parsing stream data", e);
            }
          }
        }

        setIsLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
        setIsLoading(false);
      }
    },
    [domain]
  );

  useEffect(() => {
    // If we already have results from the server, don't fetch again
    if (initialResults) {
      return;
    }

    fetchResults();
  }, [domain, fetchResults, initialResults]);

  const copyToClipboard = async () => {
    try {
      await navigator.share({
        title: "EU Domain Analyzer",
        text: "Check if your domain is EU friendly",
        url: window.location.href,
      });
    } catch (err) {
      console.error("Error sharing results", err);
    }
  };

  return (
    <>
      {results.length > 0 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-1"
            onClick={() => copyToClipboard()}
          >
            <Share2Icon className="w-4 h-4" />
            {t("buttons.shareResults")}
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={() => fetchResults(true)}
            disabled={isLoading}
          >
            {isLoading ? commonT("loading") : t("buttons.checkAgain")}
          </Button>
        </div>
      )}

      {isLoading && results.length === 0 && (
        <div className="w-full max-w-3xl mx-auto bg-white rounded-xl shadow-sm border p-8 text-center">
          <div className="w-8 h-8 rounded-full border-2 border-blue-500 border-t-transparent animate-spin mx-auto mb-4"></div>
          <h3 className="font-semibold text-lg mb-2">
            {t.rich("analyze.analyzing", {
              domain: formattedDomain,
            })}
          </h3>
          <p className="text-sm text-gray-600">
            {t("analyze.checkingAspects")}
          </p>
        </div>
      )}

      {error && (
        <div className="w-full max-w-3xl mx-auto bg-red-50 text-red-700 rounded-xl shadow-sm border border-red-200 p-6 text-center">
          <h3 className="font-semibold text-lg mb-2">{t("error.title")}</h3>
          <p>{error}</p>
          <Button variant="default" className="mt-4" asChild>
            <Link href="/tools/website">{t("error.tryAgain")}</Link>
          </Button>
        </div>
      )}

      {domainExists === false && (
        <div className="w-full max-w-3xl mx-auto bg-yellow-50 text-yellow-700 rounded-xl shadow-sm border border-yellow-200 p-6 text-center">
          <h3 className="font-semibold text-lg mb-2">
            {t("domainNotFound.title")}
          </h3>
          <p>{t.rich("domainNotFound.message", { domain: formattedDomain })}</p>
        </div>
      )}

      {results.length > 0 && !error && domainExists !== false && (
        <AnalysisResults
          results={results}
          domain={formattedDomain}
          isComplete={isComplete}
        />
      )}
    </>
  );
}

interface AnalysisResultsProps {
  results: AnalysisStep[];
  domain: string;
  isComplete: boolean;
}

function AnalysisResults({
  results,
  domain,
  isComplete,
}: AnalysisResultsProps) {
  const t = useTranslations("domainAnalyzer");

  const getEUStatus = () => {
    if (!isComplete) return null;

    const completedSteps = results.filter((step) => step.status === "complete");

    if (completedSteps.length !== results.length) return null;

    const euServices = completedSteps.filter(
      (step) => step.isEU === true
    ).length;

    const euFriendlyServices = completedSteps.filter(
      (step) => step.euFriendly === true
    ).length;

    const nonEuServices = completedSteps.filter(
      (step) => step.isEU === false && step.euFriendly === false
    ).length;

    console.log("nonEuServices", nonEuServices);

    if (nonEuServices === 0) return "green";
    if (euServices === 0 && euFriendlyServices === 0) return "red";

    return "yellow";
  };

  const status = getEUStatus();

  return (
    <div>
      <div className="mb-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-[#1a3c5a]">
            {t.rich("results.howEuFriendly", { domain })}
          </h2>
          {status !== null && (
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "w-4 h-4 rounded-full",
                  status === "green"
                    ? "bg-green-500"
                    : status === "yellow"
                    ? "bg-yellow-500"
                    : "bg-red-500"
                )}
              />
              <span className="text-sm text-[#334155] font-medium">
                {status === "green"
                  ? t("results.statusExcellent")
                  : status === "yellow"
                  ? t("results.statusImprovement")
                  : t("results.statusAttention")}
              </span>
            </div>
          )}
        </div>

        {isComplete && status === "green" && (
          <div className="bg-green-50 rounded-lg p-4 my-4">
            <p className="text-green-700 flex items-center gap-2">
              <CheckCircle2Icon className="w-5 h-5" />
              <span>{t("results.congratulations")}</span>
            </p>
          </div>
        )}

        <div className="space-y-4">
          {results.map((step) => (
            <div
              key={step.type}
              className="border bg-white rounded-lg p-4 transition-all"
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  {step.status === "pending" && (
                    <Clock className="w-5 h-5 text-gray-400" />
                  )}
                  {step.status === "complete" &&
                    (step.isEU === true || step.euFriendly === true) && (
                      <CheckCircle2Icon className="w-5 h-5 text-green-500" />
                    )}
                  {step.status === "complete" &&
                    step.isEU === false &&
                    step.euFriendly === false && (
                      <XCircleIcon className="w-5 h-5 text-red-500" />
                    )}
                  {step.status === "complete" &&
                    step.isEU === null &&
                    step.euFriendly === null && (
                      <MinusCircleIcon className="w-5 h-5 text-gray-400" />
                    )}
                  {step.status === "processing" && (
                    <div className="w-5 h-5 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
                  )}
                  <h3 className="font-medium">
                    {t(`services.${step.type}`) || step.type}
                  </h3>
                </div>
                {step.status === "complete" && (
                  <span
                    className={cn(
                      "text-sm px-2 py-1 rounded-full",
                      step.isEU === true || step.euFriendly === true
                        ? "bg-green-100 text-green-700"
                        : step.isEU === false
                        ? "bg-red-100 text-red-700"
                        : "bg-gray-100 text-gray-700"
                    )}
                  >
                    {step.isEU === true
                      ? t("results.eu")
                      : step.euFriendly === true
                      ? t("results.euFriendly")
                      : step.isEU === false
                      ? t("results.nonEu")
                      : t("results.notFound")}
                  </span>
                )}
              </div>

              {step.status === "complete" && step.details && (
                <div className="pl-8">
                  {Array.isArray(step.details) ? (
                    <div className="space-y-2">
                      {(step.details as Service[]).length > 0 ? (
                        <>
                          <p className="text-sm text-[#334155]">
                            {t("results.detectedServices")}
                          </p>
                          <ul className="space-y-1">
                            {(step.details as Service[]).map((service, i) => (
                              <li
                                key={i}
                                className="flex items-center gap-2 text-sm"
                              >
                                {service.isEU ? (
                                  <CheckCircle2Icon className="w-4 h-4 text-green-500" />
                                ) : service.euFriendly ? (
                                  <CheckCircle2Icon className="w-4 h-4 text-blue-500" />
                                ) : (
                                  <XCircleIcon className="w-4 h-4 text-red-500" />
                                )}
                                <span>{service.name}</span>
                                <span
                                  className={cn(
                                    "text-xs px-1.5 py-0.5 rounded-full",
                                    service.isEU
                                      ? "bg-green-100 text-green-700"
                                      : service.euFriendly
                                      ? "bg-green-100 text-green-700"
                                      : "bg-red-100 text-red-700"
                                  )}
                                >
                                  {service.isEU
                                    ? t("results.eu")
                                    : service.euFriendly
                                    ? t("results.euFriendly")
                                    : t("results.nonEu")}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </>
                      ) : (
                        ""
                      )}
                    </div>
                  ) : (
                    step.details && (
                      <p className="text-sm text-[#334155]">{step.details}</p>
                    )
                  )}
                </div>
              )}

              {step.status === "pending" && (
                <p className="text-sm text-[#334155] mt-2 pl-8">
                  {t("results.pending")}
                </p>
              )}

              {/* Recommendation for each non-EU service */}
              {isComplete &&
                step.status === "complete" &&
                step.isEU === false &&
                step.euFriendly === false && (
                  <div className="mt-4 bg-blue-50 rounded-b-lg p-3 m-[-16px]">
                    <div className="flex items-start gap-3">
                      <LightbulbIcon className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                      <div>
                        <div className="text-sm text-[#334155]">
                          {getRecommendationText(step.type, t)}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function getRecommendationText(
  type: AnalysisStep["type"],
  t: ReturnType<typeof useTranslations>
): React.ReactNode {
  switch (type) {
    case "mx_records":
      return (
        <div className="space-y-1.5">
          <div>{t("recommendations.emailProviders")}</div>
          <div className="flex flex-wrap gap-2">
            <Link
              href="https://proton.me/mail"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-blue-600 hover:underline"
            >
              <ReactCountryFlag
                countryCode="CH"
                style={{ width: "1em", height: "1em" }}
                svg
              />
              Proton Mail (Swiss)
            </Link>

            <Link
              href="https://mailbox.org/en/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-blue-600 hover:underline"
            >
              <ReactCountryFlag
                countryCode="DE"
                style={{ width: "1em", height: "1em" }}
                svg
              />
              Mailbox.org
            </Link>
          </div>
        </div>
      );
    case "domain_registrar":
      return (
        <div className="space-y-1.5">
          <div>{t("recommendations.domainRegistrars")}</div>
          <div className="flex flex-wrap gap-2">
            <Link
              href="https://www.gandi.net/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-blue-600 hover:underline"
            >
              <ReactCountryFlag
                countryCode="FR"
                style={{ width: "1em", height: "1em" }}
                svg
              />
              Gandi
            </Link>
          </div>
        </div>
      );
    case "services":
      return (
        <div className="space-y-1.5">
          <div>{t("recommendations.services")}</div>
          <div className="flex flex-wrap gap-2">
            <Link
              href="https://matomo.org/matomo-cloud"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-blue-600 hover:underline"
            >
              <ReactCountryFlag
                countryCode="ZZ"
                style={{ width: "1em", height: "1em" }}
                svg
              />
              Matomo cloud
            </Link>

            <Link
              href="https://plausible.io/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-blue-600 hover:underline"
            >
              <ReactCountryFlag
                countryCode="EE"
                style={{ width: "1em", height: "1em" }}
                svg
              />
              Plausible
            </Link>
          </div>
        </div>
      );

    case "hosting":
      return (
        <div className="space-y-1.5">
          <div>{t("recommendations.hostingProviders")}</div>

          <div className="flex flex-wrap gap-2">
            <Link
              href="https://www.hetzner.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-blue-600 hover:underline"
            >
              <ReactCountryFlag
                countryCode="DE"
                style={{ width: "1em", height: "1em" }}
                svg
              />
              Hetzner
            </Link>
          </div>
        </div>
      );
    case "cdn":
      return (
        <div className="space-y-1.5">
          <div>{t("recommendations.cdnProviders")}</div>
          <div className="flex flex-wrap gap-2">
            <Link
              href="https://bunny.net/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-blue-600 hover:underline"
            >
              <ReactCountryFlag
                countryCode="SI"
                style={{ width: "1em", height: "1em" }}
                svg
              />
              Bunny.net
            </Link>
          </div>
        </div>
      );
    default:
      return <div>{t("recommendations.checkAlternatives")}</div>;
  }
}
