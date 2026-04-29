import { getTranslations, getFormatter } from "next-intl/server";
import type { Service } from "@/payload-types";

export async function RecentNews({ service }: { service: Service }) {
  const t = await getTranslations("services.detail.nonEu.redesign.recentNews");
  const format = await getFormatter();

  const items = service.recentNews ?? [];
  if (items.length === 0) return null;

  return (
    <section className="rounded-3xl bg-white border border-black/5 p-6 sm:p-8">
      <h2 className="font-heading uppercase text-2xl sm:text-3xl mb-5">
        {t("title", { name: service.name })}
      </h2>
      <ul className="divide-y divide-black/10">
        {items.map((item, i) => (
          <li
            key={i}
            className="py-3 flex flex-col sm:flex-row sm:items-baseline sm:gap-4"
          >
            <span className="text-xs text-gray-500 sm:w-40 shrink-0">
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
                  className="font-semibold underline"
                >
                  {item.title}
                </a>
              )}
              {item.summary && (
                <p className="text-sm text-gray-700 mt-1">{item.summary}</p>
              )}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
