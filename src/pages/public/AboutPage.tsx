import { useTranslation } from 'react-i18next'

export function AboutPage() {
  const { t } = useTranslation()

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{t('about')}</h1>
      <div className="mt-8 space-y-6 text-gray-600 dark:text-gray-400 leading-relaxed">
        <p>Rwanda EasyRent is a modern property rental platform designed specifically for the Rwandan market. We connect property owners with tenants looking for their perfect home across all provinces of Rwanda.</p>
        <p>Our mission is to make property rental in Rwanda transparent, efficient, and accessible to everyone. Whether you are a property owner looking to list your properties or a tenant searching for a new home, EasyRent provides the tools you need.</p>
        <p>We support three languages - English, Kinyarwanda, and French - making the platform accessible to all Rwandans.</p>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Our Values</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>Trust</strong> - We verify all properties and users to ensure a safe environment.</li>
          <li><strong>Transparency</strong> - Clear pricing, honest reviews, and open communication.</li>
          <li><strong>Innovation</strong> - Modern technology to simplify the rental process.</li>
          <li><strong>Community</strong> - Building a better rental ecosystem for all Rwandans.</li>
        </ul>
      </div>
    </div>
  )
}
