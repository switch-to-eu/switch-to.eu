"use client";

import { useTranslations } from "next-intl";
import { BoardForm } from "@components/board-form";

export default function CreateBoardPage() {
  const t = useTranslations("CreatePage");

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">{t("title")}</h1>
        <p className="text-muted-foreground mb-8">{t("subtitle")}</p>
        <BoardForm />
      </div>
    </div>
  );
}
