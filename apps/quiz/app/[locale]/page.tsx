import { useTranslations } from "next-intl";
import { Brain, Plus, Share2, Play, Trophy, ArrowRight, Lock, Zap, Globe } from "lucide-react";
import { Button } from "@switch-to-eu/ui/components/button";
import { Link } from "@switch-to-eu/i18n/navigation";
import { Banner } from "@switch-to-eu/blocks/components/banner";

export default function HomePage() {
  const t = useTranslations("home");

  return (
    <main className="container max-w-7xl mx-auto flex flex-col gap-8 sm:gap-12 md:gap-16 py-8 sm:py-12 md:px-6 lg:px-8">

      {/* Hero */}
      <Banner
        color="bg-tool-primary"
        shapes={[
          { shape: "spark", className: "-top-8 -right-8 w-40 h-40 sm:w-52 sm:h-52", opacity: 0.15, duration: "8s" },
          { shape: "blob", className: "-bottom-6 -left-6 w-32 h-32 sm:w-40 sm:h-40", opacity: 0.1, duration: "10s", delay: "-3s" },
          { shape: "cross", className: "top-1/4 left-8 w-16 h-16", opacity: 0.1, duration: "7s", delay: "-1.5s" },
        ]}
        contentClassName="text-center max-w-3xl mx-auto"
      >
        <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-sm font-medium text-white">
          <Brain className="h-4 w-4" />
          {t("hero.badge")}
        </div>
        <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl uppercase text-white mb-6 leading-tight">
          {t("hero.title")}{" "}
          <span className="text-tool-accent">
            {t("hero.titleHighlight")}
          </span>
        </h1>
        <p className="text-white/80 text-lg mb-10">
          {t("hero.subtitle")}
        </p>
        <Link href="/create">
          <Button size="lg" className="bg-white text-tool-primary hover:bg-white/90 border-0 rounded-full px-8 font-semibold">
            <Plus className="mr-2 h-5 w-5" />
            {t("hero.createQuiz")}
          </Button>
        </Link>
      </Banner>

      {/* How it works */}
      <div>
        <div className="text-center mb-10 sm:mb-12 px-3 md:px-0">
          <h2 className="font-heading text-4xl sm:text-5xl uppercase text-brand-green mb-4">
            {t("features.title")}
          </h2>
        </div>
        <div className="grid gap-0 md:gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {([
            { icon: Brain, key: "create" as const, bg: "bg-tool-surface/20" },
            { icon: Share2, key: "share" as const, bg: "bg-tool-surface/30" },
            { icon: Play, key: "play" as const, bg: "bg-tool-surface/20" },
            { icon: Trophy, key: "results" as const, bg: "bg-tool-primary" },
          ]).map(({ icon: Icon, key, bg }) => {
            const isDark = bg === "bg-tool-primary";
            return (
              <div key={key} className={`${bg} md:rounded-3xl p-6 sm:p-8 flex flex-col gap-4`}>
                <div className={`flex h-12 w-12 items-center justify-center rounded-full ${isDark ? "bg-white/15" : "bg-tool-primary/10"}`}>
                  <Icon className={`h-6 w-6 ${isDark ? "text-white" : "text-tool-primary"}`} />
                </div>
                <h3 className={`font-heading text-2xl uppercase ${isDark ? "text-white" : "text-brand-green"}`}>
                  {t(`features.${key}.title`)}
                </h3>
                <p className={`text-sm leading-relaxed ${isDark ? "text-white/80" : "text-brand-green/80"}`}>
                  {t(`features.${key}.description`)}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Privacy */}
      <Banner
        color="bg-brand-navy"
        shapes={[
          { shape: "circle", className: "-top-8 -right-8 w-36 h-36", opacity: 0.1, duration: "9s" },
          { shape: "pebble", className: "-bottom-6 -left-6 w-28 h-28", opacity: 0.08, duration: "8s", delay: "-3s" },
        ]}
        contentClassName="text-center max-w-2xl mx-auto"
      >
        <h2 className="font-heading text-4xl sm:text-5xl uppercase text-brand-yellow mb-4">
          {t("privacy.title")}
        </h2>
        <p className="text-brand-sky text-lg">
          {t("privacy.description")}
        </p>
      </Banner>

      {/* Trust Badges */}
      <div className="flex flex-wrap items-center justify-center gap-3 px-3 md:px-0">
        {([
          { icon: Lock, key: "encrypted" },
          { icon: Zap, key: "realtime" },
          { icon: Globe, key: "european" },
        ] as const).map(({ icon: Icon, key }) => (
          <span key={key} className="inline-flex items-center gap-2 rounded-full border border-tool-accent/30 bg-white px-4 py-2 text-sm text-tool-primary font-medium">
            <Icon className="h-4 w-4 text-tool-accent" />
            {t(`trust.badges.${key}`)}
          </span>
        ))}
      </div>

      {/* CTA */}
      <Banner
        color="bg-brand-green"
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
            className="bg-brand-yellow text-brand-navy hover:bg-brand-yellow/90 border-0 rounded-full px-8 font-semibold"
          >
            {t("cta.button")}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </Banner>
    </main>
  );
}
