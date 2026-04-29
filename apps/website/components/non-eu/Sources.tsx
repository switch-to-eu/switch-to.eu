import { getTranslations, getFormatter } from "next-intl/server";
import type { Service } from "@/payload-types";

export async function Sources({ service }: { service: Service }) {
  const t = await getTranslations("services.detail.nonEu.redesign.sources");
  const format = await getFormatter();

  const urls = service.sourceUrls ?? [];
  if (urls.length === 0) return null;

  const lastReviewed = service.lastResearchedAt
    ? format.dateTime(new Date(service.lastResearchedAt), {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  return (
    <section
      id="sources"
      className="rounded-3xl bg-white border border-black/5 p-6 sm:p-8"
    >
      <h2 className="font-heading uppercase text-2xl sm:text-3xl mb-3">
        {t("title")}
      </h2>
      {lastReviewed && (
        <p className="text-sm text-gray-600 mb-4">
          {t("lastReviewed", { date: lastReviewed })}
        </p>
      )}
      <ul className="space-y-1 text-sm">
        {urls.map((s, i) => (
          <li key={i}>
            <a
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              className="underline text-brand-navy"
            >
              {s.label ?? s.url}
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
