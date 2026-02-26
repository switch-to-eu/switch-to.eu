"use client";

import { useTranslations } from "next-intl";

export default function CreateListPage() {
  const t = useTranslations('CreatePage');

  return (
    <div className="container mx-auto py-12">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">{t('title')}</h1>
        <p className="text-neutral-600">{t('placeholder')}</p>
        {/* TODO: List creation form with preset selection */}
      </div>
    </div>
  );
}
