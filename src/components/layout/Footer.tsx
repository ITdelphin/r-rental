import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Mail, Phone, MapPin } from 'lucide-react'
import { useSettings } from '@/hooks/useSettings'
import { useContact } from '@/hooks/useContact'
import { BrandLogo } from '@/components/ui/brand-logo'

export function Footer() {
  const { t } = useTranslation()
  const { settings } = useSettings()
  const contact = useContact()

  const platformName = settings.platform_name || t('app_name')

  return (
    <footer className="border-t bg-gray-50 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <BrandLogo variant="footer" />
            <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">{t('footer_description')}</p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">{t('quick_links')}</h3>
            <ul className="mt-3 space-y-2">
              {['/', '/properties', '/about', '/contact', '/faq'].map((to) => (
                <li key={to}>
                  <Link to={to} className="text-sm text-gray-600 hover:text-primary-600 dark:text-gray-400">{to === '/' ? t('home') : t(to.slice(1))}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">{t('contact')}</h3>
              <ul className="mt-3 space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li className="flex items-center gap-2"><MapPin className="h-4 w-4" /> {contact.address}</li>
                <li className="flex items-center gap-2"><Phone className="h-4 w-4" /> {contact.phone}</li>
                <li className="flex items-center gap-2"><Mail className="h-4 w-4" /> {contact.email}</li>
              </ul>
          </div>
        </div>

        <div className="mt-8 border-t pt-6 text-center text-sm text-gray-500 dark:text-gray-400">
          &copy; {new Date().getFullYear()} {platformName}. {t('all_rights_reserved')}
        </div>
      </div>
    </footer>
  )
}
