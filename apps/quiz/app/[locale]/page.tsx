import { useTranslations } from "next-intl";
import { Brain, Plus, Share2, Play, Trophy, ArrowRight, Lock, Zap, Globe, Bot, ArrowUpRight } from "lucide-react";
import { Button } from "@switch-to-eu/ui/components/button";
import { Link } from "@switch-to-eu/i18n/navigation";
import { Banner } from "@switch-to-eu/blocks/components/banner";
import { PageLayout } from "@switch-to-eu/blocks/components/page-layout";
import { Container } from "@switch-to-eu/blocks/components/container";

export default function HomePage() {
  const t = useTranslations("home");

  return (
    <PageLayout gapMobile>

      {/* Hero */}
      <Container noPaddingMobile>
        <Banner
          color="bg-tool-primary"
          shapes={[
            { shape: "spark", className: "-top-8 -right-8 w-40 h-40 sm:w-52 sm:h-52", opacity: 0.3, duration: "8s" },
            { shape: "blob", className: "-bottom-6 -left-6 w-32 h-32 sm:w-40 sm:h-40", opacity: 0.2, duration: "10s", delay: "-3s" },
            { shape: "cross", className: "top-1/4 left-8 w-16 h-16", opacity: 0.2, duration: "7s", delay: "-1.5s" },
          ]}
          contentClassName="text-center max-w-3xl mx-auto"
        >
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-sm font-medium text-white">
            <Brain className="h-4 w-4" />
            {t("hero.badge")}
          </div>
          <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl uppercase text-white mb-6 leading-tight">
            {t("hero.title")}{" "}
            <span className="text-brand-cream">
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
      </Container>

      {/* How it works */}
      <Container>
        <div className="text-center mb-10 sm:mb-12 px-3 md:px-0">
          <h2 className="font-heading text-4xl sm:text-5xl uppercase text-tool-primary mb-4">
            {t("features.title")}
          </h2>
        </div>
        <div className="grid gap-4 md:gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {([
            { icon: Brain, key: "create" as const },
            { icon: Share2, key: "share" as const },
            { icon: Play, key: "play" as const },
            { icon: Trophy, key: "results" as const },
          ]).map(({ icon: Icon, key }) => (
            <div key={key} className="bg-white border-2 border-tool-primary/20 rounded-3xl p-6 sm:p-8 flex flex-col gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-tool-primary/10">
                <Icon className="h-6 w-6 text-tool-primary" />
              </div>
              <h3 className="font-heading text-2xl uppercase text-tool-primary">
                {t(`features.${key}.title`)}
              </h3>
              <p className="text-sm leading-relaxed text-foreground/70">
                {t(`features.${key}.description`)}
              </p>
            </div>
          ))}
        </div>
      </Container>

      {/* Privacy */}
      <Container noPaddingMobile>
        <Banner
          color="bg-tool-primary"
          shapes={[
            { shape: "circle", className: "-top-8 -right-8 w-36 h-36", opacity: 0.25, duration: "9s" },
            { shape: "pebble", className: "-bottom-6 -left-6 w-28 h-28", opacity: 0.2, duration: "8s", delay: "-3s" },
          ]}
          contentClassName="text-center max-w-2xl mx-auto"
        >
          <h2 className="font-heading text-4xl sm:text-5xl uppercase text-white mb-4">
            {t("privacy.title")}
          </h2>
          <p className="text-white/80 text-lg">
            {t("privacy.description")}
          </p>
        </Banner>
      </Container>

      {/* Trust Badges */}
      <Container>
        <div className="flex flex-wrap items-center justify-center gap-3">
          {([
            { icon: Lock, key: "encrypted" },
            { icon: Zap, key: "realtime" },
            { icon: Globe, key: "european" },
          ] as const).map(({ icon: Icon, key }) => (
            <span key={key} className="inline-flex items-center gap-2 rounded-full border border-tool-primary/20 bg-white px-4 py-2 text-sm text-tool-primary font-medium">
              <Icon className="h-4 w-4 text-tool-accent" />
              {t(`trust.badges.${key}`)}
            </span>
          ))}
        </div>
      </Container>

      {/* MCP Integration */}
      <Container>
        <Link href="/mcp" className="group block">
          <div className="flex items-center justify-between gap-4 rounded-3xl border-2 border-tool-primary/20 bg-white p-6 sm:p-8 transition-colors hover:border-tool-primary/40">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-tool-primary/10">
                <Bot className="h-6 w-6 text-tool-primary" />
              </div>
              <div>
                <h3 className="font-heading text-2xl uppercase text-tool-primary">
                  {t("mcp.title")}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                  {t("mcp.description")}
                </p>
              </div>
            </div>
            <ArrowUpRight className="h-5 w-5 shrink-0 text-tool-primary/40 transition-colors group-hover:text-tool-primary" />
          </div>
        </Link>
      </Container>

      {/* CTA */}
      <Container noPaddingMobile>
        <Banner
          color="bg-tool-primary"
          shapes={[
            { shape: "tulip", className: "-top-6 -right-6 w-36 h-36", opacity: 0.25, duration: "7s" },
          ]}
          contentClassName="text-center max-w-2xl mx-auto"
        >
          <h2 className="font-heading text-4xl sm:text-5xl uppercase text-white mb-4">
            {t("cta.title")}
          </h2>
          <p className="text-white/80 text-lg mb-8">
            {t("cta.description")}
          </p>
          <Link href="/create">
            <Button
              size="lg"
              className="bg-white text-tool-primary hover:bg-white/90 border-0 rounded-full px-8 font-semibold"
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
