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
} from "lucide-react";

export default function HomePage() {
  const t = useTranslations("HomePage");

  return (
    <main>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="header-bg absolute inset-0" />
        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-tool-accent/20 bg-tool-surface/10 px-4 py-1.5 text-sm font-medium text-tool-primary">
              <Flame className="h-4 w-4" />
              {t("hero.floatingBadge")}
            </div>
            <h1 className="text-4xl font-black tracking-tight text-foreground sm:text-6xl">
              {t("hero.title")}{" "}
              <span className="gradient-primary bg-clip-text text-transparent">
                {t("hero.subtitle")}
              </span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-muted-foreground">
              {t("hero.description")}
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-4">
              <Link href="/create">
                <Button size="lg" className="gradient-primary text-white border-0">
                  <FileWarning className="mr-2 h-5 w-5" />
                  <span className="hidden sm:inline">{t("hero.cta")}</span>
                  <span className="sm:hidden">{t("hero.ctaMobile")}</span>
                </Button>
              </Link>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">{t("hero.disclaimer")}</p>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              {t("benefits.title")}
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              {t("benefits.description")}
            </p>
          </div>
          <div className="mx-auto mt-12 grid max-w-5xl gap-8 sm:grid-cols-3">
            <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
              <div className="mb-4 inline-flex rounded-lg bg-destructive/10 p-3">
                <Flame className="h-6 w-6 text-destructive" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">
                {t("benefits.selfDestruct.title")}
              </h3>
              <p className="mt-2 text-muted-foreground">
                {t("benefits.selfDestruct.description")}
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
              <div className="mb-4 inline-flex rounded-lg bg-tool-surface/10 p-3">
                <Shield className="h-6 w-6 text-tool-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">
                {t("benefits.encrypted.title")}
              </h3>
              <p className="mt-2 text-muted-foreground">
                {t("benefits.encrypted.description")}
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
              <div className="mb-4 inline-flex rounded-lg bg-tool-accent/10 p-3">
                <Timer className="h-6 w-6 text-tool-accent" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">
                {t("benefits.timer.title")}
              </h3>
              <p className="mt-2 text-muted-foreground">
                {t("benefits.timer.description")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-card py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              {t("howItWorks.title")}
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              {t("howItWorks.description")}
            </p>
          </div>
          <div className="mx-auto mt-12 grid max-w-4xl gap-8 sm:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full gradient-primary text-white font-bold text-lg">
                1
              </div>
              <h3 className="text-lg font-semibold text-foreground">
                {t("howItWorks.step1.title")}
              </h3>
              <p className="mt-2 text-muted-foreground">
                {t("howItWorks.step1.description")}
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full gradient-primary text-white font-bold text-lg">
                2
              </div>
              <h3 className="text-lg font-semibold text-foreground">
                {t("howItWorks.step2.title")}
              </h3>
              <p className="mt-2 text-muted-foreground">
                {t("howItWorks.step2.description")}
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full gradient-primary text-white font-bold text-lg">
                3
              </div>
              <h3 className="text-lg font-semibold text-foreground">
                {t("howItWorks.step3.title")}
              </h3>
              <p className="mt-2 text-muted-foreground">
                {t("howItWorks.step3.description")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-center gap-4">
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm text-foreground">
              <Mail className="h-4 w-4 text-muted-foreground" />
              {t("trust.badges.noEmail")}
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm text-foreground">
              <Trash2 className="h-4 w-4 text-muted-foreground" />
              {t("trust.badges.autoDelete")}
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm text-foreground">
              <Lock className="h-4 w-4 text-muted-foreground" />
              {t("trust.badges.encrypted")}
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm text-foreground">
              <Code className="h-4 w-4 text-muted-foreground" />
              {t("trust.badges.european")}
            </span>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl rounded-2xl gradient-primary p-8 text-center text-white sm:p-12">
            <h2 className="text-2xl font-bold sm:text-3xl">{t("cta.title")}</h2>
            <p className="mt-4 text-white/80">{t("cta.description")}</p>
            <div className="mt-8">
              <Link href="/create">
                <Button
                  size="lg"
                  variant="secondary"
                  className="bg-card text-foreground hover:bg-muted"
                >
                  <span className="hidden sm:inline">{t("cta.button")}</span>
                  <span className="sm:hidden">{t("cta.buttonMobile")}</span>
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
