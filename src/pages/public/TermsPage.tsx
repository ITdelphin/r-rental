import { useTranslation } from 'react-i18next'
import { SEO } from '@/components/SEO'
import { breadcrumbLD } from '@/lib/seo-data'

export function TermsPage() {
  const { t } = useTranslation()

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <SEO
        title="Terms of Service | EasyRent"
        description="Terms and conditions for using the EasyRent platform. Read our rental, listing, and payment policies."
        structuredData={breadcrumbLD([
          { name: 'Home', url: '/' },
          { name: 'Terms of Service', url: '/terms' },
        ])}
      />
      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{t('terms')}</h1>
      <div className="mt-8 space-y-6 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
<p>{t('terms_intro')}</p>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{t('terms_account_title')}</h2>
        <p>{t('terms_account_desc')}</p>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{t('terms_listings_title')}</h2>
        <p>{t('terms_listings_desc')}</p>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{t('terms_payments_title')}</h2>
        <p>{t('terms_payments_desc')}</p>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{t('terms_liability_title')}</h2>
        <p>{t('terms_liability_desc')}</p>
      </div>
    </div>
  )
}
