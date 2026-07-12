import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

const faqKeys = [
  { qKey: 'faq1_q', aKey: 'faq1_a' },
  { qKey: 'faq2_q', aKey: 'faq2_a' },
  { qKey: 'faq3_q', aKey: 'faq3_a' },
  { qKey: 'faq4_q', aKey: 'faq4_a' },
  { qKey: 'faq5_q', aKey: 'faq5_a' },
  { qKey: 'faq6_q', aKey: 'faq6_a' },
  { qKey: 'faq7_q', aKey: 'faq7_a' },
]

export function FaqPage() {
  const { t } = useTranslation()
  const [open, setOpen] = useState<number | null>(null)

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{t('faq')}</h1>
      <p className="mt-2 text-gray-600 dark:text-gray-400">{t('faq_subtitle')}</p>
      <div className="mt-8 space-y-2">
        {faqKeys.map((faq, i) => (
          <div key={i} className="rounded-lg border dark:border-gray-700">
            <button onClick={() => setOpen(open === i ? null : i)} className="flex w-full items-center justify-between p-4 text-left cursor-pointer">
              <span className="font-medium text-gray-900 dark:text-gray-100">{t(faq.qKey)}</span>
              <ChevronDown className={cn('h-4 w-4 text-gray-500 transition-transform', open === i && 'rotate-180')} />
            </button>
            {open === i && <div className="border-t px-4 py-3 text-sm text-gray-600 dark:text-gray-400 dark:border-gray-700">{t(faq.aKey)}</div>}
          </div>
        ))}
      </div>
    </div>
  )
}
