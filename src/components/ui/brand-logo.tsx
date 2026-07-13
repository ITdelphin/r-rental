import { Link } from 'react-router-dom'
import { Home } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTranslation } from 'react-i18next'
import { useSettings } from '@/hooks/useSettings'

interface BrandLogoProps {
  variant?: 'header' | 'sidebar' | 'footer' | 'auth'
  className?: string
}

const variantStyles = {
  header: { img: 'h-10 w-auto', icon: 'h-7 w-7', text: 'text-xl', wrapper: '' },
  sidebar: { img: 'h-10 w-auto', icon: 'h-6 w-6', text: '', wrapper: '' },
  footer: { img: 'h-10 w-auto', icon: 'h-6 w-6', text: 'text-lg', wrapper: '' },
  auth: { img: 'h-24 w-auto', icon: 'h-10 w-10', text: 'text-3xl', wrapper: 'justify-center' },
}

export function BrandLogo({ variant = 'header', className }: BrandLogoProps) {
  const { t } = useTranslation()
  const { settings } = useSettings()
  const logoUrl = settings.logo_url || ''
  const platformName = settings.platform_name || t('app_name')
  const styles = variantStyles[variant]

  return (
    <Link to="/" className={cn('flex items-center gap-2 font-bold text-primary-600', styles.wrapper, className)}>
      {logoUrl ? (
        <img src={logoUrl} alt={platformName} className={styles.img} />
      ) : (
        <>
          <Home className={cn(styles.icon)} />
          <span className={styles.text}>{platformName}</span>
        </>
      )}
    </Link>
  )
}
