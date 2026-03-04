import { useTranslations } from "next-intl";

export default function PrivacyPage() {
  const t = useTranslations("PrivacyPage");

  const sections = [
    "dataCollection",
    "encryption",
    "dataRetention",
    "thirdParty",
    "userRights",
    "contact",
  ] as const;

  return (
    <div className="bg-card">
      <div className="container mx-auto max-w-4xl px-6 py-16">
        {/* Header */}
        <div className="mb-12">
          <h1 className="mb-4 font-heading text-4xl sm:text-5xl uppercase text-brand-green">
            {t("hero.title")}
          </h1>
          <p className="mb-4 text-lg text-muted-foreground">{t("hero.subtitle")}</p>
          <p className="text-sm text-muted-foreground">{t("hero.lastUpdated")}</p>
        </div>

        {/* Summary */}
        <div className="mb-12 rounded-lg border border-success/20 bg-success/10 p-6">
          <h2 className="mb-4 font-heading text-2xl sm:text-3xl uppercase text-brand-green">
            {t("summary.title")}
          </h2>
          <ul className="space-y-2">
            {(t.raw("summary.points") as string[]).map(
              (point: string, index: number) => (
                <li key={index} className="text-foreground">
                  &bull; {point}
                </li>
              ),
            )}
          </ul>
        </div>

        {/* Sections */}
        <div className="space-y-10">
          {sections.map((section) => (
            <section key={section}>
              <h2 className="mb-3 font-heading text-2xl uppercase text-brand-green">
                {t(`${section}.title`)}
              </h2>
              <p className="leading-relaxed text-foreground">
                {t(`${section}.content`)}
              </p>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
