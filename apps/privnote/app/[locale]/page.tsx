"use client";

import { useTranslations } from "next-intl";
import { Link } from "@switch-to-eu/i18n/navigation";
import { Button } from "@switch-to-eu/ui/components/button";
import {
  Flame,
  Shield,
  Timer,
  ArrowRight,
  FileWarning,
  Lock,
  Mail,
  Trash2,
  Code,
  Bot,
  ArrowUpRight,
} from "lucide-react";
import { Banner } from "@switch-to-eu/blocks/components/banner";

export default function HomePage() {
  const t = useTranslations("HomePage");

  return (
    <main className="container max-w-7xl mx-auto flex flex-col gap-8 sm:gap-12 md:gap-16 py-8 sm:py-12 md:px-6 lg:px-8">

      {/* Hero */}
      <Banner
        color="bg-brand-orange"
        shapes={[
          { shape: "spark", className: "-top-8 -right-8 w-40 h-40 sm:w-52 sm:h-52", opacity: 0.15, duration: "8s" },
          { shape: "blob", className: "-bottom-6 -left-6 w-32 h-32 sm:w-40 sm:h-40", opacity: 0.1, duration: "10s", delay: "-3s" },
          { shape: "cross", className: "top-1/4 left-8 w-16 h-16", opacity: 0.1, duration: "7s", delay: "-1.5s" },
        ]}
        contentClassName="text-center max-w-3xl mx-auto"
      >
        <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-sm font-medium text-white">
          <Flame className="h-4 w-4" />
          {t("hero.floatingBadge")}
        </div>
        <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl uppercase text-white mb-6 leading-tight">
          {t("hero.title")}{" "}
          <span className="text-brand-yellow">
            {t("hero.subtitle")}
          </span>
        </h1>
        <p className="text-white/80 text-lg mb-10">
          {t("hero.description")}
        </p>
        <Link href="/create">
          <Button size="lg" className="bg-brand-yellow text-white hover:bg-brand-yellow/90 border-0 rounded-full px-8 font-semibold">
            <FileWarning className="mr-2 h-5 w-5" />
            <span className="hidden sm:inline">{t("hero.cta")}</span>
            <span className="sm:hidden">{t("hero.ctaMobile")}</span>
          </Button>
        </Link>
        <p className="mt-4 text-sm text-white/60">{t("hero.disclaimer")}</p>
      </Banner>

      {/* Benefits */}
      <div>
        <div className="text-center mb-10 sm:mb-12 px-3 md:px-0">
          <h2 className="font-heading text-4xl sm:text-5xl uppercase text-brand-orange mb-4">
            {t("benefits.title")}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t("benefits.description")}
          </p>
        </div>
        <div className="grid gap-4 md:gap-6 sm:grid-cols-3 px-3 md:px-0">
          <div className="bg-white border border-brand-orange/20 rounded-3xl p-6 sm:p-8 flex flex-col gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-orange/10">
              <Flame className="h-6 w-6 text-brand-orange" />
            </div>
            <h3 className="font-heading text-2xl uppercase text-brand-orange">
              {t("benefits.selfDestruct.title")}
            </h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {t("benefits.selfDestruct.description")}
            </p>
          </div>
          <div className="bg-white border border-brand-orange/20 rounded-3xl p-6 sm:p-8 flex flex-col gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-orange/10">
              <Shield className="h-6 w-6 text-brand-orange" />
            </div>
            <h3 className="font-heading text-2xl uppercase text-brand-orange">
              {t("benefits.encrypted.title")}
            </h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {t("benefits.encrypted.description")}
            </p>
          </div>
          <div className="bg-white border border-brand-orange/20 rounded-3xl p-6 sm:p-8 flex flex-col gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-orange/10">
              <Timer className="h-6 w-6 text-brand-orange" />
            </div>
            <h3 className="font-heading text-2xl uppercase text-brand-orange">
              {t("benefits.timer.title")}
            </h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {t("benefits.timer.description")}
            </p>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <Banner
        color="bg-brand-orange"
        shapes={[
          { shape: "starburst", className: "-top-6 -right-6 w-32 h-32 sm:w-44 sm:h-44", opacity: 0.1, duration: "9s" },
          { shape: "pebble", className: "-bottom-8 -left-8 w-28 h-28", opacity: 0.08, duration: "8s", delay: "-2s" },
        ]}
        contentClassName="text-center max-w-4xl mx-auto"
      >
        <h2 className="font-heading text-4xl sm:text-5xl uppercase text-brand-yellow mb-4">
          {t("howItWorks.title")}
        </h2>
        <p className="text-white/80 text-lg mb-12">
          {t("howItWorks.description")}
        </p>
        <div className="grid gap-8 sm:grid-cols-3">
          {([
            { step: "1", key: "step1" },
            { step: "2", key: "step2" },
            { step: "3", key: "step3" },
          ] as const).map(({ step, key }) => (
            <div key={key} className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-brand-yellow text-brand-orange font-bold text-lg">
                {step}
              </div>
              <h3 className="font-heading text-lg uppercase text-brand-yellow mb-2">
                {t(`howItWorks.${key}.title`)}
              </h3>
              <p className="text-white/70 text-sm">
                {t(`howItWorks.${key}.description`)}
              </p>
            </div>
          ))}
        </div>
      </Banner>

      {/* Trust Badges */}
      <div className="flex flex-wrap items-center justify-center gap-3 px-3 md:px-0">
        {([
          { icon: Mail, key: "noEmail" },
          { icon: Trash2, key: "autoDelete" },
          { icon: Lock, key: "encrypted" },
          { icon: Code, key: "european" },
        ] as const).map(({ icon: Icon, key }) => (
          <span key={key} className="inline-flex items-center gap-2 rounded-full border border-brand-orange/20 bg-white px-4 py-2 text-sm text-brand-orange font-medium">
            <Icon className="h-4 w-4 text-brand-orange/60" />
            {t(`trust.badges.${key}`)}
          </span>
        ))}
      </div>

      {/* MCP Integration */}
      <div className="px-3 md:px-0">
        <Link href="/mcp" className="group block">
          <div className="flex items-center justify-between gap-4 rounded-3xl border border-brand-orange/20 bg-white p-6 sm:p-8 transition-colors hover:border-brand-orange/40">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-orange/10">
                <Bot className="h-6 w-6 text-brand-orange" />
              </div>
              <div>
                <h3 className="font-heading text-2xl uppercase text-brand-orange">
                  {t("mcp.title")}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                  {t("mcp.description")}
                </p>
              </div>
            </div>
            <ArrowUpRight className="h-5 w-5 shrink-0 text-brand-orange/40 transition-colors group-hover:text-brand-orange" />
          </div>
        </Link>
      </div>

      {/* CTA */}
      <Banner
        color="bg-brand-orange"
        shapes={[
          { shape: "tulip", className: "-top-6 -right-6 w-36 h-36", opacity: 0.1, duration: "7s" },
        ]}
        contentClassName="text-center max-w-2xl mx-auto"
      >
        <h2 className="font-heading text-4xl sm:text-5xl uppercase text-brand-yellow mb-4">
          {t("cta.title")}
        </h2>
        <p className="text-white/80 text-lg mb-8">
          {t("cta.description")}
        </p>
        <Link href="/create">
          <Button
            size="lg"
            className="bg-brand-yellow text-white hover:bg-brand-yellow/90 border-0 rounded-full px-8 font-semibold"
          >
            <span className="hidden sm:inline">{t("cta.button")}</span>
            <span className="sm:hidden">{t("cta.buttonMobile")}</span>
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </Banner>
    </main>
  );
}
