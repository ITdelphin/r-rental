import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, MailCheck, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { BrandLogo } from '@/components/ui/brand-logo'
import { supabase } from '@/lib/supabase'
import { isValidEmail } from '@/lib/utils'

export function ForgotPasswordPage() {
  const { t } = useTranslation()
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = email.trim().toLowerCase()

    if (!isValidEmail(trimmed)) {
      setError(t('invalid_email_format'))
      return
    }

    setError(null)
    setLoading(true)

    const redirectTo = `${window.location.origin}/auth/reset-password`

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(trimmed, { redirectTo })
    setLoading(false)

    // Always show the same generic message whether or not the account exists.
    setSent(true)
    if (resetError) {
      // SMTP / transport failures should be friendly and not leak details.
      console.error('Password reset request failed', resetError)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 dark:bg-gray-950">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <BrandLogo variant="auth" />
          <CardTitle className="mt-4">{t('forgot_password_heading')}</CardTitle>
          <CardDescription>{sent ? t('check_email_reset') : t('forgot_password_description')}</CardDescription>
        </CardHeader>
        <CardContent>
          {sent ? (
            <div className="text-center space-y-4">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary-100 dark:bg-primary-900">
                <MailCheck className="h-6 w-6 text-primary-600 dark:text-primary-300" />
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">{t('reset_email_generic')}</p>
              <p className="text-xs text-gray-400 dark:text-gray-500">{t('sent_reset_link_to')} <strong>{email}</strong></p>
              <Button variant="outline" className="w-full" onClick={() => setSent(false)}>{t('send_again')}</Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <Input
                  label={t('email_address')}
                  id="reset-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                />
                <Mail className="pointer-events-none absolute right-3 top-9 h-4 w-4 text-gray-400" />
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <Button type="submit" className="w-full" loading={loading}>
                {t('send_reset_link')}
              </Button>
              <p className="text-xs text-gray-400 dark:text-gray-500">{t('reset_email_security_note')}</p>
            </form>
          )}
          <p className="mt-4 text-center">
            <Link to="/auth/login" className="inline-flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700">
              <ArrowLeft className="h-4 w-4" /> {t('back_to_login')}
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
