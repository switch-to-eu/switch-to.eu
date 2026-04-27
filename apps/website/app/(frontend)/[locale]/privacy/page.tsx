import { Container } from "@switch-to-eu/blocks/components/container";
import { PageLayout } from "@switch-to-eu/blocks/components/page-layout";
import { getPayload, isPreview, publishedWhere } from "@/lib/payload";
import { RichText } from "@/components/rich-text";
import { generateLanguageAlternates } from "@switch-to-eu/i18n/utils";
import { Metadata } from "next";
import { getTranslations, getLocale } from "next-intl/server";

import { notFound } from "next/navigation";
import type { Page } from "@/payload-types";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("privacy");
  const locale = await getLocale();

  return {
    title: t("title"),
    description: t("description"),
    alternates: generateLanguageAlternates("privacy", locale),
  };
}

export default async function PrivacyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  const payload = await getPayload();
  const { docs } = await payload.find({
    collection: "pages",
    where: await publishedWhere({ slug: { equals: "privacy" } }),
    draft: await isPreview(),
    locale: locale as 'en' | 'nl',
    limit: 1,
  });
  const page = docs[0] as Page | undefined;

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
