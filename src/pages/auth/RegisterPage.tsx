import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Home } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { supabase } from '@/lib/supabase'
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
      const { error: profileError } = await supabase.from('profiles').insert({
        user_id: data.user.id,
        full_name: form.full_name,
        email: form.email,
        phone: form.phone,
        role: form.role,
      } as never)
      if (profileError) toast.error('Profile creation failed')
    }
    toast.success('Account created! Check your email to verify.')
    navigate('/auth/login')
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-8 dark:bg-gray-950">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Link to="/" className="mx-auto flex items-center justify-center gap-2 text-2xl font-bold text-primary-600">
            <Home className="h-6 w-6" /> {t('app_name')}
          </Link>
          <CardTitle className="mt-4">{t('sign_up')}</CardTitle>
          <CardDescription>{t('create_account') || 'Create your account to get started.'}</CardDescription>
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
