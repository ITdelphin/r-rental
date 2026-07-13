import { Link } from 'react-router-dom'
import { Home } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useSettings } from '@/hooks/useSettings'

interface BrandLogoProps {
  variant?: 'header' | 'sidebar' | 'footer' | 'auth'
  className?: string
}

const variantStyles = {
  header: { img: 'h-8 w-auto', icon: 'h-6 w-6', text: 'text-xl', wrapper: '' },
  sidebar: { img: 'h-8 w-auto', icon: 'h-5 w-5', text: '', wrapper: '' },
  footer: { img: 'h-8 w-auto', icon: 'h-5 w-5', text: 'text-lg', wrapper: '' },
  auth: { img: 'h-10 w-auto', icon: 'h-6 w-6', text: 'text-2xl', wrapper: 'justify-center' },
}

export function BrandLogo({ variant = 'header', className }: BrandLogoProps) {
  const { settings } = useSettings()
  const logoUrl = settings.logo_url || ''
  const platformName = settings.platform_name || ''
  const styles = variantStyles[variant]

  return (
    <Link to="/" className={cn('flex items-center gap-2 font-bold text-primary-600', styles.wrapper, className)}>
      {logoUrl ? (
        <img src={logoUrl} alt={platformName} className={styles.img} />
      ) : (
        <>
          <Home className={cn(styles.icon)} />
          {platformName && <span className={styles.text}>{platformName}</span>}
        </>
      )}
    </Link>
  )
}
