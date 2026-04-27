import type { Metadata } from "next";
import { useTranslations } from "next-intl";
import { hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { CreateNoteForm } from "@components/create-note-form";
import { PageLayout } from "@switch-to-eu/blocks/components/page-layout";
import { Container } from "@switch-to-eu/blocks/components/container";
import { routing, type Locale } from "@switch-to-eu/i18n/routing";
import { generateLanguageAlternates } from "@switch-to-eu/i18n/utils";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  return {
    alternates: generateLanguageAlternates("create", locale as Locale),
  };
}

export default function CreatePage() {
  const t = useTranslations("CreatePage");

  return (
    <PageLayout paddingTopMobile paddingBottomMobile>
      <Container className="max-w-2xl">
        <div className="mb-8 text-center">
          <h1 className="font-heading text-3xl sm:text-4xl uppercase text-foreground">
            {t("title")}
          </h1>
          <p className="mt-3 text-muted-foreground">{t("description")}</p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
          <CreateNoteForm />
        </div>
      </Container>
    </PageLayout>
  );
}
