import { useTranslations } from "next-intl";

export default function PrivacyPage() {
  const t = useTranslations('PrivacyPage');

  return (
    <div className="container mx-auto py-12">
      <div className="max-w-3xl mx-auto prose">
        <h1>{t('title')}</h1>
        <p className="text-neutral-600">{t('placeholder')}</p>
        {/* TODO: Full privacy policy page */}
      </div>
    </div>
  );
}
