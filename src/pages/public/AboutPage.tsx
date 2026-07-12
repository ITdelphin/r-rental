import { useTranslation } from 'react-i18next'

export function AboutPage() {
  const { t } = useTranslation()

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{t('about')}</h1>
      <div className="mt-8 space-y-6 text-gray-600 dark:text-gray-400 leading-relaxed">
        <p>{t('about_p1')}</p>
        <p>{t('about_p2')}</p>
        <p>{t('about_p3')}</p>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{t('our_values')}</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>{t('trust')}</strong> - {t('trust_desc')}</li>
          <li><strong>{t('transparency')}</strong> - {t('transparency_desc')}</li>
          <li><strong>{t('innovation')}</strong> - {t('innovation_desc')}</li>
          <li><strong>{t('community')}</strong> - {t('community_desc')}</li>
        </ul>
      </div>
    </div>
  )
}
