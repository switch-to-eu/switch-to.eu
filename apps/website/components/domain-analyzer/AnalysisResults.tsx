import { cn } from "@switch-to-eu/ui/lib/utils";
import {
  CheckCircle2Icon,
  XCircleIcon,
  Clock,
  LightbulbIcon,
  MinusCircleIcon,
} from "lucide-react";
import { AnalysisStep } from "@/lib/types";
import ReactCountryFlag from "react-country-flag";
import { useTranslations } from "next-intl";
import { Link } from "@switch-to-eu/i18n/navigation";

interface AnalysisResultsProps {
  results: AnalysisStep[];
  domain: string;
  isComplete: boolean;
}

export function AnalysisResults({
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
      (step) => step.isEU === false
    ).length;

    if (nonEuServices === 0 && euFriendlyServices === 0) return "green";
    if (euServices === 0 && euFriendlyServices === 0) return "red";

    return "yellow";
  };

  const status = getEUStatus();

  return (
    <div>
      <div className="mb-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-heading text-xl sm:text-2xl uppercase text-brand-green">
            {t.rich("results.howEuFriendly", { domain })}
          </h2>
          {status !== null && (
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "w-4 h-4 rounded-full",
                  status === "green"
                    ? "bg-brand-sage"
                    : status === "yellow"
                      ? "bg-brand-yellow"
                      : "bg-brand-red"
                )}
              />
              <span className="text-sm text-brand-green/70 font-medium">
                {status === "green"
                  ? t("results.statusExcellent")
                  : status === "yellow"
                    ? t("results.statusImprovement")
                    : t("results.statusAttention")}
              </span>
            </div>
          )}
        </div>

        <div className="space-y-4">
          {results.map((step) => (
            <div
              key={step.type}
              className="border border-brand-sage/30 bg-white rounded-2xl p-4 transition-all"
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  {step.status === "pending" && (
                    <Clock className="w-5 h-5 text-brand-green/30" />
                  )}
                  {step.status === "complete" &&
                    (step.isEU === true || step.euFriendly === true) && (
                      <CheckCircle2Icon className="w-5 h-5 text-brand-green" />
                    )}
                  {step.status === "complete" &&
                    step.isEU === false &&
                    step.euFriendly === false && (
                      <XCircleIcon className="w-5 h-5 text-brand-red" />
                    )}
                  {step.status === "complete" &&
                    step.isEU === null &&
                    step.euFriendly === null && (
                      <MinusCircleIcon className="w-5 h-5 text-brand-green/30" />
                    )}
                  {step.status === "processing" && (
                    <div className="w-5 h-5 rounded-full border-2 border-brand-navy border-t-transparent animate-spin" />
                  )}
                  <h3 className="font-medium text-brand-green">
                    {t(`services.${step.type}`) || step.type}
                  </h3>
                </div>
                {step.status === "complete" && (
                  <span
                    className={cn(
                      "text-sm px-3 py-1 rounded-full font-medium",
                      step.isEU === true || step.euFriendly === true
                        ? "bg-brand-sage/30 text-brand-green"
                        : step.isEU === false
                          ? "bg-brand-red/10 text-brand-red"
                          : "bg-brand-sage/20 text-brand-green/50"
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
                      {step.details.length > 0 ? (
                        <>
                          <p className="text-sm text-brand-green/60">
                            {t("results.detectedServices")}
                          </p>
                          <ul className="space-y-1">
                            {step.details.map((service, i) => (
                              <li
                                key={i}
                                className="flex items-center gap-2 text-sm"
                              >
                                {service.isEU ? (
                                  <CheckCircle2Icon className="w-4 h-4 text-brand-green" />
                                ) : (
                                  <XCircleIcon className="w-4 h-4 text-brand-red" />
                                )}
                                <span className="text-brand-green">
                                  {service.name}
                                </span>
                                <span
                                  className={cn(
                                    "text-xs px-2 py-0.5 rounded-full font-medium",
                                    service.isEU
                                      ? "bg-brand-sage/30 text-brand-green"
                                      : "bg-brand-red/10 text-brand-red"
                                  )}
                                >
                                  {service.isEU
                                    ? t("results.eu")
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
                      <p className="text-sm text-brand-green/60">
                        {step.details}
                      </p>
                    )
                  )}
                </div>
              )}

              {step.status === "pending" && (
                <p className="text-sm text-brand-green/40 mt-2 pl-8">
                  {t("results.pending")}
                </p>
              )}

              {/* Recommendation for each non-EU service */}
              {isComplete &&
                step.status === "complete" &&
                step.isEU === false &&
                step.euFriendly === false && (
                  <div className="mt-4 bg-brand-sky/20 rounded-xl p-3 mx-[-4px]">
                    <div className="flex items-start gap-3">
                      <LightbulbIcon className="w-5 h-5 text-brand-navy shrink-0 mt-0.5" />
                      <div>
                        <div className="text-sm text-brand-green">
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

      {isComplete && status === "green" && (
        <div className="bg-brand-sage/30 rounded-2xl p-4 mt-4">
          <p className="text-brand-green flex items-center gap-2">
            <CheckCircle2Icon className="w-5 h-5" />
            <span>{t("results.congratulations")}</span>
          </p>
        </div>
      )}
    </div>
  );
}

function getRecommendationText(
  type: string,
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
              className="inline-flex items-center gap-1 text-brand-navy hover:underline font-medium"
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
              className="inline-flex items-center gap-1 text-brand-navy hover:underline font-medium"
            >
              <ReactCountryFlag
                countryCode="DE"
                style={{ width: "1em", height: "1em" }}
                svg
              />
              Mailbox.org (German)
            </Link>
          </div>
        </div>
      );
    case "analytics":
      return (
        <div className="space-y-1.5">
          <div>{t("recommendations.analyticsProviders")}</div>
          <div className="flex flex-wrap gap-2">
            <Link
              href="https://matomo.org/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-brand-navy hover:underline font-medium"
            >
              <ReactCountryFlag
                countryCode="DE"
                style={{ width: "1em", height: "1em" }}
                svg
              />
              Matomo (Germany)
            </Link>
            <Link
              href="https://www.piwik.pro/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-brand-navy hover:underline font-medium"
            >
              <ReactCountryFlag
                countryCode="PL"
                style={{ width: "1em", height: "1em" }}
                svg
              />
              Piwik PRO (Poland)
            </Link>
          </div>
        </div>
      );
    case "fonts":
      return (
        <div className="space-y-1.5">
          <div>{t("recommendations.fontProviders")}</div>
          <div className="flex flex-wrap gap-2">
            <Link
              href="https://bunny.net/fonts/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-brand-navy hover:underline font-medium"
            >
              <ReactCountryFlag
                countryCode="SI"
                style={{ width: "1em", height: "1em" }}
                svg
              />
              BunnyFonts (Slovenia)
            </Link>
            <span className="text-sm text-brand-green/50">
              {t("recommendations.selfHosting")}
            </span>
          </div>
        </div>
      );
    default:
      return <div>{t("recommendations.checkAlternatives")}</div>;
  }
}
