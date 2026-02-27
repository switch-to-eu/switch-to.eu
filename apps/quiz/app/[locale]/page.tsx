import { useTranslations } from "next-intl";
import { Brain, Plus, Share2, Play, Trophy } from "lucide-react";
import { Button } from "@switch-to-eu/ui/components/button";
import { Link } from "@switch-to-eu/i18n/navigation";

export default function HomePage() {
  const t = useTranslations("home");

  return (
    <main>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 header-bg" />
        <div className="relative mx-auto max-w-4xl px-4 py-20 sm:py-28 text-center">
          <h1 className="font-bricolage text-4xl font-black tracking-tight sm:text-5xl md:text-6xl">
            {t("hero.title")}{" "}
            <span className="gradient-primary bg-clip-text text-transparent">
              {t("hero.titleHighlight")}
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            {t("hero.subtitle")}
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/create">
              <Button size="lg" className="gradient-primary text-white">
                <Plus className="mr-2 h-5 w-5" />
                {t("hero.createQuiz")}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-5xl px-4 py-16">
        <h2 className="text-center font-bricolage text-3xl font-bold mb-12">
          {t("features.title")}
        </h2>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: Brain, key: "create" as const },
            { icon: Share2, key: "share" as const },
            { icon: Play, key: "play" as const },
            { icon: Trophy, key: "results" as const },
          ].map(({ icon: Icon, key }) => (
            <div key={key} className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl gradient-primary text-white">
                <Icon className="h-6 w-6" />
              </div>
              <h3 className="font-semibold mb-2">{t(`features.${key}.title`)}</h3>
              <p className="text-sm text-muted-foreground">
                {t(`features.${key}.description`)}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Privacy section */}
      <section className="bg-gradient-to-br from-neutral-50 to-rose-50/30 py-16">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <h2 className="font-bricolage text-2xl font-bold mb-4">
            {t("privacy.title")}
          </h2>
          <p className="text-muted-foreground">
            {t("privacy.description")}
          </p>
        </div>
      </section>
    </main>
  );
}
