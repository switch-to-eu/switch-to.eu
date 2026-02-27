"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Copy, Check, Link2 } from "lucide-react";
import { Button } from "@switch-to-eu/ui/components/button";

interface JoinCodeDisplayProps {
  joinCode: string;
  shareUrl: string;
}

export function JoinCodeDisplay({ joinCode, shareUrl }: JoinCodeDisplayProps) {
  const t = useTranslations("quiz.lobby");
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="text-center space-y-4">
      <p className="text-sm text-muted-foreground">{t("shareLink")}</p>
      <div className="flex items-center gap-2 rounded-lg border bg-gray-50 px-4 py-3">
        <Link2 className="h-4 w-4 shrink-0 text-muted-foreground" />
        <span className="flex-1 truncate text-sm font-mono text-left">{shareUrl}</span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          {t("joinCode")}: <span className="font-semibold tracking-wider">{joinCode}</span>
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={handleCopy}
          className="gap-2"
        >
          {copied ? (
            <>
              <Check className="h-4 w-4 text-green-600" />
              {t("linkCopied")}
            </>
          ) : (
            <>
              <Copy className="h-4 w-4" />
              {t("copyLink")}
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
