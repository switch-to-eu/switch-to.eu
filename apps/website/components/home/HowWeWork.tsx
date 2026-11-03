import { getTranslations } from "next-intl/server";
import { Container } from "@switch-to-eu/blocks/components/container";

const ITEMS = [
  { title: "sourcesTitle", body: "sourcesBody", dot: "bg-brand-yellow" },
  { title: "tradeoffsTitle", body: "tradeoffsBody", dot: "bg-brand-orange" },
  { title: "openTitle", body: "openBody", dot: "bg-brand-sky" },
  { title: "affiliateTitle", body: "affiliateBody", dot: "bg-brand-pink" },
] as const;

/** Concrete trust signals: how we source, what we disclose, where it's open. */
export async function HowWeWork() {
  const t = await getTranslations("home.howWeWork");

  return (
    <section aria-labelledby="how-we-work-title">
      <Container noPaddingMobile>
        <div className="relative overflow-hidden bg-brand-green md:rounded-3xl px-6 sm:px-10 md:px-14 py-12 sm:py-14 md:py-16">

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10">
            <div className="lg:col-span-4">
              <h2
                id="how-we-work-title"
                className="font-heading text-brand-yellow text-3xl sm:text-4xl md:text-5xl leading-none mb-6"
              >
                {t("title")}
              </h2>
              <a
                href="https://github.com/switch-to-eu/switch-to.eu"
                className="inline-block rounded-full border-2 border-brand-yellow px-5 py-2 text-sm font-semibold text-brand-yellow hover:bg-brand-yellow hover:text-brand-green transition-colors focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-yellow"
              >
                {t("githubCta")} ↗
              </a>
            </div>

            <dl className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-8">
              {ITEMS.map((item) => (
                <div key={item.title} className="border-t border-white/20 pt-5">
                  <span aria-hidden="true" className={`block h-3 w-3 rounded-full mb-3 ${item.dot}`} />
                  <dt className="font-heading text-white text-2xl leading-tight mb-2">
                    {t(item.title)}
                  </dt>
                  <dd className="text-white/90 leading-relaxed">{t(item.body)}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </Container>
    </section>
  );
}
