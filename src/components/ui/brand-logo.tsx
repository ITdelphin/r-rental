import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { useTranslation } from 'react-i18next'
import { useSettings } from '@/hooks/useSettings'
import logoImg from '/images/easyrentlogo.jpeg'

interface BrandLogoProps {
  variant?: 'header' | 'sidebar' | 'footer' | 'auth'
  className?: string
}

const variantStyles = {
  header: { img: 'h-10 w-auto', text: 'text-xl', wrapper: '' },
  sidebar: { img: 'h-10 w-auto', text: '', wrapper: '' },
  footer: { img: 'h-10 w-auto', text: 'text-lg', wrapper: '' },
  auth: { img: 'h-24 w-auto', text: 'text-3xl', wrapper: 'justify-center' },
}

export function BrandLogo({ variant = 'header', className }: BrandLogoProps) {
  const { t } = useTranslation()
  const { settings } = useSettings()
  const logoUrl = settings.logo_url || logoImg
  const platformName = settings.platform_name || t('app_name')
  const styles = variantStyles[variant]

  return (
    <Link to="/" className={cn('flex items-center gap-2 font-bold text-primary-600', styles.wrapper, className)}>
      <img src={logoUrl} alt={platformName} className={styles.img} />
      <span className={styles.text}>{platformName}</span>
    </Link>
  )
}
