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
    <div className="bg-white">
      <div className="container mx-auto max-w-4xl px-6 py-16">
        {/* Header */}
        <div className="mb-12">
          <h1 className="mb-4 text-4xl font-bold text-gray-900">
            {t("hero.title")}
          </h1>
          <p className="mb-4 text-lg text-gray-600">{t("hero.subtitle")}</p>
          <p className="text-sm text-gray-500">{t("hero.lastUpdated")}</p>
        </div>

        {/* Summary */}
        <div className="mb-12 rounded-lg border border-green-200 bg-green-50 p-6">
          <h2 className="mb-4 text-2xl font-semibold text-gray-900">
            {t("summary.title")}
          </h2>
          <ul className="space-y-2">
            {(t.raw("summary.points") as string[]).map(
              (point: string, index: number) => (
                <li key={index} className="text-gray-700">
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
              <h2 className="mb-3 text-2xl font-semibold text-gray-900">
                {t(`${section}.title`)}
              </h2>
              <p className="leading-relaxed text-gray-700">
                {t(`${section}.content`)}
              </p>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
