"use client";

import { useTranslations } from "next-intl";
import { Link } from "@switch-to-eu/i18n/navigation";
import { Button } from "@switch-to-eu/ui/components/button";
import { KanbanSquare, Lock, Eye, Trash2 } from "lucide-react";

export default function HomePage() {
  const t = useTranslations("HomePage");

  return (
    <main>
      {/* Hero */}
      <section className="relative overflow-hidden header-bg">
        <div className="container mx-auto px-4 py-20 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-tool-primary/10 px-4 py-1.5 text-sm font-medium text-tool-primary mb-6">
            <KanbanSquare className="h-4 w-4" />
            {t("hero.disclaimer")}
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight mb-2">
            <span className="gradient-primary bg-clip-text text-transparent">{t("hero.title")}</span>
            {", "}
            <span className="text-foreground">{t("hero.subtitle")}</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mt-4 mb-8">
            {t("hero.description")}
          </p>
          <Link href="/create">
            <Button size="lg" className="gradient-primary text-white font-semibold px-8">
              {t("hero.cta")}
            </Button>
          </Link>
        </div>
      </section>

      {/* Trust badges */}
      <section className="border-y bg-card">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center text-sm text-muted-foreground">
            <div className="flex flex-col items-center gap-2">
              <KanbanSquare className="h-5 w-5 text-tool-primary" />
              <span>{t("trust.badges.noAccount")}</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Lock className="h-5 w-5 text-tool-primary" />
              <span>{t("trust.badges.encrypted")}</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Trash2 className="h-5 w-5 text-tool-primary" />
              <span>{t("trust.badges.autoDelete")}</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Eye className="h-5 w-5 text-tool-primary" />
              <span>{t("trust.badges.openSource")}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold">{t("benefits.title")}</h2>
            <p className="text-muted-foreground mt-2">{t("benefits.description")}</p>
          </div>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="rounded-xl border bg-card p-6">
              <Lock className="h-8 w-8 text-tool-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">{t("benefits.privacy.title")}</h3>
              <p className="text-muted-foreground">{t("benefits.privacy.description")}</p>
            </div>
            <div className="rounded-xl border bg-card p-6">
              <Eye className="h-8 w-8 text-tool-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">{t("benefits.encrypted.title")}</h3>
              <p className="text-muted-foreground">{t("benefits.encrypted.description")}</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-card border-t">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">{t("cta.title")}</h2>
          <p className="text-muted-foreground mb-8">{t("cta.description")}</p>
          <Link href="/create">
            <Button size="lg" className="gradient-primary text-white font-semibold px-8">
              {t("cta.button")}
            </Button>
          </Link>
        </div>
      </section>
    </main>
  );
}
