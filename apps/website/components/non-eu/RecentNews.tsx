import { getTranslations, getFormatter } from "next-intl/server";
import type { Service } from "@/payload-types";

export async function RecentNews({ service }: { service: Service }) {
  const t = await getTranslations("services.detail.nonEu.redesign.recentNews");
  const format = await getFormatter();

  const items = service.recentNews ?? [];
  if (items.length === 0) return null;

  return (
    <section className="max-w-3xl">
      <h2 className="font-heading uppercase text-2xl sm:text-3xl text-brand-navy mb-5">
        {t("title", { name: service.name })}
      </h2>
      <ul className="divide-y divide-brand-navy/10">
        {items.map((item, i) => (
          <li
            key={i}
            className="py-4 flex flex-col sm:flex-row sm:items-baseline sm:gap-5"
          >
            <span className="text-xs text-brand-navy/55 sm:w-44 shrink-0">
              {item.date
                ? format.dateTime(new Date(item.date), {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })
                : null}
              {item.source ? ` · ${item.source}` : ""}
            </span>
            <div className="flex-1">
              {item.title && (
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-brand-navy underline decoration-brand-navy/30 hover:decoration-brand-navy"
                >
                  {item.title}
                </a>
              )}
              {item.summary && (
                <p className="text-sm text-brand-navy/75 mt-1 leading-relaxed">
                  {item.summary}
                </p>
              )}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
