import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Home, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'

export function LoginPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (error) {
      toast.error(error.message)
      return
    }
    navigate('/dashboard')
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 dark:bg-gray-950">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Link to="/" className="mx-auto flex items-center justify-center gap-2 text-2xl font-bold text-primary-600">
            <Home className="h-6 w-6" /> {t('app_name')}
          </Link>
          <CardTitle className="mt-4">{t('sign_in')}</CardTitle>
          <CardDescription>{t('welcome')} back! Sign in to your account.</CardDescription>
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
          <p className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
            {t('dont_have_account')} <Link to="/auth/register" className="text-primary-600 hover:text-primary-700">{t('sign_up')}</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
