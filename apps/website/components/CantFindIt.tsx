import { getTranslations } from "next-intl/server";
import { Container } from "@switch-to-eu/blocks/components/container";

import { InlineSearchInput } from "./InlineSearchInput";

export async function CantFindIt() {
  const t = await getTranslations("home");

  return (
    <section>
      <Container noPaddingMobile>
        <div className="bg-brand-cream md:rounded-3xl border border-brand-green/10 px-6 sm:px-10 md:px-16 py-10 sm:py-12 md:py-14">
          <div className="max-w-2xl mx-auto">
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
