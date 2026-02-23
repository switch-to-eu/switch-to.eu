import { Container } from "@/components/layout/container";
import { getPageContent } from "@/lib/content/pages/pages";
import { parseMarkdown } from "@/lib/markdown";
import { generateLanguageAlternates } from "@switch-to-eu/i18n/utils";
import { Metadata } from "next";
import { getTranslations, getLocale } from "next-intl/server";
import { Locale } from "next-intl";
import { notFound } from "next/navigation";

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

  // Load privacy policy content from markdown
  const pageData = getPageContent("privacy", locale as Locale);

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