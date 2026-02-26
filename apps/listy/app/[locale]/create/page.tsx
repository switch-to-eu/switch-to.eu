"use client";

import { useTranslations } from "next-intl";
import { ListForm } from "@components/list-form";

export default function CreateListPage() {
  const t = useTranslations("CreatePage");

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">{t("title")}</h1>
        <p className="text-neutral-500 mb-8">{t("subtitle")}</p>
        <ListForm />
      </div>
    </div>
  );
}
