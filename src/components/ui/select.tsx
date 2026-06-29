import { forwardRef } from 'react'
import { cn } from '@/lib/utils'
import type { SelectHTMLAttributes } from 'react'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  options: { value: string; label: string }[]
  placeholder?: string
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, options, placeholder, id, ...props }, ref) => (
    <div className="space-y-1">
      {label && <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>}
      <select
        ref={ref}
        id={id}
        className={cn(
          'flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-xs transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100',
          error && 'border-red-500',
          className
        )}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  )
)
Select.displayName = 'Select'
