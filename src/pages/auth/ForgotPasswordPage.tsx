import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Home, ArrowLeft } from 'lucide-react'
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

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.auth.resetPasswordForEmail(email)
    setLoading(false)
    if (error) {
      toast.error(error.message)
      return
    }
    setSent(true)
    toast.success('Password reset email sent!')
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
