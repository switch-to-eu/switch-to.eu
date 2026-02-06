import { cn } from "@switch-to-eu/ui";
import {
  CheckCircle2Icon,
  XCircleIcon,
  Clock,
  LightbulbIcon,
  MinusCircleIcon,
} from "lucide-react";
import { AnalysisStep, Service } from "@/lib/types";
import ReactCountryFlag from "react-country-flag";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

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
                                ) : (
                                  <XCircleIcon className="w-4 h-4 text-red-500" />
                                )}
                                <span>{service.name}</span>
                                <span
                                  className={cn(
                                    "text-xs px-1.5 py-0.5 rounded-full",
                                    service.isEU
                                      ? "bg-green-100 text-green-700"
                                      : "bg-red-100 text-red-700"
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

      {isComplete && status === "green" && (
        <div className="bg-green-50 rounded-lg p-4 mt-4">
          <p className="text-green-700 flex items-center gap-2">
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
              className="inline-flex items-center gap-1 text-blue-600 hover:underline"
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
              className="inline-flex items-center gap-1 text-blue-600 hover:underline"
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
              className="inline-flex items-center gap-1 text-blue-600 hover:underline"
            >
              <ReactCountryFlag
                countryCode="SI"
                style={{ width: "1em", height: "1em" }}
                svg
              />
              BunnyFonts (Slovenia)
            </Link>
            <span className="text-sm text-gray-500">
              {t("recommendations.selfHosting")}
            </span>
          </div>
        </div>
      );
    default:
      return <div>{t("recommendations.checkAlternatives")}</div>;
  }
}
