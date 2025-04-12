import { cn } from "@/lib/utils";
import {
  CheckCircle2Icon,
  XCircleIcon,
  Clock,
  HelpCircleIcon,
} from "lucide-react";
import { AnalysisStep, Service } from "@/lib/types";

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
  const getEUScore = () => {
    if (!isComplete) return null;

    const completedSteps = results.filter((step) => step.status === "complete");
    if (completedSteps.length === 0) return null;

    const euServices = completedSteps.filter(
      (step) => step.isEU === true
    ).length;

    const score = Math.round((euServices / completedSteps.length) * 100);

    return score;
  };

  const score = getEUScore();

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm border p-6 mb-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-[#1a3c5a]">
            Analysis Results for {domain}
          </h2>
          {score !== null && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-[#334155]">EU Score:</span>
              <span
                className={cn(
                  "font-semibold text-lg px-3 py-1 rounded-full",
                  score >= 70
                    ? "bg-green-100 text-green-700"
                    : score >= 40
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-red-100 text-red-700"
                )}
              >
                {score}%
              </span>
            </div>
          )}
        </div>

        <div className="space-y-4">
          {results.map((step) => (
            <div
              key={step.type}
              className="border rounded-lg p-4 transition-all"
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  {step.status === "pending" && (
                    <Clock className="w-5 h-5 text-gray-400" />
                  )}
                  {step.status === "complete" && step.isEU === true && (
                    <CheckCircle2Icon className="w-5 h-5 text-green-500" />
                  )}
                  {step.status === "complete" && step.isEU === false && (
                    <XCircleIcon className="w-5 h-5 text-red-500" />
                  )}
                  {step.status === "processing" && (
                    <div className="w-5 h-5 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
                  )}
                  <h3 className="font-medium">{step.title}</h3>
                </div>
                {step.status === "complete" && (
                  <span
                    className={cn(
                      "text-sm px-2 py-1 rounded-full",
                      step.isEU === true
                        ? "bg-green-100 text-green-700"
                        : step.isEU === false
                        ? "bg-red-100 text-red-700"
                        : "bg-gray-100 text-gray-700"
                    )}
                  >
                    {step.isEU === true
                      ? "EU Based"
                      : step.isEU === false
                      ? "Non-EU"
                      : "Unknown"}
                  </span>
                )}
              </div>

              {step.status === "complete" && step.details && (
                <div className="mt-3 pl-8">
                  {Array.isArray(step.details) ? (
                    <div className="space-y-2">
                      <p className="text-sm text-[#334155]">
                        Detected services:
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
                              {service.isEU ? "EU" : "Non-EU"}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <p className="text-sm text-[#334155]">
                      <span className="font-medium">Provider:</span>{" "}
                      {step.details}
                    </p>
                  )}
                </div>
              )}

              {step.status === "pending" && (
                <p className="text-sm text-[#334155] mt-2 pl-8">
                  Waiting to process...
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {isComplete && (
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-[#1a3c5a] mb-3">
            Recommendations
          </h3>
          {score !== null && score < 100 && (
            <div className="space-y-3">
              {results
                .filter((step) => step.isEU === false)
                .map((step) => (
                  <div
                    key={`rec-${step.type}`}
                    className="flex items-start gap-3"
                  >
                    <HelpCircleIcon className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">
                        Consider switching your {step.title.toLowerCase()}
                      </p>
                      <p className="text-sm text-[#334155]">
                        {getRecommendationText(step.type)}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          )}
          {score === 100 && (
            <p className="text-green-700 bg-green-50 p-3 rounded-lg">
              Congratulations! Your website is already using 100% EU-based
              services.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function getRecommendationText(type: string): string {
  switch (type) {
    case "mx_records":
      return "Consider EU email providers like Proton Mail, Infomaniak, or Mailbox.org.";
    case "domain_registrar":
      return "Consider EU domain registrars like Gandi, OVH, or Infomaniak.";
    case "hosting":
      return "Consider EU hosting providers like OVH, Hetzner, or Scaleway.";
    case "services":
      return "Replace non-EU analytics with EU alternatives like Plausible, Simple Analytics, or Matomo.";
    case "cdn":
      return "Consider EU CDN providers like Bunny CDN or KeyCDN.";
    default:
      return "Consider switching to an EU-based alternative.";
  }
}
