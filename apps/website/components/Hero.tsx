"use client";

import { useTranslations } from "next-intl";
import { InlineSearchInput } from "@/components/InlineSearchInput";
import { Link } from "@switch-to-eu/i18n/navigation";
import { BlobShape, PebbleShape, PuddleShape } from "@/components/HeroShapes";

export function Hero() {
  const t = useTranslations("home");

  return (
    <section className="py-4 sm:py-6 md:py-8">
      <div className="container max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
        <div className="bg-brand-navy rounded-3xl">
        <div className="px-4 sm:px-8 md:px-12 lg:px-16 py-12 sm:py-16 md:py-20 lg:py-24">
          <div className="relative text-center">
            <BlobShape
              color="var(--brand-orange)"
              className="absolute -left-8 md:-left-16 -top-8 md:-top-12 w-32 h-32 md:w-52 md:h-52 opacity-30 -rotate-12 pointer-events-none"
              delay={200}
            />
            <PebbleShape
              color="var(--brand-pink)"
              className="absolute -right-4 md:-right-12 -bottom-4 md:-bottom-8 w-32 h-32 md:w-48 md:h-48 opacity-30 rotate-12 pointer-events-none"
              delay={400}
            />
            <PuddleShape
              color="var(--brand-sky)"
              className="absolute right-1/4 -top-6 md:-top-10 w-28 h-28 md:w-44 md:h-44 opacity-25 rotate-45 pointer-events-none"
              delay={600}
            />
            <h1
              className="relative uppercase text-brand-yellow text-center"
              style={{
                fontFamily: "var(--font-anton)",
                fontSize: "clamp(3.5rem, 12vw, 14rem)",
                fontWeight: 400,
                lineHeight: 0.9,
                letterSpacing: "-0.02em",
              }}
            >
              {t("heroLine1")} {t("heroLine2")}
            </h1>
          </div>

          <p className="text-center text-base sm:text-lg md:text-xl text-brand-sky mt-8 sm:mt-10 max-w-2xl mx-auto">
            {t("heroSubtitleShort")}
          </p>

          <div className="mt-6 sm:mt-8 max-w-xl mx-auto">
            <InlineSearchInput />
          </div>

          <div className="flex justify-center gap-3 sm:gap-4 mt-6 sm:mt-8">
            <Link
              href="/services"
              className="px-6 sm:px-8 py-3 bg-brand-yellow text-brand-navy font-medium rounded-full hover:opacity-90 transition-colors text-sm sm:text-base"
            >
              {t("heroViewServices")}
            </Link>
            <Link
              href="/services"
              className="px-6 sm:px-8 py-3 border border-brand-yellow text-brand-yellow font-medium rounded-full hover:bg-brand-yellow hover:text-brand-navy transition-colors text-sm sm:text-base"
            >
              {t("heroViewCategories")}
            </Link>
          </div>
          </div>
        </div>
      </div>
    </section>
  );
}
