import { getLocale, getTranslations } from "next-intl/server";
import type { Service } from "@/lib/content/types";
import { markdownToPlainText, renderMarkdown } from "@/lib/markdown";

export async function FaqAccordion({ service }: { service: Service }) {
  const t = await getTranslations("services.detail.nonEu.redesign.faq");
  const locale = await getLocale();
  const faqs = (service.faqs ?? []).filter((f) => f.question && f.answer);
  if (faqs.length === 0) return null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: markdownToPlainText(f.answer),
      },
    })),
  };

  return (
    <section>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <h2 className="font-heading uppercase text-2xl sm:text-3xl text-brand-green mb-5">
        {t("title")}
      </h2>
      <div className="divide-y divide-brand-navy/10 border-y border-brand-navy/10">
        {faqs.map((f, i) => {
          const html = renderMarkdown(f.answer, locale);
          return (
            <details key={i} className="group">
              <summary className="cursor-pointer list-none py-4 font-semibold text-foreground flex justify-between items-center gap-4">
                <span>{f.question}</span>
                <span
                  aria-hidden
                  className="text-foreground/55 text-xl shrink-0 group-open:rotate-45 transition-transform"
                >
                  +
                </span>
              </summary>
              <div
                className="prose prose-sm pb-4 max-w-none text-foreground/85"
                dangerouslySetInnerHTML={{ __html: html }}
              />
            </details>
          );
        })}
      </div>
    </section>
  );
}
