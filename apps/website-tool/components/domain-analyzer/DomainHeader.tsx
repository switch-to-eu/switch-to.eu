"use client";

import {
  Globe,
  Mail,
  Server,
  Shield,
  Cloud,
  Layers,
  CheckCircle2Icon,
  XCircleIcon,
  MinusCircleIcon,
} from "lucide-react";
import { AnalysisStep } from "@/lib/types";
import { cn } from "@switch-to-eu/ui/lib/utils";
import { Banner } from "@switch-to-eu/blocks/components/banner";

const SERVICE_META: Record<
  AnalysisStep["type"],
  { icon: typeof Globe; label: string }
> = {
  mx_records: { icon: Mail, label: "Email" },
  domain_registrar: { icon: Globe, label: "Registrar" },
  hosting: { icon: Server, label: "Hosting" },
  cdn: { icon: Cloud, label: "CDN" },
  services: { icon: Layers, label: "Services" },
};

function getOverallStatus(results: AnalysisStep[]) {
  const completed = results.filter((s) => s.status === "complete");
  if (completed.length === 0) return null;

  const nonEu = completed.filter(
    (s) => s.isEU === false && s.euFriendly === false
  ).length;
  const eu = completed.filter(
    (s) => s.isEU === true || s.euFriendly === true
  ).length;

  if (nonEu === 0) return "green";
  if (eu === 0) return "red";
  return "yellow";
}

interface DomainHeaderProps {
  domain: string;
  results: AnalysisStep[] | null;
}

export function DomainHeader({ domain, results }: DomainHeaderProps) {
  const status = results ? getOverallStatus(results) : null;

  return (
    <Banner
      color="bg-brand-green"
      shapes={[
        {
          shape: "sunburst",
          className: "-top-8 -right-8 w-40 h-40 sm:w-52 sm:h-52",
          opacity: 0.08,
          duration: "8s",
        },
        {
          shape: "pebble",
          className: "-bottom-6 -left-6 w-28 h-28",
          opacity: 0.06,
          duration: "10s",
          delay: "-3s",
        },
      ]}
    >
      <div className="flex flex-col gap-6">
        {/* Domain + status */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
          <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl uppercase text-brand-yellow leading-none">
            {domain}
          </h1>
          {status && (
            <span
              className={cn(
                "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold self-start sm:self-auto",
                status === "green" && "bg-white/20 text-white",
                status === "yellow" && "bg-brand-yellow text-brand-green",
                status === "red" && "bg-brand-red text-white"
              )}
            >
              <Shield className="w-3.5 h-3.5" />
              {status === "green"
                ? "EU Compliant"
                : status === "yellow"
                  ? "Needs improvement"
                  : "Needs attention"}
            </span>
          )}
        </div>

        {/* Service status indicators */}
        {results && results.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {results.map((step) => {
              const meta = SERVICE_META[step.type];
              if (!meta) return null;
              const Icon = meta.icon;

              const isEu = step.isEU === true || step.euFriendly === true;
              const isNonEu =
                step.isEU === false && step.euFriendly === false;
              const isPending = step.status !== "complete";

              return (
                <div
                  key={step.type}
                  className={cn(
                    "flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium",
                    isPending && "bg-white/10 text-white/50",
                    !isPending && isEu && "bg-brand-sage text-brand-green",
                    !isPending && isNonEu && "bg-brand-red text-white",
                    !isPending && !isEu && !isNonEu && "bg-white/10 text-white/50"
                  )}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{meta.label}</span>
                  {!isPending && isEu && (
                    <CheckCircle2Icon className="w-3.5 h-3.5" />
                  )}
                  {!isPending && isNonEu && (
                    <XCircleIcon className="w-3.5 h-3.5" />
                  )}
                  {!isPending && !isEu && !isNonEu && (
                    <MinusCircleIcon className="w-3.5 h-3.5" />
                  )}
                  {isPending && (
                    <div className="w-3.5 h-3.5 rounded-full border border-white/40 border-t-transparent animate-spin" />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Banner>
  );
}
