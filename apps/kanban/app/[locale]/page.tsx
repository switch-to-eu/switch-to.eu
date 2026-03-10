"use client";

import { useTranslations } from "next-intl";
import { Link } from "@switch-to-eu/i18n/navigation";
import { Button } from "@switch-to-eu/ui/components/button";
import { KanbanSquare, Lock, Eye, Trash2, ArrowRight } from "lucide-react";
import { Banner } from "@switch-to-eu/blocks/components/banner";
import { PageLayout } from "@switch-to-eu/blocks/components/page-layout";
import { Container } from "@switch-to-eu/blocks/components/container";

export default function HomePage() {
  const t = useTranslations("HomePage");

  return (
    <PageLayout gapMobile>

      {/* Hero */}
      <Container noPaddingMobile>
      <Banner
        color="bg-brand-navy"
        shapes={[
          { shape: "spark", className: "-top-8 -right-8 w-40 h-40 sm:w-52 sm:h-52", opacity: 0.15, duration: "8s" },
          { shape: "blob", className: "-bottom-6 -left-6 w-32 h-32 sm:w-40 sm:h-40", opacity: 0.1, duration: "10s", delay: "-3s" },
          { shape: "cross", className: "top-1/4 left-8 w-16 h-16", opacity: 0.1, duration: "7s", delay: "-1.5s" },
        ]}
        contentClassName="text-center max-w-3xl mx-auto"
      >
        <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-sm font-medium text-white">
          <KanbanSquare className="h-4 w-4" />
          {t("hero.disclaimer")}
        </div>
        <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl uppercase text-white mb-6 leading-tight">
          {t("hero.title")}{" "}
          <span className="text-white/80">
            {t("hero.subtitle")}
          </span>
        </h1>
        <p className="text-brand-sky text-lg mb-10">
          {t("hero.description")}
        </p>
        <Link href="/create">
          <Button size="lg" className="bg-brand-sage text-foreground hover:bg-brand-sage/90 border-0 rounded-full px-8 font-semibold">
            <KanbanSquare className="mr-2 h-5 w-5" />
            {t("hero.cta")}
          </Button>
        </Link>
      </Banner>
      </Container>

      {/* Trust badges */}
      <Container>
      <div className="flex flex-wrap items-center justify-center gap-3">
        {([
          { icon: KanbanSquare, key: "noAccount" },
          { icon: Lock, key: "encrypted" },
          { icon: Trash2, key: "autoDelete" },
          { icon: Eye, key: "openSource" },
        ] as const).map(({ icon: Icon, key }) => (
          <span key={key} className="inline-flex items-center gap-2 rounded-full border border-brand-navy/20 bg-white px-4 py-2 text-sm text-brand-navy font-medium">
            <Icon className="h-4 w-4 text-brand-navy/60" />
            {t(`trust.badges.${key}`)}
          </span>
        ))}
      </div>
      </Container>

      {/* Benefits */}
      <Container>
        <div className="text-center mb-10 sm:mb-12">
          <h2 className="font-heading text-4xl sm:text-5xl uppercase text-brand-navy mb-4">
            {t("benefits.title")}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t("benefits.description")}
          </p>
        </div>
        <div className="grid gap-4 md:gap-6 sm:grid-cols-2 max-w-4xl mx-auto">
          <div className="bg-white border border-brand-navy/20 rounded-3xl p-6 sm:p-8 flex flex-col gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-navy/10">
              <Lock className="h-6 w-6 text-brand-navy" />
            </div>
            <h3 className="font-heading text-2xl uppercase text-brand-navy">
              {t("benefits.privacy.title")}
            </h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {t("benefits.privacy.description")}
            </p>
          </div>
          <div className="bg-white border border-brand-navy/20 rounded-3xl p-6 sm:p-8 flex flex-col gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-navy/10">
              <Eye className="h-6 w-6 text-brand-navy" />
            </div>
            <h3 className="font-heading text-2xl uppercase text-brand-navy">
              {t("benefits.encrypted.title")}
            </h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {t("benefits.encrypted.description")}
            </p>
          </div>
        </div>
      </Container>

      {/* CTA */}
      <Container noPaddingMobile>
      <Banner
        color="bg-brand-navy"
        shapes={[
          { shape: "tulip", className: "-top-6 -right-6 w-36 h-36", opacity: 0.1, duration: "7s" },
        ]}
        contentClassName="text-center max-w-2xl mx-auto"
      >
        <h2 className="font-heading text-4xl sm:text-5xl uppercase text-white mb-4">
          {t("cta.title")}
        </h2>
        <p className="text-brand-sky text-lg mb-8">
          {t("cta.description")}
        </p>
        <Link href="/create">
          <Button
            size="lg"
            className="bg-brand-sage text-foreground hover:bg-brand-sage/90 border-0 rounded-full px-8 font-semibold"
          >
            {t("cta.button")}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </Banner>
      </Container>
    </PageLayout>
  );
}
