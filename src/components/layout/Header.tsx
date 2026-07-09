import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Home, Menu, X, User, LogOut, Globe, Sun, Moon } from 'lucide-react'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import { getSettings } from '@/lib/settings'

const languages = [
  { code: 'en', label: 'English' },
  { code: 'rw', label: 'Kinyarwanda' },
  { code: 'fr', label: 'Français' },
]

export function Header() {
  const { t, i18n } = useTranslation()
  const { user, profile } = useAuth()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [langOpen, setLangOpen] = useState(false)
  const [logoUrl, setLogoUrl] = useState('')
  const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'))

  const navLinks = [
    { to: '/', label: t('home') },
    { to: '/properties', label: t('properties') },
    { to: '/about', label: t('about') },
    { to: '/contact', label: t('contact') },
  ]

  useEffect(() => {
    getSettings().then(s => { if (s.logo_url) setLogoUrl(s.logo_url) })
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/')
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md dark:bg-gray-900/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2">
          {logoUrl ? (
            <img src={logoUrl} alt={t('app_name')} className="h-8 w-auto" />
          ) : (
            <>
              <Home className="h-6 w-6 text-primary-600" />
              <span className="text-xl font-bold text-primary-600">{t('app_name')}</span>
            </>
          )}
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link key={link.to} to={link.to} className="text-sm font-medium text-gray-700 hover:text-primary-600 dark:text-gray-300">
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button onClick={() => { const next = !dark; setDark(next); document.documentElement.classList.toggle('dark', next); localStorage.setItem('theme', next ? 'dark' : 'light') }} className="p-2 text-gray-700 hover:text-primary-600 dark:text-gray-300 cursor-pointer" title={t('theme')}>
            {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          <div className="relative hidden sm:block">
            <button onClick={() => setLangOpen(!langOpen)} className="flex items-center gap-1 p-2 text-sm text-gray-700 hover:text-primary-600 dark:text-gray-300 cursor-pointer">
              <Globe className="h-4 w-4" />
              {i18n.language.toUpperCase()}
            </button>
            {langOpen && (
              <div className="absolute right-0 mt-1 w-36 rounded-lg border bg-white shadow-lg dark:bg-gray-800 dark:border-gray-700">
                {languages.map((lang) => (
                  <button key={lang.code} onClick={() => { i18n.changeLanguage(lang.code); setLangOpen(false) }} className="block w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">
                    {lang.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {user ? (
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')}>
                <User className="h-4 w-4" />
                {profile?.full_name || t('dashboard')}
              </Button>
              <Button variant="ghost" size="icon" onClick={handleLogout}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => navigate('/auth/login')}>{t('login')}</Button>
              <Button size="sm" onClick={() => navigate('/auth/register')}>{t('register')}</Button>
            </div>
          )}

          <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 cursor-pointer">
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t bg-white dark:bg-gray-900 px-4 py-4 space-y-3">
          {navLinks.map((link) => (
            <Link key={link.to} to={link.to} onClick={() => setMobileOpen(false)} className="block text-sm font-medium text-gray-700 hover:text-primary-600 dark:text-gray-300">
              {link.label}
            </Link>
          ))}
          <div className="border-t pt-3 flex flex-wrap gap-2">
            {languages.map((lang) => (
              <button key={lang.code} onClick={() => { i18n.changeLanguage(lang.code); setMobileOpen(false) }} className={`px-3 py-1 text-sm rounded-full border ${i18n.language === lang.code ? 'bg-primary-600 text-white border-primary-600' : 'border-gray-300 dark:border-gray-600'}`}>
                {lang.label}
              </button>
            ))}
          </div>
          {!user && (
            <div className="flex gap-2 pt-2">
              <Button variant="outline" size="sm" className="flex-1" onClick={() => { navigate('/auth/login'); setMobileOpen(false) }}>{t('login')}</Button>
              <Button size="sm" className="flex-1" onClick={() => { navigate('/auth/register'); setMobileOpen(false) }}>{t('register')}</Button>
            </div>
          )}
        </div>
      )}
    </header>
  )
}
