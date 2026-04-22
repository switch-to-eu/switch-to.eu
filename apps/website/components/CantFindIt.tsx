import { getTranslations } from "next-intl/server";
import { Container } from "@switch-to-eu/blocks/components/container";
import { DecorativeShape } from "@switch-to-eu/blocks/components/decorative-shape";

import { InlineSearchInput } from "./InlineSearchInput";

export async function CantFindIt() {
  const t = await getTranslations("home");

  return (
    <section>
      <Container noPaddingMobile>
        <div className="relative overflow-hidden bg-brand-cream md:rounded-3xl border border-brand-green/10 px-6 sm:px-10 md:px-16 py-10 sm:py-12 md:py-14">
          <DecorativeShape
            shape="sunburst"
            className="-top-12 -left-10 w-36 h-36 sm:w-48 sm:h-48"
            color="text-brand-pink"
            opacity={0.55}
            duration="9s"
          />
          <DecorativeShape
            shape="heart"
            className="-bottom-10 -right-8 w-32 h-32 sm:w-44 sm:h-44"
            color="text-brand-sage"
            opacity={0.45}
            duration="11s"
            delay="-4s"
          />
          <DecorativeShape
            shape="spark"
            className="top-6 right-6 w-10 h-10 sm:w-14 sm:h-14 hidden sm:block"
            color="text-brand-orange"
            opacity={0.55}
            duration="7s"
            delay="-2s"
          />

          <div className="relative z-10 max-w-2xl mx-auto">
            <h2 className="font-heading text-3xl sm:text-4xl uppercase text-brand-green text-center mb-3 sm:mb-4">
              {t("cantFindItTitle")}
            </h2>
            <p className="text-brand-green/70 text-base sm:text-lg text-center mb-6 sm:mb-8">
              {t("cantFindItSubtitle")}
            </p>
            <InlineSearchInput />
          </div>
        </div>
      </Container>
    </section>
  );
}
