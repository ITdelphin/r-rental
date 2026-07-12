import { useTranslation } from 'react-i18next'
import { Mail, Phone, MapPin, Clock, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { useState } from 'react'
import { sendContactForm } from '@/lib/email'
import toast from 'react-hot-toast'

export function ContactPage() {
  const { t } = useTranslation()
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [sending, setSending] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSending(true)
    try {
      const { success } = await sendContactForm(form.name, form.email, form.subject, form.message)
      if (success) {
        toast.success(t('contact_success'))
        setForm({ name: '', email: '', subject: '', message: '' })
      } else {
        toast.error(t('contact_failed'))
      }
    } catch {
      toast.error(t('contact_failed'))
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{t('contact')}</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">{t('contact_subtitle')}</p>
      </div>
      <div className="mt-12 grid gap-8 lg:grid-cols-2">
        <Card>
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{t('send_us_message')}</h2>
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <Input label={t('your_name')} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              <Input label={t('your_email')} type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
              <Input label={t('subject')} value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} required />
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('message')}</label>
                <textarea rows={5} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} required className="w-full rounded-lg border border-gray-300 bg-white p-3 text-sm dark:border-gray-600 dark:bg-gray-800" />
              </div>
              <Button type="submit" className="w-full" loading={sending}>{t('submit')}</Button>
            </form>
          </CardContent>
        </Card>
        <div className="space-y-6">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-100 text-primary-600"><Mail className="h-5 w-5" /></div>
            <div><h3 className="font-medium text-gray-900 dark:text-gray-100">{t('email')}</h3><p className="text-sm text-gray-500">info@rwanda-easyrent.com</p></div>
          </div>
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-100 text-primary-600"><Phone className="h-5 w-5" /></div>
            <div><h3 className="font-medium text-gray-900 dark:text-gray-100">{t('phone')}</h3><p className="text-sm text-gray-500">+250 788 000 000</p></div>
          </div>
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-100 text-primary-600"><MapPin className="h-5 w-5" /></div>
            <div><h3 className="font-medium text-gray-900 dark:text-gray-100">{t('address')}</h3><p className="text-sm text-gray-500">Kigali, Rwanda</p></div>
          </div>
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-100 text-primary-600"><Clock className="h-5 w-5" /></div>
            <div><h3 className="font-medium text-gray-900 dark:text-gray-100">{t('working_hours')}</h3><p className="text-sm text-gray-500">Mon - Fri: 8:00 AM - 6:00 PM</p></div>
          </div>
        </div>
      </div>
    </div>
  )
}
