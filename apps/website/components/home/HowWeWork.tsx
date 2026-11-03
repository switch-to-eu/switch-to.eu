import { getTranslations } from "next-intl/server";
import { Container } from "@switch-to-eu/blocks/components/container";
import { DecorativeShape } from "@switch-to-eu/blocks/components/decorative-shape";

const ITEMS = [
  { title: "sourcesTitle", body: "sourcesBody" },
  { title: "tradeoffsTitle", body: "tradeoffsBody" },
  { title: "openTitle", body: "openBody" },
  { title: "affiliateTitle", body: "affiliateBody" },
] as const;

/** Concrete trust signals: how we source, what we disclose, where it's open. */
export async function HowWeWork() {
  const t = await getTranslations("home.howWeWork");

  return (
    <section aria-labelledby="how-we-work-title">
      <Container noPaddingMobile>
        <div className="relative overflow-hidden bg-brand-sage/25 md:rounded-3xl px-6 sm:px-10 md:px-14 py-12 sm:py-14 md:py-16">
          <DecorativeShape
            shape="flower"
            className="-top-14 -left-12 w-44 h-44 sm:w-56 sm:h-56"
            color="text-brand-sage"
            opacity={0.6}
            duration="13s"
          />
          <DecorativeShape
            shape="squiggle"
            className="-bottom-12 right-10 w-40 h-40 sm:w-52 sm:h-52"
            color="text-brand-yellow"
            opacity={0.3}
            duration="10s"
            delay="-4s"
          />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10">
            <div className="lg:col-span-4">
              <h2
                id="how-we-work-title"
                className="font-heading uppercase text-brand-green text-4xl sm:text-5xl md:text-6xl leading-none mb-6"
              >
                {t("title")}
              </h2>
              <a
                href="https://github.com/switch-to-eu/switch-to.eu"
                className="inline-block rounded-full border-2 border-brand-green px-5 py-2 text-sm font-semibold text-brand-green hover:bg-brand-green hover:text-white transition-colors focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-green"
              >
                {t("githubCta")} ↗
              </a>
            </div>

            <dl className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-8">
              {ITEMS.map((item) => (
                <div key={item.title} className="border-t border-brand-green/20 pt-5">
                  <dt className="font-heading uppercase text-brand-green text-2xl leading-tight mb-2">
                    {t(item.title)}
                  </dt>
                  <dd className="text-[#1a1a1a] leading-relaxed">{t(item.body)}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </Container>
    </section>
  );
}
