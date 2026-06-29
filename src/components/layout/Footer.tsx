import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Home, Mail, Phone, MapPin } from 'lucide-react'

export function Footer() {
  const { t } = useTranslation()

  return (
    <footer className="border-t bg-gray-50 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Link to="/" className="flex items-center gap-2 text-lg font-bold text-primary-600">
              <Home className="h-5 w-5" />
              {t('app_name')}
            </Link>
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
              <li className="flex items-center gap-2"><MapPin className="h-4 w-4" /> Kigali, Rwanda</li>
              <li className="flex items-center gap-2"><Phone className="h-4 w-4" /> +250 788 000 000</li>
              <li className="flex items-center gap-2"><Mail className="h-4 w-4" /> info@rwanda-easyrent.com</li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">{t('newsletter')}</h3>
            <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">Stay updated with new properties.</p>
            <div className="mt-3 flex gap-2">
              <input type="email" placeholder={t('email_address')} className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800" />
              <button className="rounded-lg bg-primary-600 px-4 py-2 text-sm text-white hover:bg-primary-700 cursor-pointer">{t('subscribe')}</button>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t pt-6 text-center text-sm text-gray-500 dark:text-gray-400">
          &copy; {new Date().getFullYear()} {t('app_name')}. {t('all_rights_reserved')}
        </div>
      </div>
    </footer>
  )
}
