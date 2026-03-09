import { useTranslations } from "next-intl";
import { Shield, Database, Eye, Clock } from "lucide-react";

export default function PrivacyPage() {
  const t = useTranslations("privacy");

  const sections = [
    { icon: Shield, key: "encryption" as const },
    { icon: Database, key: "data" as const },
    { icon: Eye, key: "noTracking" as const },
    { icon: Clock, key: "expiration" as const },
  ];

  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="font-heading text-3xl sm:text-4xl uppercase text-tool-primary mb-4">{t("title")}</h1>
      <p className="text-muted-foreground mb-8">{t("intro")}</p>

      <div className="space-y-8">
        {sections.map(({ icon: Icon, key }) => (
          <section key={key} className="flex gap-4">
            <div className="flex-shrink-0 mt-1">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-tool-primary text-white">
                <Icon className="h-5 w-5" />
              </div>
            </div>
            <div>
              <h2 className="font-heading text-lg uppercase text-tool-primary mb-2">{t(`${key}.title`)}</h2>
              <p className="text-muted-foreground">{t(`${key}.description`)}</p>
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
