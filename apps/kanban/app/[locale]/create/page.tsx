"use client";

import { useTranslations } from "next-intl";
import { BoardForm } from "@components/board-form";
import { PageLayout } from "@switch-to-eu/blocks/components/page-layout";
import { Container } from "@switch-to-eu/blocks/components/container";

export default function CreateBoardPage() {
  const t = useTranslations("CreatePage");

  return (
    <PageLayout paddingTopMobile paddingBottomMobile>
      <Container className="max-w-2xl">
        <div className="mb-8 text-center">
          <h1 className="font-heading text-3xl sm:text-4xl uppercase text-tool-primary">
            {t("title")}
          </h1>
          <p className="mt-3 text-muted-foreground">{t("subtitle")}</p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
          <BoardForm />
        </div>
      </Container>
    </PageLayout>
  );
}
