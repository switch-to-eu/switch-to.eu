import { useTranslations } from "next-intl";
import { Link } from "@switch-to-eu/i18n/navigation";
import { Shield, Flame, Lock, Eye, Server } from "lucide-react";
import { Button } from "@switch-to-eu/ui/components/button";

export default function AboutPage() {
  const t = useTranslations("AboutPage");

  return (
    <div className="bg-white">
      <div className="container mx-auto max-w-4xl px-6 py-16">
        {/* Hero */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            {t("hero.title")}
          </h1>
          <p className="mt-4 text-lg text-gray-600">{t("hero.subtitle")}</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            {(["european", "encrypted", "noTracking"] as const).map((badge) => (
              <span
                key={badge}
                className="rounded-full bg-amber-50 px-4 py-1.5 text-sm font-medium text-amber-700 border border-amber-200"
              >
                {t(`hero.badges.${badge}`)}
              </span>
            ))}
          </div>
        </div>

        {/* How it works */}
        <div className="mb-16">
          <h2 className="mb-8 text-2xl font-bold text-gray-900">
            {t("howItWorks.title")}
          </h2>
          <div className="grid gap-6 sm:grid-cols-3">
            {([
              { icon: Lock, key: "encrypt" },
              { icon: Server, key: "store" },
              { icon: Flame, key: "destroy" },
            ] as const).map(({ icon: Icon, key }) => (
              <div key={key} className="rounded-xl border border-gray-100 bg-gray-50 p-6">
                <Icon className="mb-3 h-8 w-8 text-amber-600" />
                <h3 className="mb-2 text-lg font-semibold text-gray-900">
                  {t(`howItWorks.${key}.title`)}
                </h3>
                <p className="text-sm text-gray-600">
                  {t(`howItWorks.${key}.description`)}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Privacy & security */}
        <div className="mb-16">
          <h2 className="mb-8 text-2xl font-bold text-gray-900">
            {t("security.title")}
          </h2>
          <div className="grid gap-6 sm:grid-cols-2">
            {([
              { icon: Shield, key: "e2e" },
              { icon: Eye, key: "zeroKnowledge" },
              { icon: Flame, key: "ephemeral" },
              { icon: Lock, key: "password" },
            ] as const).map(({ icon: Icon, key }) => (
              <div key={key} className="rounded-xl border border-gray-100 bg-gray-50 p-6">
                <Icon className="mb-3 h-6 w-6 text-amber-600" />
                <h3 className="mb-2 font-semibold text-gray-900">
                  {t(`security.${key}.title`)}
                </h3>
                <p className="text-sm text-gray-600">
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
