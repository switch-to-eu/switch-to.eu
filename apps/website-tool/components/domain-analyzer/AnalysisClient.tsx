"use client";

import { useState, useCallback } from "react";
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
import { Link } from "@switch-to-eu/i18n/navigation";
import { api } from "@/lib/trpc-client";

import ReactCountryFlag from "react-country-flag";
import { cn } from "@switch-to-eu/ui/lib/utils";
import { DomainHeader } from "./DomainHeader";
import { Container } from "@switch-to-eu/blocks/components/container";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Phase = "scanning" | "done" | "not-found" | "error";

interface AnalysisClientProps {
  domain: string;
  formattedDomain: string;
  initialResults: AnalysisStep[] | null;
}

// ---------------------------------------------------------------------------
// Hook — encapsulates all subscription + state logic
// ---------------------------------------------------------------------------

function useDomainAnalysis(
  domain: string,
  initialResults: AnalysisStep[] | null,
) {
  const [results, setResults] = useState<AnalysisStep[]>(
    initialResults || [],
  );
  const [phase, setPhase] = useState<Phase>(
    initialResults ? "done" : "scanning",
  );

  // onData/onError callbacks fire per SSE event — no useEffect race conditions
  api.domain.analyze.useSubscription(
    { domain },
    {
      enabled: phase === "scanning",
      onData(data) {
        setResults(data.results);
        if (data.complete) setPhase("done");
      },
      onError(err) {
        setPhase(err.data?.code === "NOT_FOUND" ? "not-found" : "error");
      },
    },
  );

  const rescan = useCallback(() => {
    setResults([]);
    setPhase("scanning");
  }, []);

  return { results, phase, rescan } as const;
}

// ---------------------------------------------------------------------------
// EU status helpers (shared by steps and services)
// ---------------------------------------------------------------------------

type EUVerdict = "eu" | "eu-friendly" | "non-eu" | "unknown";

function getEUVerdict(
  isEU: boolean | null,
  euFriendly: boolean | null,
): EUVerdict {
  if (isEU === true) return "eu";
  if (euFriendly === true) return "eu-friendly";
  if (isEU === false) return "non-eu";
  return "unknown";
}

function StepIcon({ step }: { step: AnalysisStep }) {
  if (step.status === "pending")
    return <Clock className="w-5 h-5 text-muted-foreground/40" />;
  if (step.status === "processing")
    return (
      <div className="w-5 h-5 rounded-full border-2 border-brand-green border-t-transparent animate-spin" />
    );

  const verdict = getEUVerdict(step.isEU, step.euFriendly);
  if (verdict === "eu" || verdict === "eu-friendly")
    return <CheckCircle2Icon className="w-5 h-5 text-brand-green" />;
  if (verdict === "non-eu")
    return <XCircleIcon className="w-5 h-5 text-brand-red" />;
  return <MinusCircleIcon className="w-5 h-5 text-muted-foreground/40" />;
}

function EUBadge({
  isEU,
  euFriendly,
  size = "sm",
  t,
}: {
  isEU: boolean | null;
  euFriendly: boolean | null;
  size?: "sm" | "xs";
  t: ReturnType<typeof useTranslations>;
}) {
  const verdict = getEUVerdict(isEU, euFriendly);
  const sizeClass =
    size === "xs"
      ? "text-xs px-2 py-0.5"
      : "text-sm px-3 py-1";

  const colorClass =
    verdict === "eu" || verdict === "eu-friendly"
      ? "bg-brand-sage/30 text-brand-green"
      : verdict === "non-eu"
        ? "bg-brand-red/10 text-brand-red"
        : "bg-muted text-muted-foreground";

  const label =
    verdict === "eu"
      ? t("results.eu")
      : verdict === "eu-friendly"
        ? t("results.euFriendly")
        : verdict === "non-eu"
          ? t("results.nonEu")
          : t("results.notFound");

  return (
    <span className={cn("rounded-full font-medium", sizeClass, colorClass)}>
      {label}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function AnalysisClient({
  domain,
  formattedDomain,
  initialResults,
}: AnalysisClientProps) {
  const { results, phase, rescan } = useDomainAnalysis(domain, initialResults);
  const t = useTranslations("domainAnalyzer");
  const commonT = useTranslations("common");

  const scanning = phase === "scanning";
  const done = phase === "done";

  const share = async () => {
    try {
      await navigator.share({
        title: "EU Domain Analyzer",
        text: "Check if your domain is EU friendly",
        url: window.location.href,
      });
    } catch {
      // user cancelled or not supported
    }
  };

  return (
    <div>
      <Container noPaddingMobile>
        <DomainHeader domain={formattedDomain} results={results} />
      </Container>

      <Container className="flex gap-4 py-4 flex-col">
        {/* Action buttons */}
        {results.length > 0 && (
          <div className="flex justify-end gap-3">
            <button
              className="px-5 py-2 border border-border rounded-full text-foreground text-sm font-semibold hover:bg-muted transition-colors flex items-center gap-2"
              onClick={share}
            >
              <Share2Icon className="w-4 h-4" />
              {t("buttons.shareResults")}
            </button>
            <button
              className="px-5 py-2 bg-brand-green text-white rounded-full text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
              onClick={rescan}
              disabled={!done}
            >
              {t("buttons.checkAgain")}
            </button>
          </div>
        )}

        {/* Initial loading state */}
        {scanning && results.length === 0 && (
          <div className="w-full bg-white rounded-3xl border border-border p-8 text-center">
            <div className="w-8 h-8 rounded-full border-2 border-brand-green border-t-transparent animate-spin mx-auto mb-4" />
            <h3 className="font-semibold text-lg text-foreground mb-2">
              {t.rich("analyze.analyzing", { domain: formattedDomain })}
            </h3>
            <p className="text-sm text-muted-foreground">
              {t("analyze.checkingAspects")}
            </p>
          </div>
        )}

        {/* Error */}
        {phase === "error" && (
          <div className="w-full bg-brand-red/10 text-brand-red rounded-3xl border border-brand-red/20 p-6 text-center">
            <h3 className="font-semibold text-lg mb-2">{t("error.title")}</h3>
            <Link
              href="/"
              className="inline-block mt-4 px-6 py-2 bg-brand-green text-white rounded-full font-semibold text-sm hover:opacity-90 transition-opacity"
            >
              {t("error.tryAgain")}
            </Link>
          </div>
        )}

        {/* Domain not found */}
        {phase === "not-found" && (
          <div className="w-full bg-brand-yellow/10 text-foreground rounded-3xl border border-brand-yellow/30 p-6 text-center">
            <h3 className="font-semibold text-lg mb-2">
              {t("domainNotFound.title")}
            </h3>
            <p>
              {t.rich("domainNotFound.message", { domain: formattedDomain })}
            </p>
          </div>
        )}

        {/* Results */}
        {results.length > 0 && (phase === "scanning" || phase === "done") && (
          <AnalysisResults results={results} done={done} />
        )}
      </Container>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Results list
// ---------------------------------------------------------------------------

function AnalysisResults({
  results,
  done,
}: {
  results: AnalysisStep[];
  done: boolean;
}) {
  const t = useTranslations("domainAnalyzer");

  const overallVerdict = done ? getOverallVerdict(results) : null;

  return (
    <div>
      {overallVerdict === "green" && (
        <div className="bg-brand-sage/30 rounded-2xl p-4 mb-4">
          <p className="text-brand-green flex items-center gap-2">
            <CheckCircle2Icon className="w-5 h-5" />
            <span>{t("results.congratulations")}</span>
          </p>
        </div>
      )}

      <div className="space-y-4">
        {results.map((step) => (
          <StepCard key={step.type} step={step} showTip={done} t={t} />
        ))}
      </div>
    </div>
  );
}

function getOverallVerdict(
  results: AnalysisStep[],
): "green" | "yellow" | "red" | null {
  if (results.some((s) => s.status !== "complete")) return null;

  const hasNonEU = results.some(
    (s) => s.isEU === false && s.euFriendly === false,
  );
  const hasEU = results.some(
    (s) => s.isEU === true || s.euFriendly === true,
  );

  if (!hasNonEU) return "green";
  if (!hasEU) return "red";
  return "yellow";
}

// ---------------------------------------------------------------------------
// Single step card
// ---------------------------------------------------------------------------

function StepCard({
  step,
  showTip,
  t,
}: {
  step: AnalysisStep;
  showTip: boolean;
  t: ReturnType<typeof useTranslations>;
}) {
  const verdict = getEUVerdict(step.isEU, step.euFriendly);

  return (
    <div className="border border-border bg-white rounded-2xl p-4 transition-all">
      {/* Header row */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <StepIcon step={step} />
          <h3 className="font-medium text-foreground">
            {t(`services.${step.type}`) || step.type}
          </h3>
        </div>
        {step.status === "complete" && (
          <EUBadge isEU={step.isEU} euFriendly={step.euFriendly} t={t} />
        )}
      </div>

      {/* Details */}
      {step.status === "complete" && step.details && (
        <StepDetails details={step.details} t={t} />
      )}

      {step.status === "pending" && (
        <p className="text-sm text-muted-foreground/50 mt-2 pl-8">
          {t("results.pending")}
        </p>
      )}

      {/* Recommendation tip */}
      {showTip && verdict === "non-eu" && step.status === "complete" && (
        <RecommendationTip type={step.type} t={t} />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Step details (string or service list)
// ---------------------------------------------------------------------------

function StepDetails({
  details,
  t,
}: {
  details: string | Service[];
  t: ReturnType<typeof useTranslations>;
}) {
  if (typeof details === "string") {
    return (
      <p className="text-sm text-muted-foreground pl-8">{details}</p>
    );
  }

  if (details.length === 0) return null;

  return (
    <div className="pl-8 space-y-2">
      <p className="text-sm text-muted-foreground">
        {t("results.detectedServices")}
      </p>
      <ul className="space-y-1">
        {details.map((service, i) => (
          <li key={i} className="flex items-center gap-2 text-sm">
            {service.isEU || service.euFriendly ? (
              <CheckCircle2Icon className="w-4 h-4 text-brand-green" />
            ) : (
              <XCircleIcon className="w-4 h-4 text-brand-red" />
            )}
            <span className="text-foreground">{service.name}</span>
            <EUBadge
              isEU={service.isEU}
              euFriendly={service.euFriendly}
              size="xs"
              t={t}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Recommendations
// ---------------------------------------------------------------------------

const RECOMMENDATIONS: Record<
  AnalysisStep["type"],
  { label: string; links: { href: string; name: string; country: string }[] }
> = {
  mx_records: {
    label: "recommendations.emailProviders",
    links: [
      { href: "https://proton.me/mail", name: "Proton Mail (Swiss)", country: "CH" },
      { href: "https://mailbox.org/en/", name: "Mailbox.org", country: "DE" },
    ],
  },
  domain_registrar: {
    label: "recommendations.domainRegistrars",
    links: [
      { href: "https://www.gandi.net/", name: "Gandi", country: "FR" },
    ],
  },
  hosting: {
    label: "recommendations.hostingProviders",
    links: [
      { href: "https://www.hetzner.com/", name: "Hetzner", country: "DE" },
    ],
  },
  services: {
    label: "recommendations.services",
    links: [
      { href: "https://matomo.org/matomo-cloud", name: "Matomo cloud", country: "ZZ" },
      { href: "https://plausible.io/", name: "Plausible", country: "EE" },
    ],
  },
  cdn: {
    label: "recommendations.cdnProviders",
    links: [
      { href: "https://bunny.net/", name: "Bunny.net", country: "SI" },
    ],
  },
};

function RecommendationTip({
  type,
  t,
}: {
  type: AnalysisStep["type"];
  t: ReturnType<typeof useTranslations>;
}) {
  const rec = RECOMMENDATIONS[type];
  if (!rec) return null;

  return (
    <div className="mt-4 bg-brand-green/5 border border-brand-green/10 rounded-xl p-3">
      <div className="flex items-start gap-3">
        <LightbulbIcon className="w-5 h-5 text-brand-green shrink-0 mt-0.5" />
        <div className="space-y-1.5">
          <div className="text-sm text-foreground">{t(rec.label as Parameters<typeof t>[0])}</div>
          <div className="flex flex-wrap gap-2">
            {rec.links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-brand-green underline hover:no-underline font-medium text-sm"
              >
                <ReactCountryFlag
                  countryCode={link.country}
                  style={{ width: "1em", height: "1em" }}
                  svg
                />
                {link.name}
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
