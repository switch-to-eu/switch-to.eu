"use client";

import { useTranslations } from "next-intl";

export default function PrivacyPage() {
  const t = useTranslations("PrivacyPage");

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">{t("title")}</h1>
        <p className="text-neutral-500">{t("placeholder")}</p>
      </div>
    </div>
  );
}
