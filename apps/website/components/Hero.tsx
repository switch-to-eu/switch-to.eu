"use client";

import { useTranslations } from "next-intl";
import { InlineSearchInput } from "@/components/InlineSearchInput";
import { Hero as HeroBlock, HERO_PRESETS } from "@switch-to-eu/blocks/components/hero";

function scrollTo(e: React.MouseEvent<HTMLAnchorElement>) {
  e.preventDefault();
  const id = e.currentTarget.getAttribute("href")?.slice(1);
  if (id) {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  }
}

export function Hero() {
  const t = useTranslations("home");

  return (
    <HeroBlock
      title={t("heroTitle")}
      subtitle={t("heroSubtitleShort")}
      colors={HERO_PRESETS.green}
      titleFont="var(--font-bonbance)"
    >
      <InlineSearchInput />
     
      <div className="flex justify-center gap-3 sm:gap-4 mt-6 sm:mt-8">
        <a
          href="#categories"
          onClick={scrollTo}
          className="px-6 sm:px-8 py-3 bg-brand-yellow text-brand-green font-medium rounded-full hover:opacity-90 transition-colors text-sm sm:text-base"
        >
          {t("heroViewCategories")}
        </a>
        <a
          href="#stand-for"
          onClick={scrollTo}
          className="px-6 sm:px-8 py-3 border border-brand-yellow text-brand-yellow font-medium rounded-full hover:bg-brand-yellow hover:text-brand-green transition-colors text-sm sm:text-base"
        >
          {t("heroWhatWeStandFor")}
        </a>
      </div>
    </HeroBlock>
  );
}
