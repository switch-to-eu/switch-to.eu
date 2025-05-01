"use client";

import { useEffect, useState, useCallback } from "react";
import { AnalysisResults } from "./AnalysisResults";
import { Button } from "@/components/ui/button";
import { Share2Icon } from "lucide-react";
import { AnalysisStep } from "@/lib/types";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

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

  // Use next-intl translations
  const t = useTranslations("domainAnalyzer");
  const commonT = useTranslations("common");

  const fetchResults = useCallback(
    async (force = false) => {
      try {
        setIsLoading(true);
        setError(null);

        // Set up streaming response
        const response = await fetch(
          `/api/domain-analyzer?domain=${domain}${force ? "&force=true" : ""}`
        );

        if (!response.ok) {
          throw new Error("Failed to analyze domain");
        }

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

  const copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.href);
  };

  return (
    <>
      {results.length > 0 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-1"
            onClick={copyToClipboard}
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

      {results.length > 0 && !error && (
        <AnalysisResults
          results={results}
          domain={formattedDomain}
          isComplete={isComplete}
        />
      )}
    </>
  );
}
