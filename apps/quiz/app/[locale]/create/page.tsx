"use client";

import { useTranslations } from "next-intl";
import { QuizForm } from "@components/quiz-form";

export default function CreateQuizPage() {
  const t = useTranslations("create");

  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="font-bricolage text-3xl font-bold mb-2">{t("title")}</h1>
      <p className="text-muted-foreground mb-8">{t("subtitle")}</p>
      <QuizForm />
    </main>
  );
}
