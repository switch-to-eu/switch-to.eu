import { useTranslations } from "next-intl";
import { Link } from "@switch-to-eu/i18n/navigation";
import { Shield, Flame, Lock, Eye, Server } from "lucide-react";
import { Button } from "@switch-to-eu/ui/components/button";

export default function AboutPage() {
  const t = useTranslations("AboutPage");

  return (
    <div className="bg-card">
      <div className="container mx-auto max-w-4xl px-6 py-16">
        {/* Hero */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            {t("hero.title")}
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">{t("hero.subtitle")}</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            {(["european", "encrypted", "noTracking"] as const).map((badge) => (
              <span
                key={badge}
                className="rounded-full bg-tool-surface/10 px-4 py-1.5 text-sm font-medium text-tool-primary border border-tool-accent/20"
              >
                {t(`hero.badges.${badge}`)}
              </span>
            ))}
          </div>
        </div>

        {/* How it works */}
        <div className="mb-16">
          <h2 className="mb-8 text-2xl font-bold text-foreground">
            {t("howItWorks.title")}
          </h2>
          <div className="grid gap-6 sm:grid-cols-3">
            {([
              { icon: Lock, key: "encrypt" },
              { icon: Server, key: "store" },
              { icon: Flame, key: "destroy" },
            ] as const).map(({ icon: Icon, key }) => (
              <div key={key} className="rounded-xl border border-border bg-muted p-6">
                <Icon className="mb-3 h-8 w-8 text-tool-primary" />
                <h3 className="mb-2 text-lg font-semibold text-foreground">
                  {t(`howItWorks.${key}.title`)}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {t(`howItWorks.${key}.description`)}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Privacy & security */}
        <div className="mb-16">
          <h2 className="mb-8 text-2xl font-bold text-foreground">
            {t("security.title")}
          </h2>
          <div className="grid gap-6 sm:grid-cols-2">
            {([
              { icon: Shield, key: "e2e" },
              { icon: Eye, key: "zeroKnowledge" },
              { icon: Flame, key: "ephemeral" },
              { icon: Lock, key: "password" },
            ] as const).map(({ icon: Icon, key }) => (
              <div key={key} className="rounded-xl border border-border bg-muted p-6">
                <Icon className="mb-3 h-6 w-6 text-tool-primary" />
                <h3 className="mb-2 font-semibold text-foreground">
                  {t(`security.${key}.title`)}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {t(`security.${key}.description`)}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link href="/create">
            <Button size="lg" className="gradient-primary border-0 text-white">
              {t("cta")}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
