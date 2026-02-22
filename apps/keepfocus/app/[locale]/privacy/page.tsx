import { useTranslations } from "next-intl";

export default function PrivacyPage() {
  const t = useTranslations('PrivacyPage');

  return (
    <div className="bg-white">
      <div className="container mx-auto max-w-4xl py-16 px-6">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {t('hero.title')}
          </h1>
          <p className="text-lg text-gray-600 mb-4">
            {t('hero.subtitle')}
          </p>
          <p className="text-sm text-gray-500">
            {t('hero.lastUpdated')}
          </p>
        </div>

        {/* Privacy Summary */}
        <div className="mb-12 p-6 bg-green-50 rounded-lg border border-green-200">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            {t('summary.title')}
          </h2>
          <ul className="space-y-2">
            {t.raw('summary.points').map((point: string, index: number) => (
              <li key={index} className="text-gray-700">• {point}</li>
            ))}
          </ul>
        </div>

        {/* Content Sections */}
        <div className="prose prose-gray max-w-none">
          
          {/* Who We Are */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              {t('sections.whoWeAre.title')}
            </h2>
            <p className="text-gray-700 leading-relaxed">
              {t('sections.whoWeAre.content')}
            </p>
          </section>

          {/* What Data We Collect */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              {t('sections.dataCollection.title')}
            </h2>
            <p className="text-gray-700 mb-6">
              {t('sections.dataCollection.subtitle')}
            </p>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {t('sections.dataCollection.taskData.title')}
                </h3>
                <p className="text-gray-700">
                  {t('sections.dataCollection.taskData.description')}
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {t('sections.dataCollection.settingsData.title')}
                </h3>
                <p className="text-gray-700">
                  {t('sections.dataCollection.settingsData.description')}
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {t('sections.dataCollection.technicalData.title')}
                </h3>
                <p className="text-gray-700">
                  {t('sections.dataCollection.technicalData.description')}
                </p>
              </div>

              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {t('sections.dataCollection.noData.title')}
                </h3>
                <p className="text-gray-700">
                  {t('sections.dataCollection.noData.description')}
                </p>
              </div>
            </div>
          </section>

          {/* How We Protect Your Data */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              {t('sections.dataProtection.title')}
            </h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {t('sections.dataProtection.localStorage.title')}
                </h3>
                <p className="text-gray-700">
                  {t('sections.dataProtection.localStorage.description')}
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {t('sections.dataProtection.clientSide.title')}
                </h3>
                <p className="text-gray-700">
                  {t('sections.dataProtection.clientSide.description')}
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {t('sections.dataProtection.europeanServers.title')}
                </h3>
                <p className="text-gray-700">
                  {t('sections.dataProtection.europeanServers.description')}
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {t('sections.dataProtection.security.title')}
                </h3>
                <p className="text-gray-700">
                  {t('sections.dataProtection.security.description')}
                </p>
              </div>
            </div>
          </section>

          {/* Data Retention */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              {t('sections.dataRetention.title')}
            </h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {t('sections.dataRetention.automatic.title')}
                </h3>
                <p className="text-gray-700">
                  {t('sections.dataRetention.automatic.description')}
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {t('sections.dataRetention.immediate.title')}
                </h3>
                <p className="text-gray-700">
                  {t('sections.dataRetention.immediate.description')}
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {t('sections.dataRetention.logs.title')}
                </h3>
                <p className="text-gray-700">
                  {t('sections.dataRetention.logs.description')}
                </p>
              </div>
            </div>
          </section>

          {/* Third-Party Services */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              {t('sections.thirdParty.title')}
            </h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {t('sections.thirdParty.hosting.title')}
                </h3>
                <p className="text-gray-700">
                  {t('sections.thirdParty.hosting.description')}
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {t('sections.thirdParty.noTracking.title')}
                </h3>
                <p className="text-gray-700">
                  {t('sections.thirdParty.noTracking.description')}
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {t('sections.thirdParty.notifications.title')}
                </h3>
                <p className="text-gray-700">
                  {t('sections.thirdParty.notifications.description')}
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {t('sections.thirdParty.openSource.title')}
                </h3>
                <p className="text-gray-700">
                  {t('sections.thirdParty.openSource.description')}
                </p>
              </div>
            </div>
          </section>

          {/* Your Rights */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              {t('sections.userRights.title')}
            </h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {t('sections.userRights.access.title')}
                </h3>
                <p className="text-gray-700">
                  {t('sections.userRights.access.description')}
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {t('sections.userRights.deletion.title')}
                </h3>
                <p className="text-gray-700">
                  {t('sections.userRights.deletion.description')}
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {t('sections.userRights.portability.title')}
                </h3>
                <p className="text-gray-700">
                  {t('sections.userRights.portability.description')}
                </p>
              </div>

              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {t('sections.userRights.noConsent.title')}
                </h3>
                <p className="text-gray-700">
                  {t('sections.userRights.noConsent.description')}
                </p>
              </div>
            </div>
          </section>

          {/* International Data Transfers */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              {t('sections.international.title')}
            </h2>
            
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {t('sections.international.noTransfers.title')}
              </h3>
              <p className="text-gray-700">
                {t('sections.international.noTransfers.description')}
              </p>
            </div>
          </section>

          {/* Contact & Questions */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              {t('sections.contact.title')}
            </h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {t('sections.contact.privacy.title')}
                </h3>
                <p className="text-gray-700">
                  {t('sections.contact.privacy.description')}
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {t('sections.contact.authority.title')}
                </h3>
                <p className="text-gray-700">
                  {t('sections.contact.authority.description')}
                </p>
              </div>
            </div>
          </section>

          {/* Policy Updates */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              {t('sections.changes.title')}
            </h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {t('sections.changes.notification.title')}
                </h3>
                <p className="text-gray-700">
                  {t('sections.changes.notification.description')}
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {t('sections.changes.consent.title')}
                </h3>
                <p className="text-gray-700">
                  {t('sections.changes.consent.description')}
                </p>
              </div>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}