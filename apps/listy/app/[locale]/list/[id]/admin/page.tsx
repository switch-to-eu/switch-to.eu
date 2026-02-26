import { useTranslations } from "next-intl";

export default function ListAdminPage() {
  const t = useTranslations('AdminPage');

  return (
    <div className="container mx-auto py-12">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">{t('title')}</h1>
        <p className="text-neutral-600">{t('placeholder')}</p>
        {/* TODO: Admin panel — edit list, manage items, delete list */}
      </div>
    </div>
  );
}
