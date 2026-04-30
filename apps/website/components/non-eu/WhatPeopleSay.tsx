import { getTranslations } from "next-intl/server";
import type { Service } from "@/payload-types";

const SENTIMENT_DOT: Record<string, string> = {
  positive: "bg-brand-green",
  negative: "bg-brand-orange",
  neutral: "bg-foreground/30",
  mixed: "bg-foreground/30",
};

export async function WhatPeopleSay({ service }: { service: Service }) {
  const t = await getTranslations(
    "services.detail.nonEu.redesign.whatPeopleSay"
  );

  const summary = service.userSentiment?.summary;
  const mentions = (service.redditMentions ?? []).filter((m) => m.snippet);
  if (!summary && mentions.length === 0) return null;

  const visibleMentions = mentions.slice(0, 4);

  return (
    <section className="max-w-2xl">
      <h2 className="font-heading uppercase text-2xl sm:text-3xl text-brand-green mb-4">
        {t("title", { name: service.name })}
      </h2>

      {summary && (
        <p className="text-base sm:text-lg leading-relaxed text-foreground/85 mb-10">
          {summary}
        </p>
      )}

      {visibleMentions.length > 0 && (
        <div className="space-y-7 sm:space-y-8">
          {visibleMentions.map((m, i) => {
            const sentimentDot = m.sentiment
              ? (SENTIMENT_DOT[m.sentiment] ?? "bg-foreground/30")
              : null;

            return (
              <figure key={i}>
                <blockquote className="text-lg sm:text-xl leading-snug italic text-foreground/90">
                  &ldquo;{m.snippet}&rdquo;
                </blockquote>
                {sentimentDot && (
                  <figcaption className="mt-2 inline-flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-foreground/45">
                    <span
                      aria-hidden
                      className={`w-1.5 h-1.5 rounded-full ${sentimentDot}`}
                    />
                    {m.sentiment}
                  </figcaption>
                )}
              </figure>
            );
          })}
        </div>
      )}
    </section>
  );
}
