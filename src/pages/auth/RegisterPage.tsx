import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { BrandLogo } from '@/components/ui/brand-logo'
import { supabase } from '@/lib/supabase'
import { sendWelcomeEmail } from '@/lib/email'
import toast from 'react-hot-toast'

const roleOptions = [
  { value: 'tenant', labelKey: 'tenant' },
  { value: 'owner', labelKey: 'owner' },
  { value: 'agent', labelKey: 'agent' },
]

export function RegisterPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [form, setForm] = useState({ full_name: '', email: '', phone: '', password: '', role: 'tenant' })
  const [loading, setLoading] = useState(false)

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const { data, error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: { data: { full_name: form.full_name, role: form.role } },
    })
    setLoading(false)
    if (error) {
      toast.error(error.message)
      return
    }
    if (data.user) {
      // Wait for the DB trigger to create the profile row
      for (let i = 0; i < 10; i++) {
        const { data: profile } = await supabase.from('profiles').select('id').eq('user_id', data.user.id).single()
        if (profile) break
        await new Promise(r => setTimeout(r, 500))
      }
      const { error: profileError } = await supabase.from('profiles').update({
        phone: form.phone,
      } as never).eq('user_id', data.user.id)
      if (profileError) toast.error(t('profile_update_failed'))
    }
    // Send welcome email
    if (data.user) {
      sendWelcomeEmail(data.user.id)
    }
    toast.success(t('account_created'))
    navigate('/auth/login')
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-8 dark:bg-gray-950">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <BrandLogo variant="auth" />
          <CardTitle className="mt-4">{t('sign_up')}</CardTitle>
          <CardDescription>{t('create_account')}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} className="space-y-4">
            <Input label={t('full_name')} value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} required />
            <Input label={t('email_address')} type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            <Input label={t('phone_number')} type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            <Input label={t('password')} type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required minLength={6} />
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('role')}</label>
              <div className="flex gap-3">
                {roleOptions.map((opt) => (
                  <button key={opt.value} type="button" onClick={() => setForm({ ...form, role: opt.value })} className={`flex-1 rounded-lg border px-4 py-2 text-sm font-medium cursor-pointer ${form.role === opt.value ? 'bg-primary-600 text-white border-primary-600' : 'border-gray-300 dark:border-gray-600 hover:border-primary-300'}`}>
                    {t(opt.labelKey)}
                  </button>
                ))}
              </div>
            </div>
            <Button type="submit" className="w-full" loading={loading}>{t('sign_up')}</Button>
          </form>
          <p className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
            {t('already_have_account')} <Link to="/auth/login" className="text-primary-600 hover:text-primary-700">{t('sign_in')}</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
