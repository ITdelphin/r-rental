import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

const faqs = [
  { q: 'How do I create an account?', a: 'Click on the Register button in the top right corner and fill in your details. You will need to verify your email address to activate your account.' },
  { q: 'How do I list a property?', a: 'After registering as a Property Owner, go to your dashboard and click "Add Property". Fill in all the details, upload images, and submit for approval.' },
  { q: 'How long does property approval take?', a: 'Our admin team typically reviews and approves properties within 24-48 hours.' },
  { q: 'How do I book a property?', a: 'Navigate to the property details page and click "Book Now". Fill in your details and the owner will be notified of your request.' },
  { q: 'How do I pay rent?', a: 'We support MTN MoMo, Airtel Money, Visa, and MasterCard payments through our secure payment gateway.' },
  { q: 'Is my data safe?', a: 'Yes, we use industry-standard encryption and security practices. Your personal information is never shared without your consent.' },
  { q: 'Can I switch between languages?', a: 'Yes! Click the language button in the header to switch between English, Kinyarwanda, and French at any time.' },
]

export function FaqPage() {
  const { t } = useTranslation()
  const [open, setOpen] = useState<number | null>(null)

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{t('faq')}</h1>
      <p className="mt-2 text-gray-600 dark:text-gray-400">Find answers to common questions about Rwanda EasyRent.</p>
      <div className="mt-8 space-y-2">
        {faqs.map((faq, i) => (
          <div key={i} className="rounded-lg border dark:border-gray-700">
            <button onClick={() => setOpen(open === i ? null : i)} className="flex w-full items-center justify-between p-4 text-left cursor-pointer">
              <span className="font-medium text-gray-900 dark:text-gray-100">{faq.q}</span>
              <ChevronDown className={cn('h-4 w-4 text-gray-500 transition-transform', open === i && 'rotate-180')} />
            </button>
            {open === i && <div className="border-t px-4 py-3 text-sm text-gray-600 dark:text-gray-400 dark:border-gray-700">{faq.a}</div>}
          </div>
        ))}
      </div>
    </div>
  )
}
