import { getTranslations } from "next-intl/server";
import {
  convertLexicalToHTML,
  defaultHTMLConverters,
} from "@payloadcms/richtext-lexical/html";
import type { SerializedEditorState } from "@payloadcms/richtext-lexical/lexical";
import type { Service } from "@/payload-types";

function lexicalToPlainText(data: SerializedEditorState): string {
  const html = convertLexicalToHTML({
    converters: defaultHTMLConverters,
    data,
    disableContainer: true,
  });
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export async function FaqAccordion({ service }: { service: Service }) {
  const t = await getTranslations("services.detail.nonEu.redesign.faq");
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
        text: lexicalToPlainText(f.answer as SerializedEditorState),
      },
    })),
  };

  return (
    <section className="rounded-3xl bg-white border border-black/5 p-6 sm:p-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <h2 className="font-heading uppercase text-2xl sm:text-3xl mb-5">
        {t("title")}
      </h2>
      <div className="space-y-2">
        {faqs.map((f, i) => {
          const html = convertLexicalToHTML({
            converters: defaultHTMLConverters,
            data: f.answer as SerializedEditorState,
            disableContainer: true,
          });
          return (
            <details
              key={i}
              className="rounded-2xl bg-brand-cream px-4 py-3 group"
            >
              <summary className="cursor-pointer list-none font-semibold flex justify-between items-center">
                <span>{f.question}</span>
                <span
                  aria-hidden
                  className="ml-3 text-xl group-open:rotate-45 transition-transform"
                >
                  +
                </span>
              </summary>
              <div
                className="prose prose-sm mt-3 max-w-none"
                dangerouslySetInnerHTML={{ __html: html }}
              />
            </details>
          );
        })}
      </div>
    </section>
  );
}
