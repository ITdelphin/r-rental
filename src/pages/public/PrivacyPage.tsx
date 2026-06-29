import { useTranslation } from 'react-i18next'

export function PrivacyPage() {
  const { t } = useTranslation()

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{t('privacy')}</h1>
      <div className="mt-8 space-y-6 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
        <p>Your privacy is important to us. This policy outlines how we collect, use, and protect your personal information when you use Rwanda EasyRent.</p>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Information We Collect</h2>
        <p>We collect information you provide directly, such as your name, email address, phone number, and property details. We also automatically collect certain technical information about your device and usage.</p>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">How We Use Your Information</h2>
        <p>We use your information to provide and improve our services, communicate with you, process transactions, and ensure platform security and integrity.</p>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Data Protection</h2>
        <p>We implement appropriate technical and organizational measures to protect your personal data against unauthorized access, alteration, disclosure, or destruction.</p>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Contact Us</h2>
        <p>If you have questions about this privacy policy, please contact us at privacy@rwanda-easyrent.com.</p>
      </div>
    </div>
  )
}
