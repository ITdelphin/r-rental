import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { BrandLogo } from '@/components/ui/brand-logo'
import { authApi } from '@/lib/api'
import toast from 'react-hot-toast'

export function LoginPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [oauthLoading, setOauthLoading] = useState<'google' | 'github' | null>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await authApi.login(email, password)
      navigate('/dashboard')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t('login_failed'))
    } finally {
      setLoading(false)
    }
  }

  const handleOAuth = async (provider: 'google' | 'github') => {
    setOauthLoading(provider)
    try {
      await authApi.signInWithOAuth(provider)
    } catch {
      toast.error(t('oauth_failed'))
      setOauthLoading(null)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 dark:bg-gray-950">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <BrandLogo variant="auth" />
          <CardTitle className="mt-4">{t('sign_in')}</CardTitle>
          <CardDescription>{t('welcome_back')}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <Input label={t('email_address')} type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <div className="relative">
              <Input label={t('password')} type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} required />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-9 text-gray-400 hover:text-gray-600 cursor-pointer">
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <input type="checkbox" className="rounded border-gray-300" /> {t('remember_me')}
              </label>
              <Link to="/auth/forgot-password" className="text-primary-600 hover:text-primary-700">{t('forgot_password')}</Link>
            </div>
            <Button type="submit" className="w-full" loading={loading}>{t('sign_in')}</Button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t dark:border-gray-600" /></div>
            <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-gray-500 dark:bg-gray-800 dark:text-gray-400">{t('or_continue_with')}</span></div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" className="w-full" onClick={() => handleOAuth('google')} loading={oauthLoading === 'google'}>
              <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
              Google
            </Button>
            <Button variant="outline" className="w-full" onClick={() => handleOAuth('github')} loading={oauthLoading === 'github'}>
              <svg className="h-4 w-4 mr-2" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/></svg>
              GitHub
            </Button>
          </div>

          <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
            {t('dont_have_account')} <Link to="/auth/register" className="text-primary-600 hover:text-primary-700">{t('sign_up')}</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
