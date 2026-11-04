import { Container } from "@switch-to-eu/blocks/components/container";
import { PageLayout } from "@switch-to-eu/blocks/components/page-layout";
import { findPage } from "@/lib/content/loader";
import { RichText } from "@/components/rich-text";
import { pageMetadata } from "@/lib/seo";
import type { Metadata, ResolvingMetadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "next-intl";

import { notFound } from "next/navigation";

export async function generateMetadata(
  { params }: { params: Promise<{ locale: Locale }> },
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("terms");

  return pageMetadata({
    parent,
    path: "terms",
    locale,
    title: t("title"),
    description: t("description"),
  });
}

export default async function TermsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);

  const page = findPage("terms", locale);

  if (!page) {
    notFound();
  }

  return (
    <PageLayout paddingTopMobile paddingBottomMobile>
      <section>
        <Container>
          <div className="max-w-4xl mx-auto">
            <div className="mdx-content prose prose-lg max-w-none">
              <RichText data={page.content} />
            </div>
          </div>
        </Container>
      </section>
    </PageLayout>
  );
}
