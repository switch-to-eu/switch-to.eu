import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@switch-to-eu/ui/components/card";
import { Shield, Lock, Trash2, Mail, Database, EyeOff } from "lucide-react";

export default function PrivacyPage() {
  const t = useTranslations("PrivacyPage");

  return (
    <div className="py-16 sm:py-20">
      {/* Hero */}
      <div className="container mx-auto text-center mb-16 max-w-2xl">
        <h1 className="text-4xl font-bold mb-4 sm:text-5xl">{t("hero.title")}</h1>
        <p className="text-lg text-neutral-600 mb-2">{t("hero.subtitle")}</p>
        <p className="text-sm text-neutral-400">{t("hero.lastUpdated")}</p>
      </div>

      <div className="container mx-auto max-w-3xl space-y-8">
        {/* Who We Are */}
        <Card>
          <CardHeader>
            <CardTitle>{t("sections.whoWeAre.title")}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-neutral-600">{t("sections.whoWeAre.content")}</p>
          </CardContent>
        </Card>

        {/* Data Collection */}
        <Card>
          <CardHeader>
            <CardTitle>{t("sections.dataCollection.title")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-neutral-600">{t("sections.dataCollection.subtitle")}</p>
            {(["groupData", "technicalData", "noData"] as const).map((key) => {
              const icons = { groupData: Database, technicalData: Shield, noData: EyeOff };
              const Icon = icons[key];
              return (
                <div key={key} className="flex gap-3">
                  <Icon className="h-5 w-5 text-emerald-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium">{t(`sections.dataCollection.${key}.title`)}</p>
                    <p className="text-sm text-neutral-600">{t(`sections.dataCollection.${key}.description`)}</p>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Data Protection */}
        <Card>
          <CardHeader>
            <CardTitle>{t("sections.dataProtection.title")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {(["encryption", "zeroKnowledge"] as const).map((key) => {
              const icons = { encryption: Lock, zeroKnowledge: EyeOff };
              const Icon = icons[key];
              return (
                <div key={key} className="flex gap-3">
                  <Icon className="h-5 w-5 text-emerald-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium">{t(`sections.dataProtection.${key}.title`)}</p>
                    <p className="text-sm text-neutral-600">{t(`sections.dataProtection.${key}.description`)}</p>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Data Retention */}
        <Card>
          <CardHeader>
            <CardTitle>{t("sections.dataRetention.title")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {(["automatic", "immediate"] as const).map((key) => {
              const icons = { automatic: Trash2, immediate: Trash2 };
              const Icon = icons[key];
              return (
                <div key={key} className="flex gap-3">
                  <Icon className="h-5 w-5 text-emerald-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium">{t(`sections.dataRetention.${key}.title`)}</p>
                    <p className="text-sm text-neutral-600">{t(`sections.dataRetention.${key}.description`)}</p>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Contact */}
        <Card>
          <CardHeader>
            <CardTitle>{t("sections.contact.title")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3">
              <Mail className="h-5 w-5 text-emerald-600 mt-0.5 shrink-0" />
              <div>
                <p className="font-medium">{t("sections.contact.privacy.title")}</p>
                <p className="text-sm text-neutral-600">{t("sections.contact.privacy.description")}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary */}
        <Card className="border-emerald-200 bg-gradient-to-br from-white to-emerald-50/50">
          <CardHeader>
            <CardTitle>{t("summary.title")}</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {(t.raw("summary.points") as string[]).map((point, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-neutral-700">
                  <Shield className="h-4 w-4 text-emerald-600 shrink-0" />
                  {point}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
