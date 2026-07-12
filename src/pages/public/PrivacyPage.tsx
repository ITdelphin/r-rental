import { useTranslation } from 'react-i18next'

export function PrivacyPage() {
  const { t } = useTranslation()

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{t('privacy')}</h1>
      <div className="mt-8 space-y-6 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
        <p>{t('privacy_intro')}</p>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{t('privacy_collect_title')}</h2>
        <p>{t('privacy_collect_desc')}</p>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{t('privacy_use_title')}</h2>
        <p>{t('privacy_use_desc')}</p>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{t('privacy_protection_title')}</h2>
        <p>{t('privacy_protection_desc')}</p>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{t('privacy_contact_title')}</h2>
        <p>{t('privacy_contact_desc')}</p>
      </div>
    </div>
  )
}
