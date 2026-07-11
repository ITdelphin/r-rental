import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Home, ArrowLeft, Key, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'

export function ForgotPasswordPage() {
  const { t } = useTranslation()
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [recovery, setRecovery] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setRecovery(true)
      }
    })
    return () => subscription.unsubscribe()
  }, [])

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'https://rwanda-easyrent.vercel.app/auth/forgot-password',
    })
    setLoading(false)
    if (error) {
      toast.error(error.message)
      return
    }
    setSent(true)
    toast.success(t('reset_link_sent') || 'Password reset link sent to your email!')
  }

  const handleSetNewPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      toast.error(t('passwords_do_not_match'))
      return
    }
    if (newPassword.length < 6) {
      toast.error(t('password_too_short'))
      return
    }
    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    setLoading(false)
    if (error) {
      toast.error(error.message)
      return
    }
    toast.success(t('password_updated'))
    await supabase.auth.signOut()
    window.location.href = '/auth/login'
  }

  if (recovery) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 dark:bg-gray-950">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary-100 dark:bg-primary-900">
              <Key className="h-6 w-6 text-primary-600" />
            </div>
            <CardTitle className="mt-4">{t('reset_password')}</CardTitle>
            <CardDescription>Enter your new password below.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSetNewPassword} className="space-y-4">
              <div className="relative">
                <Input
                  label={t('new_password')}
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-9 text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <Input
                label={t('confirm_password')}
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
              />
              <Button type="submit" className="w-full" loading={loading}>{t('update_password')}</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 dark:bg-gray-950">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Link to="/" className="mx-auto flex items-center justify-center gap-2 text-2xl font-bold text-primary-600">
            <Home className="h-6 w-6" /> {t('app_name')}
          </Link>
          <CardTitle className="mt-4">{t('reset_password')}</CardTitle>
          <CardDescription>{sent ? 'Check your email for the reset link.' : 'Enter your email and we will send you a reset link.'}</CardDescription>
        </CardHeader>
        <CardContent>
          {sent ? (
            <div className="text-center space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">We have sent a password reset link to <strong>{email}</strong></p>
              <Button variant="outline" className="w-full" onClick={() => setSent(false)}>Send again</Button>
            </div>
          ) : (
            <form onSubmit={handleReset} className="space-y-4">
              <Input label={t('email_address')} type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              <Button type="submit" className="w-full" loading={loading}>{t('reset_password')}</Button>
            </form>
          )}
          <p className="mt-4 text-center">
            <Link to="/auth/login" className="inline-flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700">
              <ArrowLeft className="h-4 w-4" /> {t('back')} to {t('login')}
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
