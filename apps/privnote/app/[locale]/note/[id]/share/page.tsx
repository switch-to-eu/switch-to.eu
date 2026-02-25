"use client";

import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Link } from "@switch-to-eu/i18n/navigation";
import { Button } from "@switch-to-eu/ui/components/button";
import { Check, Copy, Flame, Plus, AlertTriangle } from "lucide-react";

export default function SharePage() {
  const t = useTranslations("SharePage");
  const searchParams = useSearchParams();
  const [copied, setCopied] = useState(false);

  const expiresAt = searchParams.get("expires");
  const burn = searchParams.get("burn") === "true";

  const fullNoteUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}${window.location.pathname.replace("/share", "")}`
      : "";

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(fullNoteUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const input = document.createElement("input");
      input.value = fullNoteUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatExpiry = (isoDate: string) => {
    const diff = new Date(isoDate).getTime() - Date.now();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ${hours % 24}h`;
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    return `${minutes}m`;
  };

  return (
    <main className="mx-auto max-w-2xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <div className="text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <Check className="h-8 w-8 text-green-600" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          {t("title")}
        </h1>
        <p className="mt-3 text-gray-600">{t("description")}</p>
      </div>

      <div className="mt-8 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
        {/* Link display */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            {t("linkLabel")}
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              readOnly
              value={fullNoteUrl}
              className="flex-1 rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm font-mono text-gray-700 select-all"
              onClick={(e) => (e.target as HTMLInputElement).select()}
            />
            <Button
              onClick={handleCopy}
              variant={copied ? "default" : "outline"}
              className={copied ? "gradient-primary text-white border-0" : ""}
            >
              {copied ? (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  {t("copiedButton")}
                </>
              ) : (
                <>
                  <Copy className="mr-2 h-4 w-4" />
                  {t("copyButton")}
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Expiry info */}
        {expiresAt && (
          <p className="mt-4 text-sm text-gray-500">
            {t("expiresIn", { time: formatExpiry(expiresAt) })}
          </p>
        )}

        {/* Warning */}
        <div className="mt-6 flex items-start gap-3 rounded-lg border border-amber-100 bg-amber-50/50 p-4">
          <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-500" />
          <p className="text-sm text-amber-700">{t("warning")}</p>
        </div>

        {/* Burn warning */}
        {burn && (
          <div className="mt-4 flex items-start gap-3 rounded-lg border border-red-100 bg-red-50/50 p-4">
            <Flame className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-500" />
            <p className="text-sm text-red-700">{t("burnWarning")}</p>
          </div>
        )}
      </div>

      {/* Create another */}
      <div className="mt-8 text-center">
        <Link href="/create">
          <Button variant="outline">
            <Plus className="mr-2 h-4 w-4" />
            {t("createAnother")}
          </Button>
        </Link>
      </div>
    </main>
  );
}
