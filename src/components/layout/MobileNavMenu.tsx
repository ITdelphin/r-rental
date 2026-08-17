import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Home, Building2, Info, Mail, Globe, ChevronDown, Moon, Sun, X, LogIn, UserPlus, LogOut } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import { cn } from '@/lib/utils'
import { useSettings } from '@/hooks/useSettings'
import logoImg from '/images/easyrentlogo.jpeg'

const languages = [
  { code: 'en', label: 'English' },
  { code: 'rw', label: 'Kinyarwanda' },
  { code: 'fr', label: 'Français' },
  { code: 'sw', label: 'Kiswahili' },
]

const navItems = [
  { icon: Home, to: '/', key: 'home' },
  { icon: Building2, to: '/properties', key: 'properties' },
  { icon: Info, to: '/about', key: 'about' },
  { icon: Mail, to: '/contact', key: 'contact' },
]

interface MobileNavMenuProps {
  open: boolean
  dark: boolean
  onClose: () => void
  onToggleTheme: () => void
}

export function MobileNavMenu({ open, dark, onClose, onToggleTheme }: MobileNavMenuProps) {
  const { t, i18n } = useTranslation()
  const { user, profile } = useAuth()
  const { settings } = useSettings()
  const navigate = useNavigate()
  const location = useLocation()
  const [langOpen, setLangOpen] = useState(false)

  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!open) return null

  const logoUrl = settings.logo_url || logoImg
  const platformName = settings.platform_name || t('app_name')

  const isActive = (to: string) => to === '/' ? location.pathname === '/' : location.pathname.startsWith(to)

  const navigateAndClose = (to: string) => {
    navigate(to)
    onClose()
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    onClose()
    navigate('/')
  }

  const currentLang = languages.find(l => l.code === i18n.language) || languages[0]

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-white dark:bg-gray-900 md:hidden" role="dialog" aria-modal="true">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4 dark:border-gray-800">
        <Link to="/" onClick={onClose} className="flex items-center gap-2.5">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-100">
            <img src={logoUrl} alt={platformName} className="h-7 w-7 rounded-lg object-cover" />
          </span>
          <span className="text-xl font-bold tracking-tight text-primary-600">{platformName}</span>
        </Link>
        <div className="flex items-center gap-1">
          <button onClick={onToggleTheme} title={t('theme')} className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl text-gray-600 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800">
            {dark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
          <button onClick={onClose} title={t('close')} className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl text-gray-600 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800">
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-5 py-6">
        <div className="space-y-2">
          {navItems.map(({ icon: Icon, to, key }) => {
            const active = isActive(to)
            const activeKey = key === 'home' ? 'home' : key
            return (
              <Link
                key={to}
                to={to}
                onClick={onClose}
                className={cn(
                  'flex items-center gap-4 rounded-2xl px-5 py-4 transition-colors',
                  active ? 'bg-primary-100' : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                )}
              >
                <Icon
                  className={cn(
                    'h-6 w-6',
                    active ? 'text-primary-600 fill-primary-600' : 'text-primary-400'
                  )}
                  strokeWidth={2.2}
                />
                <span className={cn(
                  'text-lg font-bold',
                  active ? 'text-primary-700' : 'text-gray-900 dark:text-gray-100'
                )}>
                  {t(activeKey)}
                </span>
              </Link>
            )
          })}
        </div>

        {/* Language selector */}
        <div className="mt-8 border-t border-gray-100 pt-6 dark:border-gray-800">
          <div className="relative">
            <button
              onClick={() => setLangOpen(v => !v)}
              className="flex w-full cursor-pointer items-center gap-3 rounded-2xl border border-gray-200 bg-white px-4 py-4 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800"
            >
              <Globe className="h-5 w-5 shrink-0 text-primary-500" />
              <span className="flex-1 text-left text-base font-semibold text-gray-900 dark:text-gray-100">
                {t('language_label')}{' '}
                <span className="text-primary-600">{currentLang.label}</span>
              </span>
              <ChevronDown className={cn('h-5 w-5 shrink-0 text-gray-400 transition-transform', langOpen && 'rotate-180')} />
            </button>
            {langOpen && (
              <div className="absolute left-0 right-0 top-full z-10 mt-2 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-800">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => { i18n.changeLanguage(lang.code); setLangOpen(false) }}
                    className={cn(
                      'block w-full cursor-pointer px-4 py-3 text-left text-base font-medium transition-colors hover:bg-primary-50 dark:hover:bg-gray-700',
                      i18n.language === lang.code ? 'text-primary-600' : 'text-gray-700 dark:text-gray-200'
                    )}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Footer auth area */}
      <div className="border-t border-gray-100 px-5 py-5 dark:border-gray-800">
        {user ? (
          <div className="flex items-center gap-3">
            <button
              onClick={() => { navigate('/dashboard'); onClose() }}
              className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-4 text-base font-bold text-gray-900 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
            >
              <Avatar className="h-6 w-6">
                {profile?.avatar_url ? <AvatarImage src={profile.avatar_url} /> : null}
                <AvatarFallback className="text-[10px]">{profile?.full_name?.charAt(0) || 'U'}</AvatarFallback>
              </Avatar>
              {profile?.full_name || t('dashboard')}
            </button>
            <button
              onClick={handleLogout}
              className="flex h-14 cursor-pointer items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white px-5 text-base font-bold text-red-600 transition-colors hover:bg-red-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-red-900/20"
            >
              <LogOut className="h-5 w-5" />
              {t('logout')}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => navigateAndClose('/auth/login')}
              className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-4 text-base font-bold text-gray-900 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
            >
              <LogIn className="h-5 w-5" />
              {t('login')}
            </button>
            <button
              onClick={() => navigateAndClose('/auth/register')}
              className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl bg-primary-500 px-4 py-4 text-base font-bold text-white shadow-lg shadow-primary-500/30 transition-colors hover:bg-primary-600"
            >
              <UserPlus className="h-5 w-5" />
              {t('register')}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}