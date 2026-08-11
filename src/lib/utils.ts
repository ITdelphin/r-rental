import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import i18n from '@/i18n'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(price: number) {
  return new Intl.NumberFormat('en-RW', {
    style: 'currency',
    currency: 'RWF',
    minimumFractionDigits: 0,
  }).format(price)
}

const LOCALE_MAP: Record<string, string> = {
  en: 'en-US',
  rw: 'rw-RW',
  fr: 'fr-FR',
  sw: 'sw-KE',
}

export function formatDate(date: string | Date) {
  const locale = LOCALE_MAP[i18n.language] || 'en-US'
  return new Intl.DateTimeFormat(locale, {
    dateStyle: 'medium',
  }).format(new Date(date))
}

export function formatRelativeTime(date: string | Date) {
  const now = new Date()
  const then = new Date(date)
  const diffMs = now.getTime() - then.getTime()
  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHr = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHr / 24)

  const rtf = new Intl.RelativeTimeFormat(LOCALE_MAP[i18n.language] || 'en-US', { numeric: 'auto' })

  if (diffSec < 60) return rtf.format(-diffSec, 'second')
  if (diffMin < 60) return rtf.format(-diffMin, 'minute')
  if (diffHr < 24) return rtf.format(-diffHr, 'hour')
  if (diffDay < 30) return rtf.format(-diffDay, 'day')
  return formatDate(date)
}

export function slugify(str: string) {
  return str.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '')
}
