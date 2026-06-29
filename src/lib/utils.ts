import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

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

export function formatDate(date: string | Date) {
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
  }).format(new Date(date))
}

export function slugify(str: string) {
  return str.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '')
}
