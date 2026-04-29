import { getTranslations } from "next-intl/server";
import type { Service } from "@/payload-types";

export async function WhatPeopleSay({ service }: { service: Service }) {
  const t = await getTranslations(
    "services.detail.nonEu.redesign.whatPeopleSay"
  );

  const summary = service.userSentiment?.summary;
  const mentions = service.redditMentions ?? [];
  if (!summary && mentions.length === 0) return null;

  return (
    <section>
      <h2 className="font-heading uppercase text-2xl sm:text-3xl text-brand-navy mb-4">
        {t("title", { name: service.name })}
      </h2>
      {summary && (
        <p className="text-base sm:text-lg leading-relaxed text-brand-navy/85 mb-6 max-w-3xl">
          {summary}
        </p>
      )}
      {mentions.length > 0 && (
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-4xl">
          {mentions.slice(0, 4).map((m, i) => (
            <li
              key={i}
              className="rounded-xl border border-brand-navy/10 bg-white p-4"
            >
              <div className="flex items-center gap-2 text-xs mb-2">
                <span className="font-semibold text-brand-navy/70">
                  {t("subreddit", { name: m.subreddit })}
                </span>
                {m.sentiment && (
                  <span
                    className={`rounded-full px-2 py-0.5 text-[11px] uppercase tracking-wider ${
                      m.sentiment === "positive"
                        ? "bg-brand-green/10 text-brand-green"
                        : m.sentiment === "negative"
                          ? "bg-brand-orange/10 text-brand-orange"
                          : "bg-brand-navy/[0.06] text-brand-navy/60"
                    }`}
                  >
                    {m.sentiment}
                  </span>
                )}
              </div>
              {m.snippet && (
                <p className="text-sm text-brand-navy/85 leading-relaxed">
                  &ldquo;{m.snippet}&rdquo;
                </p>
              )}
              {m.postUrl && (
                <a
                  href={m.postUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-brand-navy/55 underline mt-2 inline-block hover:text-brand-navy"
                >
                  {m.postTitle ?? m.postUrl}
                </a>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
