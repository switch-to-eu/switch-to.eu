"use client";

import { useTranslations } from "next-intl";
import { Link } from "@switch-to-eu/i18n/navigation";
import { Button } from "@switch-to-eu/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@switch-to-eu/ui/components/card";
import { AlertTriangle, KeyRound, SearchX } from "lucide-react";

export function MissingKeyError() {
  const t = useTranslations("ErrorStates.missingKey");
  return (
    <div className="container mx-auto max-w-lg py-20">
      <Card>
        <CardHeader className="text-center">
          <KeyRound className="mx-auto h-12 w-12 text-amber-500 mb-4" />
          <CardTitle>{t("title")}</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-neutral-600">{t("message")}</p>
          <p className="text-sm text-neutral-500">{t("urlFormat")}</p>
          <code className="block text-sm bg-neutral-100 rounded p-2">{t("urlExample")}</code>
        </CardContent>
      </Card>
    </div>
  );
}

export function GroupNotFoundError({ isAdmin = false }: { isAdmin?: boolean }) {
  const t = useTranslations("ErrorStates.groupNotFound");
  return (
    <div className="container mx-auto max-w-lg py-20">
      <Card>
        <CardHeader className="text-center">
          <SearchX className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <CardTitle>{isAdmin ? t("titleAdmin") : t("title")}</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-neutral-600">
            {isAdmin ? t("messageAdmin") : t("message")}
          </p>
          <Link href="/">
            <Button variant="outline">{t("returnHome")}</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}

export function DecryptionError({ message }: { message?: string }) {
  const t = useTranslations("ErrorStates.decryption");
  return (
    <div className="container mx-auto max-w-lg py-20">
      <Card>
        <CardHeader className="text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <CardTitle>{t("title")}</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-neutral-600">{t("message")}</p>
          {message && (
            <code className="block text-xs bg-neutral-100 rounded p-2 text-red-600">
              {message}
            </code>
          )}
          <Link href="/">
            <Button variant="outline">{t("returnHome")}</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
