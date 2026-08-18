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

const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/

const DISPOSABLE_DOMAINS = new Set([
  'yopmail.com', 'tempmail.com', 'mailinator.com', '10minutemail.com',
  'guerrillamail.com', 'throwawaymail.com', 'temp-mail.org', 'dispostable.com',
  'trashmail.com', 'getairmail.com', 'sharklasers.com', 'guerrillamailblock.com',
  'guerrillamail.net', 'guerrillamail.org', 'guerrillamail.biz', 'spam4.me',
  'mailinator.net', 'mailinator.org', 'mailinator.co', 'mailinator.space',
  'boun.cr', 'temp-mail.com', 'tempmailaddress.com', 'generator.email',
  'maildrop.cc', 'emailfake.com', 'mailnesia.com', 'fakeinbox.com',
  'dropmail.me', 'inboxkitten.com', 'luxusmail.org', 'mohmal.com',
])

/**
 * Validates an email address: strict RFC 5322 format, a real domain with a
 * proper TLD (>= 2 chars), and blocks known disposable/temporary domains.
 */
export function isValidEmail(value: string): boolean {
  const email = value.trim().toLowerCase()
  if (!EMAIL_REGEX.test(email)) return false

  const domain = email.split('@')[1] || ''
  const parts = domain.split('.')
  const tld = parts[parts.length - 1] || ''
  if (parts.length < 2 || tld.length < 2) return false

  return !DISPOSABLE_DOMAINS.has(domain)
}

/**
 * Converts a YouTube / Vimeo / direct video URL into a playable source.
 * Returns an object describing how to render it:
 *  - { kind: 'embed', url }   -> iframe embed (YouTube, Vimeo)
 *  - { kind: 'file', url }    -> native <video> src (direct .mp4/.webm/.mov)
 *  - { kind: 'invalid' }      -> unrecognized URL
 */
export function resolveVideoUrl(value: string): { kind: 'embed' | 'file' | 'invalid'; url: string } {
  const url = value.trim()
  if (!url) return { kind: 'invalid', url: '' }

  try {
    const parsed = new URL(url)
    const host = parsed.hostname.replace(/^www\./, '').toLowerCase()

    if (host === 'youtube.com' || host === 'youtu.be' || host === 'm.youtube.com') {
      const v = parsed.searchParams.get('v') || (parsed.pathname.split('/').filter(Boolean).pop() || '')
      if (v) return { kind: 'embed', url: `https://www.youtube.com/embed/${v}` }
    }

    if (host === 'vimeo.com') {
      const id = parsed.pathname.split('/').filter(Boolean)[0]
      if (id && /^\d+$/.test(id)) return { kind: 'embed', url: `https://player.vimeo.com/video/${id}` }
    }

    if (/\.(mp4|webm|mov|ogg)$/i.test(parsed.pathname)) return { kind: 'file', url }
  } catch {
    return { kind: 'invalid', url: '' }
  }

  return { kind: 'invalid', url: '' }
}
