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
    <section className="rounded-3xl bg-brand-cream p-6 sm:p-8 md:p-10">
      <h2 className="font-heading uppercase text-2xl sm:text-3xl mb-5">
        {t("title", { name: service.name })}
      </h2>
      {summary && (
        <p className="text-base sm:text-lg leading-relaxed mb-6 max-w-3xl">
          {summary}
        </p>
      )}
      {mentions.length > 0 && (
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {mentions.slice(0, 4).map((m, i) => (
            <li
              key={i}
              className="rounded-2xl bg-white p-4 border border-black/5"
            >
              <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                <span className="font-semibold">
                  {t("subreddit", { name: m.subreddit })}
                </span>
                {m.sentiment && (
                  <span
                    className={`rounded-full px-2 py-0.5 ${
                      m.sentiment === "positive"
                        ? "bg-brand-green/15 text-brand-green"
                        : m.sentiment === "negative"
                          ? "bg-brand-orange/15 text-brand-orange"
                          : "bg-gray-200 text-gray-700"
                    }`}
                  >
                    {m.sentiment}
                  </span>
                )}
              </div>
              {m.snippet && <p className="text-sm">&ldquo;{m.snippet}&rdquo;</p>}
              {m.postUrl && (
                <a
                  href={m.postUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-gray-500 underline mt-2 inline-block"
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
