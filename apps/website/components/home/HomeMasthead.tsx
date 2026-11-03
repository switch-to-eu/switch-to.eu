import { getTranslations } from "next-intl/server";
import { Container } from "@switch-to-eu/blocks/components/container";
import { DecorativeShape } from "@switch-to-eu/blocks/components/decorative-shape";
import { Link } from "@switch-to-eu/i18n/navigation";
import { InlineSearchInput } from "@/components/InlineSearchInput";
import { formatDateline } from "@/lib/news";

/**
 * Services people most often come here to leave. Slugs of non-EU listings.
 */
const QUICK_SWITCHES = [
  { slug: "gmail", name: "Gmail" },
  { slug: "whatsapp", name: "WhatsApp" },
  { slug: "google-drive", name: "Google Drive" },
  { slug: "chatgpt", name: "ChatGPT" },
  { slug: "x-twitter", name: "X" },
];

/**
 * Compact front-page intro. No hero block: one line of promise, the site's
 * main action (search for the service you want to leave) in working form, and
 * the news underneath it straight away.
 */
export async function HomeMasthead({
  locale,
  latestDate,
}: {
  locale: string;
  /** Date of the newest article. The dateline shows this, never "today", so it can't promise news that isn't there. */
  latestDate: string | null;
}) {
  const t = await getTranslations("home");

  return (
    <section>
      <Container noPaddingMobile>
        <div className="relative overflow-hidden bg-brand-green md:rounded-3xl px-6 sm:px-10 md:px-14 py-9 sm:py-12">
          <DecorativeShape
            shape="sunburst"
            className="-top-16 -left-16 w-56 h-56 sm:w-72 sm:h-72"
            color="text-brand-sage"
            opacity={0.12}
            duration="14s"
          />
          <DecorativeShape
            shape="bumpy-cloud"
            className="-bottom-24 right-[30%] w-56 h-56 hidden lg:block"
            color="text-brand-sage"
            opacity={0.1}
            duration="11s"
            delay="-5s"
          />
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 items-end">
            <div className="lg:col-span-6">
              <h1 className="font-heading text-brand-yellow text-4xl sm:text-5xl leading-[1.02] text-balance mb-4">
                {t("heroTaglineLine1")} {t("heroTaglineLine2")}{" "}
                {t("heroTaglineLine3")}
              </h1>
              <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-white/85">
                <span className="inline-flex items-center gap-2 font-semibold text-white">
                  <span
                    aria-hidden="true"
                    className="h-2.5 w-2.5 rounded-full bg-brand-yellow"
                  />
                  {t("masthead.dateline")}
                </span>
                {latestDate && (
                  <span>
                    {t("masthead.lastUpdate")}{" "}
                    <time dateTime={latestDate}>
                      {formatDateline(
                        new Date(`${latestDate}T12:00:00Z`),
                        locale,
                      )}
                    </time>
                  </span>
                )}
              </p>
            </div>

            <div className="lg:col-span-6">
              <h2 className="text-sm font-semibold text-white mb-2">
                {t("masthead.searchLabel")}
              </h2>
              <InlineSearchInput
                placeholder={t("masthead.searchPlaceholder")}
              />
              <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
                <span className="text-white/85 mr-1">
                  {t("masthead.quickLabel")}
                </span>
                {QUICK_SWITCHES.map((s) => (
                  <Link
                    key={s.slug}
                    href={`/services/non-eu/${s.slug}`}
                    className="rounded-full border border-white/40 px-3 py-1 font-semibold text-white hover:bg-brand-yellow hover:border-brand-yellow hover:text-brand-green transition-colors focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-yellow"
                  >
                    {s.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
