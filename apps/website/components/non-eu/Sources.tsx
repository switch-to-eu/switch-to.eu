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
    <section id="sources">
      <h2 className="font-heading uppercase text-2xl sm:text-3xl text-brand-green mb-3">
        {t("title")}
      </h2>
      {lastReviewed && (
        <p className="text-sm text-foreground/55 mb-4">
          {t("lastReviewed", { date: lastReviewed })}
        </p>
      )}
      <ul className="space-y-1.5 text-sm">
        {urls.map((s, i) => (
          <li key={i} className="flex gap-2">
            <span aria-hidden className="text-foreground/40 shrink-0">
              &rarr;
            </span>
            <a
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground underline decoration-foreground/30 hover:decoration-foreground"
            >
              {s.label ?? s.url}
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
