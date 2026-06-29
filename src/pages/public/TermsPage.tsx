import { useTranslation } from 'react-i18next'

export function TermsPage() {
  const { t } = useTranslation()

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{t('terms')}</h1>
      <div className="mt-8 space-y-6 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
        <p>By using Rwanda EasyRent, you agree to these terms and conditions. Please read them carefully.</p>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Account Terms</h2>
        <p>You are responsible for maintaining the confidentiality of your account and password. You must provide accurate, current, and complete information during registration.</p>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Property Listings</h2>
        <p>Property owners are responsible for the accuracy of their listings. All properties must comply with Rwandan laws and regulations. We reserve the right to remove listings that violate our policies.</p>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Payments</h2>
        <p>All payments are processed securely through our payment partners. We are not responsible for disputes between tenants and property owners regarding payments.</p>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Limitation of Liability</h2>
        <p>Rwanda EasyRent acts as a platform connecting tenants and property owners. We are not party to any rental agreements and are not liable for any disputes arising from such agreements.</p>
      </div>
    </div>
  )
}
