import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Home, Mail, Phone, MapPin, Loader2 } from 'lucide-react'
import { useSettings } from '@/hooks/useSettings'
import { sendNewsletterSubscribe } from '@/lib/email'
import toast from 'react-hot-toast'

export function Footer() {
  const { t } = useTranslation()
  const { settings } = useSettings()
  const [newsletterEmail, setNewsletterEmail] = useState('')
  const [subscribing, setSubscribing] = useState(false)

  const platformName = settings.platform_name || t('app_name')
  const address = settings.address || 'Kigali, Rwanda'
  const phone = settings.phone_number || '+250 788 000 000'
  const email = settings.support_email || 'info@rwanda-easyrent.com'

  const handleSubscribe = async () => {
    if (!newsletterEmail.trim()) return
    setSubscribing(true)
    try {
      const { success } = await sendNewsletterSubscribe(newsletterEmail.trim())
      if (success) {
        toast.success('Subscribed successfully! Check your email.')
        setNewsletterEmail('')
      } else {
        toast.error('Failed to subscribe. Please try again.')
      }
    } catch {
      toast.error('Failed to subscribe. Please try again.')
    } finally {
      setSubscribing(false)
    }
  }

  return (
    <footer className="border-t bg-gray-50 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Link to="/" className="flex items-center gap-2 text-lg font-bold text-primary-600">
              <Home className="h-5 w-5" />
              {platformName}
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
              <li className="flex items-center gap-2"><MapPin className="h-4 w-4" /> {address}</li>
              <li className="flex items-center gap-2"><Phone className="h-4 w-4" /> {phone}</li>
              <li className="flex items-center gap-2"><Mail className="h-4 w-4" /> {email}</li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">{t('newsletter')}</h3>
            <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">Stay updated with new properties.</p>
            <div className="mt-3 flex gap-2">
              <input
                type="email"
                value={newsletterEmail}
                onChange={e => setNewsletterEmail(e.target.value)}
                placeholder={t('email_address')}
                className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800"
              />
              <button
                onClick={handleSubscribe}
                disabled={subscribing}
                className="rounded-lg bg-primary-600 px-4 py-2 text-sm text-white hover:bg-primary-700 disabled:opacity-50 cursor-pointer"
              >
                {subscribing ? <Loader2 className="h-4 w-4 animate-spin" /> : t('subscribe')}
              </button>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t pt-6 text-center text-sm text-gray-500 dark:text-gray-400">
          &copy; {new Date().getFullYear()} {platformName}. {t('all_rights_reserved')}
        </div>
      </div>
    </footer>
  )
}
