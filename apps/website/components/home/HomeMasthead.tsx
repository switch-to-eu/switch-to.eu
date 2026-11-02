import { getTranslations } from "next-intl/server";
import { Container } from "@switch-to-eu/blocks/components/container";
import { DecorativeShape } from "@switch-to-eu/blocks/components/decorative-shape";
import { Link } from "@switch-to-eu/i18n/navigation";
import { InlineSearchInput } from "@/components/InlineSearchInput";
import { formatDateline } from "@/lib/news";

/** Services people most often come here to leave. Slugs of non-EU listings. */
const QUICK_SWITCHES = [
  { slug: "gmail", name: "Gmail" },
  { slug: "whatsapp", name: "WhatsApp" },
  { slug: "google-drive", name: "Google Drive" },
  { slug: "chatgpt", name: "ChatGPT" },
  { slug: "x-(twitter)", name: "X" },
];

/**
 * Front-page masthead: today's dateline, the promise in Anton, and the site's
 * main action (search for the service you want to leave) in working form.
 */
export async function HomeMasthead({ locale }: { locale: string }) {
  const t = await getTranslations("home");

  return (
    <section>
      <Container noPaddingMobile>
        <div className="relative overflow-hidden bg-brand-green md:rounded-3xl px-6 sm:px-10 md:px-14 pt-6 pb-10 sm:pb-12 md:pb-14">
          <DecorativeShape
            shape="sunburst"
            className="-top-16 -right-16 w-56 h-56 sm:w-72 sm:h-72"
            color="text-brand-yellow"
            opacity={0.12}
            duration="14s"
          />
          <DecorativeShape
            shape="bumpy-cloud"
            className="-bottom-20 left-1/3 w-48 h-48 sm:w-64 sm:h-64 hidden sm:block"
            color="text-brand-sky"
            opacity={0.1}
            duration="11s"
            delay="-5s"
          />
          <DecorativeShape
            shape="spark"
            className="top-1/2 right-[38%] w-12 h-12 hidden lg:block"
            color="text-brand-pink"
            opacity={0.35}
            duration="8s"
            delay="-2s"
          />

          <div className="relative z-10">
            <p className="flex flex-wrap items-baseline gap-x-3 gap-y-1 border-b border-brand-sky/25 pb-4 mb-8 sm:mb-10 text-sm text-brand-sky">
              <time dateTime={new Date().toISOString().slice(0, 10)} className="font-semibold text-white">
                {formatDateline(new Date(), locale)}
              </time>
              <span aria-hidden="true" className="hidden sm:inline">·</span>
              <span className="basis-full sm:basis-auto">{t("masthead.dateline")}</span>
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-end">
              <h1
                style={{ fontFamily: "var(--font-anton)" }}
                className="lg:col-span-7 uppercase text-brand-yellow leading-[0.92] tracking-[-0.01em] text-[clamp(3rem,7.5vw,6rem)] text-balance">
                {t("heroTaglineLine1")} {t("heroTaglineLine2")} {t("heroTaglineLine3")}
              </h1>

              <div className="lg:col-span-5">
                <p className="text-white text-lg leading-relaxed mb-6 max-w-[42ch]">{t("heroSubtitle")}</p>
                <h2 className="font-heading uppercase text-brand-yellow text-xl sm:text-2xl mb-3">
                  {t("masthead.searchLabel")}
                </h2>
                <InlineSearchInput />
                <div className="mt-5 flex flex-wrap items-center gap-2 text-sm">
                  <span className="text-brand-sky mr-1">{t("masthead.quickLabel")}</span>
                  {QUICK_SWITCHES.map((s) => (
                    <Link
                      key={s.slug}
                      href={`/services/non-eu/${s.slug}`}
                      className="rounded-full border border-brand-sky/40 px-3 py-1 text-white hover:bg-white hover:text-brand-green transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-yellow"
                    >
                      {s.name}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
