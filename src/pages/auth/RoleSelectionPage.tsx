import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { BrandLogo } from '@/components/ui/brand-logo'
import { useAuth } from '@/hooks/useAuth'
import { profileApi } from '@/lib/api'
import toast from 'react-hot-toast'

const roleOptions = [
  { value: 'tenant', labelKey: 'tenant', icon: '🔑', descriptionKey: 'tenant_description' },
  { value: 'owner', labelKey: 'owner', icon: '🏠', descriptionKey: 'owner_description' },
  { value: 'agent', labelKey: 'agent', icon: '📋', descriptionKey: 'agent_description' },
] as const

export function RoleSelectionPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [selectedRole, setSelectedRole] = useState<string | null>(null)
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!selectedRole || !user) return
    setLoading(true)
    try {
      await profileApi.update(user.id, { role: selectedRole as any, phone: phone || null })
      toast.success(t('role_set_success'))
      navigate('/dashboard', { replace: true })
    } catch {
      toast.error(t('role_set_failed'))
      setLoading(false)
    }
  }

  if (!user) {
    navigate('/auth/login', { replace: true })
    return null
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-8 dark:bg-gray-950">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <BrandLogo variant="auth" />
          <CardTitle className="mt-4">{t('choose_role')}</CardTitle>
          <CardDescription>{t('choose_role_description')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input label={t('phone_number')} type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+250..." />
          <div className="grid gap-3">
            {roleOptions.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setSelectedRole(opt.value)}
                className={`flex items-center gap-4 rounded-lg border p-4 text-left transition cursor-pointer ${
                  selectedRole === opt.value
                    ? 'border-primary-600 bg-primary-50 dark:bg-primary-950'
                    : 'border-gray-200 dark:border-gray-700 hover:border-primary-300'
                }`}
              >
                <span className="text-2xl">{opt.icon}</span>
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">{t(opt.labelKey)}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{t(opt.descriptionKey)}</p>
                </div>
              </button>
            ))}
          </div>
          <Button className="w-full" onClick={handleSubmit} loading={loading} disabled={!selectedRole}>
            {t('continue')}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
