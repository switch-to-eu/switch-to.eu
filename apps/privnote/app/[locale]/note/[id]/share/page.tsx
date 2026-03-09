"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { Link } from "@switch-to-eu/i18n/navigation";
import { Button } from "@switch-to-eu/ui/components/button";
import { Check, Copy, Flame, Plus, AlertTriangle } from "lucide-react";
import { useFragment } from "@switch-to-eu/blocks/hooks/use-fragment";
import { PageLayout } from "@switch-to-eu/blocks/components/page-layout";
import { Container } from "@switch-to-eu/blocks/components/container";

export default function SharePage() {
  const t = useTranslations("SharePage");
  const fragment = useFragment();
  const [copied, setCopied] = useState(false);

  const fragmentParams = fragment.ready
    ? {
        key: fragment.params.key ?? "",
        expires: fragment.params.expires ?? "",
        burn: fragment.params.burn === "true",
      }
    : null;

  // Build the share URL: note view URL + encryption key in fragment
  const fullNoteUrl =
    typeof window !== "undefined" && fragmentParams
      ? `${window.location.origin}${window.location.pathname.replace("/share", "")}#key=${encodeURIComponent(fragmentParams.key)}`
      : "";

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(fullNoteUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
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

  if (!fragmentParams) {
    return (
      <PageLayout paddingTopMobile paddingBottomMobile>
      <Container className="max-w-2xl">
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-tool-accent/20 border-t-tool-primary" />
        </div>
      </Container>
    </PageLayout>
    );
  }

  return (
    <PageLayout paddingTopMobile paddingBottomMobile>
      <Container className="max-w-2xl">
      <div className="text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
          <Check className="h-8 w-8 text-success" />
        </div>
        <h1 className="font-heading text-3xl sm:text-4xl uppercase text-foreground">
          {t("title")}
        </h1>
        <p className="mt-3 text-muted-foreground">{t("description")}</p>
      </div>

      <div className="mt-8 rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
        {/* Link display */}
        <div>
          <label className="mb-2 block text-sm font-medium text-foreground">
            {t("linkLabel")}
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              readOnly
              value={fullNoteUrl}
              className="flex-1 rounded-lg border border-border bg-muted px-4 py-2.5 text-sm font-mono text-foreground select-all"
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
        {fragmentParams.expires && (
          <p className="mt-4 text-sm text-muted-foreground">
            {t("expiresIn", { time: formatExpiry(fragmentParams.expires) })}
          </p>
        )}

        {/* Warning */}
        <div className="mt-6 flex items-start gap-3 rounded-lg border border-tool-accent/20 bg-tool-surface/10 p-4">
          <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-tool-accent" />
          <p className="text-sm text-tool-primary">{t("warning")}</p>
        </div>

        {/* Burn warning */}
        {fragmentParams.burn && (
          <div className="mt-4 flex items-start gap-3 rounded-lg border border-destructive/20 bg-destructive/10 p-4">
            <Flame className="mt-0.5 h-5 w-5 flex-shrink-0 text-destructive" />
            <p className="text-sm text-destructive">{t("burnWarning")}</p>
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
    </Container>
    </PageLayout>
  );
}
