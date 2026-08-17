import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Key, Eye, EyeOff, CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { BrandLogo } from '@/components/ui/brand-logo'
import { LoadingSpinner } from '@/components/ui/loading'
import { supabase } from '@/lib/supabase'
import type { AuthChangeEvent } from '@supabase/supabase-js'

type ResetState = 'checking' | 'form' | 'success' | 'invalid'

export function ResetPasswordPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const [state, setState] = useState<ResetState>('checking')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    let fallbackTimer: ReturnType<typeof setTimeout>

    const urlAtMount = window.location.hash + window.location.search
    const hasRecoveryToken =
      urlAtMount.includes('type=recovery') ||
      urlAtMount.includes('access_token') ||
      urlAtMount.includes('token_hash')

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event: AuthChangeEvent) => {
      // PASSWORD_RECOVERY fires when supabase-js validates the recovery token.
      // It can arrive after getSession resolves, so listen for it the whole time.
      if (event !== 'PASSWORD_RECOVERY') return
      if (!active) return
      clearTimeout(fallbackTimer)
      setState('form')
    })

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!active) return

      // A valid recovery token establishes a session. supabase-js strips the
      // token from the URL quickly, so the session is the reliable signal.
      if (session) {
        setState('form')
        return
      }

      // No session yet. If the URL showed a recovery token, the exchange may
      // still be running — wait for PASSWORD_RECOVERY before declaring failure.
      if (hasRecoveryToken) {
        fallbackTimer = setTimeout(() => {
          if (active) setState('invalid')
        }, 8000)
        return
      }

      // No token in the URL and no session: the link is invalid.
      setState('invalid')
    })

    return () => {
      active = false
      clearTimeout(fallbackTimer)
      subscription.unsubscribe()
    }
  }, [])

  const validatePasswords = (): string | null => {
    if (!newPassword) return t('new_password_required')
    if (!confirmPassword) return t('confirm_password_required')
    if (newPassword.length < 6) return t('password_too_short')
    if (newPassword !== confirmPassword) return t('passwords_do_not_match')
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const validationError = validatePasswords()
    if (validationError) {
      setError(validationError)
      return
    }
    setError(null)
    setLoading(true)
    const { error: updateError } = await supabase.auth.updateUser({ password: newPassword })
    if (!updateError) {
      // The recovery link creates a session; sign out so we do not leave the
      // user logged in. They log in again with the new password.
      await supabase.auth.signOut()
    }
    setLoading(false)
    if (updateError) {
      // Generic message — do not leak whether it was a token or server problem.
      setError(t('password_update_failed'))
      return
    }
    setState('success')
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 dark:bg-gray-950">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <BrandLogo variant="auth" />
          <CardTitle className="mt-4">{t('reset_password')}</CardTitle>
          <CardDescription>
            {state === 'form'
              ? t('enter_new_password')
              : state === 'success'
                ? t('password_reset_success_body')
                : state === 'invalid'
                  ? t('reset_link_invalid_body')
                  : ''}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {state === 'checking' && (
            <div className="flex justify-center py-6">
              <LoadingSpinner />
            </div>
          )}

          {state === 'invalid' && (
            <div className="text-center space-y-4">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900">
                <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-300" />
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">{t('reset_link_invalid_body')}</p>
              <Button className="w-full" onClick={() => navigate('/auth/forgot-password')}>
                {t('request_new_link')}
              </Button>
              <p>
                <Link to="/auth/login" className="inline-flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700">
                  <ArrowLeft className="h-4 w-4" /> {t('back_to_login')}
                </Link>
              </p>
            </div>
          )}

          {state === 'success' && (
            <div className="text-center space-y-4">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-300" />
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">{t('password_reset_success_body')}</p>
              <Button className="w-full" onClick={() => navigate('/auth/login')}>
                {t('go_to_login')}
              </Button>
            </div>
          )}

          {state === 'form' && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <Input
                  label={t('new_password')}
                  id="new-password"
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  autoComplete="new-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-9 text-gray-400 hover:text-gray-600 cursor-pointer"
                  aria-label={showPassword ? t('hide_password') : t('show_password')}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <div className="relative">
                <Input
                  label={t('confirm_password')}
                  id="confirm-password"
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                  required
                />
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <Button type="submit" className="w-full" loading={loading}>
                <Key className="h-4 w-4" /> {t('update_password')}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
