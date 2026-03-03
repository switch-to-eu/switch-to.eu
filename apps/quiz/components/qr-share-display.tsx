"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { QRCodeSVG } from "qrcode.react";
import { Copy, Check, Link2 } from "lucide-react";
import { Button } from "@switch-to-eu/ui/components/button";

interface QrShareDisplayProps {
  shareUrl: string;
}

export function QrShareDisplay({ shareUrl }: QrShareDisplayProps) {
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
      <div className="flex justify-center">
        <div className="rounded-xl border bg-card p-4">
          <QRCodeSVG value={shareUrl} size={256} level="M" />
        </div>
      </div>
      <div className="flex items-center gap-2 rounded-lg border bg-muted px-4 py-3">
        <Link2 className="h-4 w-4 shrink-0 text-muted-foreground" />
        <span className="flex-1 truncate text-sm font-mono text-left">{shareUrl}</span>
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={handleCopy}
        className="gap-2"
      >
        {copied ? (
          <>
            <Check className="h-4 w-4 text-success" />
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
  );
}
