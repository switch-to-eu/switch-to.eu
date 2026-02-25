import { Container } from "@/components/layout/container";
import { getPageContent } from "@switch-to-eu/content/services/pages";
import { parseMarkdown } from "@switch-to-eu/content/markdown";
import { generateLanguageAlternates } from "@switch-to-eu/i18n/utils";
import { Metadata } from "next";
import { getTranslations, getLocale } from "next-intl/server";
import { Locale } from "next-intl";
import { notFound } from "next/navigation";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("terms");
  const locale = await getLocale();

  return {
    title: t("title"),
    description: t("description"),
    alternates: generateLanguageAlternates("terms", locale),
  };
}

export default async function TermsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  const pageData = getPageContent("terms", locale as Locale);

  if (!pageData) {
    notFound();
  }

  const { content } = pageData;
  const htmlContent = parseMarkdown(content);

  return (
    <div className="flex flex-col gap-8 sm:gap-12 py-6 md:gap-20 md:py-12">
      <section>
        <Container>
          <div className="max-w-4xl mx-auto">
            <div
              className="mdx-content prose prose-lg max-w-none"
              dangerouslySetInnerHTML={{ __html: htmlContent }}
            />
          </div>
        </Container>
      </section>
    </div>
  );
}
