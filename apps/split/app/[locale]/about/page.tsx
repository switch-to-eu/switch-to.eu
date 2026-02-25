import { useTranslations } from "next-intl";
import { Link } from "@switch-to-eu/i18n/navigation";
import { Button } from "@switch-to-eu/ui/components/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@switch-to-eu/ui/components/card";
import { ArrowRight, Zap, Eye, RefreshCw, Shuffle } from "lucide-react";

export default function AboutPage() {
  const t = useTranslations("AboutPage");

  const features = [
    { key: "unified", icon: Shuffle },
    { key: "instant", icon: Zap },
    { key: "realtime", icon: RefreshCw },
    { key: "private", icon: Eye },
  ] as const;

  return (
    <>
      {/* Hero */}
      <div className="relative overflow-hidden py-16 sm:py-24">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-teal-50 to-white" />
        <div className="relative z-10 container mx-auto text-center">
          <h1 className="mb-6 text-4xl font-bold sm:text-6xl">
            <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              {t("hero.title")}
            </span>
          </h1>
          <p className="mx-auto max-w-2xl text-xl text-neutral-600 mb-8">
            {t("hero.subtitle")}
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {(["openSource", "encrypted", "noTracking"] as const).map((badge) => (
              <span
                key={badge}
                className="px-4 py-2 rounded-full bg-white shadow-sm text-sm font-medium text-emerald-700"
              >
                {t(`hero.badges.${badge}`)}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="py-16 sm:py-20 bg-neutral-50">
        <div className="container mx-auto">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold sm:text-4xl">{t("features.title")}</h2>
            <p className="text-lg text-neutral-600">{t("features.subtitle")}</p>
          </div>
          <div className="grid gap-8 md:grid-cols-2 max-w-4xl mx-auto">
            {features.map(({ key, icon: Icon }) => (
              <Card key={key} className="border-0 shadow-lg p-6">
                <CardHeader className="p-0">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-emerald-600 to-teal-600">
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-xl mb-2">
                    {t(`features.${key}.title`)}
                  </CardTitle>
                  <CardDescription className="text-base">
                    {t(`features.${key}.description`)}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Platform */}
      <div className="py-16 sm:py-20">
        <div className="container mx-auto text-center max-w-2xl">
          <h2 className="mb-4 text-3xl font-bold sm:text-4xl">{t("platform.title")}</h2>
          <p className="text-lg text-neutral-600 mb-8">{t("platform.description")}</p>
          <a
            href="https://switch-to.eu"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="outline" size="lg">
              {t("platform.cta")}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </a>
        </div>
      </div>

      {/* CTA */}
      <div className="relative overflow-hidden bg-gradient-to-r from-emerald-600 via-teal-600 to-green-500 py-16">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative z-10 container mx-auto text-center">
          <h2 className="mb-4 text-3xl font-bold text-white sm:text-4xl">
            {t("cta.title")}
          </h2>
          <p className="mx-auto mb-8 max-w-xl text-lg text-white/90">
            {t("cta.description")}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/create">
              <Button size="lg" className="bg-white text-emerald-700 hover:bg-neutral-100">
                {t("cta.createGroup")}
              </Button>
            </Link>
            <Link href="/">
              <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10">
                {t("cta.learnMore")}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
