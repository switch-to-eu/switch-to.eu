import { useTranslations } from "next-intl";

export default function ListPage() {
  const t = useTranslations('ListPage');

  return (
    <div className="container mx-auto py-12">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">{t('title')}</h1>
        <p className="text-neutral-600">{t('placeholder')}</p>
        {/* TODO: Shared list view with real-time updates */}
      </div>
    </div>
  );
}
